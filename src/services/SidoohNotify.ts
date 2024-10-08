import { EventType } from '../utils/enums';
import log from '../utils/logger';
import { CONFIG } from '../config';
import SidoohService from './SidoohService';

export default class SidoohNotify extends SidoohService {
    static async notify(to: (string | number)[], message: string, eventType: EventType) {
        log.info('...[SRV - NOTIFY]: Send Notification...');

        const url = `${CONFIG.sidooh.services.notify.url}/notifications`;

        try {
            const {data} = await this.fetch(url, 'POST', {
                channel: 'SMS',
                event_type: eventType,
                destination: to,
                content: message
            });

            log.info('--- --- ---   ...[SRV - NOTIFY]: Notification Sent...   --- --- ---', data);
        } catch (err) {
            log.error('Error sending notification: ', {err});
        }
    }
}
