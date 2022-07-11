import {EventType} from '../utils/enums';
import log from '../utils/logger';
import {CONFIG} from '../config';
import SidoohService from './SidoohService';
import {NotFoundError} from "../exceptions/not-found.err";
import {AxiosError} from "axios";

export default class SidoohPayments extends SidoohService {
    static async requestPayment(transaction: {}) {
        log.info('...[SRV - PAYMENTS]: Request Payment...', transaction);

        const url = `${CONFIG.sidooh.services.payments.url}/payments/disburse`;

        let payment
        await this.fetch(url, 'POST', transaction).then(
            ({data}) => {
                log.info('...[SRV - PAYMENTS]: RES - ', {data});

                payment = data.data
            },
            error => {
                const message = error.isAxiosError ? error.message : error?.response?.message || error?.response?.data
                log.error('...[SRV - PAYMENTS]: ERR - ', {message})
                throw new Error(message)
            })

        return payment
    }


    static async queryPayment(id: number) {
        log.info('...[SRV - PAYMENTS]: Querying Payment...', id);

        const url = `${CONFIG.sidooh.services.payments.url}/payments/${id}`;

        let payment
        await this.fetch(url).then(
            ({data}) => {
                log.info('...[SRV - PAYMENTS]: RES - ', {data});

                payment = data.data
            },
            error => {
                const message = error.isAxiosError ? error.message : error?.response?.message || error?.response?.data
                log.error('...[SRV - PAYMENTS]: ERR - ', {message})
                throw new Error(message)
            })

        return payment
    }
}
