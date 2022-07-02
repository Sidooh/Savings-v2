import { PersonalAccount } from '../entities/models/PersonalAccount';
import {DefaultAccount, Description, TransactionType} from '../utils/enums';
import { In } from 'typeorm';
import SidoohAccounts from '../services/SidoohAccounts';
import { PersonalEarning } from '../entities/models/PersonalEarning';
import { NotFoundError } from '../exceptions/not-found.err';
import {PersonalAccountTransaction} from "../entities/models/PersonalAccountTransaction";
import {BadRequestError} from "../exceptions/bad-request.err";

export const EarningRepository = {
    getAccountEarnings: async account_id => {
        return await PersonalAccount.findBy({
            type: In([DefaultAccount.LOCKED, DefaultAccount.CURRENT]),
            account_id
        });
    },

    store: async body => {
        for (const acc of body) {
            await SidoohAccounts.find(acc.account_id);

            const personalEarnings = await PersonalEarning.findOneBy({account_id: acc.account_id});

            if (!personalEarnings) throw new NotFoundError("Personal Earnings Account Not Found!");

            personalEarnings.locked_balance += acc.locked_amount;
            personalEarnings.current_balance += acc.current_amount;

            await personalEarnings.save();
        }
    },

    withdraw: async body => {
        const transactions = {
            completed: [],
            failed: []
        }
        for (const acc of body) {
            try {
                await SidoohAccounts.find(acc.account_id);

                const personalAccount = await PersonalAccount.findOneBy({
                    account_id: acc.account_id,
                    type: DefaultAccount.CURRENT
                });

                if (!personalAccount) throw new NotFoundError("Current Personal Account Not Found!");

                if (personalAccount.balance <= acc.amount) throw new BadRequestError("Insufficient balance!");

                const transaction = await PersonalAccountTransaction.save({
                    amount: acc.amount,
                    description: Description.ACCOUNT_WITHDRAWAL,
                    personal_account_id: personalAccount.id,
                    type: TransactionType.DEBIT
                });

                personalAccount.balance -= acc.amount;
                await personalAccount.save();

                transactions.completed.push(transaction);
            } catch (e) {
                transactions.failed.push({[acc.account_id]: e.message});
            }
        }
        // TODO: Is this good practice?
        // if (transactions.completed.length === 0) transactions.completed = undefined
        // if (transactions.failed.length === 0) transactions.failed = undefined

        return transactions
    }
};
