import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity, dateColumnType } from './BaseEntity';
import { PersonalSubInvestment } from './PersonalSubInvestment';

@Entity('personal_collective_investments')
export class PersonalCollectiveInvestment extends BaseEntity {
    @Column({type: 'decimal', default: 0, precision: 10, scale: 4})
    amount: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, nullable: true})
    interest_rate: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, nullable: true})
    interest: number;

    @Column({type: dateColumnType, default: () => 'CURRENT_TIMESTAMP'})
    investment_date: Date;

    @Column({type: dateColumnType, nullable: true})
    maturity_date: Date;

    @OneToMany(() => PersonalSubInvestment, (personalSubInvestment) => {
        return personalSubInvestment.personal_collective_investment;
    })
    personal_sub_investments: PersonalSubInvestment[];
}
