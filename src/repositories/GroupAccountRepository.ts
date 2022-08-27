import { Group } from '../entities/models/Group';
import { GroupAccount } from '../entities/models/GroupAccount';
import { NotFoundError } from '../exceptions/not-found.err';
import SidoohAccounts from '../services/SidoohAccounts';

export const GroupAccountRepository = {
    index: async (withRelations?: string) => {
        const relations = withRelations.split(',');

        return GroupAccount.find({
            select: {
                id: true,
                account_id: true,
                balance: true,
                created_at: true,
                status: true,
                group: { id: true, name: true, type: true }
            },
            order: { id: 'DESC' },
            relations: { group: relations.includes('group') }
        }).then(async groupAccounts => {
            let res: any = groupAccounts;
            if (relations.includes('account')) {
                const accounts = await SidoohAccounts.findAll();
                res = groupAccounts.map(a => ({
                    ...a, account: accounts.find(acc => String(acc.id) === a.account_id)
                }));
            }

            return res;
        });
    },

    getById: async (id, withRelations?: string) => {
        const relations = withRelations.split(',');

        const groupAccount = await GroupAccount.findOne({
            select: {
                id: true,
                balance: true,
                account_id: true,
                group_id: true,
                status: true,
                created_at: true,
                group: { id: true, name: true, type: true, balance: true, status: true },
                transactions: { id: true, created_at: true, type: true, description: true, amount: true, status: true }
            },
            where: { id }, relations: { transactions: true, group: relations.includes('group') },
            order: { transactions: { id: 'DESC' } }
        }).then(async acc => {
            let res: any = acc;
            if (relations.includes('account')) {
                res = { ...acc, account: await SidoohAccounts.find(acc.account_id) };
            }

            return res;
        });

        if (!groupAccount) throw new NotFoundError('Group Account Not Found!');

        return groupAccount;
    },

    getByAccountId: async (groupId, accountId) => {
        const groupAcc = await GroupAccount.findOne({
            where: { group_id: groupId, account_id: accountId },
            select: ['id', 'account_id', 'balance', 'created_at'],
        });

        if (!groupAcc) throw new NotFoundError("Group Account Not Found!");

        return groupAcc;
    },

    store: async (groupId, accountId: number) => {
        await SidoohAccounts.find(accountId);

        const group = await Group.findOne({ where: { id: Number(groupId) }, relations: { group_accounts: true } });

        if (!group) throw new NotFoundError('Group Not Found!');

        let groupAccount = group.group_accounts.find(acc => acc.account_id == accountId);

        if (!groupAccount) groupAccount = await GroupAccount.save({ group_id: group.id, account_id: accountId });

        return groupAccount;
    }
};