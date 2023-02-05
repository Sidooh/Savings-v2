import { ColumnExtra, PersonalAccountTransaction } from '../entities/models/PersonalAccountTransaction';
import { GroupAccountTransaction } from '../entities/models/GroupAccountTransaction';
import { Description, Status, TransactionType } from "../utils/enums";
import log from "../utils/logger";
import { In, LessThan } from "typeorm";
import SidoohPayments from "../services/SidoohPayments";
import SidoohAccounts from "../services/SidoohAccounts";
import { Payment } from "../entities/models/Payment";
import { NotFoundError } from '../exceptions/not-found.err';
import { env } from "../utils/validate.env";
import SidoohService from "../services/SidoohService";
import { PersonalAccount } from "../entities/models/PersonalAccount";
import { BadRequestError } from "../exceptions/bad-request.err";
import { AppDataSource } from "../entities/data-source";

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

    getAllGroupTransactions: async (group_id, withRelations?: string) => {
        const relations = withRelations.split(',');

        return GroupAccountTransaction.find({
            where: { group_account: { group_id } },
            select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                status: true,
                created_at: true,
                group_account: { id: true, balance: true, account_id: true, group_id: true, group: { name: true } }
            },
            order: { id: 'DESC' },
            relations: {
                group_account: {
                    group: relations.includes('group_account') || relations.includes('account') || relations.includes('group')
                }
            }
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


    processPersonalWithdrawals: async () => {
        log.info("---> Processing Personal Withdrawals...");

        const transactions = await PersonalAccountTransaction.find({
            select: ['id', 'type', 'description', 'amount', 'status', 'extra'],
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
            const { charge_transaction_id }: ColumnExtra = t.extra
            const chargeTransaction = await PersonalAccountTransaction.findOneBy({ id: charge_transaction_id })

            try {
                const account = await SidoohAccounts.find(t.personal_account.account_id);

                // Withdraw from account
                if (t.payment) {
                    // If payment exists, just query the status and update accordingly
                    await SidoohPayments.findById(t.payment.payment_id)
                        .then(async ({ data }) => {
                            t.payment.transaction = t

                            await TransactionRepository.handleWithdrawal(t.payment, data)

                            results[t.id] = t.status
                        }, () => results[t.id] = "Payment requested");
                } else {
                    const { destination, destination_account }: ColumnExtra = t.extra

                    // Request Payment
                    await SidoohPayments.requestPayment({
                        account_id: account['id'],
                        amount: t.amount,
                        description: Description.ACCOUNT_WITHDRAWAL,
                        reference: t.id,
                        source: 'FLOAT',
                        source_account: 2,
                        ipn: env.APP_URL + "/payments/callback",
                        destination,
                        destination_account
                    }).then(async ({ data }) => {
                        await Payment.insert(Payment.create({
                            payment_id: data.id,
                            type: data.type,
                            subtype: data.subtype,
                            description: data.description,
                            amount: data.amount,
                            status: data.status,
                            reference: data.reference,
                            destination: data.destination,
                            transaction: t,
                        }));

                        results[t.id] = "Payment requested"
                    }, () => results[t.id] = "Failed to process payment");
                }
            } catch (e) {
                //reverse actions // rollback
                await PersonalAccount.update({ id: t.personal_account_id }, {
                    balance: t.personal_account.balance + t.amount + chargeTransaction.amount
                })

                results[t.id] = e.message;
            }
        }

        log.info("<--- Processed Personal Withdrawals", results);

        return results;
    },

    processPaymentCallback: async (data: any) => {
        log.info('[REPO - TRANSACTION] processPaymentCallback...', { data });

        const payment = await Payment.findOne({
            where: { payment_id: data.id },
            relations: ['transaction', 'transaction.personal_account']
        });

        await TransactionRepository.handleWithdrawal(payment, data)
    },

    handleWithdrawal: async (payment: Payment, data) => {
        if (!payment) throw new NotFoundError("Payment not found.");
        if (payment.status !== Status.PENDING) throw new BadRequestError("Payment not pending.");
        if (payment.transaction.status !== Status.PENDING) throw new BadRequestError("Transaction not pending.");

        const chargeTransaction = await PersonalAccountTransaction.findOneBy({ id: payment.transaction.extra.charge_transaction_id })

        if (data.status === Status.COMPLETED) {
            await AppDataSource.transaction(async () => {
                await Payment.update({ id: payment.id }, { status: Status.COMPLETED })
                await PersonalAccountTransaction.update({
                    id: In([chargeTransaction.id, payment.transaction_id])
                }, { status: Status.COMPLETED })
            })
        }

        if (data.status == Status.FAILED) {
            await AppDataSource.transaction(async () => {
                await Payment.update({ id: payment.id }, { status: Status.FAILED })
                await PersonalAccountTransaction.update({
                    id: In([chargeTransaction.id, payment.transaction_id])
                }, { status: Status.FAILED })

                try {
                    // TODO: what happens to group transactions?

                    // Perform refund
                    await PersonalAccountTransaction.insert(PersonalAccountTransaction.create({
                        amount: payment.transaction.amount + chargeTransaction.amount,
                        description: Description.ACCOUNT_WITHDRAWAL_REFUND,
                        personal_account_id: payment.transaction.personal_account_id,
                        type: TransactionType.CREDIT,
                        status: Status.COMPLETED,
                        extra: { transaction: payment.transaction.id, }
                    }))

                    await PersonalAccount.update({ id: payment.transaction.personal_account_id }, {
                        balance: payment.transaction.personal_account.balance + payment.transaction.amount + chargeTransaction.amount
                    })
                } catch (e) {
                    log.error("failed to perform refund", e)
                }
            })
        }

        await payment.reload()

        SidoohService.callback({
            url: payment.transaction.extra.ipn,
            data: {
                id: payment.transaction.id,
                status: payment.transaction.status
            }
        })
    }
}
