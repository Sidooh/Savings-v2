import 'dotenv/config';
import { AppDataSource } from "./entities/data-source";
import log from './utils/logger';
import App from './app';
import validateEnv from './utils/validate.env';

validateEnv();

AppDataSource.initialize().then(async () => {
    const app = new App(Number(process.env.PORT || 8005));

    app.listen();

    // await (new InvestmentRepository()).invest()
}).catch(error => log.error('Database connection error: ', error))
