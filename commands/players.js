'use strict';

const { getAllPlayers } = require('../services/playerService');
const { formatDate } = require('../utils/date');
const { playerActionsKeyboard, backToMenuKeyboard } = require('../utils/keyboards');
const MESSAGES = require('../constants/messages');

async function handleListPlayers(bot, chatId) {
  try {
    const players = await getAllPlayers();

    if (!players || players.length === 0) {
      await bot.sendMessage(chatId, MESSAGES.NO_PLAYERS, {
        parse_mode: 'Markdown',
        reply_markup: backToMenuKeyboard(),
      });
      return;
    }

    await bot.sendMessage(chatId, `👥 *All Players (${players.length})*`, { parse_mode: 'Markdown' });

    for (const player of players) {
      const caption =
        `👤 *${player.full_name}*\n` +
        `🏷️ Team: ${player.team}\n` +
        `💰 Monthly Fee: ${player.monthly_fee} ETB\n` +
        `📅 Last Payment: ${formatDate(player.last_payment_date)}\n` +
        `🔔 Next Payment: ${formatDate(player.next_payment_date)}`;

      try {
        await bot.sendPhoto(chatId, player.photo_url, {
          caption,
          parse_mode: 'Markdown',
          reply_markup: playerActionsKeyboard(player.id),
        });
      } catch (photoErr) {
        // Fallback if photo fails to load
        await bot.sendMessage(chatId, caption, {
          parse_mode: 'Markdown',
          reply_markup: playerActionsKeyboard(player.id),
        });
      }
    }

    await bot.sendMessage(chatId, '——', { reply_markup: backToMenuKeyboard() });
  } catch (err) {
    console.error('❌ Error listing players:', err.message);
    await bot.sendMessage(chatId, MESSAGES.ERROR_GENERIC, { reply_markup: backToMenuKeyboard() });
  }
}

module.exports = { handleListPlayers };
