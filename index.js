'use strict';

require('dotenv').config();

const bot = require('./config/bot');
const { isAdmin } = require('./middleware/auth');
const { mainMenuKeyboard } = require('./utils/keyboards');
const MESSAGES = require('./constants/messages');

const { handleStart } = require('./commands/start');
const { handleHelp } = require('./commands/help');
const { handleAddPlayerStart, handleAddPlayerStep, handleAddPlayerPhoto, handleStartDateCallback, handleSkipPhotoCallback, cancelSession, hasActiveSession, getSessionStep } = require('./commands/addPlayer');
const { handleListPlayers } = require('./commands/players');
const { handleViewPlayer } = require('./commands/player');
const { handlePaidMenu, handleMarkPaid } = require('./commands/paid');
const { handleDueToday } = require('./commands/due');
const { handleDeleteConfirm, handleDeletePlayer } = require('./commands/deletePlayer');
const { startScheduler } = require('./scheduler/cron');

// ─── Text Commands ───────────────────────────────────────────────────────────

bot.onText(/\/start/, (msg) => handleStart(bot, msg));

bot.onText(/\/help/, async (msg) => {
  if (!isAdmin(msg.chat.id)) return bot.sendMessage(msg.chat.id, MESSAGES.UNAUTHORIZED);
  await handleHelp(bot, msg.chat.id);
});

// ─── Generic Message Handler (for multi-step flows) ──────────────────────────

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (!isAdmin(chatId)) return;
  if (msg.text && msg.text.startsWith('/')) return;

  if (!hasActiveSession(chatId)) return;

  // Route photo messages to the photo handler when on the photo step
  if (msg.photo && getSessionStep(chatId) === 'photo') {
    await handleAddPlayerPhoto(bot, msg);
    return;
  }

  // Route all other text messages through the step handler
  await handleAddPlayerStep(bot, msg);
});

// ─── Callback Query (Inline Button) Handler ──────────────────────────────────

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (!isAdmin(chatId)) {
    await bot.answerCallbackQuery(query.id, { text: 'Unauthorized.' });
    return;
  }

  // ── Start date selection (must come BEFORE the generic answerCallbackQuery below) ──
  if (data === 'start_date_today' || data === 'start_date_custom') {
    await handleStartDateCallback(bot, query);
    return;
  }

  if (data === 'skip_photo') {
    await handleSkipPhotoCallback(bot, query);
    return;
  }

  // Always acknowledge the callback to remove loading state
  await bot.answerCallbackQuery(query.id);

  // ── Navigation ──
  if (data === 'main_menu') {
    await bot.sendMessage(chatId, '🏠 *Main Menu*', {
      parse_mode: 'Markdown',
      reply_markup: mainMenuKeyboard(),
    });
    return;
  }

  if (data === 'cancel') {
    cancelSession(chatId);
    await bot.sendMessage(chatId, '❌ Action cancelled.', {
      reply_markup: mainMenuKeyboard(),
    });
    return;
  }

  // ── Commands ──
  if (data === 'add_player') {
    await handleAddPlayerStart(bot, chatId);
    return;
  }

  if (data === 'list_players') {
    await handleListPlayers(bot, chatId);
    return;
  }

  if (data === 'help') {
    await handleHelp(bot, chatId);
    return;
  }

  if (data === 'due_today') {
    await handleDueToday(bot, chatId);
    return;
  }

  if (data === 'paid_menu') {
    await handlePaidMenu(bot, chatId);
    return;
  }

  // ── Dynamic: view_<playerId> ──
  if (data.startsWith('view_')) {
    const playerId = data.replace('view_', '');
    await handleViewPlayer(bot, chatId, playerId);
    return;
  }

  // ── Dynamic: paid_<playerId> ──
  if (data.startsWith('paid_')) {
    const playerId = data.replace('paid_', '');
    await handleMarkPaid(bot, chatId, playerId);
    return;
  }

  // ── Dynamic: delete_<playerId> → show confirmation ──
  if (data.startsWith('delete_')) {
    const playerId = data.replace('delete_', '');
    await handleDeleteConfirm(bot, chatId, playerId);
    return;
  }

  // ── Dynamic: confirm_delete_<playerId> → actually delete ──
  if (data.startsWith('confirm_delete_')) {
    const playerId = data.replace('confirm_delete_', '');
    await handleDeletePlayer(bot, chatId, playerId);
    return;
  }
});

// ─── Error Handling ───────────────────────────────────────────────────────────

bot.on('polling_error', (err) => {
  console.error('❌ Polling error:', err.message);
});

bot.on('error', (err) => {
  console.error('❌ Bot error:', err.message);
});

// ─── Start ────────────────────────────────────────────────────────────────────

startScheduler();
console.log('✅ Bot started');