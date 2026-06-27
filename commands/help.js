'use strict';

const { backToMenuKeyboard } = require('../utils/keyboards');
const MESSAGES = require('../constants/messages');

async function handleHelp(bot, chatId) {
  await bot.sendMessage(chatId, MESSAGES.HELP, {
    parse_mode: 'Markdown',
    reply_markup: backToMenuKeyboard(),
  });
}

module.exports = { handleHelp };
