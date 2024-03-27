import { Telegraf, Context } from 'telegraf';

const bot = new Telegraf('7142520125:AAGpziy9caW6Hx4NKa8kUYLen0j-uyXuLRk');

bot.start((ctx: Context) => {
  const startCommand = (ctx.message as { text: string }).text;
  if (startCommand && startCommand.startsWith('/start ')) {
    const authorId = startCommand.split(' ')[1];
    if (authorId) {
      ctx.reply(`Вы подписались на автора с ID ${authorId}`);
    } else {
      ctx.reply('Для подписки на автора, пожалуйста, используйте ссылку на бота с ID автора.');
    }
  }
});

bot.launch();