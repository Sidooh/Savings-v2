import { EarningRepository as Repo } from '../../repositories/EarningRepository';
import { Request, Response } from 'express';

export default class EarningController {
    static getAccountEarnings = async ({params}: Request, res: Response) => {
        const earnings = await Repo.getAccountEarnings(params.accountId)

        res.send(earnings)
    };

    static store = async ({body}: Request, res: Response) => {
        await Repo.store(body);

        res.status(202).send({message: "Allocating Earnings!"});
    };

    static withdraw = async ({body}: Request, res: Response) => {
        const response = await Repo.withdraw(body);

        res.status(200).send(response);
    };
}
