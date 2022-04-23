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
}