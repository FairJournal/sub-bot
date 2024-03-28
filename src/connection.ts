import { createConnection } from 'typeorm';
import { Author } from './Author';

export async function connectDatabase() {
  await createConnection({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'sub_db',
    entities: [Author],
    synchronize: false,
    logging: true,
  });

  console.log('Подключение к базе данных успешно установлено');
}