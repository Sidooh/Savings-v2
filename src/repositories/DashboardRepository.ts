import { PersonalAccount } from '../entities/models/PersonalAccount';
import { PersonalAccountTransaction } from '../entities/models/PersonalAccountTransaction';
import SidoohAccounts from '../services/SidoohAccounts';
import { PersonalCollectiveInvestment } from '../entities/models/PersonalCollectiveInvestment';
import { Between } from 'typeorm';
import moment from 'moment';
import { GroupAccount } from '../entities/models/GroupAccount';
import ChartAid from '../utils/ChartAid';
import { GroupAccountTransaction } from '../entities/models/GroupAccountTransaction';
import { TransactionType } from '../utils/enums';
import SidoohPayments from "../services/SidoohPayments";

export const DashboardRepository = {
    chartData: async () => {
        const startDate = moment().startOf('day');
        const endDate = moment().endOf('day'),
            whereToday = Between(startDate.toDate(), endDate.toDate()),
            whereYesterday = Between(startDate.subtract(1, 'd').toDate(), endDate.subtract(1, 'd').toDate());

        const chartAid = new ChartAid();

        const fetch = async (whereBetween, freq = 24) => {
            const personalTransactions = await PersonalAccountTransaction.createQueryBuilder('transaction')
                .select('HOUR(created_at) as hour',)
                .addSelect('SUM(amount)', 'amount').where({ created_at: whereBetween, type: TransactionType.CREDIT })
                .groupBy('hour').getRawMany();
            const groupTransactions = await GroupAccountTransaction.createQueryBuilder('transaction')
                .select('HOUR(created_at) as hour',)
                .addSelect('SUM(amount)', 'amount').where({ created_at: whereBetween, type: TransactionType.CREDIT })
                .groupBy('hour').getRawMany();

            return {
                personal: await chartAid.chartDataSet(personalTransactions, freq),
                group: await chartAid.chartDataSet(groupTransactions, freq)
            };
        };

        const todayHrs = moment().diff(moment().startOf('day'), 'h');

        return { today: await fetch(whereToday, todayHrs + 1), yesterday: await fetch(whereYesterday) };
    },

    getSummaries: async () => {
        const startOfDay = moment().startOf('day').toDate();

        const pa = await PersonalAccount.find({ select: ['balance', 'created_at'] })
        const ga = await GroupAccount.find({ select: ['balance', 'created_at'] })

        const paToday = pa.filter(a => moment(a.created_at).isSameOrAfter(startOfDay))
        const gaToday = ga.filter(a => moment(a.created_at).isSameOrAfter(startOfDay))

        const savingsFloatAccount = await SidoohPayments.getFloatAccount(2);

        return {
            count_personal_accounts: pa.length,
            count_personal_accounts_today: paToday.length,

            count_group_accounts: ga.length,
            count_group_accounts_today: gaToday.length,

            amount_personal_accounts: pa.reduce((prev, curr) => prev + curr.balance, 0),
            amount_personal_accounts_today: paToday.reduce((prev, curr) => prev + curr.balance, 0),

            amount_group_accounts: ga.reduce((prev, curr) => prev + curr.balance, 0),
            amount_group_accounts_today: gaToday.reduce((prev, curr) => prev + curr.balance, 0),

            savings_float_balance: savingsFloatAccount ? savingsFloatAccount.balance : null
        };
    },

    getRecentTransactions: async () => {
        return await PersonalAccountTransaction.find({
            select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                status: true,
                created_at: true,
                personal_account: { id: true, type: true, account_id: true }
            },
            take: 100,
            order: { id: 'DESC' },
            relations: { personal_account: true },
        }).then(async transactions => {
            const accounts = await SidoohAccounts.findAll();

            return transactions.map(i => ({
                ...i, account: accounts?.find(a => String(a.id) === i.personal_account.account_id)
            }));
        });
    },

    getRecentCollectiveInvestments: async () => {
        return await PersonalCollectiveInvestment.find({
            select: {
                id: true,
                amount: true,
                interest: true,
                maturity_date: true,
                invested_at: true,
                updated_at: true,
                created_at: true,
            },
            take: 7,
            order: { id: 'DESC' },
        });
    }
};
