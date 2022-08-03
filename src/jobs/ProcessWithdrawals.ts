import { schedule } from 'node-cron';
import log from '../utils/logger';
import { TransactionRepository } from "../repositories/TransactionRepository";

export const ProcessWithdrawals = () => {
    log.info("...[JOB]... Setting up withdrawals job...");

    //TODO: Shift this to env vars so that prod and qa can run separate schedules
    const scheduleTime = '*/3 * * * *'
    schedule(/*scheduleTime */'37 9,13,17,20 * * *',
        async () => await TransactionRepository.processPersonalWithdrawals());

    // schedule('25 9,13,17 * * *',
    //     async () => await TransactionRepository.ProcessGroupWithdrawals());
};
