import Joi from 'joi';
import { env } from "../../utils/validate.env";

export const EarningRequest = {
    store: Joi.array().items(
        Joi.object({
            account_id: Joi.number().integer().required(), // TODO: add Sidooh account validation
            current_amount: Joi.number().required(),
            locked_amount: Joi.number().required(),
        })
    ),

    withdraw: Joi.object({
        amount: Joi.number().required().min(env().MIN_WITHDRAWAL_AMOUNT).message(`amount has to be >= ${env().MIN_WITHDRAWAL_AMOUNT}`),
        reference: Joi.string().alphanum(),
        destination: Joi.string().valid('MPESA'),
        destination_account: [Joi.number(), Joi.string()], // TODO: add phone validation
        ipn: Joi.string().uri()
    }),
}
