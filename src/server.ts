import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

const swapDir = process.env.SWAP_DIR

const bot = new Telegraf(process.env.BOT_TOKEN as string);

bot.start((ctx) => ctx.reply('Welcome to Tasks-bot'));
bot.help((ctx) => ctx.reply('Send me a message and I\'ll add a task for you'));

const publishersIds = String(process.env.PUBLISHERS_IDS)
  .split(',')
  .map((id: string): number => parseInt(id))

const adminId = Number(process.env.ADMIN_ID);

const allowedUsers = new Set([
  ...publishersIds,
  adminId,
]);

bot.use(async (ctx, next) => {
  const userId = ctx.message?.from.id || 0;

  if (allowedUsers.has(userId)) await next();
  else console.log('blocked user: ', {
    userId,
    user: ctx.message?.from.username,
  });
});

bot.on(message('text'), async (ctx) => {
  const message = ctx.message;

  console.log('message', message);

  if (!isValidShortURL(message.text)) {
    ctx.reply('only a link to the short youtube video');

    return;
  }

  ctx.reply('Link processing');
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const r = /s/
function isValidShortURL(url: string) {
  try {
    const l = new URL(url);

    console.log('new link:', l);

    if (!/shorts\/[a-zA-Z0-9]{11}/.test(url)) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

/*
URL {
  href: 'https://youtube.com/shorts/23owdgVAV5k?si=fSGa2TFVepKT7gia',
  origin: 'https://youtube.com',
  protocol: 'https:',
  username: '',
  password: '',
  host: 'youtube.com',
  hostname: 'youtube.com',
  port: '',
  pathname: '/shorts/23owdgVAV5k',
  search: '?si=fSGa2TFVepKT7gia',
  searchParams: URLSearchParams { 'si' => 'fSGa2TFVepKT7gia' },
  hash: ''
}
*/
