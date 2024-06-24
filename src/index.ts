/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import 'reflect-metadata';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { Telegraf, Context } from 'telegraf';
import { connectDatabase } from './connection';
import { Author } from './Author';
import { getRepository } from 'typeorm';
import cors from 'cors'
dotenv.config();
const token = process.env.TELEGRAM_TOKEN;
const bot = new Telegraf(token || '');
const app = express();
app.use(cors())
app.use(express.json());


async function main() {
  await connectDatabase();
}

main().catch(error => console.error(error));

const authorRepository = getRepository(Author);


app.post('/new-article', async (req: Request, res: Response) => {
  if (req.body && req.body.authorHash && req.body.articleHash) {
    const { authorHash, articleHash } = req.body;
    console.log(authorHash, articleHash)

    try {
      let author =  await authorRepository.findOne({ where: { hash: authorHash } })

      if (!author) {
        author = new Author();
        author.hash = authorHash;
        author.subscribers = [];
        await authorRepository.save(author);
      }

      if (author.subscribers) {
        for (const subscriberId of author.subscribers) {
          try {
            await bot.telegram.sendMessage(subscriberId, `Новая статья доступна: ${process.env.URL_SITE}${authorHash}/${articleHash}`);
          } catch (error) {
            console.error('Ошибка при отправке сообщения подписчику:', error);
          }
        }
      }

      res.status(200).send('Сообщения отправлены подписчикам автора.');
    } catch (error) {
      console.error('Ошибка при обработке запроса:', error);
      res.status(500).send('Произошла ошибка при обработке запроса.');
    }
  } else {
    res.status(400).send('Недостаточно данных в запросе.');
  }
});

app.get('/subscribers/:authorHash', async (req: Request, res: Response) => {
  const authorHash = req.params.authorHash;

  try {
    const author = await authorRepository.findOne({ where: { hash: authorHash } });

    if (author) {
      const subscriberCount = author.subscribers ? author.subscribers.length : 0;
      res.status(200).json({ subscribers: subscriberCount });
    } else {
      res.status(200).json({ subscribers: 0 }); // Отправляем ноль, если автор не найден
    }
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    res.status(500).send('Произошла ошибка при обработке запроса.');
  }
});

app.listen(4000, () => {
  console.log('Сервер запущен на порте 3000');
});

bot.start(async (ctx) => {
  const welcomeMessage = `
Привет! Я бот проекта Fair Journal.

Моя основная задача - помогать вам подписываться на интересных авторов и получать уведомления о новых статьях.

Чтобы подписаться на автора, используйте команду /sub и укажите хэш автора.

Когда автор, на которого вы подписаны, опубликует новую статью, я пришлю вам уведомление с ссылкой на неё.

Чтобы отписаться от автора, используйте команду /unsub и укажите его хэш.

`;
const messageText = ctx.message?.text || '';
  const commandParams = messageText.split(' ');
  if(commandParams.length === 1){
    ctx.reply(welcomeMessage);
    return
  }

  if (commandParams.length === 2 && commandParams[0] === '/start') {
      const authorHash = commandParams[1];
      try {
          const author = await authorRepository.findOne({ where: { hash: authorHash } });

          if (!author) {
              ctx.reply('Автор с указанным хешем не существует.');
              return;
          }

          const userId = ctx.from?.id.toString();

          if (userId && author.subscribers && author.subscribers.includes(userId)) {
              ctx.reply('Вы уже подписаны на этого автора.');
          } else {
              if (userId && author.subscribers && !author.subscribers.includes(userId)) {
                  author.subscribers.push(userId);
              }

              await authorRepository.save(author);
              ctx.reply(`Вы подписались на автора с хэшем ${authorHash}`);
          }
      } catch (error) {
          console.error('Ошибка при обработке команды /sub:', error);
          ctx.reply('Произошла ошибка при обработке вашего запроса.');
      }
  } else {
      ctx.reply('Для подписки на автора, пожалуйста, используйте команду /sub HASH_АВТОРА.');
  }
});

bot.command('sub', async (ctx) => {
  const messageText = ctx.message?.text || '';
  const commandParams = messageText.split(' ');

  if (commandParams.length === 2 && commandParams[0] === '/sub') {
      const authorHash = commandParams[1];
      try {
          const author = await authorRepository.findOne({ where: { hash: authorHash } });

          if (!author) {
              ctx.reply('Автор с указанным хешем не существует.');
              return;
          }

          const userId = ctx.from?.id.toString();

          if (userId && author.subscribers && author.subscribers.includes(userId)) {
              ctx.reply('Вы уже подписаны на этого автора.');
          } else {
              if (userId && author.subscribers && !author.subscribers.includes(userId)) {
                  author.subscribers.push(userId);
              }

              await authorRepository.save(author);
              ctx.reply(`Вы подписались на автора с хешем ${authorHash}`);
          }
      } catch (error) {
          console.error('Ошибка при обработке команды /sub:', error);
          ctx.reply('Произошла ошибка при обработке вашего запроса.');
      }
  } else {
      ctx.reply('Для подписки на автора, пожалуйста, используйте команду /sub HASH_АВТОРА.');
  }
});

bot.command('unsub', async (ctx: Context) => {
  const commandParams = (ctx.message as { text: string }).text.split(' ');

  if (commandParams && commandParams.length === 2) {
    const authorHash = commandParams[1];

    try {
      const author = await authorRepository.findOne({ where: { hash: authorHash } });

      if (author) {
        const userId = ctx.from?.id.toString();

        if (userId && author.subscribers && author.subscribers.includes(userId)) {
          author.subscribers = author.subscribers.filter(subscriberId => subscriberId !== userId);
          await authorRepository.save(author);
          ctx.reply(`Вы отписались от автора с хешем ${authorHash}`);
        } else {
          ctx.reply('Вы не были подписаны на этого автора.');
        }
      } else {
        ctx.reply('Автор с указанным хешем не найден.');
      }
    } catch (error) {
      console.error('Ошибка при обработке команды /unsub:', error);
      ctx.reply('Произошла ошибка при обработке вашего запроса.');
    }
  } else {
    ctx.reply('Для отписки от автора используйте команду /unsub HASH_OF_AUTHOR');
  }
});

bot.on('message', async (ctx: Context) => {
  ctx.reply('Простите, я не понимаю вашего запроса. Пожалуйста, используйте команду /sub для подписки на автора или /unsub для отписки.');
});

bot.launch()

//https://t.me/fair_journal_bot?start=22222222