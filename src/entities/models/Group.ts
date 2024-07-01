import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity, jsonColumnType, NumericColumnTransformer } from './BaseEntity';
import { Duration, Frequency, GroupType, Status } from '../../utils/enums';
import { GroupAccount } from './GroupAccount';
import { GroupSubInvestment } from './GroupSubInvestment';

@Entity('groups')
export class Group extends BaseEntity {
    @Column()
    name: string;

    @Column({length: 20, default: GroupType.DEFAULT})
    type: GroupType;

    @Column({type: 'bigint', default: 0})
    target_amount: number;

    @Column({type: 'bigint', default: 0})
    frequency_amount: number;

    @Column({type: 'decimal', default: 0, precision: 15, scale: 4, transformer: new NumericColumnTransformer})
    balance: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, transformer: new NumericColumnTransformer})
    interest: number;

    @Column({type: 'tinyint', unsigned: true, nullable: true})
    duration: Duration;

    @Column({length: 20, nullable: true})
    frequency: Frequency;

    @Column({length: 20, default: Status.INACTIVE})
    status: Status;

    @Column({type: jsonColumnType, nullable: true})
    settings: { min_frequency_amount: number };

    @OneToMany(() => GroupAccount, (groupAccount) => groupAccount.group, {
        cascade: true
    })
    group_accounts: GroupAccount[];

    @OneToMany(() => GroupSubInvestment, (subInvestment) => {
        return subInvestment.group;
    }, {cascade: true})
    group_sub_investments: GroupSubInvestment[];
}
