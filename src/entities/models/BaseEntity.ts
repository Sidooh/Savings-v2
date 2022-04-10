import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({nullable: true})
    created_at: Date;

    @CreateDateColumn({nullable: true})
    updated_at: Date;
}