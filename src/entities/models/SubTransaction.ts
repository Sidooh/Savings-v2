import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { Transaction } from './Transaction';
import { TransactionType } from '../../utils/enums';
import { PolymorphicParent } from 'typeorm-polymorphic';
import { GroupAccount } from './GroupAccount';
import { PersonalAccount } from './PersonalAccount';

@Entity('sub_transactions')
export class SubTransaction extends BaseEntity {
    @PolymorphicParent(() => [GroupAccount, PersonalAccount])
    owner: GroupAccount | PersonalAccount;

    @ManyToOne(() => Transaction, transaction => transaction.sub_transactions, {cascade: true})
    transaction: TransactionType;

    @Column({type: 'bigint', unsigned: true})
    accountable_id: number;

    @Column()
    accountable_type: string;
}
