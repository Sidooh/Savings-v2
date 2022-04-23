import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { Duration, Frequency, PersonalAccountType, Status } from '../../utils/enums';
import { PersonalAccountTransaction } from './PersonalAccountTransaction';

@Entity('personal_accounts')
@Index(["type", "account_id", "description"], {unique: true})
export class PersonalAccount extends BaseEntity {
    @Column({length: 20})
    type: PersonalAccountType;

    @Column({nullable: true})
    description: string;

    @Column({type: 'bigint', default: 0})
    target_amount: number;

    @Column({type: 'bigint', default: 0})
    frequency_amount: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4})
    balance: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4})
    interest: number;

    @Column({type: 'tinyint', unsigned: true, nullable: true})
    duration: Duration;

    @Column({length: 20, nullable: true})
    frequency: Frequency;

    @Column({length: 20, default: Status.INACTIVE})
    status: Status;

    @Column({type: 'bigint', unsigned: true})
    account_id;

    @OneToMany(() => PersonalAccountTransaction, (transaction) => {
        return transaction.personal_account;
    }, {cascade: true})
    transactions: PersonalAccountTransaction[];
}
