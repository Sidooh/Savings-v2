import { DataSource } from 'typeorm';

const dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: ['src/entities/models/**/!(BaseEntity.ts)'],
    synchronize: true,
    logging: false
});

beforeAll(async () => await dataSource.initialize());

afterAll(async () => await dataSource.destroy());

// jest.setTimeout(10000);
