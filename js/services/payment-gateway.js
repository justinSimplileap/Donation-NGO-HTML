import { config } from '../config.js';

export class PaymentUnavailableError extends Error {
  constructor(message = 'Online payments are not enabled.') {
    super(message);
    this.name = 'PaymentUnavailableError';
  }
}

/**
 * Payment provider adapters, keyed by `config.payments.provider`.
 *
 * An adapter exposes `startCheckout(donation)` and must never handle card data in this site:
 *   1. send the donation (amount, currency, cause, donor contact) to *your backend*,
 *   2. the backend creates a hosted checkout session with the provider's secret key,
 *   3. the browser is redirected to the provider's page, which collects payment details.
 * The donation is only confirmed by the provider's server-side webhook, never by this page.
 *
 * No adapter is registered yet, so checkout always reports that payments are unavailable.
 */
const adapters = {};

const activeAdapter = () => adapters[config.payments.provider] ?? null;

export const isPaymentAvailable = () => activeAdapter() !== null;

export async function startCheckout(donation) {
  const adapter = activeAdapter();
  if (!adapter) throw new PaymentUnavailableError();
  return adapter.startCheckout(donation);
}
