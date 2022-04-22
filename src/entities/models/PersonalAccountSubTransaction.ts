import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { Status, TransactionType } from '../../utils/enums';
import { PersonalAccountTransaction } from './PersonalAccountTransaction';

@Entity('personal_account_sub_transactions')
export class PersonalAccountSubTransaction extends BaseEntity {
    @Column({ type: 'decimal', default: 0, precision: 18, scale: 4 })
    amount: number;

    @Column({length: 20, default: Status.PENDING})
    status: Status;

    @ManyToOne(() => PersonalAccountTransaction, transaction => transaction.sub_transactions, {cascade: true})
    transaction: TransactionType;
}
