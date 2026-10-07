/**
 * Data source configuration.
 *
 * `local`  – reads the JSON files in /data (current development mode).
 * `remote` – calls a REST API / headless CMS at `apiBaseUrl`.
 */
export const config = {
  dataSource: 'local',
  apiBaseUrl: '',
  localDataUrl: new URL('../data/', import.meta.url),
  routes: {
    blogSingle: 'blog-single.html',
    donate: 'donate.html',
  },
  donations: {
    currency: 'USD',
    minAmount: 1,
    maxAmount: 100000,
    contactEmail: 'donation@refugeehelp.com',
  },
  /**
   * Online payments. `provider` names an adapter registered in js/services/payment-gateway.js.
   * Keep secret keys on the server – only publishable identifiers may ever be placed here.
   */
  payments: {
    provider: null,
  },
};
