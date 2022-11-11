import { Request, Response } from "express";
import { TransactionRepository } from "../../repositories/TransactionRepository";
import Controller from "./Controller";


export default class JobController extends Controller {

    static processPersonalWithdrawals = async (req: Request, res: Response) => {
        const data = await TransactionRepository.processPersonalWithdrawals()

        res.send(this.successResponse({ data }));
    };
}
