import { schedule } from 'node-cron';
import InvestmentRepository from '../repositories/InvestmentRepository';
import log from '../utils/logger';

export const Invest = () => {
    log.info("...[JOB]... Setting up investment job...");

    //  TODO: Reset the investment job to every day at midnight
    schedule('0 0 * * *', async () => await (new InvestmentRepository()).invest());
    // schedule('* * * * *', async () => await (new InvestmentRepository()).invest());
};
