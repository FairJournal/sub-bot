import 'reflect-metadata';
import { Telegraf, Context } from 'telegraf';
import { connectDatabase } from './connection';
import { Author } from './Author';
import { getRepository } from 'typeorm';

const bot = new Telegraf('7142520125:AAGpziy9caW6Hx4NKa8kUYLen0j-uyXuLRk');

async function main() {
  await connectDatabase();
}

main().catch(error => console.error(error));

const authorRepository = getRepository(Author);

bot.start(async (ctx: Context) => {
  const messageText = (ctx.message as { text: string }).text || '';
  const commandParams = messageText.split(' ');

  if (commandParams.length === 2 && commandParams[0] === '/start') {
    const authorHash = commandParams[1];

    try {
      let author = await authorRepository.findOne({ where: { hash: authorHash } });

      if (!author) {
        author = new Author();
        author.hash = authorHash;
        author.subscribers = [];
      }

      const userId = ctx.from?.id.toString();

      // Проверяем, есть ли пользователь уже в массиве подписчиков
      if (userId && author && author.subscribers && author.subscribers.includes(userId)) {
        ctx.reply('Вы уже подписаны на этого автора.');
      } else {
        // Если пользователь еще не подписан, добавляем его в массив подписчиков
        if (userId && author && author.subscribers && !author.subscribers.includes(userId)) {
          author.subscribers.push(userId);
        }

        await authorRepository.save(author);
        ctx.reply(`Вы подписались на автора с хешем ${authorHash}`);
      }
    } catch (error) {
      console.error('Ошибка при обработке команды /start:', error);
      ctx.reply('Произошла ошибка при обработке вашего запроса.');
    }
  } else {
    ctx.reply('Для подписки на автора, пожалуйста, используйте ссылку на бота с хешем автора.');
  }
});

bot.launch();
//https://t.me/fair_journal_bot?start=22222222