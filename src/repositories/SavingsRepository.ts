import { GroupCollectiveInvestment } from "../entities/models/GroupCollectiveInvestment";
import { PersonalCollectiveInvestment } from "../entities/models/PersonalCollectiveInvestment";

export const SavingsRepository = {
    getCumulativeSavings: async () => {
        const personal = await PersonalCollectiveInvestment.findOne({ order: { id: 'DESC' } })
        const group = await GroupCollectiveInvestment.findOne({ order: { id: 'DESC' } })

        return personal.amount + group.amount
    }
}
