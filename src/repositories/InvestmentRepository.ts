import { PersonalCollectiveInvestment } from '../entities/models/PersonalCollectiveInvestment';
import moment from 'moment';
import { PersonalAccount } from '../entities/models/PersonalAccount';
import { Between, IsNull, MoreThan } from 'typeorm';
import sumBy from 'lodash/sumBy';
import { PersonalSubInvestment } from '../entities/models/PersonalSubInvestment';
import { GroupCollectiveInvestment } from '../entities/models/GroupCollectiveInvestment';
import { Group } from '../entities/models/Group';
import { GroupSubInvestment } from '../entities/models/GroupSubInvestment';
import log from '../utils/logger';
import SidoohNotify from '../services/SidoohNotify';
import { EventType } from '../utils/enums';
import SidoohAccounts from '../services/SidoohAccounts';

export default class InvestmentRepository {
    getPersonalCollectiveInvestments = async (withRelations?: string) => {
        return await PersonalCollectiveInvestment.find({
            select: {
                id: true,
                amount: true,
                interest: true,
                maturity_date: true,
                invested_at: true,
                updated_at: true,
                created_at: true,
                personal_sub_investments: { id: true, amount: true, interest: true }
            },
            order: {id: 'DESC'},
            relations: { personal_sub_investments: withRelations.split(',').includes('sub_investment') }
        });
    };

    getPersonalSubInvestments = async (withRelations?: string) => {
        const relations = withRelations.split(',');

        return await PersonalSubInvestment.find({
            select: {
                id: true,
                amount: true,
                interest: true,
                created_at: true,
                personal_account: { id: true, type: true, account_id: true }
            },
            order: {id: 'DESC'},
            relations: { personal_account: relations.includes('personal_account') || relations.includes('account') }
        }).then(async subInvestments => {
            let res: any = subInvestments;
            if (withRelations.split(',').includes('account')) {
                const accounts = await SidoohAccounts.findAll();
                res = subInvestments.map(i => ({
                    ...i, account: accounts.find(a => String(a.id) === i.personal_account.account_id)
                }));
            }

            return res;
        });
    };

    getGroupCollectiveInvestments = async (withRelations?: string) => {
        return await GroupCollectiveInvestment.find({
            select: {
                id: true,
                amount: true,
                interest_rate: true,
                interest: true,
                investment_date: true,
                maturity_date: true,
                created_at: true,
                group_sub_investments: { id: true, amount: true, interest: true }
            },
            order: {id: 'DESC'},
            relations: { group_sub_investments: withRelations.split(',').includes('sub_investment') }
        });
    };

    getGroupSubInvestments = async (withRelations?: string) => {
        const relations = withRelations.split(',');

        return await GroupSubInvestment.find({
            select: {
                id: true,
                amount: true,
                interest: true,
                created_at: true,
                group: { id: true, balance: true, name: true, type: true, target_amount: true, frequency: true }
            },
            order: {id: 'DESC'},
            relations: { group: relations.includes('group') }
        });
    };


    getDailyRate = (rate: number) => {
        return (Math.pow(((rate / 100) + 1), (1 / 365)) - 1) * 100;
    };

    invest = async () => {
        log.info("...[REPO INVESTMENT] Investing...");

        await this.investGroups();
        await this.investPersonal();

        const { groups, personal_accounts } = await this.calculateInterest(Number(process.env.INTEREST_RATE) || 9);

        log.info("... Completed Investments");

        await SidoohNotify.notify(
            //TODO: Move these to admin contacts env
            [254110039317, 254714611696, 254711414987],
            `STATUS:INVESTMENT\nCalculating Interest. 
            \n\nCredited ${groups} group accounts AND ${personal_accounts} personal accounts.`,
            EventType.STATUS_UPDATE
        );
    };

    investGroups = async () => {
        const startOfDay = moment().startOf('day').add(3, 'h').toDate();
        const endOfDay = moment().endOf('day').add(3, 'h').toDate();

        let investment = await GroupCollectiveInvestment.findOneBy({ created_at: Between(startOfDay, endOfDay) });

        if (investment) return investment;

        let groups = await Group.findBy({ balance: MoreThan(0) });
        let totalAmount = sumBy(groups, (group) => Number(group.balance));

        investment = await GroupCollectiveInvestment.save({ amount: totalAmount });

        const subInvestmentModels = groups.map(g => GroupSubInvestment.create({
            amount: g.balance,
            group_id: g.id,
            group_collective_investment_id: investment.id
        }));

        await GroupSubInvestment.save(subInvestmentModels);

        return investment;
    };

    investPersonal = async () => {
        const startOfDay = moment().startOf('day').add(3, 'h').toDate();
        const endOfDay = moment().endOf('day').add(3, 'h').toDate();

        let investment = await PersonalCollectiveInvestment.findOneBy({ created_at: Between(startOfDay, endOfDay) });

        // if (investment) return investment;

        let accounts = await PersonalAccount.findBy({ balance: MoreThan(0) });
        let totalAmount = sumBy(accounts, (acc) => Number(acc.balance));

        investment = await PersonalCollectiveInvestment.save({ amount: totalAmount });

        const subInvestmentModels = accounts.map(acc => PersonalSubInvestment.create({
            amount: acc.balance,
            personal_account_id: acc.id,
            personal_collective_investment_id: investment.id
        }));

        await PersonalSubInvestment.save(subInvestmentModels);

        return investment;
    };

    calculateInterest = async (rate: number) => {
        log.info("...Calculating interest...");

        const dayRate = this.getDailyRate(rate);

        const groupsCredited = await this.calculateInterestForGroups(rate, dayRate);
        const personalAccountsCredited = await this.calculateInterestForPersonal(rate, dayRate);

        return {
            groups: groupsCredited,
            personal_accounts: personalAccountsCredited,
        };
    };

    calculateInterestForGroups = async (rate: number, dayRate?: number) => {
        log.info("...Calculating interest - groups...");

        if (!dayRate) dayRate = this.getDailyRate(rate);

        const investment = await GroupCollectiveInvestment.findOne({
            where: { interest_rate: IsNull() },
            order: { id: 'desc' },
            relations: { group_sub_investments: true }
        });

        if (!investment) {
            log.info('No Pending Group Investment!');

            return 0;
        }

        investment.interest_rate = rate;
        investment.interest = investment.amount * (dayRate / 100);
        investment.maturity_date = moment().add(1, 'month').toDate();

        for (const subInvestment of investment.group_sub_investments) {
            const interest = subInvestment.amount * (dayRate / 100);

            subInvestment.interest = interest;
            await Group.getRepository().increment({ id: subInvestment.group_id }, 'interest', interest);

            await subInvestment.save();
        }

        await investment.save();

        return investment.group_sub_investments.length;
    };

    calculateInterestForPersonal = async (rate: number, dayRate?: number) => {
        log.info("...Calculating interest - personals...");

        if (!dayRate) dayRate = this.getDailyRate(rate);

        const investment = await PersonalCollectiveInvestment.findOne({
            where: { interest_rate: IsNull() },
            order: { id: 'desc' },
            relations: { personal_sub_investments: true }
        });

        if (!investment) {
            log.info('No Pending Personal Account Investment!');

            return 0;
        }

        investment.interest_rate = rate;
        investment.interest = investment.amount * (dayRate / 100);
        investment.maturity_date = moment().add(1, 'month').toDate();

        for (const subInvestment of investment.personal_sub_investments) {
            const interest = subInvestment.amount * (dayRate / 100);

            subInvestment.interest = interest;
            await PersonalAccount.getRepository().increment({ id: subInvestment.personal_account_id }, 'interest', interest);

            await subInvestment.save();
        }

        await investment.save();

        return investment.personal_sub_investments.length;
    };
};
