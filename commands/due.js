'use strict';

const { getDuePlayers } = require('../services/playerService');
const { formatDate, getDaysOverdue } = require('../utils/date');
const { playerActionsKeyboard, backToMenuKeyboard } = require('../utils/keyboards');
const MESSAGES = require('../constants/messages');

async function handleDueToday(bot, chatId) {
  try {
    const duePlayers = await getDuePlayers();

    if (!duePlayers || duePlayers.length === 0) {
      await bot.sendMessage(chatId, MESSAGES.NO_DUE_PLAYERS, {
        parse_mode: 'Markdown',
        reply_markup: backToMenuKeyboard(),
      });
      return;
    }

    await bot.sendMessage(chatId, `📅 *Due Today — ${duePlayers.length} Player(s)*`, {
      parse_mode: 'Markdown',
    });

    for (const player of duePlayers) {
      const daysOverdue = getDaysOverdue(player.next_payment_date);
      const overdueText = daysOverdue > 0
        ? `\n⚠️ *Overdue by ${daysOverdue} day(s)*`
        : '\n🔔 *Due today*';

      const caption =
        `👤 *${player.full_name}*\n` +
        `🏷️ Team: ${player.team}\n` +
        `💰 Fee: ${player.monthly_fee} ETB\n` +
        `📞 Parent: ${player.parent_phone}\n` +
        `📅 Due Date: ${formatDate(player.next_payment_date)}` +
        overdueText;

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
    }

    await bot.sendMessage(chatId, '——', { reply_markup: backToMenuKeyboard() });
  } catch (err) {
    console.error('❌ Error fetching due players:', err.message);
    await bot.sendMessage(chatId, MESSAGES.ERROR_GENERIC, { reply_markup: backToMenuKeyboard() });
  }
}

module.exports = { handleDueToday };
