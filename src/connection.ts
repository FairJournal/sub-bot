import { createConnection } from 'typeorm';
import { Author } from './Author';
import dotenv from 'dotenv';
dotenv.config();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

export async function connectDatabase() {
  await createConnection({
    type: 'mysql',
    host: dbHost,
    port: 3306,
    username: dbUser,
    password: dbPassword,
    database: dbName || 'sub_db',
    entities: [Author],
    synchronize: false,
    logging: true,
  });

  console.log('Подключение к базе данных успешно установлено');
}
