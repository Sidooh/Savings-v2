import SidoohService from './SidoohService';
import log from '../utils/logger';
import { CONFIG } from '../config';
import { NotFoundError } from '../exceptions/not-found.err';
import { Cache } from '../utils/helpers';
import moment from 'moment';
import {error} from "winston";

export default class SidoohAccounts extends SidoohService {
    static async find(id: number) {
        log.info('...[SRV - ACCOUNTS]: Find Account...', {id});

        const url = `${CONFIG.sidooh.services.accounts.url}/accounts/${id}`;

        let acc = Cache.get(id);

        if (!acc) {
            await this.fetch(url).then(
                ({data}) => {
                    log.info('...[SRV - ACCOUNTS]: RES - ', {data});

                    acc = data;
                    Cache.set(id, acc, moment().add(1, 'd').diff(moment(), 's'));
                },
                error => {
                    const message = error.isAxiosError ? error.message : error?.response?.message || error?.response?.data
                    log.error('...[SRV - ACCOUNTS]: ERR - ', {message})
                    throw new NotFoundError('Sidooh Account Not Found!')
                }
            );
        }

        if (!acc) throw new NotFoundError('Sidooh Account Not Found!')

        return acc
    }
}
