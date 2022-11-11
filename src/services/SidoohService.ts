import axios, { AxiosInstance, Method } from 'axios';
import log from '../utils/logger';
import { CONFIG } from '../config';
import { Cache } from '../utils/helpers';

export default class SidoohService {
    static http = async (): Promise<AxiosInstance> => {
        let token = Cache.get('auth_token');

        if (!token) {
            token = await this.authenticate();

            Cache.set('auth_token', token, 15 * 60);
        }

        return axios.create({
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                ContentType: 'application/json'
            },
            responseType: 'json'
        });
    };

    static authenticate = async () => {
        log.info('...[SRV - SIDOOH]: AUTH...')

        const url = `${CONFIG.sidooh.services.accounts.url}/users/signin`;

        const { data: { access_token } } = await axios.post(url, { email: 'aa@a.a', password: '12345678' });

        return access_token;
    };

    static fetch = async (url: string, method: Method = 'GET', data: {} = {}) => {
        log.info('...[SRV - SIDOOH]: REQ...', { url, method, data });

        const http = await this.http();

        const t = performance.now()
        try {
            const response = await http[method.toLowerCase()](url, data).then(({ data }) => data);
            const latency = Math.round(performance.now() - t)

            log.info('...[SRV - SIDOOH]: RES... ' + latency + 'ms', response);

            return response
        } catch (e) {
            const latency = Math.round(performance.now() - t)

            // if (e.getCode() === 401) {
            //     log.error('...[SRV - SIDOOH]: ERR... '+latency+'ms', e.response);
            //     throw new Error('Something went wrong, please try again later.');
            // }
            const message = e.isAxiosError ? e.message : e?.response?.data || e?.response?.message
            log.error('...[SRV - SIDOOH]: ERR... ' + latency + 'ms', { message });
            throw new Error('Something went wrong, please try again later.');
        }
    };

    static callback(transaction: { [key: string]: any }) {
        log.info('--- ...[SRV - SIDOOH]: CB... ---', transaction)

        const { extra: { ipn } } = transaction;

        this.fetch(ipn, 'POST', transaction).catch(
            error => {
                // log.error('...[SRV - SIDOOH]: ERR - ', error)
            })
    }
}
