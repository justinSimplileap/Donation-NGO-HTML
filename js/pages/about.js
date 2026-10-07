import { qs } from '../core/dom.js';
import { animateProgressBars } from '../components/progress-bar.js';
import { getPosts } from '../services/blog-service.js';
import { postUrl } from '../templates/blog-card.js';
import { imageTileTemplate } from '../templates/image-tile.js';

async function renderStoryGrid() {
  const grid = qs('[data-story-grid]');
  if (!grid) return;

  try {
    const posts = await getPosts({ limit: Number(grid.dataset.limit) || 6, order: 'desc' });
    grid.innerHTML = posts
      .map((post) => imageTileTemplate({ href: postUrl(post), title: post.title, image: post.image }))
      .join('');
  } catch (error) {
    grid.innerHTML = '<li class="data-placeholder">Stories could not be loaded right now.</li>';
    console.warn('[about] Could not load stories.', error);
  }
}

renderStoryGrid();
animateProgressBars(qs('.journey'));
