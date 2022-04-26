import { schedule } from 'node-cron';
import InvestmentRepository from '../repositories/InvestmentRepository';
import log from '../utils/logger';

export const Invest = () => {
    log.info("Investing...");

    schedule('* * * * *', async () => await (new InvestmentRepository()).invest);
};