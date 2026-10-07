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

export const formatDate = (isoDate, locale = 'en-US') =>
  new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(isoDate));

export const formatCurrency = (amount, currency = 'USD', locale = 'en-US', fractionDigits = 2) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
