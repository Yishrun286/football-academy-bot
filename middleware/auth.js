'use strict';

const MESSAGES = require('../constants/messages');

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

function isAdmin(chatId) {
  return String(chatId) === String(ADMIN_CHAT_ID);
}

async function requireAdmin(bot, msg, next) {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) {
    await bot.sendMessage(chatId, MESSAGES.UNAUTHORIZED);
    return false;
  }
  return true;
}

module.exports = { isAdmin, requireAdmin };
