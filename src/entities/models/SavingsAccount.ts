import { Column, Entity } from "typeorm";
import { SavingsAccountType, Status } from '../../utils/enums';
import { BaseEntity } from './BaseEntity';

@Entity('savings_accounts')
export class SavingsAccount extends BaseEntity {
    @Column({length: 20})
    type: SavingsAccountType;

    @Column({type: 'decimal', default: 0})
    balance: number;

    @Column({length: 20, default: Status.INACTIVE})
    status: Status;
}