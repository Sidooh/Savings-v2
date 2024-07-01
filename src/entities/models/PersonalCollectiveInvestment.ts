import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity, dateColumnType, NumericColumnTransformer } from './BaseEntity';
import { PersonalSubInvestment } from './PersonalSubInvestment';

@Entity('personal_collective_investments')
export class PersonalCollectiveInvestment extends BaseEntity {
    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, transformer: new NumericColumnTransformer})
    amount: number;

    @Column({type: 'decimal', precision: 10, scale: 4, nullable: true, transformer: new NumericColumnTransformer})
    interest_rate: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, nullable: true, transformer: new NumericColumnTransformer})
    interest: number;

    @Column({type: dateColumnType, default: () => 'CURRENT_TIMESTAMP'})
    invested_at: Date;

    @Column({type: dateColumnType, nullable: true})
    maturity_date: Date;

    @OneToMany(() => PersonalSubInvestment, (personalSubInvestment) => {
        return personalSubInvestment.personal_collective_investment;
    })
    personal_sub_investments: PersonalSubInvestment[];
}
