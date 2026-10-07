export const qs = (selector, scope = document) => scope.querySelector(selector);

export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersReducedMotion = () => reducedMotionQuery.matches;

export const onReducedMotionChange = (callback) => {
  reducedMotionQuery.addEventListener('change', () => callback(reducedMotionQuery.matches));
};

/** Runs `callback` at most once per animation frame. */
export const rafThrottle = (callback) => {
  let frame = null;
  return (...args) => {
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      callback(...args);
    });
  };
};

export const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');
