import 'dotenv/config';
import { AppDataSource } from "./entities/data-source";
import log from './utils/logger';
import App from './app';
import validateEnv, {env} from './utils/validate.env';
import Jobs from "./jobs";

validateEnv();

AppDataSource.initialize().then(async () => {
    const app = new App(Number(env().PORT || 8005));

    app.listen();

    Jobs();
}).catch(error => log.error('Connection error: ', error))
