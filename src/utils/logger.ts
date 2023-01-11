import { config, createLogger, format, transports } from 'winston';
import SlackHook from 'winston-slack-webhook-transport';
import { FileTransportInstance } from 'winston/lib/winston/transports';
import { circularReplacer } from './helpers';
import { env } from "./validate.env";

const { combine, timestamp, printf, align } = format;

const exceptionHandlers = [
    new transports.File({ filename: 'logs/exception.log' })
];

if (env.ENABLE_SLACK_LOGGING) {
    exceptionHandlers.push(<FileTransportInstance>new SlackHook({ webhookUrl: env.SLACK_HOOK_URL }));
}

const log = createLogger({
    levels: config.syslog.levels,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS A' }),
        align(),
        printf(info => {
            const { timestamp, level, message, ...args } = info;
            const ts = timestamp.slice(0, 23).replace('T', ' ');

            return `${ts} [${level}]: ${message} ${Object.keys(args).length
                ? JSON.stringify(args, circularReplacer(), 2)
                : ''}`;
        })
    ),
    exceptionHandlers,
    transports: [
        new transports.File({ filename: 'logs/savings.log', level: env.LOG_LEVEL }),
        new transports.Console({ level: env.LOG_LEVEL }),
        // new SlackHook({
        //     level: 'error',
        //     webhookUrl: String(env.SLACK_HOOK_URL),
        //     formatter: info => {
        //         const {timestamp, level, message, ...args} = info;
        //         const stack = Object.keys(args).length ? JSON.stringify(args, circularReplacer(), 2) : '';
        //
        //         return {
        //             blocks: [
        //                 {
        //                     type: 'header',
        //                     text: {
        //                         type: 'plain_text',
        //                         text: `Error Alert!`
        //                     }
        //                 },
        //                 {
        //                     'type': 'divider'
        //                 },
        //                 {
        //                     'type': 'section',
        //                     'text': {
        //                         'type': 'mrkdwn',
        //                         'text': `*MESSAGE:* \n${message}\n${stack}`
        //                     }
        //                 },
        //                 {
        //                     'type': 'divider'
        //                 },
        //                 {
        //                     'type': 'section',
        //                     'text': {
        //                         'type': 'mrkdwn',
        //                         'text': `*LEVEL*: ${level.toUpperCase().padEnd(5)}`
        //                     }
        //                 }
        //             ]
        //         };
        //     }
        // })
    ],
    exitOnError: false
});

export default log;
