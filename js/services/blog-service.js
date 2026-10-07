import { apiClient } from './api-client.js';

const byDateThenId = (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt) || a.id - b.id;

/**
 * @param {{ limit?: number, order?: 'asc' | 'desc' }} [options]
 */
export async function getPosts({ limit, order = 'desc' } = {}) {
  const { posts } = await apiClient.get('posts');
  const sorted = [...posts].sort(byDateThenId);
  if (order === 'desc') sorted.reverse();
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

export async function getPostBySlug(slug) {
  const { posts } = await apiClient.get('posts');
  return posts.find((post) => post.slug === slug) ?? null;
}
