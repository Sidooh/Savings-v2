import { Request, Response } from 'express';
import { TransactionRepository as Repo } from '../../repositories/TransactionRepository';
import Controller from './Controller';

export default class TransactionController extends Controller {
    static getAllPersonalTransactions = async ({ query }: Request, res: Response) => {
        const { with_relations } = query;

        const transactions = await Repo.getAllPersonalTransactions(String(with_relations));

        res.send(this.successResponse({ data: transactions }));
    };

    static getAllGroupAccountTransactions = async ({ query }: Request, res: Response) => {
        const { with_relations } = query;

        const transactions = await Repo.getAllGroupAccountTransactions(String(with_relations));

        res.send(this.successResponse({ data: transactions }));
    };

    static getAllGroupTransactions = async ({ params, query }: Request, res: Response) => {
        const { with_group } = query;
        const { groupId } = params;

        const transactions = await Repo.getAllGroupTransactions(groupId, with_group);

        res.send(this.successResponse({ data: transactions }));
    };

    static getPersonalTransactionById = async (req: Request, res: Response) => {
        const { with_account } = req.query;
        const { transactionId } = req.params;

        const transaction = await Repo.getPersonalTransactionById(transactionId, Boolean(with_account));

        res.send(this.successResponse({ data: transaction }));
    };

    static getGroupTransactionById = async (req: Request, res: Response) => {
        const { with_group_account } = req.query;
        const { transactionId } = req.params;

        const group = await Repo.getGroupTransactionById(transactionId, Boolean(with_group_account));

        res.send(this.successResponse({ data: group }));
    };
}