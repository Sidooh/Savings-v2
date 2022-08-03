import { schedule } from 'node-cron';
import InvestmentRepository from '../repositories/InvestmentRepository';
import log from '../utils/logger';

export const Invest = () => {
    log.info("...[JOB]... Setting up investment job...");

    schedule('0 21 * * *', async () => await (new InvestmentRepository()).invest());
};
