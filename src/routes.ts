import RouteGroup from 'express-group-router';
import SavingsAccountController from './http/controllers/SavingsAccountController';
import { SavingsAccountRequest } from './http/requests/SavingsAccount.request';
import { validate } from './http/middleware/validate.middleware';

const router = new RouteGroup();

router.group('/savings-accounts', router => {
    router.get('/', SavingsAccountController.index)
    router.post('/', [validate(SavingsAccountRequest.store)], SavingsAccountController.store)
    router.put('/update', SavingsAccountController.update)
    router.delete('/delete', SavingsAccountController.destroy)
})

export default router.init()