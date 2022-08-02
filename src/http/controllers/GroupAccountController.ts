import { Request, Response } from 'express';
import { GroupAccount } from '../../entities/models/GroupAccount';
import { GroupAccountRepository as Repo } from '../../repositories/GroupAccountRepository';
import Controller from './Controller';

export default class GroupAccountController extends Controller {
    static index = async ({params}: Request, res: Response) => {
        const {groupId} = params;

        const groups = await GroupAccount.find({
            where: {group_id: groupId},
            select: ['id', 'account_id', 'balance', 'created_at'],
        });

        res.send(this.successResponse({data: groups}));
    };

    static store = async ({body, params}: Request, res: Response) => {
        const {account_id} = body;
        const {groupId} = params;

        const groupAccount = await Repo.store(groupId, account_id);

        res.send(groupAccount);
    };

    static getById = async ({query, params}: Request, res: Response) => {
        const {id} = params;

        const group = await Repo.getById(id);

        res.send(this.successResponse({data: group}));
    };

    static getByAccountId = async ({query, params}: Request, res: Response) => {
        const {groupId, accountId} = params;

        const group = await Repo.getByAccountId(groupId, accountId);

        res.send(this.successResponse({data: group}));
    };
}