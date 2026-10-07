import { qs, qsa, prefersReducedMotion } from '../core/dom.js';

const DURATION = 350;
const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

/**
 * Progressive enhancement for <details> accordions: smooth height animation and
 * (unless data-accordion="multiple") only one item open at a time.
 * Without JS the native <details> behaviour still works.
 */
function initAccordion(root) {
  const items = qsa('details', root);
  const exclusive = root.dataset.accordion !== 'multiple';

  const animateItem = (item, open) => {
    const summary = qs('summary', item);
    const startHeight = item.offsetHeight;

    item.running?.cancel();

    if (open) item.open = true;
    const border = item.offsetHeight - item.clientHeight;
    const endHeight = (open ? item.scrollHeight : summary.offsetHeight) + border;

    if (prefersReducedMotion() || startHeight === endHeight) {
      item.open = open;
      return;
    }

    item.style.overflow = 'hidden';
    const animation = item.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      { duration: DURATION, easing: EASING },
    );
    item.running = animation;
    item.classList.toggle('is-closing', !open);

    animation.onfinish = () => {
      item.open = open;
      item.classList.remove('is-closing');
      item.style.overflow = '';
      item.running = null;
    };
    animation.oncancel = () => {
      item.classList.remove('is-closing');
      item.style.overflow = '';
    };
  };

  items.forEach((item) => {
    qs('summary', item).addEventListener('click', (event) => {
      event.preventDefault();
      const willOpen = !item.open || item.classList.contains('is-closing');

      if (willOpen && exclusive) {
        items.forEach((other) => {
          if (other !== item && other.open && !other.classList.contains('is-closing')) {
            animateItem(other, false);
          }
        });
      }
      animateItem(item, willOpen);
    });
  });
}

export function initAccordions(scope = document) {
  qsa('[data-accordion]', scope).forEach(initAccordion);
}
