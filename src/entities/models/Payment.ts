import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity, jsonColumnType, NumericColumnTransformer } from './BaseEntity';
import { PersonalAccountTransaction } from "./PersonalAccountTransaction";

@Entity('payments')
// @Index(["reference", "transaction"], { unique: true })
export class Payment extends BaseEntity {
    @Column({ type: 'bigint', unsigned: true })
    payment_id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, transformer: new NumericColumnTransformer })
    amount: number;

    @Column({ length: 32 })
    status: string;

    @Column({ length: 32 })
    type: string;

    @Column({ length: 32 })
    subtype: string;

    @Column()
    description: string;

    @Column()
    reference: string;

    @Column({ type: jsonColumnType, nullable: true })
    destination: {};

    @OneToOne(() => PersonalAccountTransaction, (personalAccountTransaction) => personalAccountTransaction.payment)
    @JoinColumn()
    transaction;
}
