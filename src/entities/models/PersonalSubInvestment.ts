import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { PersonalCollectiveInvestment } from './PersonalCollectiveInvestment';

@Entity('personal_sub_investments')
export class PersonalSubInvestment extends BaseEntity {
    @Column({type: 'decimal', default: 0, precision: 10, scale: 4})
    amount: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, nullable: true})
    interest: number;

    @Column({type: 'bigint', unsigned: true})
    account_id: number;

    @Column({type: 'bigint', unsigned: true})
    personal_collective_investment_id: number;

    @ManyToOne(() => PersonalCollectiveInvestment, (personalCollectiveInvestment) => {
        return personalCollectiveInvestment.personal_sub_investments;
    })
    personal_collective_investment: PersonalCollectiveInvestment;
}
