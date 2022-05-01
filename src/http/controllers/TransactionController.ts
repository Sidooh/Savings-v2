import { Request, Response } from 'express';
import { TransactionRepository as Repo } from '../../repositories/TransactionRepository';

export default class TransactionController {
    static getAllPersonalTransactions =async ({query}: Request, res: Response) => {
        const {with_account} = query;

        const transactions = await Repo.getAllPersonalTransactions(with_account);

        res.send(transactions);
    }

    static getAllGroupAccountTransactions =async ({query}: Request, res: Response) => {
        const {with_group_account} = query;

        const transactions = await Repo.getAllGroupAccountTransactions(with_group_account);

        res.send(transactions);
    }
}