import { apiClient } from './api-client.js';

const normalize = (value = '') => String(value).toLowerCase().trim();

/**
 * @param {{ category?: string }} [options]
 */
export async function getGalleryItems({ category = '' } = {}) {
  const { items = [] } = await apiClient.get('gallery');
  const list = Array.isArray(items) ? items : [];
  const key = normalize(category);
  if (!key || key === 'all') return list;
  return list.filter((item) => normalize(item.category) === key);
}

export async function getGalleryCategories() {
  const { items = [] } = await apiClient.get('gallery');
  const list = Array.isArray(items) ? items : [];
  return [...new Set(list.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
