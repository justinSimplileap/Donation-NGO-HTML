import { config } from '../config.js';
import { escapeHtml, formatDate, formatEventDay, formatEventMonth, formatTime } from '../core/format.js';

export const eventUrl = (event) => `${config.routes.eventSingle}?slug=${encodeURIComponent(event.slug)}`;

export const eventCardTemplate = (event) => `
  <article class="event-card">
    <a class="event-card__media" href="${eventUrl(event)}" tabindex="-1" aria-hidden="true">
      <img class="event-card__image" src="${escapeHtml(event.image.src)}" alt=""
        width="${event.image.width}" height="${event.image.height}" loading="lazy" decoding="async">
      <span class="event-card__date" aria-hidden="true">
        <span class="event-card__day">${escapeHtml(formatEventDay(event.date))}</span>
        <span class="event-card__month">${escapeHtml(formatEventMonth(event.date))}</span>
      </span>
    </a>
    <div class="event-card__body">
      <p class="event-card__category">${escapeHtml(event.category)}</p>
      <h3 class="event-card__title">
        <a class="event-card__link" href="${eventUrl(event)}">${escapeHtml(event.title)}</a>
      </h3>
      <p class="event-card__excerpt">${escapeHtml(event.excerpt)}</p>
      <ul class="event-card__meta">
        <li><svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#icon-calendar"></use></svg>${escapeHtml(formatDate(event.date))}</li>
        <li><svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#icon-clock"></use></svg>${escapeHtml(formatTime(event.startTime))}</li>
        <li><svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#icon-map-pin"></use></svg>${escapeHtml(event.location)}</li>
      </ul>
      <a class="btn btn--accent event-card__btn" href="${eventUrl(event)}">View Event</a>
    </div>
  </article>`;
