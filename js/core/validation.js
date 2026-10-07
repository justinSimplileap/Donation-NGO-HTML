const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const EMAIL_MAX_LENGTH = 254;

export const isValidEmail = (value = '') => {
  const email = String(value).trim();
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email);
};
