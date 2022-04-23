import { Request, Response } from 'express';
import { Group } from '../../entities/models/Group';

export default class GroupController {
    static index = async (req: Request, res: Response) => {
        const {with_members} = req.query;

        const groups = await Group.find({
            select: ['id', 'name', 'balance', 'interest', 'created_at'],
            relations: {
                group_accounts: Boolean(with_members)
            }
        });

        res.send(groups);
    };

    static store = async ({body}: Request, res: Response) => {
        const {name, amount, frequency, account_id} = body;

        const group = await Group.save({name, amount, frequency, group_accounts: [{account_id}]});

        res.send(group);
    };

    static show = async (req: Request, res: Response) => {
        const {with_members} = req.query;
        const {id} = req.params;

        const groups = await Group.findOne({
            where: {id: Number(id)},
            select: ['id', 'name', 'balance', 'interest', 'created_at'],
            relations: {group_accounts: Boolean(with_members)}
        });

        res.send(groups);
    };
}