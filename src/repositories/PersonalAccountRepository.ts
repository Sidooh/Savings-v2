import { PersonalAccount } from '../entities/models/PersonalAccount';
import { NotFoundError } from '../exceptions/not-found.err';
import { DefaultAccount, Description, TransactionType } from '../utils/enums';
import { PersonalAccountTransaction } from '../entities/models/PersonalAccountTransaction';
import { DeepPartial, In } from 'typeorm';
import SidoohAccounts from '../services/SidoohAccounts';

export const PersonalAccountRepository = {
    index: async (withRelations?: string) => {
        const relations = withRelations.split(',');

        return PersonalAccount.find({
            select: [
                'id', 'type', 'description', 'target_amount', 'frequency_amount',
                'balance', 'interest', 'duration',
                'status', 'account_id', 'created_at'
            ]
        }).then(async personalAccounts => {
            let res: any = personalAccounts;

            if (relations.includes('account')) {
                const accounts = await SidoohAccounts.findAll();
                res = personalAccounts.map(pa => ({
                    ...pa, account: accounts.find(a => String(a.id) === pa.account_id)
                }));
            }

            return res;
        });
    },

    getById: async (id: number) => {
        const personalAccount = await PersonalAccount.findOne({
            where: { id: Number(id) },
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
            where: { account_id: Number(accountId) },
            select: [
                'id', 'type', 'description', 'target_amount', 'frequency_amount',
                'balance', 'interest', 'duration',
                'status', 'account_id', 'created_at'
            ]
        });
    },

    store: async (requestBody: DeepPartial<PersonalAccount>) => {
        const { account_id, type, target_amount, frequency_amount, duration, frequency, description } = requestBody;

        await SidoohAccounts.find(account_id);

        let personalAccount = await PersonalAccount.findOneBy({ type, description, account_id });

        if (!personalAccount) personalAccount = await PersonalAccount.save({
            account_id,
            type, target_amount, frequency_amount,
            duration, frequency, description
        });

        return personalAccount;
    },

    storeDefaults: async account_id => {
        await SidoohAccounts.find(account_id);

        const accs = await PersonalAccount.findBy({
            type: In([DefaultAccount.LOCKED, DefaultAccount.CURRENT]),
            account_id
        })

        let current, locked: PersonalAccount
        for (const acc of accs) {
            if (acc.type === DefaultAccount.LOCKED) {
                locked = acc
            }

            if (acc.type === DefaultAccount.CURRENT) {
                current = acc
            }
        }

        if (!current) current = await PersonalAccount.save({ type: DefaultAccount.CURRENT, account_id });
        if (!locked) locked = await PersonalAccount.save({ type: DefaultAccount.LOCKED, account_id });

        return [current, locked];
    },

    deposit: async (amount: number, personalAccId) => {
        const personalAcc = await PersonalAccount.findOneBy({ id: personalAccId });

        if (!personalAcc) throw new NotFoundError("Personal Account Not Found!");

        const transaction = await PersonalAccountTransaction.save({
            amount,
            description: Description.ACCOUNT_DEPOSIT,
            personal_account_id: personalAccId,
            type: TransactionType.CREDIT
        });

        personalAcc.balance += amount
        await personalAcc.save()

        return transaction;
    },

    withdraw: async (amount: number, personalAccId) => {
        const personalAcc = await PersonalAccount.findOneBy({ id: personalAccId });

        if (!personalAcc) throw new NotFoundError("Personal Account Not Found!");
        if (personalAcc.type === DefaultAccount.LOCKED && personalAcc.balance <= 30000000)
            return { message: "Cannot Withdraw From Locked Account!" };
        if (personalAcc.balance <= amount) return { message: "Insufficient balance!" };

        const transaction = await PersonalAccountTransaction.save({
            amount,
            description: Description.ACCOUNT_WITHDRAWAL,
            personal_account_id: personalAccId,
            type: TransactionType.DEBIT
        });

        personalAcc.balance -= amount;
        await personalAcc.save();

        return transaction;
    },
};
