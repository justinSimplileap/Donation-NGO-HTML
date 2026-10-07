import { qs } from '../core/dom.js';
import { animateProgressBars } from '../components/progress-bar.js';
import { apiClient } from '../services/api-client.js';
import { imageTileTemplate } from '../templates/image-tile.js';

async function renderStoryGrid() {
  const grid = qs('[data-story-grid]');
  if (!grid) return;

  try {
    const { stories = [] } = await apiClient.get('aboutStories');
    grid.innerHTML = stories.length
      ? stories.map((story) => imageTileTemplate(story)).join('')
      : '<li class="data-placeholder">Stories could not be loaded right now.</li>';
  } catch (error) {
    grid.innerHTML = '<li class="data-placeholder">Stories could not be loaded right now.</li>';
    console.warn('[about] Could not load stories.', error);
  }
}

renderStoryGrid();
animateProgressBars(qs('.journey'));
