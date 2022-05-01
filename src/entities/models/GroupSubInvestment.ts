import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity, NumericColumnTransformer } from './BaseEntity';
import { GroupCollectiveInvestment } from './GroupCollectiveInvestment';
import { Group } from './Group';

@Entity('group_sub_investments')
export class GroupSubInvestment extends BaseEntity {
    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, transformer: new NumericColumnTransformer})
    amount: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, nullable: true, transformer: new NumericColumnTransformer})
    interest: number;

    @Column({type: 'bigint', unsigned: true})
    group_id: number;

    @Column({type: 'bigint', unsigned: true})
    group_collective_investment_id: number;

    @ManyToOne(() => Group, (group) => {
        return group.group_sub_investments;
    })
    group: Group;

    @ManyToOne(() => GroupCollectiveInvestment, (groupCollectiveInvestment) => {
        return groupCollectiveInvestment.group_sub_investments;
    })
    group_collective_investment: GroupCollectiveInvestment;
}
