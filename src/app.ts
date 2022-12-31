import express, { Application, json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import 'express-async-errors';
import log from './utils/logger';
import routes, { api } from './routes';
import { ErrorMiddleware } from './http/middleware/error.middleware';
import { User } from './http/middleware/user.middleware';
import cookieParser from "cookie-parser";
import { NotFoundError } from './exceptions/not-found.err';
import { Auth } from "./http/middleware/auth.middleware";
import * as Sentry from "@sentry/node";
import { env } from "./utils/validate.env";
import * as Tracing from "@sentry/tracing";

class App {
    public app: Application;
    public port: number;

    constructor(port: number) {
        /** --------------------------------    INIT APP
         * */
        this.port = port;
        this.app = express();

        /** --------------------------------    INIT SENTRY
         * */
        Sentry.init({
            dsn: env.SENTRY_DSN,
            integrations: [
                // enable HTTP calls tracing
                new Sentry.Integrations.Http({ tracing: true }),
                // enable Express.js middleware tracing
                new Tracing.Integrations.Express({ app: this.app }),
            ],

            // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
            // We recommend adjusting this value in production
            tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
        });

        // RequestHandler creates a separate execution context using domains, so that every
        // transaction/span/breadcrumb is attached to its own Hub instance
        this.app.use(Sentry.Handlers.requestHandler());
        // TracingHandler creates a trace for every incoming request
        this.app.use(Sentry.Handlers.tracingHandler());
        this.app.use(Sentry.Handlers.errorHandler());

        /** --------------------------------    INIT APP MIDDLEWARE
         * */
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(User);

        /** --------------------------------    INIT API ROUTES
         * */
        this.app.use('/', routes);
        this.app.use('/', [Auth], api);
        // [...routes.stack, ...api.stack].map(r => console.log(r.route.path))
        this.app.all('*', async () => {
            throw new NotFoundError();
        });

        /** --------------------------------    INIT ERROR HANDLER
         * */
        this.app.use(ErrorMiddleware);
    }

    serve(): void {
        this.app.listen(this.port, async () => {
            log.info(`App listening on port: ${this.port}`);
        }).on('error', err => log.error('Startup Error: ', err));
    }
}

export default App;
