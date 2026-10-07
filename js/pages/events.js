import { qs } from '../core/dom.js';
import { escapeHtml } from '../core/format.js';
import { getEvents } from '../services/event-service.js';
import { eventCardTemplate } from '../templates/event-card.js';
import { paginationTemplate } from '../templates/pagination.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'community', label: 'Community' },
  { id: 'fundraising', label: 'Fundraising' },
  { id: 'volunteer', label: 'Volunteer' },
];

function initEventsPage() {
  const grid = qs('[data-event-list]');
  const pagination = qs('[data-event-pagination]');
  const status = qs('[data-event-status]');
  const filters = qs('[data-event-filters]');
  if (!grid || !pagination || !filters) return;

  const params = new URLSearchParams(window.location.search);
  let category = (params.get('category') ?? 'all').toLowerCase();
  const perPage = Number(grid.dataset.perPage) || 6;
  let events = [];
  let current = 1;

  const totalPages = () => Math.max(1, Math.ceil(events.length / perPage));

  const renderFilters = () => {
    filters.innerHTML = FILTERS
      .map(
        (filter) => `
      <li>
        <a class="filter-chip${filter.id === category ? ' is-active' : ''}" href="events.html${filter.id === 'all' ? '' : `?category=${encodeURIComponent(filter.id)}`}"
          ${filter.id === category ? ' aria-current="true"' : ''}>${escapeHtml(filter.label)}</a>
      </li>`,
      )
      .join('');
  };

  const render = ({ moveFocus = false } = {}) => {
    const start = (current - 1) * perPage;
    grid.innerHTML = events.length
      ? events.slice(start, start + perPage).map(eventCardTemplate).join('')
      : '<p class="data-placeholder event-grid__empty">No events match this filter. <a href="events.html">View all events</a>.</p>';
    grid.setAttribute('aria-label', totalPages() > 1 ? `Events, page ${current} of ${totalPages()}` : 'Events');
    pagination.innerHTML = paginationTemplate({ current, total: totalPages() });

    if (status) {
      if (category && category !== 'all') {
        const label = FILTERS.find((filter) => filter.id === category)?.label ?? category;
        status.innerHTML = `Showing ${events.length} ${events.length === 1 ? 'event' : 'events'} in <strong>${escapeHtml(label)}</strong>. <a href="events.html">View all events</a>`;
        status.hidden = false;
      } else {
        status.hidden = true;
        status.textContent = '';
      }
    }

    if (moveFocus) {
      grid.focus({ preventScroll: true });
      if (grid.getBoundingClientRect().top < 0) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button || button.getAttribute('aria-current') === 'page') return;
    current = Math.min(totalPages(), Math.max(1, Number(button.dataset.page)));
    render({ moveFocus: true });
  });

  renderFilters();

  getEvents({ category })
    .then((list) => {
      events = list;
      render();
    })
    .catch((error) => {
      grid.innerHTML = '<p class="data-placeholder">Events could not be loaded right now.</p>';
      console.warn('[events] Could not load events.', error);
    });
}

initEventsPage();
