import { escapeHtml, formatDate, formatTime } from '../core/format.js';
import { eventUrl } from './event-card.js';

const icon = (name) =>
  `<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#icon-${name}"></use></svg>`;

export const eventBodyTemplate = (blocks = []) =>
  blocks
    .map((block) => {
      if (block.type === 'paragraph') {
        return `<p class="event__text">${escapeHtml(block.text)}</p>`;
      }
      return '';
    })
    .join('');

export const eventDetailsTemplate = (details = []) =>
  details.length
    ? `<section class="event__details" aria-labelledby="event-details-title">
        <h2 class="event__subheading" id="event-details-title">Good to Know</h2>
        <ul class="event__details-list">
          ${details.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </section>`
    : '';

export const eventGalleryTemplate = (images = []) =>
  images.length
    ? `<div class="event__gallery" role="list">
        ${images
          .map(
            (image) => `
          <figure class="event__gallery-item" role="listitem">
            <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt ?? '')}"
              width="${image.width}" height="${image.height}" loading="lazy" decoding="async">
          </figure>`,
          )
          .join('')}
      </div>`
    : '';

export const eventMetaTemplate = (event) => `
  <ul class="event-meta">
    <li class="event-meta__item">
      ${icon('calendar')}
      <span><strong>Date</strong> ${escapeHtml(formatDate(event.date))}</span>
    </li>
    <li class="event-meta__item">
      ${icon('clock')}
      <span><strong>Time</strong> ${escapeHtml(formatTime(event.startTime))} – ${escapeHtml(formatTime(event.endTime))}</span>
    </li>
    <li class="event-meta__item">
      ${icon('map-pin')}
      <span><strong>Location</strong> ${escapeHtml(event.location)}</span>
    </li>
    <li class="event-meta__item">
      ${icon('hashtag')}
      <span><strong>Category</strong> ${escapeHtml(event.category)}</span>
    </li>
  </ul>`;

export const eventRegistrationTemplate = (event) => {
  if (!event.registrationUrl) return '';
  const isExternal = /^https?:\/\//i.test(event.registrationUrl);
  const href = escapeHtml(event.registrationUrl);
  const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  const label = event.registrationUrl.includes('donate') ? 'Support This Drive' : 'Register Interest';
  return `<a class="btn btn--accent event-aside__cta" href="${href}"${attrs}>${label}${
    isExternal ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''
  }</a>`;
};

export const relatedEventsHeading = 'More Events You May Like';
