import { PersonalAccount } from '../entities/models/PersonalAccount';
import { PersonalAccountType } from '../utils/enums';
import { In } from 'typeorm';

export const EarningRepository = {
    getAccountEarnings: async account_id => {
        return await PersonalAccount.findBy({
            type: In([PersonalAccountType.LOCKED, PersonalAccountType.CURRENT]),
            account_id
        });
    },

    store: async body => {
        for (const acc of body) {
            await PersonalAccount.getRepository().increment({
                account_id: acc.account_id,
                type: PersonalAccountType.LOCKED
            }, 'balance', acc.locked_amount);

            await PersonalAccount.getRepository().increment({
                account_id: acc.account_id,
                type: PersonalAccountType.CURRENT
            }, 'balance', acc.current_amount);
        }
    }
};