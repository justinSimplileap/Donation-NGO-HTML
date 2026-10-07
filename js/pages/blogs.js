import { qs } from '../core/dom.js';
import { escapeHtml } from '../core/format.js';
import { getAuthor, getPosts } from '../services/blog-service.js';
import { blogCardTemplate } from '../templates/blog-card.js';
import { paginationTemplate } from '../templates/pagination.js';

/* Blog listing with optional filters from links such as blogs.html?search=water or ?author=riley-johnson. */
function initBlogListing() {
  const grid = qs('[data-blog-list]');
  const pagination = qs('[data-blog-pagination]');
  const status = qs('[data-blog-status]');
  if (!grid || !pagination || !status) return;

  const params = new URLSearchParams(window.location.search);
  const search = (params.get('search') ?? '').trim().slice(0, 100);
  const authorSlug = (params.get('author') ?? '').trim();
  const perPage = Number(grid.dataset.perPage) || 6;
  let posts = [];
  let current = 1;

  const totalPages = () => Math.max(1, Math.ceil(posts.length / perPage));

  const render = ({ moveFocus = false } = {}) => {
    const start = (current - 1) * perPage;
    grid.innerHTML = posts.length
      ? posts.slice(start, start + perPage).map(blogCardTemplate).join('')
      : '<p class="data-placeholder blog-grid__empty">No posts match your search. Try a different word or <a href="blogs.html">browse all posts</a>.</p>';
    grid.setAttribute('aria-label', totalPages() > 1 ? `Posts, page ${current} of ${totalPages()}` : 'Posts');
    pagination.innerHTML = paginationTemplate({ current, total: totalPages() });

    if (moveFocus) {
      grid.focus({ preventScroll: true });
      if (grid.getBoundingClientRect().top < 0) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const describeFilter = (author) => {
    const count = `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`;
    const parts = [];
    if (search) parts.push(`matching “<strong>${escapeHtml(search)}</strong>”`);
    if (authorSlug) parts.push(`by <strong>${escapeHtml(author?.name ?? authorSlug)}</strong>`);
    status.innerHTML = `Showing ${count} ${parts.join(' ')}. <a href="blogs.html">View all posts</a>`;
    status.hidden = false;
  };

  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button || button.getAttribute('aria-current') === 'page') return;
    current = Math.min(totalPages(), Math.max(1, Number(button.dataset.page)));
    render({ moveFocus: true });
  });

  Promise.all([getPosts({ search, author: authorSlug }), authorSlug ? getAuthor(authorSlug) : null])
    .then(([list, author]) => {
      posts = list;
      if (search || authorSlug) describeFilter(author);
      render();
    })
    .catch((error) => {
      grid.innerHTML = '<p class="data-placeholder">Posts could not be loaded right now.</p>';
      console.warn('[blogs] Could not load posts.', error);
    });
}

initBlogListing();
