import express, { Application, json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import 'express-async-errors';
import log from './utils/logger';
import routes from './routes';
import { ErrorMiddleware } from './http/middleware/error.middleware';
import { User } from './http/middleware/user.middleware';
import cookieParser from "cookie-parser";
import { NotFoundError } from './exceptions/not-found.err';

class App {
    public app: Application;
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
        this.app.use(urlencoded({extended: false}));
        this.app.use(cookieParser());
        this.app.use(User);

        /** --------------------------------    INIT API ROUTES
         * */
        this.app.use('/api/v1', /*[Auth],*/ routes);
        this.app.all('*', async() => {
            throw new NotFoundError();
        })

        /** --------------------------------    INIT ERROR HANDLER
         * */
        this.app.use(ErrorMiddleware);
    }

    listen(): void {
        this.app.listen(this.port, () => log.info(`App listening on port: ${this.port}`))
            .on('error', err => log.error('Startup error: ', err));
    }
}

export default App;