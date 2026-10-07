import { qs, qsa } from '../core/dom.js';

/**
 * Image lightbox on <dialog>. Triggers: [data-gallery-open] with index into the items array.
 */
export function initGalleryLightbox(items, scope = document) {
  const triggers = qsa('[data-gallery-open]', scope);
  if (triggers.length === 0 || typeof HTMLDialogElement !== 'function') return;

  let dialog = null;
  let figure = null;
  let caption = null;
  let lastTrigger = null;
  let activeIndex = 0;
  let visibleItems = items;

  const build = () => {
    dialog = document.createElement('dialog');
    dialog.className = 'gallery-lightbox';
    dialog.innerHTML = `
      <button class="gallery-lightbox__close" type="button" aria-label="Close image">
        <svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#icon-close"></use></svg>
      </button>
      <button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" aria-label="Previous image">
        <svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#icon-chevron-left"></use></svg>
      </button>
      <button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" aria-label="Next image">
        <svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#icon-chevron-right"></use></svg>
      </button>
      <figure class="gallery-lightbox__figure">
        <img class="gallery-lightbox__img" alt="">
        <figcaption class="gallery-lightbox__caption"></figcaption>
      </figure>`;
    figure = dialog.querySelector('.gallery-lightbox__figure');
    caption = dialog.querySelector('.gallery-lightbox__caption');

    dialog.querySelector('.gallery-lightbox__close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.gallery-lightbox__nav--prev').addEventListener('click', () => show(activeIndex - 1));
    dialog.querySelector('.gallery-lightbox__nav--next').addEventListener('click', () => show(activeIndex + 1));
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('is-locked');
      lastTrigger?.focus();
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        show(activeIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        show(activeIndex + 1);
      }
    });
    document.body.append(dialog);
  };

  const render = (item) => {
    const image = item.image ?? item.thumbnail;
    const img = dialog.querySelector('.gallery-lightbox__img');
    img.src = image.src;
    img.width = image.width;
    img.height = image.height;
    img.alt = item.alt || item.title || '';
    caption.textContent = item.title || '';
    dialog.setAttribute('aria-label', item.title || 'Gallery image');
  };

  const show = (index) => {
    if (!visibleItems.length) return;
    activeIndex = (index + visibleItems.length) % visibleItems.length;
    render(visibleItems[activeIndex]);
  };

  const open = (trigger) => {
    if (!dialog) build();
    const grid = qs('[data-gallery-grid]', scope);
    const category = grid?.dataset.activeCategory ?? 'all';
    visibleItems =
      category && category !== 'all'
        ? items.filter((item) => item.category.toLowerCase() === category.toLowerCase())
        : items;
    const index = Number(trigger.dataset.galleryOpen);
    const item = items[index];
    if (!item) return;
    activeIndex = Math.max(0, visibleItems.findIndex((entry) => entry.id === item.id));
    if (activeIndex < 0) activeIndex = 0;
    lastTrigger = trigger;
    show(activeIndex);
    document.body.classList.add('is-locked');
    dialog.showModal();
    dialog.querySelector('.gallery-lightbox__close').focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => open(trigger));
  });
}
