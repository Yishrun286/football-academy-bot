'use strict';

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getNextPaymentDate(fromDate) {
  const date = fromDate ? new Date(fromDate) : new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysOverdue(nextPaymentDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(nextPaymentDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
  return diff;
}

module.exports = { getTodayDate, getNextPaymentDate, formatDate, getDaysOverdue };
