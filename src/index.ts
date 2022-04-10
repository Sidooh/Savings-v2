import 'dotenv/config';
import { AppDataSource } from "./data-source";
import log from './utils/logger';
import App from './app';
import validateEnv from './utils/validateEnv';

validateEnv();

AppDataSource.initialize().then(async () => {
    const app = new App(Number(process.env.PORT || 8005));

    app.listen();
}).catch(error => log.error('Database connection error: ', error))
