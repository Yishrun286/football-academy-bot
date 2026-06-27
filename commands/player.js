'use strict';

const { getPlayerById } = require('../services/playerService');
const { formatDate } = require('../utils/date');
const { playerActionsKeyboard, backToMenuKeyboard } = require('../utils/keyboards');
const MESSAGES = require('../constants/messages');

async function handleViewPlayer(bot, chatId, playerId) {
  try {
    const player = await getPlayerById(playerId);

    if (!player) {
      await bot.sendMessage(chatId, MESSAGES.PLAYER_NOT_FOUND, { reply_markup: backToMenuKeyboard() });
      return;
    }

    const caption =
      `👤 *${player.full_name}*\n\n` +
      `🏷️ *Team:* ${player.team}\n` +
      `📞 *Parent Phone:* ${player.parent_phone}\n` +
      `💰 *Monthly Fee:* ${player.monthly_fee} ETB\n` +
      `📅 *Last Payment:* ${formatDate(player.last_payment_date)}\n` +
      `🔔 *Next Payment:* ${formatDate(player.next_payment_date)}\n` +
      `🗓️ *Registered:* ${formatDate(player.created_at)}`;

    try {
      await bot.sendPhoto(chatId, player.photo_url, {
        caption,
        parse_mode: 'Markdown',
        reply_markup: playerActionsKeyboard(player.id),
      });
    } catch (photoErr) {
      await bot.sendMessage(chatId, caption, {
        parse_mode: 'Markdown',
        reply_markup: playerActionsKeyboard(player.id),
      });
    }
  } catch (err) {
    console.error('❌ Error viewing player:', err.message);
    await bot.sendMessage(chatId, MESSAGES.ERROR_GENERIC, { reply_markup: backToMenuKeyboard() });
  }
}

module.exports = { handleViewPlayer };
