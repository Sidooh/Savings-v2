import InvestmentRepository from '../../repositories/InvestmentRepository';
import { Request, Response } from 'express';
import Controller from './Controller';

const Repo = new InvestmentRepository();

export default class InvestmentController extends Controller {
    static getPersonalCollectiveInvestments = async ({query}: Request, res: Response) => {
        const {with_relations} = query;

        const investments = await Repo.getPersonalCollectiveInvestments(String(with_relations));

        res.send(this.successResponse({data: investments}));
    };

    static getPersonalSubInvestments = async ({query}: Request, res: Response) => {
        const {with_relations} = query;

        const investments = await Repo.getPersonalSubInvestments(String(with_relations));

        res.send(this.successResponse({data: investments}));
    };

    static getGroupCollectiveInvestments = async ({query}: Request, res: Response) => {
        const {with_relations} = query;

        const investments = await Repo.getGroupCollectiveInvestments(String(with_relations));

        res.send(this.successResponse({data: investments}));
    };

    static getGroupSubInvestments = async ({query}: Request, res: Response) => {
        const {with_relations} = query;

        const investments = await Repo.getGroupSubInvestments(String(with_relations));

        res.send(this.successResponse({data: investments}));
    };
}
