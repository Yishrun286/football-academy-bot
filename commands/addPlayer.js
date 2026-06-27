'use strict';

const { createPlayer } = require('../services/playerService');
const { uploadPhotoFromTelegram } = require('../services/uploadService');
const { isValidName, isValidTeam, isValidPhone, isValidFee } = require('../utils/validation');
const { mainMenuKeyboard, cancelKeyboard } = require('../utils/keyboards');
const MESSAGES = require('../constants/messages');

// In-memory session store keyed by chatId
const sessions = {};

function getSession(chatId) {
  return sessions[chatId] || null;
}

function startSession(chatId) {
  sessions[chatId] = { step: 'name', data: {} };
}

function clearSession(chatId) {
  delete sessions[chatId];
}

// Validate date input: accepts YYYY-MM-DD or DD/MM/YYYY
function parseCustomDate(text) {
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const d = new Date(text);
    if (!isNaN(d.getTime())) return text;
  }
  // Try DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    const [day, month, year] = text.split('/');
    const iso = `${year}-${month}-${day}`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return iso;
  }
  return null;
}

async function handleAddPlayerStart(bot, chatId) {
  startSession(chatId);
  await bot.sendMessage(chatId, MESSAGES.ADD_PLAYER_START, {
    parse_mode: 'Markdown',
    reply_markup: cancelKeyboard(),
  });
}

// Called for regular text messages during the flow
async function handleAddPlayerStep(bot, msg) {
  const chatId = msg.chat.id;
  const session = getSession(chatId);
  if (!session) return false;

  const text = msg.text && msg.text.trim();

  switch (session.step) {
    case 'name': {
      if (!isValidName(text)) {
        await bot.sendMessage(chatId, MESSAGES.ERROR_INVALID_NAME, { reply_markup: cancelKeyboard() });
        return true;
      }
      session.data.full_name = text;
      session.step = 'team';
      await bot.sendMessage(chatId, MESSAGES.ASK_TEAM, {
        parse_mode: 'Markdown',
        reply_markup: cancelKeyboard(),
      });
      return true;
    }

    case 'team': {
      if (!isValidTeam(text)) {
        await bot.sendMessage(chatId, MESSAGES.ERROR_INVALID_TEAM, { reply_markup: cancelKeyboard() });
        return true;
      }
      session.data.team = text;
      session.step = 'phone';
      await bot.sendMessage(chatId, MESSAGES.ASK_PHONE, {
        parse_mode: 'Markdown',
        reply_markup: cancelKeyboard(),
      });
      return true;
    }

    case 'phone': {
      if (!isValidPhone(text)) {
        await bot.sendMessage(chatId, MESSAGES.ERROR_INVALID_PHONE, { reply_markup: cancelKeyboard() });
        return true;
      }
      session.data.parent_phone = text;
      session.step = 'fee';
      await bot.sendMessage(chatId, MESSAGES.ASK_FEE, {
        parse_mode: 'Markdown',
        reply_markup: cancelKeyboard(),
      });
      return true;
    }

    case 'fee': {
      if (!isValidFee(text)) {
        await bot.sendMessage(chatId, MESSAGES.ERROR_INVALID_FEE, { reply_markup: cancelKeyboard() });
        return true;
      }
      session.data.monthly_fee = parseInt(text, 10);
      session.step = 'start_date';

      // Ask for payment start date with today as default option
      const today = new Date().toISOString().split('T')[0];
      const keyboard = {
        inline_keyboard: [
          [{ text: `✅ Use Today (${today})`, callback_data: 'start_date_today' }],
          [{ text: '📅 Enter Custom Date', callback_data: 'start_date_custom' }],
        ],
      };
      await bot.sendMessage(
        chatId,
        `📅 *Payment Start Date*\n\nWhen should payment tracking begin for this player?`,
        { parse_mode: 'Markdown', reply_markup: keyboard }
      );
      return true;
    }

    case 'start_date_input': {
      // Admin typed a custom date
      const parsed = parseCustomDate(text);
      if (!parsed) {
        await bot.sendMessage(
          chatId,
          '❌ Invalid date format. Please use *YYYY-MM-DD* or *DD/MM/YYYY*.\n\nExample: `2024-01-15` or `15/01/2024`',
          { parse_mode: 'Markdown', reply_markup: cancelKeyboard() }
        );
        return true;
      }
      session.data.start_date = parsed;
      session.step = 'photo';
      await bot.sendMessage(chatId, MESSAGES.ASK_PHOTO, {
        parse_mode: 'Markdown',
        reply_markup: cancelKeyboard(),
      });
      return true;
    }

    case 'photo': {
      // If they sent text instead of a photo, remind them
      await bot.sendMessage(chatId, MESSAGES.ERROR_SEND_PHOTO, { reply_markup: cancelKeyboard() });
      return true;
    }

    default:
      clearSession(chatId);
      return false;
  }
}

// Called when admin taps the inline keyboard for start date
async function handleStartDateCallback(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const session = getSession(chatId);
  if (!session || session.step !== 'start_date') return false;

  const data = callbackQuery.data;
  await bot.answerCallbackQuery(callbackQuery.id);

  if (data === 'start_date_today') {
    const today = new Date().toISOString().split('T')[0];
    session.data.start_date = today;
    session.step = 'photo';
    await bot.sendMessage(chatId, MESSAGES.ASK_PHOTO, {
      parse_mode: 'Markdown',
      reply_markup: cancelKeyboard(),
    });
    return true;
  }

  if (data === 'start_date_custom') {
    session.step = 'start_date_input';
    await bot.sendMessage(
      chatId,
      '📅 Enter the payment start date:\n\nFormat: *YYYY-MM-DD* or *DD/MM/YYYY*\nExample: `2024-01-15` or `15/01/2024`',
      { parse_mode: 'Markdown', reply_markup: cancelKeyboard() }
    );
    return true;
  }

  return false;
}

// Called specifically when the admin sends a photo message
async function handleAddPlayerPhoto(bot, msg) {
  const chatId = msg.chat.id;
  const session = getSession(chatId);
  if (!session || session.step !== 'photo') return false;

  const uploadingMsg = await bot.sendMessage(chatId, '⏳ Uploading photo, please wait...');

  try {
    // Pick the highest resolution version of the photo
    const photos = msg.photo;
    const bestPhoto = photos[photos.length - 1];

    const photoUrl = await uploadPhotoFromTelegram(bot, bestPhoto.file_id);
    session.data.photo_url = photoUrl;

    // Delete the "uploading" message for a clean UX
    await bot.deleteMessage(chatId, uploadingMsg.message_id).catch(() => {});

    const player = await createPlayer(session.data);
    clearSession(chatId);

    await bot.sendMessage(chatId, MESSAGES.PLAYER_SAVED(player.full_name), {
      parse_mode: 'Markdown',
      reply_markup: mainMenuKeyboard(),
    });
  } catch (err) {
    clearSession(chatId);
    console.error('❌ Error uploading photo or creating player:', err.message);
    await bot.deleteMessage(chatId, uploadingMsg.message_id).catch(() => {});
    await bot.sendMessage(chatId, MESSAGES.ERROR_PHOTO_UPLOAD, { reply_markup: mainMenuKeyboard() });
  }

  return true;
}

function cancelSession(chatId) {
  clearSession(chatId);
}

function hasActiveSession(chatId) {
  return !!sessions[chatId];
}

function getSessionStep(chatId) {
  return sessions[chatId] ? sessions[chatId].step : null;
}

module.exports = {
  handleAddPlayerStart,
  handleAddPlayerStep,
  handleAddPlayerPhoto,
  handleStartDateCallback,
  cancelSession,
  hasActiveSession,
  getSessionStep,
};