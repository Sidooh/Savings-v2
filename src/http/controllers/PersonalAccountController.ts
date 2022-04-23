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

    static getById = async (req: Request, res: Response) => {
        const {id} = req.params;

        const personalAcc = await Repo.getById(id);

        res.send(personalAcc);
    };

    static getByAccountId = async ({params}: Request, res: Response) => {
        const {accountId} = params;

        const personalAcc = await Repo.getByAccountId(accountId)

        res.send(personalAcc);
    };
}