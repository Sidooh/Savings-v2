import { Request, Response } from 'express';
import { PersonalAccountRepository as Repo } from '../../repositories/PersonalAccountRepository';

export default class PersonalAccountController {
    static index = async (req: Request, res: Response) => {
        const personalAccounts = await Repo.index();

        res.send(personalAccounts);
    };

    static store = async ({body}: Request, res: Response) => {
        const personalAcc = await Repo.store(body);

        res.send(personalAcc);
    };

    static storeDefaults = async ({params}: Request, res: Response) => {
        const earningsAcc = await Repo.storeDefaults(params.accountId);

        res.send(earningsAcc);
    };

    static getById = async (req: Request, res: Response) => {
        const personalAcc = await Repo.getById(req.params.id);

        res.send(personalAcc);
    };

    static getByAccountId = async ({params}: Request, res: Response) => {
        const personalAcc = await Repo.getByAccountId(params.accountId)

        res.send(personalAcc);
    };

    static deposit = async ({body, params}: Request, res: Response) => {
        const {amount} = body
        const {personalAccountId} = params

        const transaction = await Repo.deposit(amount, personalAccountId)

        res.send(transaction)
    };

    static withdraw = async ({body, params}: Request, res: Response) => {
        const {amount} = body
        const {personalAccountId} = params

        const transaction = await Repo.withdraw(amount, personalAccountId)

        res.send(transaction)
    };
}