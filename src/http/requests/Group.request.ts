import Joi from 'joi';
import { Frequency } from '../../utils/enums';

export const GroupRequest = {
    store: Joi.object({
        account_id: Joi.number().integer().required(),
        name: Joi.string().required(),
        frequency: Joi.string().valid(...Object.values(Frequency).map(f => f)),
        frequency_amount: Joi.number().integer().min(Number(process.env.MIN_FREQUENCY_AMOUNT || 20)),
        target_amount: Joi.number().integer().min(Number(process.env.MIN_FREQUENCY_AMOUNT || 20)),
        min_frequency_amount: Joi.number().integer().min(Number(process.env.MIN_FREQUENCY_AMOUNT || 20)),
    }),

    deposit: Joi.object({
        account_id: Joi.number().integer().required(),
        amount: Joi.number().integer().min(Number(process.env.MIN_FREQUENCY_AMOUNT || 20)).required(),
    }),

    withdraw: Joi.object({
        account_id: Joi.number().integer().required(),
        amount: Joi.number().integer().min(10).required(),
    })
};