import { GroupCollectiveInvestment } from "../entities/models/GroupCollectiveInvestment";
import { PersonalCollectiveInvestment } from "../entities/models/PersonalCollectiveInvestment";

export const SavingsRepository = {
    getCumulativeSavings: async () => {
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

        return (personal?.amount ?? 0) + (group?.amount ?? 0)
    }
}
