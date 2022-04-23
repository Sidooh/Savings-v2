import { Router } from 'express';
import RouteGroup from 'express-route-grouping';
import PersonalAccountController from './http/controllers/PersonalAccountController';
import { PersonalAccountRequest } from './http/requests/PersonalAccount.request';
import { validate } from './http/middleware/validate.middleware';
import GroupController from './http/controllers/GroupController';
import { GroupAccountRequest } from './http/requests/GroupAccount.request';
import { GroupRequest } from './http/requests/Group.request';
import GroupAccountController from './http/controllers/GroupAccountController';

const router = new RouteGroup('/', Router());

router.group('/accounts', router => {
    router.get('/:accountId/personal-accounts', PersonalAccountController.getByAccountId)
})

router.group('/personal-accounts', router => {
    router.get('/', PersonalAccountController.index)
    router.get('/:id', PersonalAccountController.show)
    router.post('/', validate(PersonalAccountRequest.store), PersonalAccountController.store)
})

router.group('/groups', router => {
    router.post('/', validate(GroupRequest.store), GroupController.store)
    router.get('/', GroupController.index)
    router.get('/:id', GroupController.show)

    router.group('/:groupId/accounts', router => {
        router.post('/', validate(GroupAccountRequest.store), GroupAccountController.store)
        router.get('/', GroupAccountController.index)
        router.get('/:accountId', GroupAccountController.show)
    })
})

export default router.export()