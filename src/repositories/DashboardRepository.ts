import { PersonalAccount } from '../entities/models/PersonalAccount';
import { PersonalAccountTransaction } from '../entities/models/PersonalAccountTransaction';
import SidoohAccounts from '../services/SidoohAccounts';
import { PersonalCollectiveInvestment } from '../entities/models/PersonalCollectiveInvestment';
import { Between } from 'typeorm';
import moment from 'moment';
import { GroupAccount } from '../entities/models/GroupAccount';

export const DashboardRepository = {
    chartData: async () => {
        const startDate = moment().startOf('day');
        const endDate = moment().endOf('day'),
            whereToday = Between(startDate.toDate(), endDate.toDate());

        const transactions = await PersonalAccountTransaction.createQueryBuilder('transaction')
            .select('DAY(created_at) as day, HOUR(created_at) as hour',)
            .addSelect('SUM(amount)', 'amount').where({created_at: whereToday})
            .groupBy('day, hour').getRawMany();

        const freqCount = 24;

        const getLabel = (day: number, month: number, year: number) => {
            return moment(`${day}-${month}-${year}`, 'DD-MM-YYYY').format('HH:mm');
        };

        let datasets = [], labels = [];
        for (let hour: number = 0; hour < freqCount; hour++) {
            let label = moment(hour, 'H').format('HHmm'), amount;

            if (transactions.find(t => t.hour === startDate.hour())) {
                amount = Number(transactions.find(({hour}) => hour === startDate.hour()).amount);
            } else {
                amount = 0;
            }

            labels.push(label);
            datasets.push(amount);

            startDate.add(1, 'h');
        }

        return {datasets, labels, transactions};
    },

    getSummaries: async () => {
        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate(),
            whereToday = Between(startOfDay, endOfDay);

        return {
            count_personal_accounts: await PersonalAccount.count(),
            count_personal_accounts_today: await PersonalAccount.countBy({created_at: whereToday}),

            count_group_accounts: await GroupAccount.count(),
            count_group_accounts_today: await GroupAccount.countBy({created_at: whereToday}),

            amount_personal_accounts: await PersonalAccount.createQueryBuilder().select('SUM(balance)', 'balance')
                .getRawOne().then(res => res.balance),
            amount_personal_accounts_today: await PersonalAccount.createQueryBuilder().select('SUM(balance)', 'balance')
                .where({created_at: whereToday}).getRawOne().then(res => res.balance),

            amount_group_accounts: await GroupAccount.createQueryBuilder().select('SUM(balance)', 'balance')
                .getRawOne().then(res => res.balance),
            amount_group_accounts_today: await GroupAccount.createQueryBuilder().select('SUM(balance)', 'balance')
                .where({created_at: whereToday}).getRawOne().then(res => res.balance),
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
                personal_account: {id: true, type: true, account_id: true}
            },
            take: 100,
            relations: {personal_account: true},
        }).then(async transactions => {
            const accounts = await SidoohAccounts.findAll();

            return transactions.map(i => ({
                ...i, account: accounts.find(a => String(a.id) === i.personal_account.account_id)
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
        });
    }
};