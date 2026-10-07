import { qsa } from '../core/dom.js';

const EMBED_HOST = 'https://www.youtube-nocookie.com/embed/';

/**
 * YouTube lightbox built on <dialog> (focus trap, Esc and inert page come from the platform).
 * Trigger: <a href="https://www.youtube.com/watch?v=ID" data-video-modal="ID" data-video-title="…">
 * Without JavaScript or <dialog> support the link simply opens the video on YouTube.
 */
export function initVideoModals(scope = document) {
  const triggers = qsa('[data-video-modal]', scope);
  if (triggers.length === 0 || typeof HTMLDialogElement !== 'function') return;

  let dialog = null;
  let frameHolder = null;
  let lastTrigger = null;

  const build = () => {
    dialog = document.createElement('dialog');
    dialog.className = 'video-modal';
    dialog.innerHTML = `
      <button class="video-modal__close" type="button" aria-label="Close video">
        <svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#icon-close"></use></svg>
      </button>
      <div class="video-modal__frame"></div>`;
    frameHolder = dialog.querySelector('.video-modal__frame');

    dialog.querySelector('.video-modal__close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      frameHolder.replaceChildren();
      document.body.classList.remove('is-locked');
      lastTrigger?.focus();
    });
    document.body.append(dialog);
  };

  const open = (trigger) => {
    if (!dialog) build();
    lastTrigger = trigger;
    const id = encodeURIComponent(trigger.dataset.videoModal);
    const title = trigger.dataset.videoTitle || 'Video';

    const frame = document.createElement('iframe');
    frame.src = `${EMBED_HOST}${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
    frame.title = title;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';

    dialog.setAttribute('aria-label', title);
    frameHolder.replaceChildren(frame);
    document.body.classList.add('is-locked');
    dialog.showModal();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      open(trigger);
    });
  });
}
