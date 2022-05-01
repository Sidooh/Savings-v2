import "reflect-metadata";
import { DataSource } from "typeorm";
import { Group } from './models/Group';
import { GroupAccount } from './models/GroupAccount';
import { PersonalAccountTransaction } from './models/PersonalAccountTransaction';
import { PersonalAccount } from './models/PersonalAccount';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PersonalCollectiveInvestment } from './models/PersonalCollectiveInvestment';
import { GroupAccountTransaction } from './models/GroupAccountTransaction';
import { GroupCollectiveInvestment } from './models/GroupCollectiveInvestment';
import { PersonalSubInvestment } from './models/PersonalSubInvestment';
import { GroupSubInvestment } from './models/GroupSubInvestment';
import { PersonalEarning } from './models/PersonalEarning';

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    // dropSchema:true,
    entities: [
        Group,
        GroupAccount,
        GroupAccountTransaction,
        GroupCollectiveInvestment,
        GroupSubInvestment,

        PersonalAccount,
        PersonalAccountTransaction,
        PersonalCollectiveInvestment,
        PersonalSubInvestment,
        PersonalEarning
    ],
    migrations: [],
    subscribers: [],
    namingStrategy: new SnakeNamingStrategy()
});
