import { Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { Group } from './Group';
import { GroupAccountTransaction } from './GroupAccountTransaction';

@Entity('group_accounts')
@Index(["account_id", "group_id"], {unique: true})
export class GroupAccount extends BaseEntity {
    @Column({type: 'decimal', default: 0, precision: 10, scale: 4})
    balance: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4})
    interest: number;

    @Column({type: 'bigint', unsigned: true})
    account_id;

    @Column({type: 'bigint', unsigned: true})
    group_id;

    @ManyToOne(() => Group, group => group.group_accounts, {onDelete:'CASCADE'})
    group: Group;

    @OneToMany(() => GroupAccountTransaction, (transaction) => transaction.group_account, {
        cascade: true,
    })
    transactions: GroupAccountTransaction[];
}
