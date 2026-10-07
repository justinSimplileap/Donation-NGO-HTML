import { apiClient } from './api-client.js';

export async function subscribe(email) {
  return apiClient.post('newsletter', { email });
}
