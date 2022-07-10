import { Request, Response } from 'express';
import { TransactionRepository as Repo } from '../../repositories/TransactionRepository';

export default class PaymentController {

    static processCallback = async ({body}: Request, res: Response) => {
        const response = await Repo.processPaymentCallback(body);

        res.send(response);
    };

}
