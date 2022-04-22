import "reflect-metadata";
import { DataSource } from "typeorm";
import { Group } from './models/Group';
import { GroupAccount } from './models/GroupAccount';
import { PersonalAccountTransaction } from './models/PersonalAccountTransaction';
import { PersonalAccount } from './models/PersonalAccount';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PersonalAccountSubTransaction } from './models/PersonalAccountSubTransaction';
import { GroupAccountTransaction } from './models/GroupAccountTransaction';
import { GroupAccountSubTransaction } from './models/GroupAccountSubTransaction';

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [
        Group,
        GroupAccount,
        GroupAccountTransaction,
        GroupAccountSubTransaction,
        PersonalAccount,
        PersonalAccountTransaction,
        PersonalAccountSubTransaction
    ],
    migrations: [],
    subscribers: [],
    namingStrategy: new SnakeNamingStrategy()
});
