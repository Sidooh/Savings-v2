import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { Status } from '../../utils/enums';
import { GroupAccountTransaction } from './GroupAccountTransaction';

@Entity('group_account_sub_transactions')
export class GroupAccountSubTransaction extends BaseEntity {
    @Column({ type: 'decimal', default: 0, precision: 18, scale: 4 })
    amount: number;

    @Column({length: 20, default: Status.PENDING})
    status: Status;

    @ManyToOne(() => GroupAccountTransaction, transaction => transaction.sub_transactions, {cascade: true})
    transaction: GroupAccountTransaction;
}
