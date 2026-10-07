import { qsa, prefersReducedMotion } from '../core/dom.js';

const EMBED_HOST = 'https://www.youtube-nocookie.com/embed/';
const FADE_IN_DELAY = 1200;

const embedUrl = (id) => {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: id,
    controls: '0',
    disablekb: '1',
    fs: '0',
    rel: '0',
    playsinline: '1',
    iv_load_policy: '3',
    modestbranding: '1',
  });
  return `${EMBED_HOST}${encodeURIComponent(id)}?${params}`;
};

/**
 * Muted, looping YouTube background (privacy-enhanced domain).
 *  - data-bg-video="VIDEO_ID"   data-bg-video-title="Accessible frame title"
 * Shows the video thumbnail as a poster; the iframe is only injected when the
 * element nears the viewport, and never when the user prefers reduced motion.
 */
export function initBackgroundVideos(scope = document) {
  const items = qsa('[data-bg-video]', scope);
  if (items.length === 0) return;

  const load = (el) => {
    const id = el.dataset.bgVideo;
    const frame = document.createElement('iframe');
    frame.className = 'bg-video__frame';
    frame.src = embedUrl(id);
    frame.title = el.dataset.bgVideoTitle || 'Background video';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.addEventListener('load', () => {
      window.setTimeout(() => el.classList.add('is-playing'), FADE_IN_DELAY);
    });
    el.append(frame);
  };

  items.forEach((el) => {
    el.style.setProperty('--bg-video-poster', `url('https://i.ytimg.com/vi/${el.dataset.bgVideo}/maxresdefault.jpg')`);
  });

  if (prefersReducedMotion()) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(load);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        load(entry.target);
      });
    },
    { rootMargin: '300px 0px' },
  );
  items.forEach((el) => observer.observe(el));
}
