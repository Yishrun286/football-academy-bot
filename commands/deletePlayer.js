'use strict';

const { getPlayerById, deletePlayer } = require('../services/playerService');
const { backToMenuKeyboard } = require('../utils/keyboards');
const MESSAGES = require('../constants/messages');

async function handleDeleteConfirm(bot, chatId, playerId) {
  try {
    const player = await getPlayerById(playerId);

    if (!player) {
      await bot.sendMessage(chatId, MESSAGES.PLAYER_NOT_FOUND, { reply_markup: backToMenuKeyboard() });
      return;
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🗑️ Yes, Delete', callback_data: `confirm_delete_${playerId}` },
          { text: '❌ Cancel', callback_data: `view_${playerId}` },
        ],
      ],
    };

    await bot.sendMessage(
      chatId,
      `⚠️ *Are you sure you want to delete this player?*\n\n👤 *${player.full_name}*\n🏷️ Team: ${player.team}\n\nThis action cannot be undone.`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  } catch (err) {
    console.error('❌ Error fetching player for delete:', err.message);
    await bot.sendMessage(chatId, MESSAGES.ERROR_GENERIC, { reply_markup: backToMenuKeyboard() });
  }
}

async function handleDeletePlayer(bot, chatId, playerId) {
  try {
    const player = await deletePlayer(playerId);

    await bot.sendMessage(
      chatId,
      `🗑️ *${player.full_name}* has been removed from the academy.`,
      { parse_mode: 'Markdown', reply_markup: backToMenuKeyboard() }
    );
  } catch (err) {
    console.error('❌ Error deleting player:', err.message);
    await bot.sendMessage(chatId, MESSAGES.ERROR_GENERIC, { reply_markup: backToMenuKeyboard() });
  }
}

module.exports = { handleDeleteConfirm, handleDeletePlayer };