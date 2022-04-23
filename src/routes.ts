import { Router } from 'express';
import RouteGroup from 'express-route-grouping';
import PersonalAccountController from './http/controllers/PersonalAccountController';
import { PersonalAccountRequest } from './http/requests/PersonalAccount.request';
import { validate } from './http/middleware/validate.middleware';

const router = new RouteGroup('/', Router());

router.group('/personal-accounts', router => {
    router.get('/', PersonalAccountController.index)
    router.post('/', validate(PersonalAccountRequest.store), PersonalAccountController.store)
})

export default router.export()