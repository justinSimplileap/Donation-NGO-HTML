import { apiClient } from './api-client.js';

const normalize = (value = '') => String(value).toLowerCase().trim();

/**
 * @param {{ category?: string }} [options]
 */
export async function getGalleryItems({ category = '' } = {}) {
  const { items } = await apiClient.get('gallery');
  const key = normalize(category);
  if (!key || key === 'all') return items;
  return items.filter((item) => normalize(item.category) === key);
}

export async function getGalleryCategories() {
  const { items } = await apiClient.get('gallery');
  return [...new Set(items.map((item) => item.category))].sort((a, b) => a.localeCompare(b));
}
