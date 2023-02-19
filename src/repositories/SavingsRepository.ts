import { GroupCollectiveInvestment } from "../entities/models/GroupCollectiveInvestment";
import { PersonalCollectiveInvestment } from "../entities/models/PersonalCollectiveInvestment";
import SidoohPayments from "../services/SidoohPayments";
import { env } from "../utils/validate.env";
import SidoohNotify from "../services/SidoohNotify";
import { EventType } from "../utils/enums";
import { BadRequestError } from "../exceptions/bad-request.err";

export const SavingsRepository = {
    checkServiceBalances: async () => {
        const savingsFloatAccount = await SidoohPayments.getFloatAccount(2);
        if (!savingsFloatAccount) {
            throw new BadRequestError('Unable to fetch savings float account!')
        }

        const personal = await PersonalCollectiveInvestment.findOne({
            select: ['id', 'amount'],
            where: {},
            order: { id: 'DESC' }
        })
        const group = await GroupCollectiveInvestment.findOne({
            select: ['id', 'amount'],
            where: {},
            order: { id: 'DESC' }
        })

        const cumulativeSavings = (personal?.amount ?? 0) + (group?.amount ?? 0)

        let message = `Provider Balances:\n`;
        if (savingsFloatAccount.balance <= (env.SAVINGS_FLOAT_THRESHOLD_PERCENTAGE / 100) * cumulativeSavings) {
            message += `\t - Savings Float: ${savingsFloatAccount.balance}\n`;
        }

        if (message.includes('-')) {
            message += `\n#SRV:Savings`;

            await SidoohNotify.notify(env.ADMIN_CONTACTS.split(','), message, EventType.STATUS_UPDATE);
        }
    }
}
