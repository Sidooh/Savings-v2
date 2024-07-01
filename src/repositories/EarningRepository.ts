import { PersonalAccount } from '../entities/models/PersonalAccount';
import { DefaultAccount, Description, MerchantDefaultAccount, Status, TransactionType } from '../utils/enums';
import { In } from 'typeorm';
import SidoohAccounts from '../services/SidoohAccounts';
import { NotFoundError } from '../exceptions/not-found.err';
import { PersonalAccountTransaction } from "../entities/models/PersonalAccountTransaction";
import { BadRequestError } from "../exceptions/bad-request.err";
import { TransactionRepository } from "./TransactionRepository";
import { withdrawalCharge } from "../utils/helpers";
import { PersonalAccountRepository } from "./PersonalAccountRepository";

export const EarningRepository = {
    getAccountEarnings: async account_id => {
        return await PersonalAccount.find({
            select: [
                'id', 'type', 'balance', 'interest',
                'status', 'account_id', 'created_at'
            ],
            where: {
                type: In([DefaultAccount.LOCKED, DefaultAccount.CURRENT, DefaultAccount.MERCHANT, MerchantDefaultAccount.MERCHANT_CASHBACK, MerchantDefaultAccount.MERCHANT_COMMISSION]),
                account_id
            }
        });
    },

    deposit: async body => {
        const deposits = {
            completed: {},
            failed: {}
        };

        //TODO: Can we get the relevant accounts then use PersonalAccountRepo::deposit to actually deposit?
        for (const record of body) {
            try {
                await SidoohAccounts.find(record.account_id);

                const accounts = await PersonalAccount.findBy({
                    type: In([DefaultAccount.LOCKED, DefaultAccount.CURRENT, DefaultAccount.MERCHANT]),
                    account_id: record.account_id
                });

                let currentAcc: PersonalAccount = accounts?.find(a => a.type === DefaultAccount.CURRENT),
                    lockedAcc: PersonalAccount = accounts?.find(a => a.type === DefaultAccount.LOCKED),
                    merchantAcc: PersonalAccount = accounts?.find(a => a.type === DefaultAccount.MERCHANT);

                deposits.completed[record.account_id] = []

                // TODO: simplify this repetition
                if (record.current_amount > 0) {
                    // TODO: refactor common code
                    if (!currentAcc) {
                        currentAcc = PersonalAccount.create({
                            type: DefaultAccount.CURRENT,
                            account_id: record.account_id,
                            balance: record.current_amount,
                            status: Status.ACTIVE,
                        });

                        await PersonalAccount.insert(currentAcc)
                    } else {
                        await PersonalAccount.update({ id: currentAcc.id }, {
                            balance: currentAcc.balance + record.current_amount
                        })
                    }

                    const transaction = await PersonalAccountTransaction.save({
                        amount: record.current_amount,
                        description: Description.ACCOUNT_DEPOSIT,
                        personal_account_id: currentAcc.id,
                        type: TransactionType.CREDIT,
                        status: Status.COMPLETED
                    });

                    deposits.completed[record.account_id].push(transaction)
                }

                if (record.locked_amount > 0) {
                    if (!lockedAcc) {
                        lockedAcc = await PersonalAccount.create({
                            type: DefaultAccount.LOCKED,
                            account_id: record.account_id,
                            balance: record.locked_amount,
                            status: Status.ACTIVE,
                        });
                        await PersonalAccount.insert(lockedAcc)
                    } else {
                        await PersonalAccount.update({ id: lockedAcc.id }, {
                            balance: lockedAcc.balance + record.locked_amount
                        })
                    }

                    const transaction = await PersonalAccountTransaction.save({
                        amount: record.locked_amount,
                        description: Description.ACCOUNT_DEPOSIT,
                        personal_account_id: lockedAcc.id,
                        type: TransactionType.CREDIT,
                        status: Status.COMPLETED
                    });

                    deposits.completed[record.account_id].push(transaction)
                }

                if (record.merchant_amount > 0) {
                    if (!merchantAcc) {
                        merchantAcc = await PersonalAccount.create({
                            type: DefaultAccount.MERCHANT,
                            account_id: record.account_id,
                            balance: record.merchant_amount,
                            status: Status.ACTIVE,
                        });
                        await PersonalAccount.insert(merchantAcc)
                    } else {
                        await PersonalAccount.update({ id: merchantAcc.id }, {
                            balance: merchantAcc.balance + record.merchant_amount
                        })
                    }

                    const transaction = await PersonalAccountTransaction.save({
                        amount: record.merchant_amount,
                        description: Description.ACCOUNT_DEPOSIT,
                        personal_account_id: merchantAcc.id,
                        type: TransactionType.CREDIT,
                        status: Status.COMPLETED
                    });

                    deposits.completed[record.account_id].push(transaction)
                }
            } catch (e) {
                deposits.failed[record.account_id] = e.message;
            }
        }

        return deposits;
    },

    withdraw: async (id, body) => {
        const personalAccount = await PersonalAccount.findOneBy({
            account_id: id,
            type: DefaultAccount.CURRENT
        });

        if (!personalAccount) throw new NotFoundError("Current Personal Account Not Found!");

        const charge = await withdrawalCharge(body.amount)

        if (personalAccount.balance - charge <= body.amount) throw new BadRequestError("Insufficient balance!");

        let withdrawalTransaction = PersonalAccountTransaction.create({
            amount: body.amount,
            description: Description.ACCOUNT_WITHDRAWAL,
            personal_account_id: personalAccount.id,
            type: TransactionType.DEBIT,
            extra: {
                destination: body.destination,
                destination_account: body.destination_account,
                reference: body.reference,
                ipn: body.ipn
            }
        })

        const chargeTransaction = PersonalAccountTransaction.create({
            amount: charge,
            description: Description.ACCOUNT_WITHDRAWAL_CHARGE,
            personal_account_id: personalAccount.id,
            type: TransactionType.CHARGE,
        })

        await PersonalAccountTransaction.insert([withdrawalTransaction, chargeTransaction]);

        await PersonalAccountTransaction.update({ id: withdrawalTransaction.id }, {
            extra: {
                ...withdrawalTransaction.extra,
                charge_transaction_id: chargeTransaction.id
            }
        })

        await PersonalAccount.update({ id: personalAccount.id }, {
            balance: personalAccount.balance - (body.amount + charge)
        })
        await withdrawalTransaction.reload()

        TransactionRepository.processPersonalWithdrawals()

        return withdrawalTransaction;
    },

    merchantDeposit: async body => {
        const deposits = {
            completed: {},
            failed: {}
        };
        // create map of accounts and expected amount keys

        const accountMap = {
            [MerchantDefaultAccount.MERCHANT_CASHBACK]: 'cashback_amount',
            [MerchantDefaultAccount.MERCHANT_COMMISSION]: 'commission_amount'
        }

        // iterate, creating or updating as necessary

        for (const record of body) {
            try {
                await SidoohAccounts.find(record.account_id);

                const accounts = await PersonalAccount.findBy({
                    type: In(Object.keys(accountMap)),
                    account_id: record.account_id
                });

                deposits.completed[record.account_id] = []

                for (const accountType in accountMap) {
                    if (record[accountMap[accountType]] > 0) {
                        let acc = accounts?.find(a => a.type === accountType)

                        if (!acc) {
                            acc = PersonalAccount.create({
                                type: accountType,
                                account_id: record.account_id,
                                status: Status.ACTIVE,
                            });

                            acc = await PersonalAccount.save(acc)

                        }
                        const transaction = await PersonalAccountRepository.deposit(record[accountMap[accountType]], acc.id)

                        deposits.completed[record.account_id].push(transaction)
                    }
                }

            } catch (e) {
                deposits.failed[record.account_id] = e.message;
            }
        }

        return deposits;
    },
};
