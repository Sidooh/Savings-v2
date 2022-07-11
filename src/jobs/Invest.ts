import { schedule } from 'node-cron';
import InvestmentRepository from '../repositories/InvestmentRepository';
import log from '../utils/logger';

export const Invest = () => {
    log.info("...[JOB]... Setting up Investment job...");

    schedule('* * * * *', async () => await (new InvestmentRepository()).invest());
    // schedule('0 0 * * *', async () => await (new InvestmentRepository()).invest());
};
