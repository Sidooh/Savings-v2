import SidoohService from './SidoohService';
import log from '../utils/logger';
import { CONFIG } from '../config';
import { NotFoundError } from '../exceptions/not-found.err';

export default class SidoohAccounts extends SidoohService {
    static async find(id: number) {
        log.info('--- --- --- --- ---   ...[SRV - ACCOUNTS]: Find Account...   --- --- --- --- ---', {id});

        const url = `${CONFIG.sidooh.services.accounts.url}/accounts/${id}`;

        const {data: acc} = await this.fetch(url);

        if (!acc) throw new NotFoundError('Sidooh Account Not Found!');

        return acc;
    }
}