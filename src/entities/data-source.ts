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
import { env } from "../utils/validate.env";
import { Payment } from "./models/Payment";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: Number(process.env.DB_PORT || 3306),
    username: env().DB_USERNAME,
    password: env().DB_PASSWORD,
    database: env().DB_DATABASE,
    socketPath: process.env.DB_SOCKET,
    // synchronize: process.env.NODE_ENV !== 'production',
    // logging    : true, // TODO: Add logging to debug queries and optimize
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

        Payment,
    ],
    migrations    : [],
    subscribers   : [],
    namingStrategy: new SnakeNamingStrategy()
});
