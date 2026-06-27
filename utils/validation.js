'use strict';

function isValidName(value) {
  return typeof value === 'string' && value.trim().length >= 2;
}

function isValidTeam(value) {
  return typeof value === 'string' && value.trim().length >= 1;
}

function isValidPhone(value) {
  const cleaned = value.replace(/[\s\-\+]/g, '');
  return /^\d{10,15}$/.test(cleaned);
}

function isValidFee(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

function isValidUrl(value) {
  return typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
}

module.exports = { isValidName, isValidTeam, isValidPhone, isValidFee, isValidUrl };
