import Joi from 'joi';
import { Frequency } from '../../utils/enums';

export const GroupAccountRequest = {
    store: Joi.object({
        account_id: Joi.number().integer().required(),
        name:Joi.string().required(),
        amount: Joi.number().integer().min(1000).required(),
        frequency: Joi.string().valid(...Object.values(Frequency).map(f => f)),
    })
};