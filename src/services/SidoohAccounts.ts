import SidoohService from './SidoohService';
import log from '../utils/logger';
import { CONFIG } from '../config';
import { NotFoundError } from '../exceptions/not-found.err';
import { Cache } from '../utils/helpers';

export default class SidoohAccounts extends SidoohService {
    static async find(id: number) {
        log.info('--- --- --- --- ---   ...[SRV - ACCOUNTS]: Find Account...   --- --- --- --- ---', {id});

        const url = `${CONFIG.sidooh.services.accounts.url}/accounts/${id}`;

        let acc = Cache.get(id);

        if (!acc) {
            let {data} = await this.fetch(url);

            acc = data;
            Cache.set(id, acc);
        }

        if (!acc) throw new NotFoundError('Sidooh Account Not Found!');

        return acc;
    }
}