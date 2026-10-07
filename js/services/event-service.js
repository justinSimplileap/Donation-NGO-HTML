import { apiClient } from './api-client.js';

const byDateThenId = (a, b) => new Date(a.date) - new Date(b.date) || a.id - b.id;

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const isUpcoming = (event) => new Date(event.date) >= startOfToday();

const categoryKey = (value = '') => String(value).toLowerCase();

/**
 * @param {{ limit?: number, order?: 'asc' | 'desc', category?: string }} [options]
 * category: `upcoming`, `community`, `fundraising`, `volunteer`, or empty for all
 */
export async function getEvents({ limit, order = 'asc', category = '' } = {}) {
  const { events } = await apiClient.get('events');
  const key = categoryKey(category);
  const filtered = events.filter((event) => {
    if (!key || key === 'all') return true;
    if (key === 'upcoming') return isUpcoming(event);
    return categoryKey(event.category) === key;
  });
  const sorted = filtered.sort(byDateThenId);
  if (order === 'desc') sorted.reverse();
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

export async function getEventBySlug(slug) {
  const { events } = await apiClient.get('events');
  return events.find((event) => event.slug === slug) ?? null;
}

export async function getFeaturedEvent() {
  const { events } = await apiClient.get('events');
  return events.find((event) => event.featured) ?? events[0] ?? null;
}

export async function getLatestEvent() {
  const [latest] = await getEvents({ limit: 1, order: 'desc' });
  return latest ?? null;
}

/** Related events: same category first, excluding the current slug. */
export async function getRelatedEvents(slug, limit = 3) {
  const current = await getEventBySlug(slug);
  if (!current) return [];
  const { events } = await apiClient.get('events');
  const others = events.filter((event) => event.slug !== slug);
  const sameCategory = others.filter((event) => event.category === current.category);
  const rest = others.filter((event) => event.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}
