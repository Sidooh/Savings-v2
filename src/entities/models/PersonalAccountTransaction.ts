import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { TransactionType } from '../../utils/enums';
import { PersonalAccountSubTransaction } from './PersonalAccountSubTransaction';

@Entity('personal_account_transactions')
export class PersonalAccountTransaction extends BaseEntity {
    @Column({length: 20})
    type: TransactionType;

    @Column()
    description: string;

    @OneToMany(() => PersonalAccountSubTransaction, (subTransaction) => subTransaction.transaction)
    sub_transactions: PersonalAccountSubTransaction[];
}
