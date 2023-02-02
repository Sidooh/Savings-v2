import log from '../utils/logger';
import { CONFIG } from '../config';
import SidoohService from './SidoohService';

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
}
