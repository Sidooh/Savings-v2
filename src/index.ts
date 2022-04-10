import 'dotenv/config';
import { AppDataSource } from "./data-source";
import log from './utils/logger';
import App from './app';
import validateEnv from './utils/validateEnv';
import { SavingsAccount } from './entities/models/SavingsAccount';

validateEnv();

AppDataSource.initialize().then(async () => {
    // console.log("Inserting a new user into the database...")
    // const user = new User()
    // user.firstName = "Timber"
    // user.lastName = "Saw"
    // user.age = 25

    // await AppDataSource.manager.save(user)
    // console.log("Saved a new user with id: " + user.id)

    console.log("Loading accounts from the database...")
    const accounts = await AppDataSource.manager.find(SavingsAccount)
    console.log("Loaded accounts: ", accounts)

    const app = new App(Number(process.env.PORT || 8005));
    app.listen();
}).catch(error => log.error('Database connection error: ', error))
