import Joi from 'joi';
import { GroupType, PersonalAccountType, SavingsAccountType } from '../../utils/enums';

export const SavingsAccountRequest = {
    store: Joi.object({
        type: Joi.string().valid(...Object.values(SavingsAccountType).map(type => type)).required(),
        sub_type: Joi.string()
            .when('type', {
            is: SavingsAccountType.GROUP,
            then:Joi.string().valid(...Object.values(GroupType).map(type => type))
        }).required()
            .when('type', {
            is: SavingsAccountType.PERSONAL,
            then:Joi.string().valid(...Object.values(PersonalAccountType).map(type => type))
        }).required()
    })
};