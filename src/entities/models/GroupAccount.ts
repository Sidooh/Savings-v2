import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { Group } from './Group';
import { PolymorphicChildren } from 'typeorm-polymorphic';
import { SubTransaction } from './SubTransaction';

@Entity('group_accounts')
export class GroupAccount extends BaseEntity {
    @Column({type: 'decimal', default: 0})
    balance: number;

    @Column({type: 'bigint', unsigned: true})
    account_id;

    @ManyToOne(() => Group, group => group.group_accounts, {cascade: true})
    group: Group;

    @PolymorphicChildren(() => SubTransaction, {eager: false})
    sub_transactions: SubTransaction[];
}
