import { qs } from '../core/dom.js';
import { initDonationForm } from '../components/donation-form.js';
import { animateProgressBars } from '../components/progress-bar.js';
import { getCauseBySlug, getListedCauses } from '../services/cause-service.js';
import { parseAmount } from '../services/donation-service.js';
import { causeCardTemplate } from '../templates/cause-card.js';
import { paginationTemplate } from '../templates/pagination.js';

const formElement = qs('[data-donation-form]');
const donationForm = formElement ? initDonationForm(formElement) : null;

const updateCauseParam = (slug) => {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set('cause', slug);
  else url.searchParams.delete('cause');
  window.history.replaceState(null, '', url);
};

/* Pre-fill from links such as donate.html?amount=25&cause=make-a-change (Home widget, cause cards). */
async function applyUrlParams() {
  if (!donationForm) return;
  const params = new URLSearchParams(window.location.search);

  if (params.has('amount')) {
    const { cents } = parseAmount(params.get('amount'));
    if (cents) donationForm.setAmount(cents);
  }

  try {
    const cause = await getCauseBySlug(params.get('cause'));
    if (cause) donationForm.setCause(cause);
  } catch (error) {
    console.warn('[donate] Could not load causes.', error);
  }
}

/* ---------- Cause grid with client-side pagination ---------- */
function initCauseGrid() {
  const grid = qs('[data-cause-grid]');
  const pagination = qs('[data-cause-pagination]');
  if (!grid || !pagination) return;

  const perPage = Number(grid.dataset.perPage) || 2;
  let causes = [];
  let current = 1;

  const totalPages = () => Math.max(1, Math.ceil(causes.length / perPage));

  const render = ({ moveFocus = false } = {}) => {
    const start = (current - 1) * perPage;
    grid.innerHTML = causes
      .slice(start, start + perPage)
      .map((cause) => causeCardTemplate(cause, { layout: 'stacked' }))
      .join('');
    grid.setAttribute('aria-label', `Causes, page ${current} of ${totalPages()}`);
    pagination.innerHTML = paginationTemplate({ current, total: totalPages() });
    animateProgressBars(grid);

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

  grid.addEventListener('click', (event) => {
    const link = event.target.closest('[data-cause-donate]');
    if (!link || !donationForm) return;
    const cause = causes.find((item) => item.slug === link.dataset.causeDonate);
    if (!cause) return;
    event.preventDefault();
    donationForm.setCause(cause);
    updateCauseParam(cause.slug);
    donationForm.focusForm();
  });

  getListedCauses()
    .then((list) => {
      causes = list;
      render();
    })
    .catch((error) => {
      grid.innerHTML = '<p class="data-placeholder">Causes could not be loaded right now.</p>';
      console.warn('[donate] Could not load causes.', error);
    });
}

formElement?.addEventListener('click', (event) => {
  if (event.target.closest('[data-cause-clear]')) updateCauseParam(null);
});

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href="#donation-form"]');
  if (!link || !donationForm) return;
  event.preventDefault();
  donationForm.focusForm();
});

applyUrlParams();
initCauseGrid();
