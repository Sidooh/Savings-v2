import { schedule } from 'node-cron';
import InvestmentRepository from '../repositories/InvestmentRepository';
import log from '../utils/logger';
import { CONFIG } from '../config';

export const Invest = () => {
    log.info("...[JOB]... Setting up investment job...");

    schedule(CONFIG.sidooh.cron.daily_interest_calculation, async () => await (new InvestmentRepository()).dailyInterestCalculation());
    schedule(CONFIG.sidooh.cron.monthly_interest_allocation, async () => await (new InvestmentRepository()).monthlyInterestAllocation());
};
