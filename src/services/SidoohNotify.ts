import { EventType } from '../utils/enums';
import log from '../utils/logger';
import { CONFIG } from '../config';
import SidoohService from './SidoohService';

export default class SidoohNotify extends SidoohService {
    static notify(to: (string | number)[], message: string, eventType: EventType) {
        log.info('--- --- --- --- ---   ...[SRV - NOTIFY]: Send Notification...   --- --- --- --- ---', {
            channel: 'sms',
            event_type: eventType,
            destination: to,
            content: message
        });

        const url = `${CONFIG.sidooh.services.notify.url}/notifications`

        console.log(url);
    }
}