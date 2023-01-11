import 'dotenv/config';
import { AppDataSource } from "./entities/data-source";
import log from './utils/logger';
import App from './app';
import { env } from './utils/validate.env';

AppDataSource.initialize().then(async () => {
    const app = new App(env.PORT);

    app.serve();

    // Jobs();
}).catch(error => log.error('Error Initializing DB: ', error))
