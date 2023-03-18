import log from '../utils/logger';
import { CONFIG } from '../config';
import SidoohService from './SidoohService';
import { Cache } from "../utils/helpers";

export default class SidoohPayments extends SidoohService {
    static async requestPayment(transaction: {}) {
        log.info('...[SRV - PAYMENTS]: Request Payment...');

        const url = `${CONFIG.sidooh.services.payments.url}/payments/withdraw`;

        return await this.fetch(url, 'POST', transaction)
    }

    static async findById(id: number) {
        log.info('...[SRV - PAYMENTS]: Find By ID...', { id });

        const url = `${CONFIG.sidooh.services.payments.url}/payments/${id}`;

        return await this.fetch(url)
    }

    static async getWithdrawalCharges(): Promise<number> {
        log.info('...[SRV - PAYMENTS]: Get Withdrawal Charges...');

        let charges: number = Cache.get(`withdrawal_charges`)
        if (charges) return charges

        const url = `${CONFIG.sidooh.services.payments.url}/charges/withdrawal`;
        let res = await this.fetch(url)

        Cache.set(`withdrawal_charges`, res.data, (3600 * 24 * 90))

        return res.data
    }

    static async getFloatAccount(id: number) {
        log.info('...[SRV - PAYMENTS]: Get Float Account...');

        const url = `${CONFIG.sidooh.services.payments.url}/float-accounts/${id}`;

        return await this.fetch(url).then(({ data }) => {
            log.info('...[SRV - PAYMENTS]: RES - ', { data });
            return data;
        }, error => {
            console.log(error);
            const message = error.isAxiosError ? error.message : error?.response?.message || error?.response?.data;
            log.error('...[SRV - PAYMENTS]: ERR - ', { message });
        });
    }
}
