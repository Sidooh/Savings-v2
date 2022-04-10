import 'dotenv/config';
import { AppDataSource } from "./data-source";
import { User } from "./entity/models/User";
import log from './utils/logger';
import App from './app';
import validateEnv from './utils/validateEnv';

validateEnv();

AppDataSource.initialize().then(async () => {
    console.log("Inserting a new user into the database...")
    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    user.age = 25
    await AppDataSource.manager.save(user)
    console.log("Saved a new user with id: " + user.id)

    console.log("Loading users from the database...")
    const users = await AppDataSource.manager.find(User)
    console.log("Loaded users: ", users)

    console.log("Here you can setup and run express / fastify / any other framework.")

    const app = new App(Number(process.env.PORT || 8005));
    app.listen();
}).catch(error => log.error('Database connection error: ', error))
