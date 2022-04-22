import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { Status, TransactionType } from '../../utils/enums';
import { GroupAccount } from './GroupAccount';

@Entity('group_account_transactions')
export class GroupAccountTransaction extends BaseEntity {
    @Column({length: 20})
    type: TransactionType;

    @Column()
    description: string;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4})
    amount: number;

    @Column({length: 20, default: Status.PENDING})
    status: Status;

    @Column({type: 'bigint', unsigned: true})
    group_account_id;

    @ManyToOne(() => GroupAccount, (groupAccount) => groupAccount.transactions)
    group_account;
}
