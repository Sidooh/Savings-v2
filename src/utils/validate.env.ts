import { cleanEnv, port, str, url } from 'envalid';

export default function validateEnv(): void {
    cleanEnv(process.env, {
        PORT: port({default: 3000}),

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
        })
    });
}
