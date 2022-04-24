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
    router.get('/:accountId/personal-accounts', PersonalAccountController.getByAccountId);
    router.get('/:accountId/groups', GroupController.getByAccountId);
});

router.group('/personal-accounts', router => {
    router.get('/', PersonalAccountController.index);
    router.get('/:id', PersonalAccountController.getById);
    router.post('/', validate(PersonalAccountRequest.store), PersonalAccountController.store);

    router.post('/deposit', [validate(PersonalAccountRequest.deposit)], PersonalAccountController.deposit);
});

router.group('/group-accounts', router => {
    router.get('/:id', GroupAccountController.getById)
})

router.group('/groups', router => {
    router.post('/', validate(GroupRequest.store), GroupController.store);
    router.get('/', GroupController.index);
    router.get('/:id', GroupController.getById);

    router.post('/deposit', validate(GroupRequest.deposit), GroupController.deposit);

    router.group('/:groupId/accounts', router => {
        router.post('/', validate(GroupAccountRequest.store), GroupAccountController.store);
        router.get('/:accountId', GroupAccountController.getByAccountId);
    });
});

export default router.export();