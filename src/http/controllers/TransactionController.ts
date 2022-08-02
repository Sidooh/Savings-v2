import { Request, Response } from 'express';
import { TransactionRepository as Repo } from '../../repositories/TransactionRepository';
import Controller from './Controller';

export default class TransactionController extends Controller {
    static getAllPersonalTransactions =async ({query}: Request, res: Response) => {
        const {with_account} = query;

        const transactions = await Repo.getAllPersonalTransactions(with_account);

        res.send(this.successResponse({data: transactions}));
    }

    static getAllGroupAccountTransactions =async ({query}: Request, res: Response) => {
        const {with_group_account} = query;

        const transactions = await Repo.getAllGroupAccountTransactions(with_group_account);

        res.send(this.successResponse({data: transactions}));
    }

    static getAllGroupTransactions =async ({params, query}: Request, res: Response) => {
        const {with_group} = query;
        const {groupId} = params;

        const transactions = await Repo.getAllGroupTransactions(groupId, with_group);

        res.send(this.successResponse({data: transactions}));
    }
}