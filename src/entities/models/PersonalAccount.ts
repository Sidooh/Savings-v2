import { Column, Entity } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { PersonalAccountType, Status } from '../../utils/enums';
import { PolymorphicChildren } from 'typeorm-polymorphic';
import { SubTransaction } from './SubTransaction';

@Entity('personal_accounts')
export class PersonalAccount extends BaseEntity {
    @Column({length: 20, default: PersonalAccountType.GOAL})
    type: PersonalAccountType;

    @Column({nullable: true})
    description: string;

    @Column({type: 'decimal', default: 0})
    amount: number;

    @Column({unsigned: true})
    duration: number;

    @Column({length: 20, default: Status.PENDING})
    status: Status;

    @Column({type: 'bigint', unsigned: true})
    account_id;

    @PolymorphicChildren(() => SubTransaction, {eager: false})
    sub_transactions: SubTransaction[];
}
