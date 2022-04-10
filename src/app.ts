import express, { Express, json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import 'express-async-errors';
import log from './utils/logger';
import routes from './routes';
import { errorHandler } from '@nabz.tickets/common';

class App {
    public app: Express;
    public port: number;

    constructor(port: number) {
        /** --------------------------------    INIT APP
         * */
        this.port = port;
        this.app = express();

        /** --------------------------------    INIT APP MIDDLEWARE
         * */
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));

        /** --------------------------------    INIT API ROUTES
         * */
        this.app.use('/api', routes)

        /** --------------------------------    INIT ERROR HANDLER
         * */
        this.app.use(errorHandler);
    }

    listen(): void {
        this.app.listen(this.port, () => log.info(`App listening on port: ${this.port}`))
            .on('error', err => log.error('Startup error: ', err));
    }
}

export default App;