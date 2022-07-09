import {schedule} from 'node-cron';
import log from '../utils/logger';
import {TransactionRepository} from "../repositories/TransactionRepository";

export const ProcessWithdrawals = () => {
    log.info("...[JOB]... Setting up withdrawals job...");

    const scheduleTime = '* * * * *'
    schedule(scheduleTime /*'37 9,13,17,20 * * *'*/,
        async () => await TransactionRepository.ProcessPersonalWithdrawals());


    // schedule('25 9,13,17 * * *',
    //     async () => await TransactionRepository.ProcessGroupWithdrawals());
};
