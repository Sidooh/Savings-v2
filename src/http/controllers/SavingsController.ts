import { Request, Response } from 'express';
import { SavingsRepository as Repo } from '../../repositories/SavingsRepository';

export default class SavingsController {
    static getCumulativeSavings = async ({body}: Request, res: Response) => {
        const response = await Repo.getCumulativeSavings();

        res.send(response);
    };
}
