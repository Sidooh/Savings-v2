import Joi from 'joi';
import { Frequency, PersonalAccountType } from '../../utils/enums';

export const PersonalAccountRequest = {
    store: Joi.object({
        account_id: Joi.number().integer().required(),
        type: Joi.string().valid(...Object.values(PersonalAccountType).map(pa => pa)).required(),
        amount: Joi.number().integer().min(1000).required(),
        duration: Joi.number().integer().min(1),
        frequency: Joi.string().valid(...Object.values(Frequency).map(f => f)),
        description: Joi.string().when('type', {
            is: PersonalAccountType.GOAL,
            then: Joi.required()
        })
    })
};