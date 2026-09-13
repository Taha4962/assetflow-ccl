/**
 * formatters.js — Utility helpers for date/number/string formatting in CCL AssetFlow
 */

/**
 * Format an ISO date string to a human-readable short date.
 * e.g. "2026-08-30T18:15:14Z" → "30 Aug 2026"
 */
export const formatDate = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format an ISO date string to date + time.
 * e.g. "2026-08-30T18:15:14Z" → "30 Aug 2026, 11:45 PM"
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format a number as Indian currency (INR).
 * e.g. 125000 → "₹1,25,000"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Truncate a string to a given max length with an ellipsis.
 */
export const truncate = (str, maxLen = 50) => {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
};

/**
 * Convert a snake_case role key to a Title Case display string.
 * e.g. "super_admin" → "Super Admin"
 */
export const formatRole = (role) => {
  if (!role) return '';
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

/**
 * Return initials from a full name string.
 * e.g. "Rajesh Kumar" → "RK"
 */
export const getInitials = (fullName = '') => {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Pluralise a noun based on count.
 * e.g. pluralise(1, 'request') → "1 request"
 *      pluralise(3, 'request') → "3 requests"
 */
export const pluralise = (count, noun, suffix = 's') =>
  `${count} ${noun}${count !== 1 ? suffix : ''}`;
