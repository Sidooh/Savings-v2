import { PersonalAccountTransaction } from '../entities/models/PersonalAccountTransaction';
import { GroupAccountTransaction } from '../entities/models/GroupAccountTransaction';
import { DefaultAccount, Description, Status, TransactionType } from "../utils/enums";
import log from "../utils/logger";
import { LessThan } from "typeorm";
import SidoohPayments from "../services/SidoohPayments";
import SidoohAccounts from "../services/SidoohAccounts";
import { Payment } from "../entities/models/Payment";
import { NotFoundError } from '../exceptions/not-found.err';
import { env } from "../utils/validate.env";
import SidoohService from "../services/SidoohService";
import { PersonalAccount } from "../entities/models/PersonalAccount";

export const TransactionRepository = {
    getPersonalTransactionById: async (id, withRelations?: string) => {
        const relations = withRelations.split(',');

        const transaction = await PersonalAccountTransaction.findOne({
            where: { id: Number(id) },
            select: ['id', 'type', 'description', 'amount', 'status', 'created_at'],
            relations: {
                personal_account: relations.includes('personal_account') || relations.includes('account'),
                payment: true
            }
        }).then(async transaction => {
            let res: any = transaction;

            if (withRelations.split(',').includes('account')) {
                res = { ...transaction, account: await SidoohAccounts.find(transaction.personal_account.account_id) };
            }

            return res;
        });

        if (!transaction) throw new NotFoundError();

        return transaction;
    },

    getGroupTransactionById: async (id, withRelations?: string) => {
        const relations = withRelations.split(',');

        const transaction = await GroupAccountTransaction.findOne({
            where: { id: Number(id) },
            select: ['id', 'type', 'description', 'amount', 'status', 'created_at'],
            relations: { group_account: relations.includes('group_account') || relations.includes('account') }
        }).then(async transaction => {
            let res: any = transaction;
            if (withRelations.split(',').includes('account')) {
                res = { ...transaction, account: await SidoohAccounts.find(transaction.group_account.account_id) };
            }

            return res;
        });

        if (!transaction) throw new NotFoundError();

        return transaction;
    },

    getAllPersonalTransactions: async (withRelations?: string) => {
        const relations = withRelations.split(',');

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
            order: { id: 'DESC' },
            relations: { personal_account: relations.includes('personal_account') || relations.includes('account') }
        }).then(async transactions => {
            let res: any = transactions;

            if (withRelations.split(',').includes('account')) {
                const accounts = await SidoohAccounts.findAll();
                res = transactions.map(i => ({
                    ...i, account: accounts.find(a => String(a.id) === i.personal_account.account_id)
                }));
            }

            return res;
        });
    },

    getAllGroupAccountTransactions: async (withRelations?: string) => {
        const relations = withRelations.split(',');

        return GroupAccountTransaction.find({
            select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                status: true,
                created_at: true,
                group_account: { id: true, balance: true, account_id: true, group_id: true }
            },
            order: { id: 'DESC' },
            relations: { group_account: relations.includes('group_account') || relations.includes('account') }
        }).then(async transactions => {
            let res: any = transactions;

            if (withRelations.split(',').includes('account')) {
                const accounts = await SidoohAccounts.findAll();
                res = transactions.map(i => ({
                    ...i, account: accounts.find(a => String(a.id) === i.group_account.account_id)
                }));
            }

            return res;
        });
    },

    getAllGroupTransactions: async (group_id, withGroup = null) => {
        return await GroupAccountTransaction.find({
            where: { group_account: { group_id } },
            select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                status: true,
                group_account: { id: true, balance: true, account_id: true, group_id: true }
            },
            order: { id: 'DESC' },
            relations: { group_account: Boolean(withGroup) }
        });
    },


    processPersonalWithdrawals: async () => {
        log.info("---> Processing Personal Withdrawals...");

        const transactions = await PersonalAccountTransaction.find({
            select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                status: true,
                extra: true,
            },
            where: {
                type: TransactionType.DEBIT,
                status: Status.PENDING,
                amount: LessThan(1000),
            },
            relations: { personal_account: true, payment: true }
        });

        log.info(`...Processing ${transactions.length} transactions`);

        const results = {};
        for (const t of transactions) {
            try {
                const account = await SidoohAccounts.find(t.personal_account.account_id);
                // Withdraw from account
                // TODO: create method, helper to get withdrawal amount

                if (t.payment) {
                    // If payment exists, just query the status and update accordingly
                    await SidoohPayments.queryPayment(t.payment.payment_id)
                        .then(async ({ data }) => {
                                if (data && data.status === Status.COMPLETED) {
                                    t.payment.status = Status.COMPLETED;
                                    await t.payment.save();

                                    t.status = Status.COMPLETED;
                                    await t.save();

                                    results[t.id] = t;

                                    // Notify user
                                    SidoohService.callback({
                                        ...t,
                                        personal_account: undefined,
                                        payment: undefined,
                                        deleted_at: undefined
                                    })
                                }

                                if (data && data.status == Status.FAILED) {
                                    t.payment.status = Status.FAILED;
                                    await t.payment.save();

                                    t.status = Status.FAILED;
                                    await t.save();

                                    results[t.id] = t;

                                    // Notify user
                                    SidoohService.callback({
                                        ...t,
                                        personal_account: undefined,
                                        payment: undefined,
                                        deleted_at: undefined
                                    })
                                }

                                // TODO: Handle for other status or non-existent (undefined res)
                                results[t.id] = t.status
                            },
                            async () => {
                                results[t.id] = "Payment requested"
                            });
                } else {
                    if (t.personal_account.balance - 50 < t.amount) {
                        throw new Error('Account Balance is insufficient');
                    }

                    t.personal_account.balance -= t.amount;
                    await t.save();

                    const { destination, destination_account }: { [key: string]: any } = t.extra

                    // Request Payment
                    await SidoohPayments.requestPayment({
                        account_id: account['id'],
                        amount: t.amount,
                        description: Description.ACCOUNT_WITHDRAWAL,
                        reference: t.id,
                        source: 'FLOAT',
                        source_account: 1,
                        ipn: env.APP_URL + "/payments/callback",
                        destination,
                        destination_account
                    }).then(async ({ data }) => {
                        await Payment.save({
                            ...data,
                            payment_id: data.id,
                            // type: data.type,
                            // subtype: data.subtype,
                            // description: data.description,
                            // amount: data.amount,
                            // status: data.status,
                            // reference: data.reference,
                            // destination: res.destination,
                            transaction: t,
                        });

                        results[t.id] = "Payment requested"
                    }, (e) => {
                        results[t.id] = "Failed to process payment"
                    });

                }

                // Mark transaction complete?
                // results[t.id] = payment
            } catch (e) {
                //reverse actions // rollback
                t.personal_account.balance += t.amount;
                await t.personal_account.save();

                results[t.id] = e.message;
            }

            // if (t.status !== Status.PENDING)
            // SidoohService.callback({ ...t, personal_account: undefined, payment: undefined });
        }

        log.info("<--- Processed Personal Withdrawals", results);

        return results;
    },


    processPaymentCallback: async (data: any) => {
        log.info('processPaymentCallback', { data });

        const payment = await Payment.findOne({
            where: {
                reference: data.id
            },
            relations: { transaction: true }
        });

        log.info({ payment });

        if (data.status === Status.COMPLETED) {
            payment.status = Status.COMPLETED;
            await payment.save();

            payment.transaction.status = Status.COMPLETED;
            await payment.transaction.save();

            // Notify user
        }

        if (data.status == Status.FAILED) {
            payment.status = Status.FAILED;
            await payment.save();

            payment.transaction.status = Status.FAILED;
            await payment.transaction.save();

            try {
                // Perform refund // TODO: what happens to group transactions?
                const personalAccount = await PersonalAccount.findOneBy({
                    account_id: payment.transaction.personal_account_id,
                    type: DefaultAccount.CURRENT
                });

                await PersonalAccountTransaction.save({
                    amount: payment.transaction.amount,
                    description: Description.ACCOUNT_WITHDRAWAL_REFUND,
                    personal_account_id: personalAccount.id,
                    type: TransactionType.CREDIT,
                    extra: {
                        transaction: payment.transaction.id,
                    }
                });

                personalAccount.balance += payment.transaction.amount;
                await personalAccount.save();
            } catch (e) {
                log.error("failed to perform refund", e)
            }

            // Notify user
        }

        SidoohService.callback({ ...payment.transaction })

        return {};
    }
}
