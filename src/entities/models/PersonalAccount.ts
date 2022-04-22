import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { PersonalAccountType, Status } from '../../utils/enums';
import { PersonalAccountTransaction } from './PersonalAccountTransaction';

@Entity('personal_accounts')
export class PersonalAccount extends BaseEntity {
    @Column({length: 20, default: PersonalAccountType.GOAL})
    type: PersonalAccountType;

    @Column({nullable: true})
    description: string;

    @Column({type: 'decimal', default: 0})
    amount: number;

    @Column({ type: 'decimal', default: 0, scale: 4 })
    interest: number;

    @Column({unsigned: true})
    duration: number;

    @Column({length: 20, default: Status.PENDING})
    status: Status;

    @Column({type: 'bigint', unsigned: true})
    account_id;

    @OneToMany(() => PersonalAccountTransaction, (transaction) => transaction.sub_transactions)
    transactions: PersonalAccountTransaction[];
}
