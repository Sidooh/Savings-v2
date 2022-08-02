import { schedule } from 'node-cron';
import InvestmentRepository from '../repositories/InvestmentRepository';
import log from '../utils/logger';

export const Invest = () => {
    log.info("...[JOB]... Setting up Investment job...");

    schedule('25 22 * * *', async () => await (new InvestmentRepository()).invest());
};
