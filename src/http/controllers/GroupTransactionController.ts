import { Request, Response } from 'express';
import { TransactionRepository as Repo } from '../../repositories/TransactionRepository';
import Controller from './Controller';

export default class GroupTransactionController extends Controller {
    static getAllTransactionsByAccount = async ({ query }: Request, res: Response) => {
        const { with_relations } = query;

        const transactions = await Repo.getAllGroupAccountTransactions(String(with_relations));

        res.send(this.successResponse({ data: transactions }));
    };

    static getAll = async ({ params, query }: Request, res: Response) => {
        const { with_relations } = query;
        const { groupId } = params;

        const transactions = await Repo.getAllGroupTransactions(groupId, String(with_relations));

        res.send(this.successResponse({ data: transactions }));
    };

    static getGroupTransactionById = async ({ query, params }: Request, res: Response) => {
        const { with_relations } = query;
        const { transactionId } = params;

        const group = await Repo.getGroupTransactionById(transactionId, String(with_relations));

        res.send(this.successResponse({ data: group }));
    };
}
