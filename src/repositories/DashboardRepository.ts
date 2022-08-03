import { PersonalAccount } from '../entities/models/PersonalAccount';
import { PersonalAccountTransaction } from '../entities/models/PersonalAccountTransaction';
import SidoohAccounts from '../services/SidoohAccounts';
import { PersonalCollectiveInvestment } from '../entities/models/PersonalCollectiveInvestment';
import { Between } from 'typeorm';
import moment from 'moment';
import { GroupAccount } from '../entities/models/GroupAccount';

export const DashboardRepository = {
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