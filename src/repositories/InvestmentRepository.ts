import { PersonalCollectiveInvestment } from '../entities/models/PersonalCollectiveInvestment';
import moment from 'moment';
import { PersonalAccount } from '../entities/models/PersonalAccount';
import { Between, IsNull, MoreThan } from 'typeorm';
import { PersonalSubInvestment } from '../entities/models/PersonalSubInvestment';
import { GroupCollectiveInvestment } from '../entities/models/GroupCollectiveInvestment';
import { Group } from '../entities/models/Group';
import { GroupSubInvestment } from '../entities/models/GroupSubInvestment';
import log from '../utils/logger';
import SidoohNotify from '../services/SidoohNotify';
import { Description, EventType, Status, TransactionType } from '../utils/enums';
import SidoohAccounts from '../services/SidoohAccounts';
import { PersonalAccountTransaction } from '../entities/models/PersonalAccountTransaction';
import { env } from '../utils/validate.env';

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
            order: { id: 'DESC' },
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
            order: { id: 'DESC' },
            relations: { personal_account: relations.includes('personal_account') || relations.includes('account') },
            take: 10000
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
            order: { id: 'DESC' },
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
            order: { id: 'DESC' },
            relations: { group: relations.includes('group') },
            take: 10000
        });
    };


    getDailyRate = (rate: number) => {
        // return (Math.pow(((rate / 100) + 1), (1 / 365)) - 1) * 100;
        // Updated on 2/4/23

        return (rate / 100) / 365;
    };

    dailyInterestCalculation = async () => {
        log.info("...[REPO INVESTMENT] Investing...");

        // await this.investGroups();
        await this.investPersonal();

        const { groups, personal_accounts } = await this.calculateInterest(env.INTEREST_RATE);

        log.info("... Completed Investments");

        await SidoohNotify.notify(
            env.ADMIN_CONTACTS.split(','),
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
        let totalAmount = groups.reduce((pV, group) => pV += group.balance, 0);

        investment = GroupCollectiveInvestment.create({ amount: totalAmount });
        await GroupCollectiveInvestment.insert(investment)

        const subInvestmentModels = groups.map(g => GroupSubInvestment.create({
            amount: g.balance,
            group_id: g.id,
            group_collective_investment_id: investment.id
        }));

        await GroupSubInvestment.insert(subInvestmentModels);

        return investment;
    };

    investPersonal = async () => {
        const startOfDay = moment().startOf('day').utc().toDate();
        const endOfDay = moment().endOf('day').utc().toDate();

        let investment = await PersonalCollectiveInvestment.findOneBy({ created_at: Between(startOfDay, endOfDay) });

        let accounts = await PersonalAccount.findBy({ balance: MoreThan(0) });
        let totalAmount = accounts.reduce((pV, acc) => pV += acc.balance, 0);

        investment = PersonalCollectiveInvestment.create({ amount: totalAmount });
        await PersonalCollectiveInvestment.insert(investment)

        const subInvestmentModels = accounts.map(acc => PersonalSubInvestment.create({
            amount: acc.balance,
            personal_account_id: acc.id,
            personal_collective_investment_id: investment.id
        }));

        await PersonalSubInvestment.insert(subInvestmentModels);

        return investment;
    };

    calculateInterest = async (rate: number) => {
        log.info("...Calculating interest...");

        const dayRate = this.getDailyRate(rate);

        // const groupsCredited = await this.calculateInterestForGroups(dayRate);
        const personalAccountsCredited = await this.calculateInterestForPersonal(dayRate);

        return {
            groups: 0,
            personal_accounts: personalAccountsCredited,
        };
    };

    calculateInterestForGroups = async (dayRate: number) => {
        log.info("...Calculating interest - personal-accounts...");

        const investment = await GroupCollectiveInvestment.findOne({
            where: { interest_rate: IsNull() },
            order: { id: 'desc' },
            relations: { group_sub_investments: true }
        });

        if (!investment) {
            log.info('No Pending Group Investment!');

            return 0;
        }

        investment.interest_rate = dayRate;
        investment.interest = investment.amount * dayRate;
        investment.maturity_date = moment().add(1, 'month').toDate();

        for (const subInvestment of investment.group_sub_investments) {
            const interest = subInvestment.amount * dayRate;

            subInvestment.interest = interest;
            await Group.getRepository().increment({ id: subInvestment.group_id }, 'interest', interest);

            await subInvestment.save();
        }

        await investment.save();

        return investment.group_sub_investments.length;
    };

    calculateInterestForPersonal = async (dayRate: number) => {
        log.info("...Calculating interest - personals...");

        const investment = await PersonalCollectiveInvestment.findOne({
            where: { interest_rate: IsNull() },
            order: { id: 'desc' },
            relations: { personal_sub_investments: true }
        });

        if (!investment) {
            log.info('No Pending Personal Account Investment!');

            return 0;
        }

        investment.interest_rate = dayRate;
        investment.interest = investment.amount * dayRate;
        investment.maturity_date = moment().add(1, 'month').toDate();

        // TODO: Refactor to do bulk update
        for (const subInvestment of investment.personal_sub_investments) {
            const interest = subInvestment.amount * dayRate;

            subInvestment.interest = interest;
            await PersonalAccount.getRepository()
                .increment({ id: subInvestment.personal_account_id }, 'interest', interest);

            await subInvestment.save();
        }

        await investment.save();

        return investment.personal_sub_investments.length;
    };

    monthlyInterestAllocation = async () => {
        log.info("...[REPO INVESTMENT] Monthly Interest Allocation...");

        // const gA = await Group.find({select: ['id', 'balance', 'interest']}).then(personal-accounts => {
        //     personal-accounts.forEach(async g => {
        //         g.balance += g.interest;
        //
        //         await GroupAccountTransaction.save({
        //             amount: g.interest,
        //             type: TransactionType.CREDIT,
        //             description: Description.MONTHLY_INTEREST_ALLOCATION,
        //             group_account_id: g.id,
        //             status: Status.COMPLETED
        //         });
        //
        //         g.interest = 0;
        //
        //         await g.save();
        //     });
        //
        //     return personal-accounts.length;
        // });

        const pA = await PersonalAccount.find({ select: ['id', 'balance', 'interest'] }).then(accounts => {
            let accountsCount = 0;
            accounts.forEach(a => {
                if (a.interest > 0) {
                    a.balance += a.interest;

                    PersonalAccountTransaction.insert(PersonalAccountTransaction.create({
                        amount: a.interest,
                        type: TransactionType.CREDIT,
                        description: Description.MONTHLY_INTEREST_ALLOCATION,
                        personal_account_id: a.id,
                        status: Status.COMPLETED
                    })).then(async () => await PersonalAccount.update({ id: a.id }, {
                        interest: 0,
                        balance: a.balance
                    }))

                    accountsCount++
                }
            });

            return accountsCount
        });

        log.info("...Completed Monthly Interest Allocation...");

        await SidoohNotify.notify(
            env.ADMIN_CONTACTS.split(','),
            `STATUS:INVESTMENT\nAllocated Interest. 
            \n\n${0} Group Accounts and ${pA} Personal Accounts updated.`,
            EventType.STATUS_UPDATE
        );
    };
};
