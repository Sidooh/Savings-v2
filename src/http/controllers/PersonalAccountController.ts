import { Request, Response } from 'express';
import { PersonalAccount } from '../../entities/models/PersonalAccount';

export default class PersonalAccountController {
    static index = async (req: Request, res: Response) => {
        const personalAccounts = await PersonalAccount.find({
            select: [
                'id', 'type', 'description', 'amount',
                'balance', 'interest', 'duration',
                'status', 'account_id', 'created_at'
            ]
        });

        res.send(personalAccounts);
    };

    static store = async ({body}: Request, res: Response) => {
        const {account_id, type, amount, duration, frequency, description} = body;

        const personalAcc = await PersonalAccount.save({account_id, type, amount, duration, frequency, description});

        res.send(personalAcc);
    };

    static show = async (req: Request, res: Response) => {
        const {id} = req.params;

        const personalAcc = await PersonalAccount.findOne({
            where: {id: Number(id)},
            select: [
                'id', 'type', 'description', 'amount',
                'balance', 'interest', 'duration',
                'status', 'account_id', 'created_at'
            ]
        });

        res.send(personalAcc);
    };

    static getByAccountId = async ({params}: Request, res: Response) => {
        const {accountId} = params;

        const personalAcc = await PersonalAccount.find({
            where: {account_id: Number(accountId)},
            select: [
                'id', 'type', 'description', 'amount',
                'balance', 'interest', 'duration',
                'status', 'account_id', 'created_at'
            ]
        });

        res.send(personalAcc);
    };
}