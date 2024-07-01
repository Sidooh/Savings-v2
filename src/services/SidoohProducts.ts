import log from '../utils/logger';
import { CONFIG } from '../config';
import SidoohService from './SidoohService';

export default class SidoohProducts extends SidoohService {
    static async withdrawalCallback(transaction: {}) {
        log.info('...[SRV - PRODUCTS]: Withdrawal Callback...', transaction);

        const url = `${CONFIG.sidooh.services.products.url}/savings/callback`;

        await this.fetch(url, 'POST', transaction).then(
            ({data}) => {
                log.info('...[SRV - PRODUCTS]: RES - ', {data});
            },
            error => {
                const message = error.isAxiosError ? error.message : error?.response?.message || error?.response?.data
                log.error('...[SRV - PRODUCTS]: ERR - ', {message})
            })
    }
}
