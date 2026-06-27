'use strict';

const { requireAdmin } = require('../middleware/auth');
const { mainMenuKeyboard } = require('../utils/keyboards');
const MESSAGES = require('../constants/messages');

async function handleStart(bot, msg) {
  const authorized = await requireAdmin(bot, msg, null);
  if (!authorized) return;

  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'Coach';

  await bot.sendMessage(chatId, MESSAGES.WELCOME(firstName), {
    parse_mode: 'Markdown',
    reply_markup: mainMenuKeyboard(),
  });
}

module.exports = { handleStart };
