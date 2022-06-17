import { PersonalAccount } from '../entities/models/PersonalAccount';
import { DefaultAccount } from '../utils/enums';
import { In } from 'typeorm';
import SidoohAccounts from '../services/SidoohAccounts';
import { PersonalEarning } from '../entities/models/PersonalEarning';

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

            let personalEarnings = await PersonalEarning.findOneBy({account_id: acc.account_id});

            if (!personalEarnings) {
                personalEarnings = PersonalEarning.create({
                    account_id     : acc.account_id,
                    current_balance: acc.current_amount,
                    locked_balance : acc.locked_amount
                });
            } else {
                personalEarnings.locked_balance += acc.locked_amount;
                personalEarnings.current_balance += acc.current_amount;
            }

            await personalEarnings.save();
        }
    }
};