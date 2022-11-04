import Joi from 'joi';
import {env} from "../../utils/validate.env";

export const EarningRequest = {
    store: Joi.array().items(
        Joi.object({
            account_id: Joi.number().integer().required(),
            current_amount: Joi.number().required(),
            locked_amount: Joi.number().required(),
        })
    ),

    withdraw: Joi.object({
        account_id: Joi.number().integer().required(),
        amount: Joi.number().required().min(env().MIN_WITHDRAWAL_AMOUNT).message(`amount has to be >= ${env().MIN_WITHDRAWAL_AMOUNT}`),
        ref: Joi.string().alphanum().required(),
        method: Joi.string(),
        destination: Joi.string(),
    }),
}
