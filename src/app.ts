import express, { Express, json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import log from './utils/logger';

class App {
    //  Initialize our express app
    public app: Express;
    public port: number;

    constructor(port: number) {
        this.port = port;
        this.app = express();

        this.#initMiddleware();
    }

    #initMiddleware(): void {
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));
    }

    listen(): void {
        this.app.listen(this.port, () => log.info(`App listening on port: ${this.port}`))
            .on('error', err => log.error('Startup error: ', err));
    }
}

export default App;