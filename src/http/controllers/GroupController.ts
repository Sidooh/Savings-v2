import { Request, Response } from 'express';
import { GroupRepository as Repo } from '../../repositories/GroupRepository';
import Controller from './Controller';

export default class GroupController extends Controller{
    static index = async (req: Request, res: Response) => {
        const {with_group_accounts} = req.query;

        const groups = await Repo.index(with_group_accounts);

        res.send(this.successResponse({data: groups}));
    };

    static store = async ({body}: Request, res: Response) => {
        const group = await Repo.store(body);

        res.send(group);
    };

    static getById = async (req: Request, res: Response) => {
        const {with_group_accounts} = req.query;
        const {id} = req.params;

        const group = await Repo.getById(id, with_group_accounts);

        res.send(this.successResponse({data: group}));
    };

    static getByAccountId = async ({params}: Request, res: Response) => {
        const {accountId} = params;

        const groups = await Repo.getByAccountId(accountId);

        res.send(this.successResponse({data: groups}));
    };

    static deposit = async ({body, params}: Request, res: Response) => {
        const {amount, account_id} = body
        const {groupId} = params

        const transaction = await Repo.deposit(amount, groupId, account_id)

        res.send(transaction)
    };

    static withdraw = async ({body, params}: Request, res: Response) => {
        const {amount, account_id} = body
        const {groupId} = params

        const transaction = await Repo.withdraw(amount, groupId, account_id)

        res.send(transaction)
    };
}