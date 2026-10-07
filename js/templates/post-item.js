import { escapeHtml, truncateWords } from '../core/format.js';
import { postUrl } from './blog-card.js';

export const postItemTemplate = (post, { excerptWords } = {}) => `
  <li class="post-item">
    <a class="post-item__thumb" href="${postUrl(post)}" tabindex="-1" aria-hidden="true">
      <img src="${escapeHtml(post.image.src)}" alt="" width="${post.image.width}" height="${post.image.height}"
        loading="lazy" decoding="async">
    </a>
    <div class="post-item__body">
      <h3 class="post-item__title"><a href="${postUrl(post)}">${escapeHtml(post.title)}</a></h3>
      <p class="post-item__excerpt">${escapeHtml(excerptWords ? truncateWords(post.excerpt, excerptWords) : post.excerpt)}</p>
    </div>
  </li>`;
