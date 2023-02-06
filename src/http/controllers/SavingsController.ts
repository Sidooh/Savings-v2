import { Request, Response } from 'express';
import { SavingsRepository as Repo } from '../../repositories/SavingsRepository';
import Controller from "./Controller";

export default class SavingsController extends Controller {
    static getCumulativeSavings = async ({ body }: Request, res: Response) => {
        const response = await Repo.getCumulativeSavings();

        res.send(this.successResponse({ data: response }));
    };
}
