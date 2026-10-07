import { qsa } from '../core/dom.js';
import { getPosts } from '../services/blog-service.js';
import { postItemTemplate } from '../templates/post-item.js';

/**
 * Renders compact post lists (sidebar, footer):
 * <ul data-post-list data-limit="3" data-order="asc" data-excerpt-words="7">
 */
export async function renderPostLists(scope = document) {
  const lists = qsa('[data-post-list]', scope);

  await Promise.all(
    lists.map(async (list) => {
      try {
        const posts = await getPosts({
          limit: Number(list.dataset.limit) || 3,
          order: list.dataset.order === 'asc' ? 'asc' : 'desc',
        });
        const excerptWords = Number(list.dataset.excerptWords) || undefined;
        list.innerHTML = posts.map((post) => postItemTemplate(post, { excerptWords })).join('');
      } catch (error) {
        list.innerHTML = '';
        console.warn('[post-list] Could not load posts.', error);
      }
    }),
  );
}
