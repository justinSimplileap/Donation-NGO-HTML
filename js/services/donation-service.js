import { config } from '../config.js';
import { formatCurrency } from '../core/format.js';
import { isValidEmail } from '../core/validation.js';
import { startCheckout, isPaymentAvailable, PaymentUnavailableError } from './payment-gateway.js';

const { currency, minAmount, maxAmount } = config.donations;

const NAME_MAX_LENGTH = 50;

export const FREQUENCY_LABELS = { once: 'One time' };

export const formatAmount = (cents) => formatCurrency(cents / 100, currency);

/**
 * Parses a typed amount ("25", "$1,000.50") into integer cents.
 * Returns `{ cents }` on success or `{ error }` with a donor-facing message.
 */
export function parseAmount(raw) {
  const value = String(raw ?? '')
    .trim()
    .replace(/^\$\s*/, '')
    .replace(/,/g, '');

  if (value === '') return { error: 'Please choose an amount or enter your own.' };
  if (/^-\s*\d*\.?\d*$/.test(value) && /\d/.test(value)) return { error: 'The amount can’t be negative.' };
  if (!/^\d*\.?\d*$/.test(value) || !/\d/.test(value)) {
    return { error: 'Please use numbers only, for example 25 or 25.50.' };
  }

  const [whole = '', fraction = ''] = value.split('.');
  if (fraction.length > 2) return { error: 'Please use no more than two decimal places.' };

  const cents = Number(whole || '0') * 100 + Number(fraction.padEnd(2, '0') || '0');
  if (cents === 0) return { error: 'The amount must be more than $0.' };
  if (cents < minAmount * 100) return { error: `The minimum donation is ${formatAmount(minAmount * 100)}.` };
  if (cents > maxAmount * 100) {
    return { error: `For gifts over ${formatCurrency(maxAmount, currency, 'en-US', 0)}, please contact us directly.` };
  }
  return { cents };
}

/** Returns a map of field name → message for invalid donor fields (empty when valid). */
export function validateDonor({ firstName = '', lastName = '', email = '' }) {
  const errors = {};
  const first = firstName.trim();
  const last = lastName.trim();
  const mail = email.trim();

  if (!first) errors.firstName = 'Please enter your first name.';
  else if (first.length > NAME_MAX_LENGTH) errors.firstName = `Please use ${NAME_MAX_LENGTH} characters or fewer.`;

  if (last.length > NAME_MAX_LENGTH) errors.lastName = `Please use ${NAME_MAX_LENGTH} characters or fewer.`;

  if (!mail) errors.email = 'Please enter your email address.';
  else if (!isValidEmail(mail)) errors.email = 'Please enter a valid email address, like name@example.com.';
  return errors;
}

/** Builds the payload handed to the payment provider. Contains no payment details. */
export function createDonation({ cents, frequency = 'once', cause = null, donor, paymentMethod }) {
  return {
    amount: cents,
    currency,
    frequency,
    cause: cause?.slug ?? null,
    paymentMethod,
    donor: {
      firstName: donor.firstName.trim(),
      lastName: donor.lastName.trim(),
      email: donor.email.trim(),
    },
  };
}

export { isPaymentAvailable, PaymentUnavailableError };

export async function submitDonation(donation) {
  return startCheckout(donation);
}
