import { bool, cleanEnv, num, port, str, url } from 'envalid';

export const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'], default: undefined }),
    APP_URL: url(),
    PORT: port({ default: 8005 }),

    JWT_KEY: str(),

    APP_ENV: str({
        default: 'development',
        choices: ['development', 'production']
    }),

    DB_PORT: num({ default: 3306 }),
    DB_USERNAME: str(),
    DB_PASSWORD: str(),
    DB_DATABASE: str(),
    DB_SOCKET: str({ default: '' }),
    DB_HOST: str({ default: '127.0.0.7' }),

    SYNCHRONIZE_DB: bool({ default: false }),

    LOG_LEVEL: str({
        //  In order of priority - highest to lowest
        choices: ['emerg', 'alert', 'crit', 'error', 'warn', 'notice', 'info', 'debug'],
        default: 'debug'
    }),

    SLACK_HOOK_URL: url({ default: '' }),
    ENABLE_SLACK_LOGGING: bool({ default: false }),

    SIDOOH_ACCOUNTS_API_URL: url({ default: 'http://localhost:8000/api/v1' }),
    SIDOOH_NOTIFY_API_URL: url({ default: 'http://localhost:8003/api/v1' }),
    SIDOOH_PRODUCTS_API_URL: url({ default: 'http://localhost:8001/api/v1' }),
    SIDOOH_PAYMENTS_API_URL: url({ default: 'http://localhost:8002/api/v1' }),

    MIN_FREQUENCY_AMOUNT: num({ default: 20 }),
    MIN_WITHDRAWAL_AMOUNT: num({ default: 20 }),

    SENTRY_DSN: url({ default: null }),
    SENTRY_TRACES_SAMPLE_RATE: num({ default: 0.0 }),

    INTEREST_RATE: num({ default: 9.00 }),

    ADMIN_CONTACTS: str({ default: '254110039317,254714611696,254711414987' }),

    SAVINGS_FLOAT_THRESHOLD_PERCENTAGE: num({ default: 10 })
});
