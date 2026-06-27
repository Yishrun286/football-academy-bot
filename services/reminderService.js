'use strict';

const bot = require('../config/bot');
const { getDuePlayers } = require('./playerService');
const { formatDate, getDaysOverdue } = require('../utils/date');
const MESSAGES = require('../constants/messages');

async function sendDailyReminder() {
  const adminChatId = process.env.ADMIN_CHAT_ID;

  try {
    const duePlayers = await getDuePlayers();

    if (!duePlayers || duePlayers.length === 0) {
      return;
    }

    let message = MESSAGES.REMINDER_HEADER;

    duePlayers.forEach((player, index) => {
      const daysOverdue = getDaysOverdue(player.next_payment_date);
      const overdueText = daysOverdue > 0 ? `\n⚠️ Overdue by ${daysOverdue} day(s)` : '';

      message += `*${index + 1}. ${player.full_name}*\n`;
      message += `🏷️ Team: ${player.team}\n`;
      message += `💰 Fee: ${player.monthly_fee} ETB\n`;
      message += `📞 Parent: ${player.parent_phone}`;
      message += overdueText;

      if (index < duePlayers.length - 1) {
        message += MESSAGES.REMINDER_SEPARATOR;
      }
    });

    await bot.sendMessage(adminChatId, message, { parse_mode: 'Markdown' });
    console.log(`✅ Reminder sent: ${duePlayers.length} due player(s) notified`);
  } catch (err) {
    console.error('❌ Error sending daily reminder:', err.message);
  }
}

module.exports = { sendDailyReminder };
