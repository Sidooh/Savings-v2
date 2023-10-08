import Joi from 'joi';

export const MerchantEarningRequest = {
    store: Joi.array().items(
        Joi.object({
            account_id: Joi.number().integer().required(), // TODO: add Sidooh account validation
            cashback_amount: Joi.number().required(),
            commission_amount: Joi.number().required(),
        })
    ),
}
