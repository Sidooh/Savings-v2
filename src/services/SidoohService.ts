import axios, { AxiosInstance, Method } from 'axios';
import log from '../utils/logger';
import { CONFIG } from '../config';

export default class SidoohService {
    static http = async (): Promise<AxiosInstance> => {
        const {token} = await this.authenticate();

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
        const url = `${CONFIG.sidooh.services.accounts.url}/users/signin`;

        const {data: token} = await axios.post(url, {email: 'aa@a.a', password: '12345678'});

        return token;
    };

    static fetch = async (url: string, method: Method = 'GET', data: {} = {}) => {
        log.info('--- --- --- --- ---   ...[SRV - SIDOOH]: Fetch...   --- --- --- --- ---', {method, data});

        const http = await this.http();

        return http[method.toLowerCase()](url, data);
    };
}