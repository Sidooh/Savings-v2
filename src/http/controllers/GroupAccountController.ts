import { Request, Response } from 'express';
import { GroupAccountRepository as Repo } from '../../repositories/GroupAccountRepository';
import Controller from './Controller';

export default class GroupAccountController extends Controller {
    static index = async ({query}: Request, res: Response) => {
        const {with_relations} = query;

        const accounts = await Repo.index(String(with_relations))

        res.send(this.successResponse({data: accounts}));
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