'use strict';

const { getAllPlayers } = require('../services/playerService');
const { markPlayerAsPaid } = require('../services/paymentService');
const { formatDate } = require('../utils/date');
const { backToMenuKeyboard } = require('../utils/keyboards');
const MESSAGES = require('../constants/messages');

async function handlePaidMenu(bot, chatId) {
  try {
    const players = await getAllPlayers();

    if (!players || players.length === 0) {
      await bot.sendMessage(chatId, MESSAGES.NO_PLAYERS, {
        parse_mode: 'Markdown',
        reply_markup: backToMenuKeyboard(),
      });
      return;
    }

    const keyboard = {
      inline_keyboard: players.map((p) => [
        { text: `💰 ${p.full_name} (${p.team})`, callback_data: `paid_${p.id}` },
      ]),
    };

    keyboard.inline_keyboard.push([{ text: '🏠 Main Menu', callback_data: 'main_menu' }]);

    await bot.sendMessage(chatId, '💰 *Select a player to mark as paid:*', {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
  } catch (err) {
    console.error('❌ Error loading paid menu:', err.message);
    await bot.sendMessage(chatId, MESSAGES.ERROR_GENERIC, { reply_markup: backToMenuKeyboard() });
  }
}

async function handleMarkPaid(bot, chatId, playerId) {
  try {
    const player = await markPlayerAsPaid(playerId);
    await bot.sendMessage(chatId, MESSAGES.PAYMENT_UPDATED(player.full_name), {
      parse_mode: 'Markdown',
      reply_markup: backToMenuKeyboard(),
    });
  } catch (err) {
    console.error('❌ Error marking payment:', err.message);
    await bot.sendMessage(chatId, MESSAGES.ERROR_GENERIC, { reply_markup: backToMenuKeyboard() });
  }
}

module.exports = { handlePaidMenu, handleMarkPaid };
