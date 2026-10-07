import { escapeHtml } from '../core/format.js';

/**
 * @param {{ href: string, title: string, image: { src: string, alt?: string, width: number, height: number } }} tile
 */
export const imageTileTemplate = ({ href, title, image }) => `
  <li class="image-tile">
    <a class="image-tile__link" href="${escapeHtml(href)}">
      <img class="image-tile__img" src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt ?? '')}"
        width="${image.width}" height="${image.height}" loading="lazy" decoding="async">
      <span class="image-tile__overlay">
        <span class="image-tile__title">${escapeHtml(title)}</span>
      </span>
    </a>
  </li>`;
