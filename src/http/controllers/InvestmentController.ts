import InvestmentRepository from '../../repositories/InvestmentRepository';
import { Request, Response } from 'express';
import Controller from './Controller';

const Repo = new InvestmentRepository();

export default class InvestmentController extends Controller {
    static getPersonalCollectiveInvestments = async ({query}: Request, res: Response) => {
        const {with_sub_investments} = query;

        const transactions = await Repo.getPersonalCollectiveInvestments(Boolean(with_sub_investments));

        res.send(this.successResponse({data: transactions}));
    };

    static getPersonalSubInvestments = async ({query}: Request, res: Response) => {
        const {with_relations} = query;

        const transactions = await Repo.getPersonalSubInvestments(String(with_relations));

        res.send(this.successResponse({data: transactions}));
    };

    static getGroupCollectiveInvestments = async ({query}: Request, res: Response) => {
        const {with_group_account} = query;

        const transactions = await Repo.getGroupCollectiveInvestments(with_group_account);

        res.send(this.successResponse({data: transactions}));
    };

    static getGroupSubInvestments = async ({query}: Request, res: Response) => {
        const {with_group_account} = query;

        const transactions = await Repo.getGroupSubInvestments(with_group_account);

        res.send(this.successResponse({data: transactions}));
    };
}
