import { Request, Response } from 'express';
import Controller from './Controller';
import SidoohPayments from "../../services/SidoohPayments";

export default class ChargeController extends Controller {
    static getWithdrawalCharges = async (req: Request, res: Response) => {
        const charges = await SidoohPayments.getWithdrawalCharges()

        res.send(this.successResponse({ data: charges }))
    };
}
