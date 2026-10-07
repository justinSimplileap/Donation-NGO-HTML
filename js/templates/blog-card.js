import { config } from '../config.js';
import { escapeHtml, formatDate } from '../core/format.js';

export const postUrl = (post) => `${config.routes.blogSingle}?slug=${encodeURIComponent(post.slug)}`;

export const blogCardTemplate = (post) => `
  <article class="blog-card">
    <img class="blog-card__image" src="${escapeHtml(post.image.src)}" alt="${escapeHtml(post.image.alt)}"
      width="${post.image.width}" height="${post.image.height}" loading="lazy" decoding="async">
    <time class="blog-card__date" datetime="${escapeHtml(post.publishedAt)}">${formatDate(post.publishedAt)}</time>
    <h3 class="blog-card__title">
      <a class="blog-card__link" href="${postUrl(post)}">${escapeHtml(post.title)}</a>
    </h3>
    <p class="blog-card__excerpt">${escapeHtml(post.excerpt)}</p>
  </article>`;
