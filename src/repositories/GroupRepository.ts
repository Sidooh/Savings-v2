import { Group } from '../entities/models/Group';
import { GroupAccountTransaction } from '../entities/models/GroupAccountTransaction';
import { Description, TransactionType } from '../utils/enums';
import { NotFoundError } from '../exceptions/not-found.err';
import SidoohAccounts from '../services/SidoohAccounts';
import { GroupAccount } from "../entities/models/GroupAccount";

export const GroupRepository = {
    index: async (withGroupAccounts = null) => {
        return await Group.find({
            select: ['id', 'name', 'balance', 'interest', 'target_amount', 'type', 'status', 'created_at'],
            order: { id: 'DESC' },
            relations: {
                group_accounts: Boolean(withGroupAccounts)
            }
        });
    },

    getById: async (id, withRelations?: string) => {
        const relations = withRelations.split(',');

        const group = await Group.findOne({
            where: { id: Number(id) },
            select: ['id', 'name', 'type', 'target_amount', 'balance', 'interest', 'status', 'frequency', 'frequency_amount', 'duration', 'created_at'],
            relations: { group_accounts: relations.includes('group_accounts') || relations.includes('account') }
        }).then(async group => {
            let res: any = group;
            if (relations.includes('account')) {
                const accounts = await SidoohAccounts.findAll();
                res.group_accounts = group.group_accounts.map(a => ({
                    ...a, account: accounts.find(acc => String(acc.id) === a.account_id)
                }));
            }

            return res;
        });

        if (!group) throw new NotFoundError();

        return group;
    },

    getByAccountId: async (accountId) => {
        return await Group.findBy({ group_accounts: { account_id: accountId } });
    },

    store: async (body) => {
        const { name, target_amount, frequency_amount, frequency, account_id, min_frequency_amount } = body;

        await SidoohAccounts.find(account_id);

        let group = await Group.findOne({
            where: { name, group_accounts: { account_id } },
            relations: { group_accounts: true }
        });

        if (!group) {
            group = Group.create({
                name,
                target_amount,
                frequency_amount,
                frequency,
                settings: { min_frequency_amount },
                group_accounts: [{ account_id }]
            });
            await Group.insert(group)
        }

        return group;
    },

    deposit: async (amount: number, groupId, accountId: number) => {
        const group = await Group.findOne({ where: { id: groupId }, relations: { group_accounts: true } });
        const groupAccount = group?.group_accounts.find(acc => acc.account_id == accountId);

        if (!group) throw new NotFoundError("Group Not Found!");
        if (!groupAccount) throw new NotFoundError("Group Account Not Found!");

        const transaction = GroupAccountTransaction.create({
            amount,
            description: Description.ACCOUNT_DEPOSIT,
            group_account_id: groupAccount.id,
            type: TransactionType.CREDIT
        });
        await GroupAccountTransaction.insert(transaction)

        await GroupAccount.update({ id: groupAccount.id }, { balance: groupAccount.balance + amount })
        await Group.update({ id: groupId }, { balance: group.balance + amount })

        return transaction;
    },

    withdraw: async (amount: number, groupId, accountId: number) => {

    }
};
