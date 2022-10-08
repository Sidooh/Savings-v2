import SidoohService from './SidoohService';
import log from '../utils/logger';
import { CONFIG } from '../config';
import { NotFoundError } from '../exceptions/not-found.err';
import { Cache } from '../utils/helpers';
import moment from 'moment';

export type User = {
    id: number
    name: string
    email: string
}

export type Account = {
    id: number
    phone: number
    user?: User
    user_id: number
}

export default class SidoohAccounts extends SidoohService {
    static async find(id: number) {
        log.info('...[SRV - ACCOUNTS]: Find Account...', { id });

        const url = `${CONFIG.sidooh.services.accounts.url}/accounts/${id}?with_user=true`;

        let acc = Cache.get(id);

        if (!acc) {
            await this.fetch(url).then(
                ({ data }) => {
                    log.info('...[SRV - ACCOUNTS]: RES - ', { count: data.length });

                    acc = data;
                    Cache.set(id, acc, moment().add(1, 'd').diff(moment(), 's'));
                },
                error => {
                    const message = error.isAxiosError ? error.message : error?.response?.message || error?.response?.data;
                    log.error('...[SRV - ACCOUNTS]: ERR - ', { message });
                    throw new NotFoundError('Sidooh Account Not Found!');
                }
            );
        }

        if (!acc) throw new NotFoundError('Sidooh Account Not Found!');

        return acc;
    }

    static async findAll() {
        log.info('...[SRV - ACCOUNTS]: Find All...');

        const url = `${CONFIG.sidooh.services.accounts.url}/accounts?with_user=true`;

        return await this.fetch(url).then(({ data }: { data: Account[] }) => {
            log.info('...[SRV - ACCOUNTS]: RES - ', { count: data.length });

            data.forEach(acc => Cache.set(acc.id, acc, moment().add(1, 'd').diff(moment(), 's')));

            return data;
        });
    }
}
