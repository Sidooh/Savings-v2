import {Column, Entity, Index, JoinColumn, ManyToOne, OneToOne} from "typeorm";
import { BaseEntity, NumericColumnTransformer } from './BaseEntity';
import { Status, TransactionType } from '../../utils/enums';
import { PersonalAccount } from './PersonalAccount';
import {PersonalAccountTransaction} from "./PersonalAccountTransaction";
import {GroupAccountTransaction} from "./GroupAccountTransaction";

@Entity('payments')
@Index(["reference", "transaction"], { unique: true })
export class Payment extends BaseEntity {
    @Column({length: 20})
    type: TransactionType;

    @Column()
    description: string;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, transformer: new NumericColumnTransformer})
    amount: number;

    @Column({length: 20, default: Status.PENDING})
    status: Status;

    @Column()
    reference: string;

    // @Column({type: 'bigint', unsigned: true})
    // transaction_id;

    @OneToOne(() => PersonalAccountTransaction, (personalAccountTransaction) => personalAccountTransaction.payment)
    @JoinColumn()
    transaction;
}
