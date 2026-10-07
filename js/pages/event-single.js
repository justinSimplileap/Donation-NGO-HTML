import { qs } from '../core/dom.js';
import { escapeHtml } from '../core/format.js';
import { eventUrl } from '../templates/event-card.js';
import {
  eventBodyTemplate,
  eventDetailsTemplate,
  eventGalleryTemplate,
  eventMetaTemplate,
  eventRegistrationTemplate,
  relatedEventsHeading,
} from '../templates/event-single.js';
import { eventCardTemplate } from '../templates/event-card.js';
import { getEventBySlug, getLatestEvent, getRelatedEvents } from '../services/event-service.js';

const SITE_NAME = 'ONG Donation';

const elements = {
  hero: qs('[data-event-hero]'),
  title: qs('[data-event-title]'),
  category: qs('[data-event-category]'),
  article: qs('[data-event]'),
  aside: qs('[data-event-aside]'),
  related: qs('[data-related-events]'),
};

const setMeta = (selector, attribute, value) => qs(selector)?.setAttribute(attribute, value);

const absoluteUrl = (path) => new URL(path, window.location.href).href;

function updateDocumentMeta(event) {
  const url = absoluteUrl(eventUrl(event));
  document.title = `${event.title} – ${SITE_NAME} Events`;
  setMeta('meta[name="description"]', 'content', event.excerpt);
  setMeta('link[rel="canonical"]', 'href', url);
  setMeta('meta[property="og:type"]', 'content', 'article');
  setMeta('meta[property="og:title"]', 'content', event.title);
  setMeta('meta[property="og:description"]', 'content', event.excerpt);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[property="og:image"]', 'content', absoluteUrl(event.cover.src));
}

function renderEvent(event) {
  updateDocumentMeta(event);
  elements.hero.style.backgroundImage = `url("${encodeURI(event.cover.src)}")`;
  elements.title.textContent = event.title;
  elements.category.textContent = event.category;

  elements.article.innerHTML = `
    <figure class="event__figure">
      <img class="event__cover" src="${escapeHtml(event.image.src)}" alt="${escapeHtml(event.image.alt ?? '')}"
        width="${event.image.width}" height="${event.image.height}" loading="eager" decoding="async">
    </figure>
    <div class="event__body">
      ${eventBodyTemplate(event.content)}
      ${eventDetailsTemplate(event.details)}
      ${eventGalleryTemplate(event.gallery)}
    </div>`;

  elements.aside.innerHTML = `
    <h2 class="event-aside__title">Event Info</h2>
    ${eventMetaTemplate(event)}
    ${eventRegistrationTemplate(event)}
    <p class="event-aside__note">Registration on this demo site sends you to our contact or donate pages. No live ticketing is connected.</p>`;
}

async function renderRelated(slug) {
  if (!elements.related) return;
  const related = await getRelatedEvents(slug, 3);
  if (!related.length) {
    elements.related.hidden = true;
    return;
  }
  elements.related.hidden = false;
  elements.related.innerHTML = `
    <div class="container related-events__inner">
      <header class="section-heading section-heading--center related-events__header" data-reveal="fade-up" data-reveal-delay="200">
        <p class="eyebrow eyebrow--info">Stay Involved</p>
        <h2 class="section-title">${relatedEventsHeading}</h2>
      </header>
      <div class="event-grid related-events__grid" data-reveal="fade" data-reveal-delay="200">
        ${related.map(eventCardTemplate).join('')}
      </div>
    </div>`;
}

function renderMessage(title, heading, message) {
  elements.title.textContent = title;
  elements.category.textContent = 'Gather, Give and Grow Together';
  elements.aside.hidden = true;
  elements.article.innerHTML = `
    <div class="event__body">
      <h2 class="event__subheading">${heading}</h2>
      <p class="event__text">${message}</p>
      <p><a class="btn btn--accent" href="events.html">Browse all events</a></p>
    </div>`;
  if (elements.related) elements.related.hidden = true;
}

async function initEventSingle() {
  if (!elements.article) return;
  const slug = new URLSearchParams(window.location.search).get('slug');

  try {
    const event = slug ? await getEventBySlug(slug) : await getLatestEvent();
    if (event) {
      renderEvent(event);
      await renderRelated(event.slug);
      return;
    }
    document.title = `Event Not Found – ${SITE_NAME}`;
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.append(robots);
    renderMessage('Event Not Found', 'We couldn’t find that event', 'It may have been moved, or the link may be incomplete.');
  } catch (error) {
    renderMessage('Event Unavailable', 'Something went wrong', 'This event could not be loaded right now. Please try again in a moment.');
    console.warn('[event-single] Could not load event.', error);
  }
}

initEventSingle();
