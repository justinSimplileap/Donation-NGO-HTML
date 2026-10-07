import { apiClient } from './api-client.js';

const byDateThenId = (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt) || a.id - b.id;

const normalize = (value = '') => String(value).toLocaleLowerCase('en-US').normalize('NFKD').replace(/\p{M}/gu, '').trim();

/** All searchable text of a post: title, excerpt, category and body blocks. */
const searchableText = (post) =>
  normalize(
    [
      post.title,
      post.excerpt,
      post.category,
      ...(post.content ?? []).flatMap((block) => [
        block.text,
        block.cite,
        ...(block.items ?? []).flatMap((item) => [item.title, item.text]),
        ...(block.images ?? []).map((image) => image.caption),
      ]),
    ]
      .filter(Boolean)
      .join(' '),
  );

const matchesSearch = (post, query) => {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const text = searchableText(post);
  return terms.every((term) => text.includes(term));
};

/**
 * @param {{ limit?: number, order?: 'asc' | 'desc', search?: string, author?: string }} [options]
 */
export async function getPosts({ limit, order = 'desc', search = '', author = '' } = {}) {
  const { posts } = await apiClient.get('posts');
  const filtered = posts.filter((post) => (!author || post.author === author) && matchesSearch(post, search));
  const sorted = filtered.sort(byDateThenId);
  if (order === 'desc') sorted.reverse();
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

export async function getAuthor(slug) {
  const { authors = [] } = await apiClient.get('posts');
  return authors.find((author) => author.slug === slug) ?? null;
}

/** Returns the post with its author resolved, or null when the slug is unknown. */
export async function getPostBySlug(slug) {
  const { posts } = await apiClient.get('posts');
  const post = posts.find((item) => item.slug === slug);
  if (!post) return null;
  return { ...post, author: await getAuthor(post.author) };
}

export async function getLatestPost() {
  const [latest] = await getPosts({ limit: 1 });
  return latest ? getPostBySlug(latest.slug) : null;
}
