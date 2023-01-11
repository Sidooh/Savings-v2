import { EarningRepository as Repo } from '../../repositories/EarningRepository';
import { Request, Response } from 'express';
import Controller from './Controller';
import SidoohAccounts from "../../services/SidoohAccounts";
import { HttpStatusCode } from "axios";

export default class EarningController extends Controller {
    static getAccountEarnings = async ({ params }: Request, res: Response) => {
        const earnings = await Repo.getAccountEarnings(params.accountId)

        res.send(this.successResponse({ data: earnings }))
    };

    static deposit = async ({ body }: Request, res: Response) => {
        const response = await Repo.deposit(body);

        res.status(HttpStatusCode.Accepted).send(this.successResponse({ data: response }));
    };

    static withdraw = async ({ params, body }: Request, res: Response) => {
        await SidoohAccounts.find(Number(params.accountId));

        try {
            const transaction = await Repo.withdraw(Number(params.accountId), body);

            res.status(200).send(this.successResponse({ data: transaction }));
        } catch (e) {
            res.status(400).send(this.errorResponse({ message: e.message, errors: [] }));
        }
    };
}
