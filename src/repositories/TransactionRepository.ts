import { PersonalAccountTransaction } from '../entities/models/PersonalAccountTransaction';
import { GroupAccountTransaction } from '../entities/models/GroupAccountTransaction';

export const TransactionRepository = {
    getAllPersonalTransactions: async (withAccount = null) => {
        return await PersonalAccountTransaction.find({
            select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                status: true,
                personal_account: {id: true, type: true}
            },
            relations: {personal_account: Boolean(withAccount)}
        });
    },

    getAllGroupAccountTransactions: async (withGroupAccount = null) => {
        return await GroupAccountTransaction.find({
            select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                status: true,
                group_account: {id: true, balance: true, account_id: true, group_id: true}
            },
            relations: {group_account: Boolean(withGroupAccount)}
        });
    },
};