import { qs, qsa, focusableSelector } from '../core/dom.js';

const desktopQuery = window.matchMedia('(min-width: 1025px)');

/* ---------- Dropdown sub-menus ---------- */
function initDropdowns(header) {
  const dropdowns = qsa('[data-dropdown]', header);

  const setOpen = (item, open) => {
    item.classList.toggle('is-open', open);
    qs('[data-dropdown-toggle]', item)?.setAttribute('aria-expanded', String(open));
  };

  const closeAll = (except) => dropdowns.forEach((item) => item !== except && setOpen(item, false));

  dropdowns.forEach((item) => {
    const toggle = qs('[data-dropdown-toggle]', item);
    toggle?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      closeAll(item);
      setOpen(item, open);
    });

    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !item.classList.contains('is-open')) return;
      event.stopPropagation();
      setOpen(item, false);
      toggle?.focus();
    });

    item.addEventListener('focusout', (event) => {
      if (desktopQuery.matches && !item.contains(event.relatedTarget)) setOpen(item, false);
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-dropdown]')) closeAll();
  });

  return { closeAll };
}

/* ---------- Mobile navigation panel ---------- */
function initMobileNav(header, dropdowns) {
  const toggle = qs('[data-nav-toggle]', header);
  const nav = qs('[data-nav]', header);
  if (!toggle || !nav) return;

  const label = qs('[data-nav-toggle-label]', toggle);
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const setOpen = (open, { restoreFocus = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close menu' : 'Open menu';
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-nav-open', open);
    document.body.classList.toggle('is-locked', open);
    if (!open) dropdowns.closeAll();
    if (open) qs(focusableSelector, nav)?.focus({ preventScroll: true });
    if (!open && restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      setOpen(false, { restoreFocus: true });
      return;
    }

    if (event.key === 'Tab') {
      const focusables = [toggle, ...qsa(focusableSelector, nav)].filter((el) => el.offsetParent !== null);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && !nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a[href]')) setOpen(false);
  });

  desktopQuery.addEventListener('change', (event) => {
    if (event.matches && isOpen()) setOpen(false);
  });
}

export function initNavigation() {
  const header = qs('[data-header]');
  if (!header) return;
  const dropdowns = initDropdowns(header);
  initMobileNav(header, dropdowns);
}
