import { Router } from 'express';
import RouteGroup from 'express-route-grouping';
import PersonalAccountController from './http/controllers/PersonalAccountController';
import { PersonalAccountRequest } from './http/requests/PersonalAccount.request';
import { validate } from './http/middleware/validate.middleware';
import GroupController from './http/controllers/GroupController';
import { GroupAccountRequest } from './http/requests/GroupAccount.request';
import { GroupRequest } from './http/requests/Group.request';
import GroupAccountController from './http/controllers/GroupAccountController';
import EarningController from './http/controllers/EarningController';
import { EarningRequest } from './http/requests/Earning.request';
import TransactionController from './http/controllers/TransactionController';

const router = new RouteGroup('/', Router());

router.group('/accounts', router => {
    router.get('/:accountId/personal-accounts', PersonalAccountController.getByAccountId);
    router.get('/:accountId/groups', GroupController.getByAccountId);

    router.post('/:accountId/defaults', PersonalAccountController.storeDefaults);

    router.get('/:accountId/earnings', EarningController.getAccountEarnings);
    router.post('/earnings', validate(EarningRequest.store), EarningController.store);
});

router.group('/personal-accounts', router => {
    router.get('/transactions', TransactionController.getAllPersonalTransactions);

    router.get('/', PersonalAccountController.index);
    router.get('/:id', PersonalAccountController.getById);
    router.post('/', validate(PersonalAccountRequest.store), PersonalAccountController.store);

    router.post('/:personalAccountId/deposit', [validate(PersonalAccountRequest.deposit)], PersonalAccountController.deposit);
    router.post('/:personalAccountId/withdraw', [validate(PersonalAccountRequest.withdraw)], PersonalAccountController.withdraw);
});

router.group('/group-accounts', router => {
    router.get('/transactions', TransactionController.getAllGroupAccountTransactions);
    router.get('/:id', GroupAccountController.getById);
});

router.group('/groups', router => {
    router.post('/', validate(GroupRequest.store), GroupController.store);
    router.get('/', GroupController.index);
    router.get('/:id', GroupController.getById);

    router.post('/:groupId/deposit', validate(GroupRequest.deposit), GroupController.deposit);
    router.post('/:groupId/withdraw', validate(GroupRequest.withdraw), GroupController.withdraw);

    router.group('/:groupId/accounts', router => {
        router.post('/', validate(GroupAccountRequest.store), GroupAccountController.store);
        router.get('/:accountId', GroupAccountController.getByAccountId);
    });
});

export default router.export();