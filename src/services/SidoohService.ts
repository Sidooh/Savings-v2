import axios, { AxiosInstance } from 'axios';

export default class SidoohService {
    static http: AxiosInstance = axios.create({
        headers: {
            Accept: 'application/json',
            ContentType: 'application/json'
        },
        responseType:'json'
    });

}