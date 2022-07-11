import { cleanEnv, num, port, str, url } from 'envalid';

export const env = () => cleanEnv(process.env, {
    PORT: port({default: 3000}),

    JWT_KEY: str(),

    APP_ENV: str({
        default: 'development',
        choices: ['development', 'production']
    }),

    DB_USERNAME: str(),
    DB_PASSWORD: str(),
    DB_DATABASE: str(),
    DB_HOST: str({default: '127.0.0.7'}),

    SLACK_HOOK_URL: url({default: null}),
    SLACK_LOGGING: str({
        default: 'disabled',
        choices: ["enabled", "disabled"]
    }),

    SIDOOH_ACCOUNTS_API_URL: url({default: 'http://localhost:8000/api/v1'}),
    SIDOOH_NOTIFY_API_URL: url({default: 'http://localhost:8003/api/v1'}),
    SIDOOH_PRODUCTS_API_URL: url({default: 'http://localhost:8001/api/v1'}),
    SIDOOH_PAYMENTS_API_URL: url({default: 'http://localhost:8002/api/v1'}),

    MIN_FREQUENCY_AMOUNT: num({default: 20}),
    MIN_WITHDRAWAL_AMOUNT: num({default: 20}),

    INTEREST_RATE: num({default: 9}),
});


export default function validateEnv(): void {
    env();
}
