import {env} from "../utils/validate.env";


export default {
    services: {
        notify: {
            url: env().SIDOOH_NOTIFY_API_URL
        },
        accounts: {
            url: env().SIDOOH_ACCOUNTS_API_URL
        }
    }
}
