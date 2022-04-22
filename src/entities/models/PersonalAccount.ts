import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { Duration, Frequency, PersonalAccountType, Status } from '../../utils/enums';
import { PersonalAccountTransaction } from './PersonalAccountTransaction';

@Entity('personal_accounts')
export class PersonalAccount extends BaseEntity {
    @Column({length: 20, default: PersonalAccountType.GOAL})
    type: PersonalAccountType;

    @Column({nullable: true})
    description: string;

    @Column({type: 'decimal', default: 0, precision:10, scale: 4})
    balance: number;

    @Column({type: 'decimal', default: 0, precision:10, scale: 4})
    interest: number;

    @Column({type: 'tinyint', unsigned: true, nullable: true})
    duration: Duration;

    @Column({length: 20, default: Frequency.MONTHLY})
    frequency: Frequency;

    @Column({length: 20, default: Status.INACTIVE})
    status: Status;

    @Column({type: 'bigint', unsigned: true})
    account_id;

    @OneToMany(() => PersonalAccountTransaction, (transaction) => transaction.personal_account)
    transactions: PersonalAccountTransaction[];
}
