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

    static async getWithdrawalCharge(amount: number): Promise<number> {
        log.info('...[SRV - PAYMENTS]: Get Withdrawal Charge...', { amount });

        let charge: number = Cache.get(`withdrawal_charge_${amount}`)
        if (charge) return charge

        const url = `${CONFIG.sidooh.services.payments.url}/charges/withdrawal/${amount}`;
        let res = await this.fetch(url)
        charge = res.data

        Cache.set(`withdrawal_charge_${amount}`, charge, (24 * 60 * 60))

        return charge
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
