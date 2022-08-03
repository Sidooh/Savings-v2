import { Request, Response } from 'express';
import { DashboardRepository as Repo } from '../../repositories/DashboardRepository';
import Controller from './Controller';

export default class DashboardController extends Controller {
    static summaries = async ({body}: Request, res: Response) => {
        const response = await Repo.getSummaries();

        res.send(this.successResponse({data: response}));
    };

    static recentTransactions = async ({body}: Request, res: Response) => {
        const response = await Repo.getRecentTransactions();

        res.send(this.successResponse({data: response}));
    };

    static recentCollectiveInvestments = async ({body}: Request, res: Response) => {
        const response = await Repo.getRecentCollectiveInvestments();

        res.send(this.successResponse({data: response}));
    };
}
