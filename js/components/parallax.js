import { qsa, prefersReducedMotion, onReducedMotionChange, rafThrottle } from '../core/dom.js';

const desktopQuery = window.matchMedia('(min-width: 1025px)');
const MAX_SHIFT_Y = 160;

/**
 * Scroll-linked parallax.
 *  - data-parallax="0.08"   vertical shift relative to the viewport centre (negative = opposite direction)
 *  - data-parallax-x="60"   horizontal shift range in px while the element crosses the viewport
 *  - data-parallax-bg="main" background layer taller than its parent (height set in CSS) that drifts
 *                           down by the extra height while the element matched by the selector
 *                           (default: the parent) crosses the viewport. A tall progress element
 *                           gives a gentle drift.
 * Positions are measured on the parent so the transform never feeds back into the measurement.
 * Disabled on tablet/mobile layouts and when the user prefers reduced motion.
 */
export function initParallax(scope = document) {
  const items = qsa('[data-parallax], [data-parallax-x], [data-parallax-bg]', scope).map((el) => ({
    el,
    anchor: el.parentElement,
    factorY: Number(el.dataset.parallax) || 0,
    rangeX: Number(el.dataset.parallaxX) || 0,
    isBackground: el.hasAttribute('data-parallax-bg'),
    progressEl: (el.dataset.parallaxBg && el.closest(el.dataset.parallaxBg)) || el.parentElement,
    visible: false,
  }));
  if (items.length === 0) return;

  const isEnabled = () => desktopQuery.matches && !prefersReducedMotion();

  const update = () => {
    const viewportHeight = window.innerHeight;
    items.forEach((item) => {
      if (!item.visible) return;
      const rect = item.anchor.getBoundingClientRect();
      let x = 0;
      let y = 0;
      if (item.isBackground) {
        const range = item.progressEl === item.anchor ? rect : item.progressEl.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (viewportHeight - range.top) / (viewportHeight + range.height)));
        y = -(item.el.offsetHeight - rect.height) * (1 - progress);
      } else if (item.factorY) {
        const raw = (rect.top + rect.height / 2 - viewportHeight / 2) * item.factorY;
        y = Math.max(-MAX_SHIFT_Y, Math.min(MAX_SHIFT_Y, raw));
      }
      if (item.rangeX) {
        const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        x = (Math.min(1, Math.max(0, progress)) - 0.5) * -2 * item.rangeX;
      }
      item.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
  };

  const onScroll = rafThrottle(update);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        items.forEach((item) => {
          if (item.anchor === entry.target) item.visible = entry.isIntersecting;
        });
      });
      onScroll();
    },
    { rootMargin: '200px 0px' },
  );

  let active = false;

  const enable = () => {
    if (active) return;
    active = true;
    new Set(items.map((item) => item.anchor)).forEach((anchor) => observer.observe(anchor));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  };

  const disable = () => {
    if (!active) return;
    active = false;
    observer.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    items.forEach((item) => {
      item.visible = false;
      item.el.style.transform = '';
    });
  };

  const sync = () => (isEnabled() ? enable() : disable());
  desktopQuery.addEventListener('change', sync);
  onReducedMotionChange(sync);
  sync();
}
