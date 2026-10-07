import { qsa, prefersReducedMotion, rafThrottle } from '../core/dom.js';

const VIEWPORT_INSET = 0.08;

let observer = null;
const pending = new Set();

const reveal = (el) => {
  el.classList.add('is-revealed');
  pending.delete(el);
  observer?.unobserve(el);
};

/* Resting position: the hidden state's translate offset is removed from the measured box. */
const restingRect = (el) => {
  const rect = el.getBoundingClientRect();
  const { m42: offsetY } = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  return { top: rect.top - offsetY, bottom: rect.bottom - offsetY };
};

/*
 * Backstop for the observer, which measures the translated box: content near the end of the page
 * can be pushed below the viewport by its own offset, and restored scroll positions fire no events.
 */
const checkPending = rafThrottle(() => {
  const viewportHeight = window.innerHeight;
  const revealLine = viewportHeight * (1 - VIEWPORT_INSET);
  const remainingScroll = Math.max(0, document.documentElement.scrollHeight - window.scrollY - viewportHeight);

  pending.forEach((el) => {
    const { top, bottom } = restingRect(el);
    if (bottom <= 0 || top >= viewportHeight) return;
    const canReachLine = top - remainingScroll < revealLine;
    if (top < revealLine || !canReachLine) reveal(el);
  });

  if (pending.size === 0) {
    window.removeEventListener('scroll', checkPending);
    window.removeEventListener('resize', checkPending);
  }
});

const getObserver = () => {
  observer ??= new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    },
    { rootMargin: `0px 0px -${VIEWPORT_INSET * 100}% 0px`, threshold: 0.05 },
  );
  return observer;
};

/**
 * Scroll reveal: [data-reveal="fade|fade-up|fade-left|fade-right"] with optional data-reveal-delay="ms".
 * Elements are only hidden while the `.js` class is present, so content never depends on JS.
 */
export function initReveal(scope = document) {
  const elements = qsa('[data-reveal]:not(.is-revealed)', scope);

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    elements.forEach(reveal);
    return;
  }

  elements.forEach((el) => {
    if (el.dataset.revealDelay) el.style.setProperty('--reveal-delay', `${el.dataset.revealDelay}ms`);
    pending.add(el);
    getObserver().observe(el);
  });

  if (pending.size === 0) return;
  window.addEventListener('scroll', checkPending, { passive: true });
  window.addEventListener('resize', checkPending);
  window.addEventListener('load', checkPending, { once: true });
  window.addEventListener('pageshow', checkPending);
  checkPending();
}
