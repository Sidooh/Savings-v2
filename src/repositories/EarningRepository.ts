import { PersonalAccount } from '../entities/models/PersonalAccount';
import { DefaultAccount, Description, Status, TransactionType } from '../utils/enums';
import { In } from 'typeorm';
import SidoohAccounts from '../services/SidoohAccounts';
import { NotFoundError } from '../exceptions/not-found.err';
import { PersonalAccountTransaction } from "../entities/models/PersonalAccountTransaction";
import { BadRequestError } from "../exceptions/bad-request.err";
import SidoohPayments from "../services/SidoohPayments";

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

    deposit: async body => {
        const transactions = {
            completed: {},
            failed: {}
        };

        //TODO: Can we get the relevant accounts then use PersonalAccountRepo::deposit to actually deposit?
        for (const record of body) {
            try {
                await SidoohAccounts.find(record.account_id);

                const accounts = await PersonalAccount.findBy({
                    type: In([DefaultAccount.LOCKED, DefaultAccount.CURRENT]),
                    account_id: record.account_id
                });

                let currentAcc: PersonalAccount = accounts?.find(a => a.type === DefaultAccount.CURRENT),
                    lockedAcc: PersonalAccount = accounts?.find(a => a.type === DefaultAccount.LOCKED);

                if (!currentAcc) {
                    currentAcc = PersonalAccount.create({
                        type: DefaultAccount.CURRENT,
                        account_id: record.account_id,
                        balance: record.current_amount
                    });

                    await PersonalAccount.insert(currentAcc)
                } else {
                    await PersonalAccount.update({ id: currentAcc.id }, {
                        balance: currentAcc.balance + record.current_amount
                    })
                }

                if (!lockedAcc) {
                    lockedAcc = await PersonalAccount.create({
                        type: DefaultAccount.LOCKED,
                        account_id: record.account_id,
                        balance: record.locked_amount
                    });
                    await PersonalAccount.insert(lockedAcc)
                } else {
                    await PersonalAccount.update({ id: lockedAcc.id }, {
                        balance: lockedAcc.balance + record.locked_amount
                    })
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

    withdraw: async (id, body) => {
        const personalAccount = await PersonalAccount.findOneBy({
            account_id: id,
            type: DefaultAccount.CURRENT
        });

        if (!personalAccount) throw new NotFoundError("Current Personal Account Not Found!");

        const charge = await SidoohPayments.getWithdrawalCharge(body.amount)
        if (!charge) throw new BadRequestError('Unable to fetch withdrawal charge!')

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

        return withdrawalTransaction;
    }
};
