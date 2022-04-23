import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity, dateColumnType } from './BaseEntity';
import { GroupSubInvestment } from './GroupSubInvestment';

@Entity('group_collective_investments')
export class GroupCollectiveInvestment extends BaseEntity {
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

    @OneToMany(() => GroupSubInvestment, (groupSubInvestment) => {
        return groupSubInvestment.group_collective_investment;
    }, {cascade: true,})
    group_sub_investments: GroupSubInvestment[];
}
