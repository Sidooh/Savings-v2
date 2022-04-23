import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { Duration, Frequency, GroupType, Status } from '../../utils/enums';
import { GroupAccount } from './GroupAccount';

@Entity('groups')
export class Group extends BaseEntity {
    @Column()
    name: string;

    @Column({length: 20, default: GroupType.DEFAULT})
    type: GroupType;

    @Column({type: 'bigint', default: 0})
    amount: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4})
    balance: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4})
    interest: number;

    @Column({type: 'tinyint', unsigned: true, nullable: true})
    duration: Duration;

    @Column({length: 20, nullable: true})
    frequency: Frequency;

    @Column({length: 20, default: Status.INACTIVE})
    status: Status;

    @OneToMany(() => GroupAccount, (groupAccount) => groupAccount.group, {
        cascade: true,
    })
    group_accounts: GroupAccount[];
}
