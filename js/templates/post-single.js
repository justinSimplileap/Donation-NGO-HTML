import { escapeHtml, formatDate, formatTime } from '../core/format.js';

const icon = (name, className = 'icon') =>
  `<svg class="${className}" aria-hidden="true"><use href="assets/icons/sprite.svg#icon-${name}"></use></svg>`;

const NEW_TAB = 'target="_blank" rel="noopener noreferrer"';

export const authorUrl = (author) => `blogs.html?author=${encodeURIComponent(author.slug)}`;

const tweetUrl = (text, url) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

/* ---------- Body blocks ---------- */
const blockTemplates = {
  heading: ({ text }) => `<h2 class="post__heading">${escapeHtml(text)}</h2>`,

  paragraph: ({ text }) => `<p class="post__text">${escapeHtml(text)}</p>`,

  quote: ({ text, cite }, { url }) => `
    <figure class="post-quote">
      <blockquote class="post-quote__text"><p>${escapeHtml(text)}</p></blockquote>
      <figcaption class="post-quote__footer">
        <cite class="post-quote__cite">${escapeHtml(cite)}</cite>
        <a class="post-quote__tweet" href="${escapeHtml(tweetUrl(`“${text}” – ${cite}`, url))}" ${NEW_TAB}>
          ${icon('twitter')}Tweet<span class="visually-hidden"> this quote (opens in a new tab)</span>
        </a>
      </figcaption>
    </figure>`,

  gallery: ({ images }) => `
    <div class="post-gallery">
      ${images
        .map(
          (image) => `
        <figure class="post-gallery__item">
          <img class="post-gallery__image" src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}"
            width="${image.width}" height="${image.height}" loading="lazy" decoding="async">
          ${image.caption ? `<figcaption class="post-gallery__caption">${escapeHtml(image.caption)}</figcaption>` : ''}
        </figure>`,
        )
        .join('')}
    </div>`,

  accordion: ({ items }) => `
    <div class="accordion accordion--toggle post__accordion" data-accordion="multiple">
      ${items
        .map(
          (item) => `
        <details class="accordion__item">
          <summary class="accordion__summary">
            ${icon('chevron-down', 'icon accordion__icon')}
            ${icon('chevron-up', 'icon accordion__icon accordion__icon--open')}
            ${escapeHtml(item.title)}
          </summary>
          <div class="accordion__panel"><p>${escapeHtml(item.text)}</p></div>
        </details>`,
        )
        .join('')}
    </div>`,
};

export const postBodyTemplate = (blocks = [], context) =>
  blocks.map((block) => blockTemplates[block.type]?.(block, context) ?? '').join('');

/* ---------- Share links ---------- */
export const shareLinksTemplate = ({ url, title }) => {
  const u = encodeURIComponent(url);
  const links = [
    { name: 'Facebook', icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: 'Twitter', icon: 'twitter', href: tweetUrl(title, url) },
    { name: 'LinkedIn', icon: 'linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  ];
  return `
    <ul class="share-links" aria-label="Share this post">
      ${links
        .map(
          (link) => `
        <li><a class="share-links__link" href="${escapeHtml(link.href)}" ${NEW_TAB}>
          ${icon(link.icon)}${link.name}<span class="visually-hidden"> (opens in a new tab)</span>
        </a></li>`,
        )
        .join('')}
    </ul>`;
};

/* ---------- Sidebar post info ---------- */
export const postInfoTemplate = (post) => `
  ${post.author ? `<li class="post-meta__item">${icon('user')}<a href="${authorUrl(post.author)}">${escapeHtml(post.author.name)}</a></li>` : ''}
  <li class="post-meta__item">${icon('calendar')}<time datetime="${escapeHtml(post.publishedAt)}">${formatDate(post.publishedAt)}</time></li>
  <li class="post-meta__item">${icon('clock')}<time datetime="${escapeHtml(post.publishedAt)}">${formatTime(post.publishedAt)}</time></li>
  <li class="post-meta__item">${icon('comment')}<span>No Comments</span></li>`;

/* ---------- Author box ---------- */
export const authorBoxTemplate = (author) => `
  <img class="author-box__avatar" src="${escapeHtml(author.avatar.src)}" alt="" width="${author.avatar.width}"
    height="${author.avatar.height}" loading="lazy" decoding="async">
  <div class="author-box__body">
    <h2 class="author-box__name"><span class="visually-hidden">About the author: </span>${escapeHtml(author.name)}</h2>
    <p class="author-box__bio">${escapeHtml(author.bio)}</p>
    <a class="author-box__link" href="${authorUrl(author)}">All Posts<span class="visually-hidden"> by ${escapeHtml(author.name)}</span></a>
  </div>`;
