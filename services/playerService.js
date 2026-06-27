'use strict';

const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const { getTodayDate, getNextPaymentDate } = require('../utils/date');

async function getAllPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch players: ${error.message}`);
  return data;
}

async function getPlayerById(id) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to fetch player: ${error.message}`);
  return data;
}

async function createPlayer({ full_name, team, parent_phone, monthly_fee, photo_url, start_date }) {
  // Use the custom start_date if provided, otherwise default to today
  const paymentStart = start_date || getTodayDate();
  const nextPayment = getNextPaymentDate(paymentStart);

  const newPlayer = {
    id: uuidv4(),
    full_name,
    team,
    parent_phone,
    monthly_fee: parseInt(monthly_fee, 10),
    photo_url,
    last_payment_date: paymentStart,
    next_payment_date: nextPayment,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('players')
    .insert([newPlayer])
    .select()
    .single();

  if (error) throw new Error(`Failed to create player: ${error.message}`);

  console.log(`✅ Player created: ${full_name} (payment starts: ${paymentStart})`);
  return data;
}

async function deletePlayer(id) {
  const { data, error } = await supabase
    .from('players')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to delete player: ${error.message}`);

  console.log(`🗑️ Player deleted: ${data.full_name}`);
  return data;
}

async function getDuePlayers() {
  const today = getTodayDate();

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .lte('next_payment_date', today)
    .order('next_payment_date', { ascending: true });

  if (error) throw new Error(`Failed to fetch due players: ${error.message}`);
  return data;
}

module.exports = { getAllPlayers, getPlayerById, createPlayer, deletePlayer, getDuePlayers };