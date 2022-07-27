import {
    BaseEntity as OrmBaseEntity,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

export const dateColumnType = process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp';

export class NumericColumnTransformer {
    to = (data: number): number => data;

    from = (data: string): number => parseFloat(data);
}

export abstract class BaseEntity extends OrmBaseEntity {
    @PrimaryGeneratedColumn({type: process.env.NODE_ENV === 'test' ? 'integer' : 'bigint', unsigned: true})
    id: number;

    @CreateDateColumn({type: dateColumnType, nullable: true})
    created_at: Date;

    @UpdateDateColumn({type: dateColumnType, nullable: true})
    updated_at: Date;

    @DeleteDateColumn({type: dateColumnType, nullable: true})
    deleted_at: Date;
}