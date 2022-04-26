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

export default class InvestmentRepository {
    getDailyRate = (rate: number) => {
        return (Math.pow(((rate / 100) + 1), (1 / 365)) - 1) * 100;
    };

    invest = async () => {
        log.info("Investing...");

        await this.investGroups();
        await this.investPersonal();

        const {groups, personal_accounts} = await this.calculateInterest(9);

        SidoohNotify.notify(
            [254110039317],
            `STATUS::INVESTMENT\nCalcuating Interest. 
            \n\nCredited ${groups} group accounts AND ${personal_accounts} personal accounts.`,
            EventType.STATUS_UPDATE
        );
    };

    investGroups = async () => {
        const startOfDay = moment().startOf('day').add(3, 'h').toDate();
        const endOfDay = moment().endOf('day').add(3, 'h').toDate();

        let investment = await GroupCollectiveInvestment.findOneBy({created_at: Between(startOfDay, endOfDay)});

        if (investment) return investment;

        let groups = await Group.findBy({balance: MoreThan(0)});
        let totalAmount = sumBy(groups, (group) => Number(group.balance));

        investment = await GroupCollectiveInvestment.save({amount: totalAmount});

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

        let investment = await PersonalCollectiveInvestment.findOneBy({created_at: Between(startOfDay, endOfDay)});

        // if (investment) return investment;

        let accounts = await PersonalAccount.findBy({balance: MoreThan(0)});
        let totalAmount = sumBy(accounts, (acc) => Number(acc.balance));

        investment = await PersonalCollectiveInvestment.save({amount: totalAmount});

        const subInvestmentModels = accounts.map(acc => PersonalSubInvestment.create({
            amount: acc.balance,
            personal_account_id: acc.id,
            personal_collective_investment_id: investment.id
        }));

        await PersonalSubInvestment.save(subInvestmentModels);

        return investment;
    };

    calculateInterest = async (rate: number) => {
        const dayRate = this.getDailyRate(rate);

        const groupsCredited = await this.calculateInterestForGroups(rate, dayRate);
        const personalAccountsCredited = await this.calculateInterestForPersonal(rate, dayRate);

        return {
            groups: groupsCredited,
            personal_accounts: personalAccountsCredited,
        };
    };

    calculateInterestForGroups = async (rate: number, dayRate?: number) => {
        if (!dayRate) dayRate = this.getDailyRate(rate);

        const investment = await GroupCollectiveInvestment.findOne({
            where: {interest_rate: IsNull()},
            order: {id: 'desc'},
            relations: {group_sub_investments: true}
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
            await Group.getRepository().increment({id: subInvestment.group_id}, 'interest', interest);

            await subInvestment.save();
        }

        await investment.save();

        return investment.group_sub_investments.length;
    };

    calculateInterestForPersonal = async (rate: number, dayRate?: number) => {
        if (!dayRate) dayRate = this.getDailyRate(rate);

        const investment = await PersonalCollectiveInvestment.findOne({
            where: {interest_rate: IsNull()},
            order: {id: 'desc'},
            relations: {personal_sub_investments: true}
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
            await PersonalAccount.getRepository().increment({id: subInvestment.personal_account_id}, 'interest', interest);

            await subInvestment.save();
        }

        await investment.save();

        return investment.personal_sub_investments.length;
    };
};