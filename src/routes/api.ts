import { Router } from 'express';
import RouteGroup from 'express-route-grouping';
import EarningController from "../http/controllers/EarningController";
import { EarningRequest } from "../http/requests/Earning.request";
import PersonalAccountController from "../http/controllers/PersonalAccountController";
import { validate } from "../http/middleware/validate.middleware";
import DashboardController from "../http/controllers/DashboardController";


const apiRouter = new RouteGroup('/api/v1', Router());

apiRouter.group('/accounts', router => {
    router.group('/:accountId', router => {
        router.get('/personal-accounts', PersonalAccountController.getByAccountId);
        // router.get('/groups', GroupController.getByAccountId);
        router.post('/defaults', PersonalAccountController.storeDefaults);
        router.get('/earnings', EarningController.getAccountEarnings);
        router.post('/earnings/withdraw', validate(EarningRequest.withdraw), EarningController.withdraw);
    });

    router.post('/earnings', validate(EarningRequest.store), EarningController.store);
});
//
// apiRouter.group('/personal-accounts', router => {
//     router.get('/transactions', TransactionController.getAllPersonalTransactions);
//     router.get('/transactions/:transactionId', TransactionController.getPersonalTransactionById);
//
//     router.get('/collective-investments', InvestmentController.getPersonalCollectiveInvestments);
//     router.get('/sub-investments', InvestmentController.getPersonalSubInvestments);
//
//     router.get('/', PersonalAccountController.index);
//     router.get('/:personalAccountId', PersonalAccountController.getById);
//     router.post('/', validate(PersonalAccountRequest.store), PersonalAccountController.store);
//
//     router.post('/:personalAccountId/deposit', [validate(PersonalAccountRequest.deposit)], PersonalAccountController.deposit);
//     router.post('/:personalAccountId/withdraw', [validate(PersonalAccountRequest.withdraw)], PersonalAccountController.withdraw);
// });
//
// apiRouter.group('/group-accounts', router => {
//     router.get('/', GroupAccountController.index);
//
//     router.get('/transactions', GroupTransactionController.getAll);
//     router.get('/transactions/:transactionId', TransactionController.getGroupTransactionById);
//     router.get('/:id', GroupAccountController.getById);
// });

// apiRouter.group('/groups', router => {
//     router.get('/collective-investments', InvestmentController.getGroupCollectiveInvestments);
//     router.get('/sub-investments', InvestmentController.getGroupSubInvestments);
//
//     router.post('/', validate(GroupRequest.store), GroupController.store);
//     router.get('/', GroupController.index);
//     router.get('/:id', GroupController.getById);
//
//     router.post('/:groupId/deposit', validate(GroupRequest.deposit), GroupController.deposit);
//     router.post('/:groupId/withdraw', validate(GroupRequest.withdraw), GroupController.withdraw);
//
//     router.group('/:groupId', router => {
//         router.get('/transactions', TransactionController.getAllGroupTransactions);
//
//         router.group('/accounts', router => {
//             router.post('/', validate(GroupAccountRequest.store), GroupAccountController.store);
//             router.get('/:accountId', GroupAccountController.getByAccountId);
//         });
//     });
// });

apiRouter.group('/dashboard', router => {
    router.get('/chart', DashboardController.chartData);
    router.get('/summaries', DashboardController.summaries);
    router.get('/recent-transactions', DashboardController.recentTransactions);
    router.get('/recent-collective-investments', DashboardController.recentCollectiveInvestments);
});

export default apiRouter.export();
