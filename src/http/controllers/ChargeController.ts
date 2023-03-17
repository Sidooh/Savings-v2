import { Request, Response } from 'express';
import Controller from './Controller';
import SidoohPayments from "../../services/SidoohPayments";

export default class ChargeController extends Controller {
    static getWithdrawalCharge = async ({ params, body }: Request, res: Response) => {
        const charge = await SidoohPayments.getWithdrawalCharge(body.amount)

        res.send(this.successResponse({ data: charge }))
    };
}
