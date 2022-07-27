import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity, NumericColumnTransformer } from './BaseEntity';
import { PersonalCollectiveInvestment } from './PersonalCollectiveInvestment';
import { PersonalAccount } from './PersonalAccount';

@Entity('personal_sub_investments')
export class PersonalSubInvestment extends BaseEntity {
    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, transformer: new NumericColumnTransformer})
    amount: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, nullable: true, transformer: new NumericColumnTransformer})
    interest: number;

    @Column({type: 'bigint', unsigned: true})
    personal_account_id: number;

    @Column({type: 'bigint', unsigned: true})
    personal_collective_investment_id: number;

    @ManyToOne(() => PersonalAccount, (personalAcc) => {
        return personalAcc.personal_sub_investments;
    })
    personal_account: PersonalAccount;

    @ManyToOne(() => PersonalCollectiveInvestment, (personalCollectiveInvestment) => {
        return personalCollectiveInvestment.personal_sub_investments;
    }, {cascade: true})
    personal_collective_investment: PersonalCollectiveInvestment;
}
