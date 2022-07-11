import { PersonalAccountTransaction } from '../entities/models/PersonalAccountTransaction';
import { GroupAccountTransaction } from '../entities/models/GroupAccountTransaction';
import { Description, SavingsAccountType, Status, TransactionType } from "../utils/enums";
import log from "../utils/logger";
import { LessThan } from "typeorm";
import SidoohPayments from "../services/SidoohPayments";
import SidoohAccounts from "../services/SidoohAccounts";
import { Payment } from "../entities/models/Payment";
import SidoohProducts from "../services/SidoohProducts";

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

    getAllGroupTransactions: async (group_id, withGroup = null) => {
        return await GroupAccountTransaction.find({
            where: {group_account: {group_id}},
            select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                status: true,
                group_account: {id: true, balance: true, account_id: true, group_id: true}
            },
            relations: {group_account: Boolean(withGroup)}
        });
    },


    processPersonalWithdrawals: async () => {
        log.info("Processing Personal Withdrawals...");

        const transactions = await PersonalAccountTransaction.find({
            select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                status: true,
            },
            where: {
                status: Status.PENDING,
                amount: LessThan(100),
            },
            relations: {personal_account: true, payment: true}
        });

        log.info(`...Processing ${transactions.length} transactions`);

        const results = {}
        for (const t of transactions) {
            try {
                const account = await SidoohAccounts.find(t.personal_account.account_id)
                // Withdraw from account
                // TODO: create method, helper to get withdrawal amount

                if (t.payment) {
                    // If payment exists, just query the status and update accordingly
                    await SidoohPayments.queryPayment(t.payment.reference)
                        .then(async res => {

                            if (res && res.status === Status.COMPLETED) {
                                t.payment.status = Status.COMPLETED
                                await t.payment.save()

                                t.status = Status.COMPLETED
                                await t.save()

                                results[t.id] = t.payment

                                // Notify user
                            }

                            if (res && res.status == Status.FAILED) {
                                console.log({res})
                                t.payment.status = Status.FAILED
                                await t.payment.save()

                                t.status = Status.FAILED
                                await t.save()

                                results[t.id] = t.payment

                                // Notify user
                            }

                            // TODO: Handle for other status or non-existent (undefined res)

                        }, error => {
                            throw new Error('Payment already initialized')
                        })

                } else {
                    if (t.personal_account.balance - 50 < t.amount) {
                        throw new Error('Account Balance is insufficient')
                    }

                    t.personal_account.balance -= t.amount
                    await t.save()

                    // Request Payment
                    const description = t.description.split(' - ')
                    const destination = description.length > 1 ? description[1] : account['phone']
                    await SidoohPayments.requestPayment({
                        amount: t.amount,
                        destination,
                        payable_type: SavingsAccountType.PERSONAL + '_SAVING_TRANSACTION',
                        payable_id: t.id,
                        account_id: account['id']
                    })
                        .then(async res => {
                                const p = await Payment.save({
                                    type: TransactionType.DEBIT,
                                    description: Description.ACCOUNT_WITHDRAWAL,
                                    amount: t.amount,
                                    transaction: t,
                                    reference: res.id,
                                })
                                results[t.id] = p
                            },
                            async error => {
                                throw new Error("Failed")
                            })

                }

                // Mark transaction complete?
                // results[t.id] = payment
            } catch (e) {
                //reverse actions // rollback
                t.personal_account.balance += t.amount
                await t.personal_account.save()

                results[t.id] = e.message
            }

            SidoohProducts.withdrawalCallback({...t, personal_account: undefined, payment: undefined})
        }

        log.info("...Processed Personal Withdrawals!", results);
    },


    processPaymentCallback: async (data: any) => {
        console.log('processPaymentCallback', {data})
        const payment = await Payment.findOne({
            where: {
                reference: data.id
            },
            relations: {transaction: true}
        })

        console.log({payment})

        if (data.status === Status.COMPLETED) {
            payment.status = Status.COMPLETED
            await payment.save()

            payment.transaction.status = Status.COMPLETED
            await payment.transaction.save()

            // Notify user
        }

        if (data.status == Status.FAILED) {
            payment.status = Status.FAILED
            await payment.save()

            payment.transaction.status = Status.FAILED
            await payment.transaction.save()

            // Notify user
        }

        SidoohProducts.withdrawalCallback({...payment.transaction})

        return {}
    }
};
