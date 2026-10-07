import { apiClient } from './api-client.js';

export async function getCauses() {
  const { causes } = await apiClient.get('causes');
  return causes;
}

/** Causes shown in listings. Entries with `listed: false` are donation designations only. */
export async function getListedCauses() {
  const causes = await getCauses();
  return causes.filter((cause) => cause.listed !== false);
}

export async function getFeaturedCause() {
  const causes = await getListedCauses();
  return causes.find((cause) => cause.featured) ?? causes[0] ?? null;
}

export async function getCauseBySlug(slug) {
  if (!slug) return null;
  const causes = await getCauses();
  return causes.find((cause) => cause.slug === slug) ?? null;
}
