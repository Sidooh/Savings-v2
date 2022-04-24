import Joi from 'joi';

export const EarningRequest = {
    store: Joi.array().items(
        Joi.object({
            account_id: Joi.number().integer().required(),
            current_amount: Joi.number().required(),
            locked_amount: Joi.number().required(),
        })
    ),
}