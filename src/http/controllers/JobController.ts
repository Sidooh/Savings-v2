import { Request, Response } from "express";
import { TransactionRepository } from "../../repositories/TransactionRepository";
import Controller from "./Controller";
import { SavingsRepository } from "../../repositories/SavingsRepository";


export default class JobController extends Controller {
    static processPersonalWithdrawals = async (req: Request, res: Response) => {
        const data = await TransactionRepository.processPersonalWithdrawals()

        res.send(this.successResponse({ data }));
    };

    static checkServiceBalances = async ({ body }: Request, res: Response) => {
        const response = await SavingsRepository.checkServiceBalances();

        res.send(this.successResponse({ data: response }));
    };
}
