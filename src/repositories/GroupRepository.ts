import { Group } from '../entities/models/Group';
import { NotFoundError } from '@nabz.tickets/common';

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
        const {name, amount, frequency, account_id} = body;

        let group = await Group.findOne({
            where: {name, group_accounts: {account_id}},
            relations: {group_accounts: true}
        });

        if (!group) group = await Group.save({name, amount, frequency, group_accounts: [{account_id}]});

        return group;
    },

    deposit: async (amount: number, groupId: number, accountId: number) => {
        const group = await Group.findOneBy({id: groupId})

        return group;
    }
};