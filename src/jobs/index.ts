import { Invest } from './Invest';
import {ProcessWithdrawals} from "./ProcessWithdrawals";

const Jobs = async () => {
    await Invest();

    await ProcessWithdrawals();
}

export default Jobs
