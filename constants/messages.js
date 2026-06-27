'use strict';

const MESSAGES = {
  UNAUTHORIZED: '⛔ You are not authorized.',

  WELCOME: (name) =>
    `⚽ *Welcome to Football Academy Bot!*\n\nHello, Coach ${name}! 👋\n\nThis bot helps you manage player registrations and track monthly payments.\n\nUse the buttons below to get started:`,

  HELP: `📋 *Available Commands*\n\n` +
    `➕ *Add Player* — Register a new player\n` +
    `👥 *Players* — View all registered players\n` +
    `💰 *Paid* — Mark a payment as received\n` +
    `📅 *Due Today* — See players with payments due\n\n` +
    `*Payment Logic:*\n` +
    `Next Payment = Last Payment + 30 days\n\n` +
    `*Automatic Reminders:*\n` +
    `Every day at 8:00 AM, you'll receive a reminder for all due players.`,

  ADD_PLAYER_START: '➕ *Add New Player*\n\nLet\'s register a new player. Please enter the player\'s *full name*:',
  ASK_TEAM: '✅ Got it!\n\nNow enter the player\'s *team* (e.g., U10, U12, U15):',
  ASK_PHONE: '✅ Team saved!\n\nEnter the *parent\'s phone number*:',
  ASK_FEE: '✅ Phone saved!\n\nEnter the *monthly fee* (numbers only, e.g., 1500):',
  ASK_PHOTO: '✅ Fee saved!\n\n📸 Now *send the player\'s photo* directly in this chat (just take or pick a photo and send it):',

  ERROR_SEND_PHOTO: '📸 Please *send a photo* — don\'t type text. Take or pick an image and send it here:',
  ERROR_PHOTO_UPLOAD: '❌ Failed to upload photo. Please try again by pressing *Add Player*.',

  PLAYER_SAVED: (name) => `✅ *Player Registered Successfully!*\n\n*${name}* has been added to the academy.\n\nPayment tracking starts from today.`,

  NO_PLAYERS: '👥 No players registered yet.\n\nPress *Add Player* to register your first player!',
  NO_DUE_PLAYERS: '✅ No players are due today. All payments are up to date!',

  PAYMENT_UPDATED: (name) => `✅ *Payment Updated!*\n\n*${name}*\'s payment has been recorded.\nNext payment due in 30 days.`,

  ERROR_GENERIC: '❌ Something went wrong. Please try again.',
  ERROR_INVALID_NAME: '❌ Name cannot be empty. Please enter a valid full name:',
  ERROR_INVALID_TEAM: '❌ Team cannot be empty. Please enter a valid team name:',
  ERROR_INVALID_PHONE: '❌ Invalid phone number. Please enter a valid phone (10–15 digits):',
  ERROR_INVALID_FEE: '❌ Invalid fee. Please enter a number only (e.g., 1500):',
  ERROR_INVALID_PHOTO: '❌ Invalid URL. Photo URL must start with http:// or https://:',

  PLAYER_NOT_FOUND: '❌ Player not found.',

  REMINDER_HEADER: '🔔 *Payment Reminder*\n\n*Today\'s Due Players:*\n\n',
  REMINDER_SEPARATOR: '\n--------------------\n',
};

module.exports = MESSAGES;
