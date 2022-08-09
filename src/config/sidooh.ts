import { env } from "../utils/validate.env";

export default {
    services: {
        notify: {
            url: env().SIDOOH_NOTIFY_API_URL
        },
        accounts: {
            url: env().SIDOOH_ACCOUNTS_API_URL
        },
        products: {
            url: env().SIDOOH_PRODUCTS_API_URL
        },
        payments: {
            url: env().SIDOOH_PAYMENTS_API_URL
        }
    },
    cron: {
        daily_interest_calculation: env().DAILY_INTEREST_CALCULATION_CRON,
        monthly_interest_allocation: env().MONTHLY_INTEREST_ALLOCATION_CRON
    }
};
