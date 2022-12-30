import { cleanEnv, num, port, str, url } from 'envalid';

export const validateEnv = () => cleanEnv(process.env, {
    APP_URL: url(),
    PORT: port({ default: 8005 }),

    JWT_KEY: str(),

    APP_ENV: str({
        default: 'development',
        choices: ['development', 'production']
    }),

    DB_USERNAME: str(),
    DB_PASSWORD: str(),
    DB_DATABASE: str(),
    DB_SOCKET: str({ default: '' }),
    DB_HOST: str({ default: '127.0.0.7' }),

    SLACK_HOOK_URL: url({ default: null }),
    SLACK_LOGGING: str({
        default: 'disabled',
        choices: ["enabled", "disabled"]
    }),

    SIDOOH_ACCOUNTS_API_URL: url({ default: 'http://localhost:8000/api/v1' }),
    SIDOOH_NOTIFY_API_URL: url({ default: 'http://localhost:8003/api/v1' }),
    SIDOOH_PRODUCTS_API_URL: url({ default: 'http://localhost:8001/api/v1' }),
    SIDOOH_PAYMENTS_API_URL: url({ default: 'http://localhost:8002/api/v2' }),

    MIN_FREQUENCY_AMOUNT: num({ default: 20 }),
    MIN_WITHDRAWAL_AMOUNT: num({ default: 20 }),

    SENTRY_DSN: url({ default: null }),
    SENTRY_TRACES_SAMPLE_RATE: num({ default: 0.0 }),

    INTEREST_RATE: num({ default: 9 }),

    DAILY_INTEREST_CALCULATION_CRON: str({ default: '0 21 * * *' }),
    MONTHLY_INTEREST_ALLOCATION_CRON: str({ default: '0 21 1 * *' }),

    ADMIN_CONTACTS: str({ default: '254110039317,254714611696,254711414987' })
});

export const env = validateEnv();
