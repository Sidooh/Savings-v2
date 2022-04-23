import { PersonalAccount } from '../entities/models/PersonalAccount';
import { NotFoundError } from '../exceptions/not-found.err';

export const PersonalAccountRepository = {
    index: async () => {
        return await PersonalAccount.find({
            select: [
                'id', 'type', 'description', 'target_amount', 'frequency_amount',
                'balance', 'interest', 'duration',
                'status', 'account_id', 'created_at'
            ]
        });
    },

    getById: async (id) => {
        const personalAccount = await PersonalAccount.findOne({
            where: {id: Number(id)},
            select: [
                'id', 'type', 'description', 'target_amount', 'frequency_amount',
                'balance', 'interest', 'duration',
                'status', 'account_id', 'created_at'
            ]
        });

        if (!personalAccount) throw new NotFoundError();

        return personalAccount;
    },

    getByAccountId: async (accountId) => {
        return await PersonalAccount.find({
            where: {account_id: Number(accountId)},
            select: [
                'id', 'type', 'description', 'target_amount', 'frequency_amount',
                'balance', 'interest', 'duration',
                'status', 'account_id', 'created_at'
            ]
        });
    },

    store: async (requestBody) => {
        const {account_id, type, target_amount, frequency_amount, duration, frequency, description} = requestBody;

        let personalAccount = await PersonalAccount.findOneBy({type, description, account_id});

        if (!personalAccount) personalAccount = await PersonalAccount.save({
            account_id,
            type, target_amount, frequency_amount,
            duration, frequency, description
        });

        return personalAccount;
    }
};