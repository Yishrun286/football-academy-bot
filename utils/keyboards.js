'use strict';

function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '➕ Add Player', callback_data: 'add_player' },
        { text: '👥 Players', callback_data: 'list_players' },
      ],
      [
        { text: '💰 Paid', callback_data: 'paid_menu' },
        { text: '📅 Due Today', callback_data: 'due_today' },
      ],
      [
        { text: '❓ Help', callback_data: 'help' },
      ],
    ],
  };
}

function playerActionsKeyboard(playerId) {
  return {
    inline_keyboard: [
      [
        { text: '✅ Paid', callback_data: `paid_${playerId}` },
        { text: '👤 View', callback_data: `view_${playerId}` },
      ],
      [
        { text: '🗑️ Delete Player', callback_data: `delete_${playerId}` },
      ],
    ],
  };
}

function backToMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🏠 Main Menu', callback_data: 'main_menu' }],
    ],
  };
}

function cancelKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '❌ Cancel', callback_data: 'cancel' }],
    ],
  };
}

module.exports = { mainMenuKeyboard, playerActionsKeyboard, backToMenuKeyboard, cancelKeyboard };