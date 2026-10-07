import { qs, qsa, prefersReducedMotion } from '../core/dom.js';

const SWIPE_THRESHOLD = 50;

/**
 * Generic, data-attribute driven slider.
 *
 * Markup: [data-slider] > .slider__viewport > [data-slider-track] > [data-slide]*
 * Optional: [data-slider-dots], [data-slider-prev], [data-slider-next]
 * Options:  data-autoplay="ms", data-loop, data-effect="fade"
 */
export function initSlider(root) {
  const track = qs('[data-slider-track]', root);
  const slides = qsa('[data-slide]', root);
  if (!track || slides.length === 0) return null;

  const viewport = track.parentElement;
  const dotsContainer = qs('[data-slider-dots]', root);
  const prevButton = qs('[data-slider-prev]', root);
  const nextButton = qs('[data-slider-next]', root);
  const isFade = root.dataset.effect === 'fade';
  const loop = root.hasAttribute('data-loop');
  const autoplayDelay = Number(root.dataset.autoplay) || 0;

  let index = 0;
  let timer = null;
  let isPaused = false;
  let isVisible = true;
  const dots = [];

  if (slides.length < 2) {
    slides[0].classList.add('is-active');
    if (dotsContainer) dotsContainer.hidden = true;
    if (prevButton) prevButton.hidden = true;
    if (nextButton) nextButton.hidden = true;
    return null;
  }

  if (dotsContainer) {
    dotsContainer.setAttribute('role', 'group');
    dotsContainer.setAttribute('aria-label', 'Choose slide');
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider__dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goTo(i);
        restartAutoplay();
      });
      dotsContainer.append(dot);
      dots.push(dot);
    });
  }

  const normalise = (i) => {
    if (loop) return (i + slides.length) % slides.length;
    return Math.max(0, Math.min(slides.length - 1, i));
  };

  const setTrackOffset = (dragPx = 0) => {
    if (isFade) return;
    track.style.transform = `translate3d(calc(${-index * 100}% + ${dragPx}px), 0, 0)`;
  };

  function goTo(target) {
    index = normalise(target);
    setTrackOffset();

    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });

    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));

    if (!loop) {
      if (prevButton) prevButton.disabled = index === 0;
      if (nextButton) nextButton.disabled = index === slides.length - 1;
    }
  }

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  /* ---------- Autoplay ---------- */
  const canAutoplay = () => autoplayDelay > 0 && !prefersReducedMotion();

  function stopAutoplay() {
    window.clearTimeout(timer);
    timer = null;
  }

  function scheduleAutoplay() {
    stopAutoplay();
    if (!canAutoplay() || isPaused || !isVisible || document.hidden) return;
    timer = window.setTimeout(() => {
      if (!loop && index === slides.length - 1) goTo(0);
      else next();
      scheduleAutoplay();
    }, autoplayDelay);
  }

  function restartAutoplay() {
    if (timer !== null) scheduleAutoplay();
  }

  const pause = () => {
    isPaused = true;
    stopAutoplay();
  };

  const resume = () => {
    isPaused = false;
    scheduleAutoplay();
  };

  if (autoplayDelay > 0) {
    viewport.setAttribute('aria-live', canAutoplay() ? 'off' : 'polite');
    root.addEventListener('pointerenter', pause);
    root.addEventListener('pointerleave', resume);
    root.addEventListener('focusin', pause);
    root.addEventListener('focusout', (event) => {
      if (!root.contains(event.relatedTarget)) resume();
    });
    document.addEventListener('visibilitychange', scheduleAutoplay);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        scheduleAutoplay();
      }).observe(root);
    }
  } else {
    viewport.setAttribute('aria-live', 'polite');
  }

  /* ---------- Buttons & keyboard ---------- */
  prevButton?.addEventListener('click', () => {
    prev();
    restartAutoplay();
  });
  nextButton?.addEventListener('click', () => {
    next();
    restartAutoplay();
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') prev();
    else if (event.key === 'ArrowRight') next();
    else return;
    event.preventDefault();
    if (document.activeElement?.classList.contains('slider__dot')) dots[index]?.focus();
  });

  /* ---------- Pointer swipe ---------- */
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let pointerId = null;
  let isDragging = false;

  viewport.addEventListener('dragstart', (event) => event.preventDefault());

  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    deltaX = 0;
    isDragging = false;
  });

  viewport.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    if (!isDragging) {
      if (Math.abs(deltaX) < 8 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      isDragging = true;
      root.classList.add('is-dragging');
      viewport.setPointerCapture(pointerId);
    }
    setTrackOffset(deltaX);
  });

  const endDrag = (event) => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    if (!isDragging) return;
    isDragging = false;
    root.classList.remove('is-dragging');

    if (deltaX <= -SWIPE_THRESHOLD) next();
    else if (deltaX >= SWIPE_THRESHOLD) prev();
    else setTrackOffset();
    restartAutoplay();
  };

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  viewport.addEventListener(
    'click',
    (event) => {
      if (Math.abs(deltaX) >= 8) {
        event.preventDefault();
        event.stopPropagation();
        deltaX = 0;
      }
    },
    true,
  );

  goTo(0);
  scheduleAutoplay();

  return { goTo, next, prev, pause, resume };
}

export function initSliders(scope = document) {
  return qsa('[data-slider]', scope).map(initSlider);
}
