import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { Status, TransactionType } from '../../utils/enums';
import { SubTransaction } from './SubTransaction';

@Entity('transactions')
export class Transaction extends BaseEntity {
    @Column({length: 20})
    type: TransactionType;

    @Column({type: 'decimal', default: 0})
    amount: number;

    @Column()
    description: string;

    @Column({length: 20, default: Status.PENDING})
    status: Status;

    @OneToMany(() => SubTransaction, (subTransaction) => subTransaction.transaction)
    sub_transactions: SubTransaction[];
}
