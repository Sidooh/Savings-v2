import RouteGroup from "express-route-grouping";
import { Router } from "express";
import PaymentController from "../http/controllers/PaymentController";
import api from "./api";
import JobController from "../http/controllers/JobController";

const router = new RouteGroup('/', Router());

router.group('/payments', router => {
    router.post('/callback', PaymentController.processCallback);
});

router.group('/jobs', router => {
    router.post('/interest/calculation', PaymentController.processCallback);
    router.post('/interest/allocation', PaymentController.processCallback);

    router.post('/withdrawals/personal', JobController.processPersonalWithdrawals);
});

const routes = router.export()

export { routes as default, api }
