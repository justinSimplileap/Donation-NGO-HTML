import { escapeHtml } from '../core/format.js';

export const galleryItemTemplate = (item, index) => {
  const image = item.thumbnail ?? item.image;
  return `
  <li class="gallery-grid__item" data-gallery-item data-index="${index}" data-category="${escapeHtml(item.category)}">
    <button class="gallery-item" type="button" data-gallery-open="${index}"
      aria-label="View image: ${escapeHtml(item.title)}">
      <img class="gallery-item__img" src="${escapeHtml(image.src)}" alt="${escapeHtml(item.alt)}"
        width="${image.width}" height="${image.height}" loading="lazy" decoding="async">
      <span class="gallery-item__overlay">
        <span class="gallery-item__title">${escapeHtml(item.title)}</span>
        <span class="gallery-item__category">${escapeHtml(item.category)}</span>
      </span>
    </button>
  </li>`;
};
