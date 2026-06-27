'use strict';

const { supabase } = require('../config/supabase');
const { getTodayDate, getNextPaymentDate } = require('../utils/date');

async function markPlayerAsPaid(playerId) {
  const today = getTodayDate();
  const nextPayment = getNextPaymentDate(today);

  const { data, error } = await supabase
    .from('players')
    .update({
      last_payment_date: today,
      next_payment_date: nextPayment,
    })
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update payment: ${error.message}`);

  console.log(`✅ Payment updated: Player ID ${playerId}`);
  return data;
}

module.exports = { markPlayerAsPaid };
