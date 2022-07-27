import { Group } from '../entities/models/Group';
import { GroupAccountTransaction } from '../entities/models/GroupAccountTransaction';
import { Description, TransactionType } from '../utils/enums';
import { NotFoundError } from '../exceptions/not-found.err';
import SidoohAccounts from '../services/SidoohAccounts';

export const GroupRepository = {
    index: async (withGroupAccounts = null) => {
        return await Group.find({
            select: ['id', 'name', 'balance', 'interest', 'created_at'],
            relations: {
                group_accounts: Boolean(withGroupAccounts)
            }
        });
    },

    getById: async (id, withGroupAccounts = null) => {
        const group = await Group.findOne({
            where: {id: Number(id)},
            select: ['id', 'name', 'balance', 'interest', 'created_at'],
            relations: {group_accounts: Boolean(withGroupAccounts)}
        });

        if (!group) throw new NotFoundError();

        return group;
    },

    getByAccountId: async (accountId) => {
        return await Group.findBy({group_accounts: {account_id: accountId}});
    },

    store: async (body) => {
        const {name, target_amount, frequency_amount, frequency, account_id, min_frequency_amount} = body;

        await SidoohAccounts.find(account_id);

        let group = await Group.findOne({
            where: {name, group_accounts: {account_id}},
            relations: {group_accounts: true}
        });

        if (!group) group = await Group.save({
            name,
            target_amount,
            frequency_amount,
            frequency,
            settings: {min_frequency_amount},
            group_accounts: [{account_id}]
        });

        return group;
    },

    deposit: async (amount: number, groupId, accountId: number) => {
        const group = await Group.findOne({where: {id: groupId}, relations: {group_accounts: true}});
        const groupAccount = group?.group_accounts.find(acc => acc.account_id == accountId);

        if (!group) throw new NotFoundError("Group Not Found!");
        if (!groupAccount) throw new NotFoundError("Group Account Not Found!");

        const transaction = await GroupAccountTransaction.save({
            amount,
            description: Description.ACCOUNT_DEPOSIT,
            group_account_id: groupAccount.id,
            type: TransactionType.CREDIT
        });

        groupAccount.balance += amount;
        group.balance += amount;
        await groupAccount.save();
        await group.save();

        return transaction;
    },

    withdraw: async (amount: number, groupId, accountId: number) => {

    }
};