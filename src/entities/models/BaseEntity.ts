import {
    BaseEntity as OrmBaseEntity,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { env } from "../../utils/validate.env";

export const dateColumnType = env.NODE_ENV === 'test' ? 'datetime' : 'timestamp';
export const intColumnType = env.NODE_ENV === 'test' ? 'integer' : 'bigint';
export const jsonColumnType = env.NODE_ENV === 'test' ? 'simple-json' : 'json';

export class NumericColumnTransformer {
    to = (data: number): number => data;

    from = (data: string): number => parseFloat(data);
}

export abstract class BaseEntity extends OrmBaseEntity {
    @PrimaryGeneratedColumn({ type: intColumnType, unsigned: true })
    id: number;

    @CreateDateColumn({type: dateColumnType, nullable: true})
    created_at: Date;

    @UpdateDateColumn({type: dateColumnType, nullable: true})
    updated_at: Date;

    @DeleteDateColumn({type: dateColumnType, nullable: true})
    deleted_at: Date;
}
