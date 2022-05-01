import { Column, Entity } from "typeorm";
import { BaseEntity, NumericColumnTransformer } from './BaseEntity';

@Entity('personal_earnings')
export class PersonalEarning extends BaseEntity {
    @Column({type: 'decimal', default: 0, precision: 15, scale: 4, transformer: new NumericColumnTransformer})
    current_balance: number;

    @Column({type: 'decimal', default: 0, precision: 15, scale: 4, transformer: new NumericColumnTransformer})
    locked_balance: number;

    @Column({type: 'decimal', default: 0, precision: 10, scale: 4, transformer: new NumericColumnTransformer})
    interest: number;

    @Column({type: 'bigint', unsigned: true, transformer: new NumericColumnTransformer})
    account_id;
}
