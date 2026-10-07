const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

export const truncateWords = (text = '', count = 0) => {
  const words = String(text).trim().split(/\s+/);
  return words.length <= count ? words.join(' ') : words.slice(0, count).join(' ').replace(/[.,;:]$/, '');
};

/* Date-only strings ("2025-01-31") parse as UTC midnight, so format them in UTC to keep the same day everywhere. */
const isDateOnly = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value));

export const formatDate = (isoDate, locale = 'en-US') =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(isDateOnly(isoDate) && { timeZone: 'UTC' }),
  }).format(new Date(isoDate));

export const formatTime = (isoDateTime, locale = 'en-US') =>
  new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(new Date(isoDateTime)).toLowerCase();

const dateParts = (isoDate, options, locale = 'en-US') =>
  new Intl.DateTimeFormat(locale, {
    ...options,
    ...(isDateOnly(isoDate) && { timeZone: 'UTC' }),
  }).formatToParts(new Date(isoDate));

export const formatEventDay = (isoDate, locale = 'en-US') =>
  dateParts(isoDate, { day: 'numeric' }, locale).find((part) => part.type === 'day')?.value ?? '';

export const formatEventMonth = (isoDate, locale = 'en-US') =>
  dateParts(isoDate, { month: 'short' }, locale).find((part) => part.type === 'month')?.value ?? '';

export const formatCurrency = (amount, currency = 'USD', locale = 'en-US', fractionDigits = 2) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
