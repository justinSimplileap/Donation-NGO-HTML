import { qs, qsa, prefersReducedMotion } from '../core/dom.js';
import { getPosts } from '../services/blog-service.js';
import { getFeaturedCause } from '../services/cause-service.js';
import { blogCardTemplate } from '../templates/blog-card.js';
import { causeCardTemplate } from '../templates/cause-card.js';

const renderError = (container, message) => {
  container.innerHTML = `<p class="data-placeholder">${message}</p>`;
};

async function renderBlogGrid() {
  const grid = qs('[data-blog-grid]');
  if (!grid) return;

  try {
    const posts = await getPosts({ limit: Number(grid.dataset.limit) || 6, order: 'desc' });
    grid.innerHTML = posts.map(blogCardTemplate).join('');
  } catch (error) {
    renderError(grid, 'News could not be loaded right now.');
    console.warn('[home] Could not load posts.', error);
  }
}

function animateProgressBars(scope) {
  const bars = qsa('[data-progress]', scope);
  const fill = (bar) => {
    bar.style.width = `${bar.dataset.progress}%`;
  };

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    bars.forEach(fill);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        fill(entry.target);
      });
    },
    { threshold: 0.5 },
  );
  bars.forEach((bar) => observer.observe(bar));
}

async function renderFeaturedCause() {
  const container = qs('[data-featured-cause]');
  if (!container) return;

  try {
    const cause = await getFeaturedCause();
    if (!cause) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = causeCardTemplate(cause);
    animateProgressBars(container);
  } catch (error) {
    renderError(container, 'Featured cause could not be loaded right now.');
    console.warn('[home] Could not load causes.', error);
  }
}

renderBlogGrid();
renderFeaturedCause();
