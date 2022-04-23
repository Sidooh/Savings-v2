import { Request, Response } from 'express';
import { GroupRepository as Repo } from '../../repositories/GroupRepository';

export default class GroupController {
    static index = async (req: Request, res: Response) => {
        const {with_group_accounts} = req.query;

        const groups = await Repo.index(with_group_accounts);

        res.send(groups);
    };

    static store = async ({body}: Request, res: Response) => {
        const group = await Repo.store(body);

        res.send(group);
    };

    static getById = async (req: Request, res: Response) => {
        const {with_group_accounts} = req.query;
        const {id} = req.params;

        const group = await Repo.getById(id, with_group_accounts);

        res.send(group);
    };

    static getByAccountId = async ({params}: Request, res: Response) => {
        const {accountId} = params;

        const groups = await Repo.getByAccountId(accountId);

        res.send(groups);
    };

    static deposit = async ({body}: Request, res: Response) => {
        const {amount, account_id, group_id} = body

        const balances = await Repo.deposit(amount, group_id, account_id)

        res.send(balances)
    };
}