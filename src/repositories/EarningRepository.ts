import { PersonalAccount } from '../entities/models/PersonalAccount';
import { DefaultAccount } from '../utils/enums';
import { In } from 'typeorm';
import SidoohAccounts from '../services/SidoohAccounts';

export const EarningRepository = {
    getAccountEarnings: async account_id => {
        return await PersonalAccount.findBy({
            type: In([DefaultAccount.LOCKED, DefaultAccount.CURRENT]),
            account_id
        });
    },

    store: async body => {

        for (const acc of body) {
            await SidoohAccounts.find(acc.account_id)

            await PersonalAccount.getRepository().increment({
                account_id: acc.account_id,
                type: DefaultAccount.LOCKED
            }, 'balance', acc.locked_amount);

            await PersonalAccount.getRepository().increment({
                account_id: acc.account_id,
                type: DefaultAccount.CURRENT
            }, 'balance', acc.current_amount);
        }
    }
};