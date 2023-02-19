import RouteGroup from "express-route-grouping";
import { Router } from "express";
import PaymentController from "../http/controllers/PaymentController";
import api from "./api";
import JobController from "../http/controllers/JobController";
import InvestmentController from "../http/controllers/InvestmentController";

const router = new RouteGroup('/', Router());

router.group('/payments', router => {
    router.post('/callback', PaymentController.processCallback);
});

router.group('/jobs', router => {
    router.post('/interest/calculation', InvestmentController.calculateInterest);
    router.post('/interest/allocation', InvestmentController.allocateInterest);

    router.post('/withdrawals/personal', JobController.processPersonalWithdrawals);

    router.get('/providers/check-balances', JobController.checkServiceBalances)
});

const routes = router.export()

export { routes as default, api }
