import "reflect-metadata";
import { DataSource } from "typeorm";
import { SavingsAccount } from './entities/models/SavingsAccount';
import { Group } from './entities/models/Group';
import { GroupAccount } from './entities/models/GroupAccount';
import { Transaction } from './entities/models/Transaction';
import { SubTransaction } from './entities/models/SubTransaction';
import { PersonalAccount } from './entities/models/PersonalAccount';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [SavingsAccount, Group, GroupAccount, Transaction, SubTransaction, PersonalAccount],
    migrations: [],
    subscribers: [],
    namingStrategy: new SnakeNamingStrategy()
});
