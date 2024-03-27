import { Telegraf } from 'telegraf';

// Получите токен бота от BotFather в Telegram
const bot = new Telegraf('7142520125:AAGpziy9caW6Hx4NKa8kUYLen0j-uyXuLRk');
console.log('start...')

bot.start((ctx) => ctx.reply('Привет! Я бот.'));

bot.help((ctx) => ctx.reply('Это справочная информация.'));

bot.command('subscribe', (ctx) => {
  // Реализуйте подписку пользователя на автора статей
  ctx.reply('Вы подписались на автора.');
});

bot.launch().then(() => {
  console.log('Бот запущен');
}).catch((err) => {
  console.error('Ошибка при запуске бота:', err);
});