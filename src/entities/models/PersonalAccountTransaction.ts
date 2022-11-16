import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { BaseEntity, NumericColumnTransformer } from './BaseEntity';
import { Status, TransactionType } from '../../utils/enums';
import { PersonalAccount } from './PersonalAccount';
import { Payment } from "./Payment";

@Entity('personal_account_transactions')
export class PersonalAccountTransaction extends BaseEntity {
    @Column({ length: 20 })
    type: TransactionType;

    @Column()
    description: string;

    @Column({ type: 'decimal', default: 0, precision: 10, scale: 4, transformer: new NumericColumnTransformer })
    amount: number;

    @Column({ length: 20, default: Status.PENDING })
    status: Status;

    @Column({ type: 'bigint', unsigned: true })
    personal_account_id;

    @Column({ type: 'json', nullable: true })
    extra: {};

    @ManyToOne(() => PersonalAccount, (personalAccount) => personalAccount.transactions)
    personal_account: PersonalAccount;

    @OneToOne(() => Payment, (payment) => payment.transaction)
    payment: Payment;
}
