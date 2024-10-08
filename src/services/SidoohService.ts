import axios, { AxiosInstance, Method } from 'axios';
import log from '../utils/logger';
import { CONFIG } from '../config';
import { Cache } from '../utils/helpers';

export default class SidoohService {
    static http = async (): Promise<AxiosInstance> => {
        let token = Cache.get('auth_token');

        if (!token) {
            try {
                token = await this.authenticate();
            } catch (e) {
                throw new Error('Something went wrong, please try again later.');
            }
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

        Cache.set('auth_token', access_token, 15 * 60);

        return access_token;
    };

    static fetch = async (url: string, method: Method = 'GET', data: {} = {}) => {
        log.info('...[SRV - SIDOOH]: REQ...', { url, method, data });

        const http = await this.http();
        const t = performance.now()

        try {
            const response = await http[method.toLowerCase()](url, data).then(({ data }) => data);
            const latency = Math.round(performance.now() - t)

            log.info('...[SRV - SIDOOH]: RES... ' + latency + 'ms');

            return response
        } catch (e) {
            console.log(e?.response)
            const latency = Math.round(performance.now() - t)

            const message = e.isAxiosError ? e.message : e?.response?.data || e?.response?.message
            log.error('...[SRV - SIDOOH]: ERR... ' + latency + 'ms', { message, response: e?.response?.data });

            throw new Error('Something went wrong, please try again later.');
        }
    };

    static callback({ url, method = 'POST', data = {} }: { url: string, method?: Method, data: any }) {
        log.info('--- ...[SRV - SIDOOH]: CB... ---', data)

        this.fetch(url, method, data).catch(err => {
            log.error('...[SRV - SIDOOH]: ERR - ', err)
        })
    }
}
