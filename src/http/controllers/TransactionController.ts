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
        const { with_relations } = query;
        const { groupId } = params;

        const transactions = await Repo.getAllGroupTransactions(groupId, String(with_relations));

        res.send(this.successResponse({ data: transactions }));
    };

    static getPersonalTransactionById = async ({ query, params }: Request, res: Response) => {
        const { with_relations } = query;
        const { transactionId } = params;

        const transaction = await Repo.getPersonalTransactionById(transactionId, String(with_relations));

        res.send(this.successResponse({ data: transaction }));
    };

    static getGroupTransactionById = async ({ query, params }: Request, res: Response) => {
        const { with_relations } = query;
        const { transactionId } = params;

        const group = await Repo.getGroupTransactionById(transactionId, String(with_relations));

        res.send(this.successResponse({ data: group }));
    };
}
