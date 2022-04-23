import { Request, Response } from 'express';
import { Group } from '../../entities/models/Group';
import { GroupAccount } from '../../entities/models/GroupAccount';
import { NotFoundError } from '@nabz.tickets/common';

export default class GroupAccountController {
    static index = async ({params}: Request, res: Response) => {
        const {groupId} = params;

        const groups = await GroupAccount.find({
            where: {group_id: groupId},
            select: ['id', 'account_id', 'balance', 'interest', 'created_at'],
        });

        res.send(groups);
    };

    static store = async ({body, params}: Request, res: Response) => {
        const {account_id} = body;
        const {groupId} = params;

        const group = await Group.findOne({where: {id: Number(groupId)}, relations: {group_accounts: true}});

        if (!group) throw new NotFoundError();

        let groupAccount = group.group_accounts.find(acc => acc.account_id == account_id);

        if (!groupAccount) groupAccount = await GroupAccount.save({group_id: group.id, account_id});

        res.send(groupAccount);
    };

    static show = async ({query, params}: Request, res: Response) => {
        const {groupId, accountId} = params;

        const groups = await GroupAccount.findOne({
            where: {group_id: groupId, account_id: accountId},
            select: ['id', 'account_id', 'balance', 'interest', 'created_at'],
        });

        res.send(groups);
    };
}