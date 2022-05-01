import { PersonalAccount } from '../entities/models/PersonalAccount';
import { NotFoundError } from '../exceptions/not-found.err';
import { DefaultAccount, Description, TransactionType } from '../utils/enums';
import { PersonalAccountTransaction } from '../entities/models/PersonalAccountTransaction';
import { DeepPartial } from 'typeorm';
import SidoohAccounts from '../services/SidoohAccounts';

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

    store: async (requestBody: DeepPartial<PersonalAccount>) => {
        const {account_id, type, target_amount, frequency_amount, duration, frequency, description} = requestBody;

        await SidoohAccounts.find(account_id)

        let personalAccount = await PersonalAccount.findOneBy({type, description, account_id});

        if (!personalAccount) personalAccount = await PersonalAccount.save({
            account_id,
            type, target_amount, frequency_amount,
            duration, frequency, description
        });

        return personalAccount;
    },

    storeDefaults: async accountId => {
        await SidoohAccounts.find(accountId)

        const lockedAcc = await PersonalAccountRepository.store({
            account_id: accountId,
            type: DefaultAccount.LOCKED
        });
        const currentAcc = await PersonalAccountRepository.store({
            account_id: accountId,
            type: DefaultAccount.CURRENT
        });

        return {lockedAcc, currentAcc};
    },

    deposit: async (amount: number, personalAccId) => {
        const personalAcc = await PersonalAccount.findOneBy({id: personalAccId});

        if (!personalAcc) throw new NotFoundError("Personal Account Not Found!");

        const transaction = await PersonalAccountTransaction.save({
            amount,
            description: Description.ACCOUNT_DEPOSIT,
            personal_account_id: personalAccId,
            type: TransactionType.CREDIT
        });

        await PersonalAccount.getRepository().increment({id: personalAccId}, 'balance', amount);

        return transaction;
    },

    withdraw: async (amount: number, personalAccId) => {
        const personalAcc = await PersonalAccount.findOneBy({id: personalAccId});

        if (!personalAcc) throw new NotFoundError("Personal Account Not Found!");
        if (personalAcc.type === DefaultAccount.LOCKED && personalAcc.balance <= 30000000)
            return {message: "Cannot Withdraw From Locked Account!"};
        if (personalAcc.balance <= amount) return {message: "Insufficient balance!"};

        const transaction = await PersonalAccountTransaction.save({
            amount,
            description: Description.ACCOUNT_WITHDRAWAL,
            personal_account_id: personalAccId,
            type: TransactionType.DEBIT
        });

        await PersonalAccount.getRepository().decrement({id: personalAccId}, 'balance', amount);

        return transaction;
    }
};