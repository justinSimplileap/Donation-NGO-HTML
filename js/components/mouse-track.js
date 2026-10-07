import { qsa, prefersReducedMotion, onReducedMotionChange } from '../core/dom.js';

const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1025px)');
const EASING = 0.08;

/**
 * Pointer-driven drift: elements move away from the cursor.
 *  - data-mouse-track="24"   maximum shift in px from the resting position
 * Uses the `translate` property so it never fights reveal/parallax transforms.
 * Disabled for touch, tablet/mobile layouts and reduced motion.
 */
export function initMouseTrack(scope = document) {
  const items = qsa('[data-mouse-track]', scope).map((el) => ({
    el,
    range: Number(el.dataset.mouseTrack) || 20,
  }));
  if (items.length === 0) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let frame = null;
  let active = false;

  const render = () => {
    currentX += (targetX - currentX) * EASING;
    currentY += (targetY - currentY) * EASING;
    items.forEach(({ el, range }) => {
      el.style.translate = `${(currentX * range).toFixed(2)}px ${(currentY * range).toFixed(2)}px`;
    });
    const settled = Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001;
    frame = settled ? null : requestAnimationFrame(render);
  };

  const requestRender = () => {
    if (frame === null) frame = requestAnimationFrame(render);
  };

  const onPointerMove = (event) => {
    targetX = -((event.clientX / window.innerWidth) * 2 - 1);
    targetY = -((event.clientY / window.innerHeight) * 2 - 1);
    requestRender();
  };

  const onPointerLeave = () => {
    targetX = 0;
    targetY = 0;
    requestRender();
  };

  const enable = () => {
    if (active) return;
    active = true;
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
  };

  const disable = () => {
    if (!active) return;
    active = false;
    window.removeEventListener('pointermove', onPointerMove);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    targetX = targetY = currentX = currentY = 0;
    items.forEach(({ el }) => {
      el.style.translate = '';
    });
  };

  const sync = () => (finePointerQuery.matches && !prefersReducedMotion() ? enable() : disable());
  finePointerQuery.addEventListener('change', sync);
  onReducedMotionChange(sync);
  sync();
}
