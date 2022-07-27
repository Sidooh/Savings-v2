import Joi from 'joi';
import { Frequency, PersonalAccountType } from '../../utils/enums';
import {env} from "../../utils/validate.env";

export const PersonalAccountRequest = {
    store: Joi.object({
        account_id: Joi.number().integer().required(),
        type: Joi.string().valid(...Object.values(PersonalAccountType).map(pa => pa)).required(),
        duration: Joi.number().integer().min(1),
        frequency: Joi.string().valid(...Object.values(Frequency).map(f => f)),
        frequency_amount: Joi.number().integer().min(env().MIN_FREQUENCY_AMOUNT),
        target_amount: Joi.number().integer().min(env().MIN_FREQUENCY_AMOUNT),
        description: Joi.string().when('type', {
            is: PersonalAccountType.GOAL,
            then: Joi.required()
        })
    }),

    deposit: Joi.object({
        amount: Joi.number().integer().min(env().MIN_FREQUENCY_AMOUNT).required(),
    }),

    withdraw: Joi.object({
        amount: Joi.number().integer().min(env().MIN_WITHDRAWAL_AMOUNT).required(),
    })
};
