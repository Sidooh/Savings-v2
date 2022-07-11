import { PersonalAccount } from '../entities/models/PersonalAccount';
import { DefaultAccount, Description, Status, TransactionType } from '../utils/enums';
import { In } from 'typeorm';
import SidoohAccounts from '../services/SidoohAccounts';
import { NotFoundError } from '../exceptions/not-found.err';
import { PersonalAccountTransaction } from "../entities/models/PersonalAccountTransaction";
import { BadRequestError } from "../exceptions/bad-request.err";

export const EarningRepository = {
    getAccountEarnings: async account_id => {
        return await PersonalAccount.find({
            select: [
                'id', 'type', 'balance', 'interest',
                'status', 'account_id', 'created_at'
            ],
            where: {
                type: In([DefaultAccount.LOCKED, DefaultAccount.CURRENT]),
                account_id
            }
        });
    },

    store: async body => {
        const transactions = {
            completed: {},
            failed: {}
        }

        //TODO: Can we get the relevant accounts then use PersonalAccountRepo::deposit to actually deposit?
        for (const record of body) {
            try {
                await SidoohAccounts.find(record.account_id);

                const accs = await PersonalAccount.findBy({
                    type: In([DefaultAccount.LOCKED, DefaultAccount.CURRENT]),
                    account_id: record.account_id
                });

                let currentAcc, lockedAcc: PersonalAccount
                for (const acc of accs) {
                    if (acc.type === DefaultAccount.LOCKED) {
                        lockedAcc = acc
                    }

                    if (acc.type === DefaultAccount.CURRENT) {
                        currentAcc = acc
                    }
                }

                if (!currentAcc) {
                    currentAcc = await PersonalAccount.save({
                        type: DefaultAccount.CURRENT,
                        account_id: record.account_id,
                        balance: record.current_amount
                    });
                } else {
                    currentAcc.balance += record.current_amount;
                    await currentAcc.save();
                }

                if (!lockedAcc) {
                    lockedAcc = await PersonalAccount.save({
                        type: DefaultAccount.LOCKED,
                        account_id: record.account_id,
                        balance: record.locked_amount
                    });
                } else {
                    lockedAcc.balance += record.locked_amount;
                    await lockedAcc.save();
                }

                const cTransaction = await PersonalAccountTransaction.save({
                    amount: record.current_amount,
                    description: Description.ACCOUNT_DEPOSIT,
                    personal_account_id: currentAcc.id,
                    type: TransactionType.CREDIT,
                    status: Status.COMPLETED
                });
                const lTransaction = await PersonalAccountTransaction.save({
                    amount: record.locked_amount,
                    description: Description.ACCOUNT_DEPOSIT,
                    personal_account_id: lockedAcc.id,
                    type: TransactionType.CREDIT,
                    status: Status.COMPLETED
                });

                transactions.completed[record.account_id] = [cTransaction, lTransaction];

            } catch (e) {
                transactions.failed[record.account_id] = e.message;
            }
        }

        return transactions;
    },

    withdraw: async body => {
        const transactions = {
            completed: {},
            failed: {}
        }
        for (const acc of body) {
            try {
                await SidoohAccounts.find(acc.account_id);

                const personalAccount = await PersonalAccount.findOneBy({
                    account_id: acc.account_id,
                    type: DefaultAccount.CURRENT
                });

                if (!personalAccount) throw new NotFoundError("Current Personal Account Not Found!");

                if (personalAccount.balance-50 <= acc.amount) throw new BadRequestError("Insufficient balance!");

                const transaction = await PersonalAccountTransaction.save({
                    amount: acc.amount,
                    description: Description.ACCOUNT_WITHDRAWAL + ' - ' + acc.destination,
                    personal_account_id: personalAccount.id,
                    type: TransactionType.DEBIT
                });

                personalAccount.balance -= acc.amount;
                await personalAccount.save();

                transactions.completed[acc.ref] = transaction;
            } catch (e) {
                transactions.failed[acc.ref] = e.message;
            }
        }
        // TODO: Is this good practice?
        // if (transactions.completed.length === 0) transactions.completed = undefined
        // if (transactions.failed.length === 0) transactions.failed = undefined

        return transactions
    }
};
