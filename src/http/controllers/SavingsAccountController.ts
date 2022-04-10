import { Request, Response } from 'express';

export default class SavingsAccountController {
    static index = (req: Request, res: Response) => {
    };
    static store = ({body}: Request, res: Response) => {
        console.log(body);

        res.send(body);
    };
    static update = (req, res) => {
    };
    static destroy = (req, res) => {
    };
}