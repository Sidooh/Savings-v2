import { EarningRepository as Repo } from '../../repositories/EarningRepository';
import { Request, Response } from 'express';
import Controller from './Controller';

export default class EarningController extends Controller{
    static getAccountEarnings = async ({params}: Request, res: Response) => {
        const earnings = await Repo.getAccountEarnings(params.accountId)

        res.send(this.successResponse({data: earnings}))
    };

    static store = async ({body}: Request, res: Response) => {
       const response = await Repo.store(body);

        res.status(202).send(response);
    };

    static withdraw = async ({body}: Request, res: Response) => {
        try {
            const transaction = await Repo.withdraw(body);
            res.status(200).send(this.successResponse({data: transaction}));
        } catch (e) {
            res.status(400).send(this.errorResponse({message: e.message, errors: []}));
        }
    };
}
