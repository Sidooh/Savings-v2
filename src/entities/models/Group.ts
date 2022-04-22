import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { Frequency, GroupType, Status } from '../../utils/enums';
import { GroupAccount } from './GroupAccount';

@Entity('groups')
export class Group extends BaseEntity {
    @Column()
    name: string;

    @Column({length: 20, default: GroupType.DEFAULT})
    type: GroupType;

    @Column({ type: 'decimal', default: 0, scale: 4 })
    balance: number;

    @Column({ type: 'decimal', default: 0, scale: 4 })
    interest: number;

    @Column({length: 20, default: Frequency.MONTHLY})
    frequency: Frequency;

    @Column({length: 20, default: Status.PENDING})
    status: Status;

    @OneToMany(() => GroupAccount, (groupAccount) => groupAccount.group)
    group_accounts: GroupAccount[];
}
