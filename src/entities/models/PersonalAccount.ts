import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity, NumericColumnTransformer } from './BaseEntity';
import { DefaultAccount, Duration, Frequency, PersonalAccountType, Status } from '../../utils/enums';
import { PersonalAccountTransaction } from './PersonalAccountTransaction';
import { PersonalSubInvestment } from './PersonalSubInvestment';

@Entity('personal_accounts')
@Index(["type", "account_id", "description"], {unique: true})
export class PersonalAccount extends BaseEntity {
    @Column({length: 20})
    type: PersonalAccountType|DefaultAccount;

    @Column({nullable: true})
    description: string;

    @Column({type: 'bigint', default: 0, transformer: new NumericColumnTransformer})
    target_amount: number;

    @Column({type: 'bigint', default: 0, transformer: new NumericColumnTransformer})
    frequency_amount: number;

    @Column({type: 'decimal', default: 0, precision: 15, scale: 4, transformer: new NumericColumnTransformer})
    balance: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, transformer: new NumericColumnTransformer})
    interest: number;

    @Column({type: 'tinyint', unsigned: true, nullable: true})
    duration: Duration;

    @Column({length: 20, nullable: true})
    frequency: Frequency;

    @Column({length: 20, default: Status.INACTIVE})
    status: Status;

    @Column({type: 'bigint', unsigned: true})
    account_id;

    @OneToMany(() => PersonalAccountTransaction, (transaction) => transaction.personal_account, { cascade: true })
    transactions: PersonalAccountTransaction[];

    @OneToMany(() => PersonalSubInvestment, (subInvestment) => {
        return subInvestment.personal_account;
    }, {cascade: true})
    personal_sub_investments: PersonalSubInvestment[];
}
