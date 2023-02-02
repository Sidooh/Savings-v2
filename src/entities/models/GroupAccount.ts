import { Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity, NumericColumnTransformer } from './BaseEntity';
import { Group } from './Group';
import { GroupAccountTransaction } from './GroupAccountTransaction';
import { Status } from '../../utils/enums';

@Entity('group_accounts')
@Index(["account_id", "group_id"], { unique: true })
export class GroupAccount extends BaseEntity {
    @Column({ type: 'decimal', default: 0, precision: 15, scale: 4, transformer: new NumericColumnTransformer })
    balance: number;

    @Column({ length: 20, default: Status.INACTIVE })
    status: Status;

    @Column({ type: 'bigint', unsigned: true })
    account_id;

    @Column({ type: 'bigint', unsigned: true })
    group_id: number;

    @ManyToOne(() => Group, group => group.group_accounts, { onDelete: 'CASCADE' })
    group: Group;

    @OneToMany(() => GroupAccountTransaction, (transaction) => transaction.group_account, {
        cascade: true,
    })
    transactions: GroupAccountTransaction[];
}
