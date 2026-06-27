'use strict';

const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('❌ Missing BOT_TOKEN in environment variables.');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

module.exports = bot;
