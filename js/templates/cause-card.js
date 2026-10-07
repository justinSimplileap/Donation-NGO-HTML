import { config } from '../config.js';
import { escapeHtml, formatCurrency } from '../core/format.js';

export const causeProgress = (cause) =>
  cause.goal > 0 ? Math.min(100, Math.round((cause.raised / cause.goal) * 100)) : 0;

/** `layout: 'stacked'` places the image above the content (grid listings). */
export const causeCardTemplate = (cause, { layout = 'row' } = {}) => {
  const progress = causeProgress(cause);
  const donateUrl = `${config.routes.donate}?cause=${encodeURIComponent(cause.slug)}`;
  const modifier = layout === 'stacked' ? ' cause-card--stacked' : '';
  return `
  <article class="cause-card${modifier}">
    <div class="cause-card__media">
      <img src="${escapeHtml(cause.image.src)}" alt="${escapeHtml(cause.image.alt)}"
        width="${cause.image.width}" height="${cause.image.height}" loading="lazy" decoding="async">
    </div>
    <div class="cause-card__body">
      <div class="cause-card__content">
        <h3 class="cause-card__title">${escapeHtml(cause.title)}</h3>
        <p class="cause-card__text">${escapeHtml(cause.excerpt)}</p>
        <a class="btn btn--accent" href="${donateUrl}" data-cause-donate="${escapeHtml(cause.slug)}">Donate<span class="visually-hidden"> to ${escapeHtml(cause.title)}</span></a>
      </div>
      <div class="cause-card__progress">
        <div class="progress" role="progressbar" aria-label="Funds raised for ${escapeHtml(cause.title)}"
          aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
          <span class="progress__bar" data-progress="${progress}"></span>
        </div>
        <div class="cause-card__stats">
          <p class="cause-card__stat">
            <strong>${formatCurrency(cause.raised, cause.currency)}</strong>
            <span>of ${formatCurrency(cause.goal, cause.currency, 'en-US', 0)}</span>
          </p>
          <p class="cause-card__stat cause-card__stat--end">
            <strong>${cause.donations}</strong>
            <span>donation</span>
          </p>
        </div>
      </div>
    </div>
  </article>`;
};
