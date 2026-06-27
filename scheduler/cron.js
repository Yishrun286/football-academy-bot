'use strict';

const cron = require('node-cron');
const { sendDailyReminder } = require('../services/reminderService');

function startScheduler() {
  // Runs every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily payment reminder check...');
    await sendDailyReminder();
  }, {
    timezone: 'Africa/Addis_Ababa',
  });

  console.log('✅ Scheduler started — daily reminders at 8:00 AM (EAT)');
}

module.exports = { startScheduler };
