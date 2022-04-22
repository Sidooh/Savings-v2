import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { GroupCollectiveInvestment } from './GroupCollectiveInvestment';

@Entity('group_sub_investments')
export class GroupSubInvestment extends BaseEntity {
    @Column({type: 'decimal', default: 0, precision: 10, scale: 4})
    amount: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, nullable: true})
    interest: number;

    @Column({type: 'bigint', unsigned: true})
    account_id: number;

    @Column({type: 'bigint', unsigned: true})
    group_collective_investment_id: number;

    @ManyToOne(() => GroupCollectiveInvestment, (groupCollectiveInvestment) => {
        return groupCollectiveInvestment.group_sub_investments;
    })
    group_collective_investment: GroupCollectiveInvestment;
}
