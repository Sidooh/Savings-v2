import { DataSource } from 'typeorm';
import jwt from "jsonwebtoken";
import moment from "moment";
import { env } from "../src/utils/validate.env";

const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    dropSchema: true,
    entities: ['src/entities/models/**/!(BaseEntity.ts)'],
    synchronize: true,
    logging: false
});

beforeAll(async () => await dataSource.initialize());

afterAll(async () => await dataSource.destroy());

// jest.setTimeout(10000);

export const testToken = 'Bearer ' + jwt.sign({ iat: moment().add(15, 'm').unix() }, env.JWT_KEY)
