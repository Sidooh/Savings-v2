import { PersonalAccount } from '../entities/models/PersonalAccount';
import { NotFoundError } from '../exceptions/not-found.err';
import { DefaultAccount, Description, Status, TransactionType } from '../utils/enums';
import { PersonalAccountTransaction } from '../entities/models/PersonalAccountTransaction';
import { DeepPartial, In } from 'typeorm';
import SidoohAccounts from '../services/SidoohAccounts';
import { withdrawalCharge } from "../utils/helpers";
import { BadRequestError } from "../exceptions/bad-request.err";

export const PersonalAccountRepository = {
    index: async (withRelations?: string) => {
        const relations = withRelations.split(',');

        return PersonalAccount.find({
            select: [
                'id', 'type', 'description', 'target_amount', 'frequency_amount',
                'balance', 'interest', 'duration',
                'status', 'account_id', 'created_at'
            ],
            order: { id: 'DESC' },
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

    getById: async (id: number, withRelations?: string) => {
        const relations = withRelations.split(',');

        const personalAccount = await PersonalAccount.findOne({
            where: { id: Number(id) },
            select: [
                'id', 'account_id', 'type', 'description', 'target_amount', 'frequency_amount',
                'balance', 'interest', 'duration', 'frequency',
                'status', 'account_id', 'created_at'
            ],
            relations: { transactions: relations.includes('transactions') },
            order: { transactions: { id: 'DESC' } }
        }).then(async acc => {
            let res: any = acc;
            if (relations.includes('account')) {
                res = { ...acc, account: await SidoohAccounts.find(acc.account_id) };
            }

            return res;
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

    storeDefaults: async (account_id: any) => {
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

    deposit: async (amount: number, personalAccId: any) => {
        const personalAcc = await PersonalAccount.findOneBy({ id: personalAccId });

        if (!personalAcc) throw new NotFoundError("Personal Account Not Found!");

        const transaction = await PersonalAccountTransaction.save({
            amount,
            description: Description.ACCOUNT_DEPOSIT,
            personal_account_id: personalAccId,
            type: TransactionType.CREDIT,
            status: Status.COMPLETED
        });

        personalAcc.balance += amount
        await personalAcc.save()

        return transaction;
    },

    withdraw: async (personalAccId: number, body: any) => {
        const personalAcc = await PersonalAccount.findOneBy({ id: personalAccId });

        if (!personalAcc) throw new NotFoundError("Personal Account Not Found!");
        if (personalAcc.type === DefaultAccount.LOCKED && personalAcc.balance <= 30000000)
            return { message: "Cannot Withdraw From Locked Account!" };
        if (personalAcc.balance <= body.amount) return { message: "Insufficient balance!" };

        const charge = await withdrawalCharge(body.amount);

        if (personalAcc.balance - charge <= body.amount) throw new BadRequestError("Insufficient balance!");

        const transaction = PersonalAccountTransaction.create({
            amount: body.amount,
            description: Description.ACCOUNT_WITHDRAWAL,
            personal_account_id: personalAccId,
            type: TransactionType.DEBIT,
            extra: {
                destination: body.destination,
                destination_account: body.destination_account,
                reference: body.reference,
                ipn: body.ipn
            }
        });

        const chargeTransaction = PersonalAccountTransaction.create({
            amount: charge,
            description: Description.ACCOUNT_WITHDRAWAL_CHARGE,
            personal_account_id: personalAcc.id,
            type: TransactionType.CHARGE,
        })


        await PersonalAccountTransaction.insert([transaction, chargeTransaction]);

        await PersonalAccountTransaction.update({ id: transaction.id }, {
            extra: {
                ...transaction.extra,
                charge_transaction_id: chargeTransaction.id
            }
        })

        await PersonalAccount.update({ id: personalAcc.id }, {
            balance: personalAcc.balance - (body.amount + charge)
        })
        await transaction.reload()

        return transaction;
    },
};
