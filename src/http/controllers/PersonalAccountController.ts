import { Request, Response } from 'express';
import { PersonalAccountRepository as Repo } from '../../repositories/PersonalAccountRepository';
import Controller from './Controller';

export default class PersonalAccountController extends Controller {
    static index = async ({ query }: Request, res: Response) => {
        const { with_relations } = query;

        const personalAccounts = await Repo.index(String(with_relations));

        res.send(this.successResponse({ data: personalAccounts }));
    };

    static store = async ({ body }: Request, res: Response) => {
        const personalAcc = await Repo.store(body);

        res.send(personalAcc);
    };

    static storeDefaults = async ({ params }: Request, res: Response) => {
        const earningsAcc = await Repo.storeDefaults(params.accountId);

        res.send(earningsAcc);
    };

    static getById = async ({ query, params: { personalAccountId: id } }: Request, res: Response) => {
        const { with_relations } = query;

        const personalAcc = await Repo.getById(Number(id), String(with_relations));

        res.send(this.successResponse({ data: personalAcc }));
    };

    static getByAccountId = async ({ params }: Request, res: Response) => {
        const personalAcc = await Repo.getByAccountId(params.accountId)

        res.send(this.successResponse({ data: personalAcc }));
    };

    static deposit = async ({ body, params }: Request, res: Response) => {
        const { amount } = body
        const { personalAccountId } = params

        const transaction = await Repo.deposit(amount, personalAccountId)

        res.send(transaction)
    };

    static withdraw = async ({ body, params }: Request, res: Response) => {
        const { personalAccountId } = params

        const transaction = await Repo.withdraw(Number(personalAccountId), body)

        res.send(transaction)
    };
}
