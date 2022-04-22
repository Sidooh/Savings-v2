import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from './BaseEntity';
import { TransactionType } from '../../utils/enums';
import { GroupAccountSubTransaction } from './GroupAccountSubTransaction';

@Entity('group_account_transactions')
export class GroupAccountTransaction extends BaseEntity {
    @Column({length: 20})
    type: TransactionType;

    @Column()
    description: string;

    @OneToMany(() => GroupAccountSubTransaction, (subTransaction) => subTransaction.transaction)
    sub_transactions: GroupAccountSubTransaction[];
}
