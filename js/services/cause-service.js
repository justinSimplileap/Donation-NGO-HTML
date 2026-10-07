import { apiClient } from './api-client.js';

export async function getCauses() {
  const { causes } = await apiClient.get('causes');
  return causes;
}

export async function getFeaturedCause() {
  const causes = await getCauses();
  return causes.find((cause) => cause.featured) ?? causes[0] ?? null;
}
