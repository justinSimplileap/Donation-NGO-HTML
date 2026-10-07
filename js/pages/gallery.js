import { qs } from '../core/dom.js';
import { escapeHtml } from '../core/format.js';
import { initGalleryLightbox } from '../components/gallery-lightbox.js';
import { getGalleryCategories, getGalleryItems } from '../services/gallery-service.js';
import { galleryItemTemplate } from '../templates/gallery-item.js';

function initGalleryPage() {
  const grid = qs('[data-gallery-grid]');
  const filters = qs('[data-gallery-filters]');
  const status = qs('[data-gallery-status]');
  if (!grid || !filters) return;

  const params = new URLSearchParams(window.location.search);
  let category = (params.get('category') ?? 'all').toLowerCase();
  let items = [];

  const setActiveCategory = (value) => {
    category = value;
    grid.dataset.activeCategory = category;
  };

  const renderFilters = (categories) => {
    const options = ['All', ...categories];
    filters.innerHTML = options
      .map((label) => {
        const id = label === 'All' ? 'all' : label.toLowerCase();
        const href = id === 'all' ? 'gallery.html' : `gallery.html?category=${encodeURIComponent(id)}`;
        return `<li>
          <a class="filter-chip${id === category ? ' is-active' : ''}" href="${href}"
            ${id === category ? ' aria-current="true"' : ''}>${escapeHtml(label)}</a>
        </li>`;
      })
      .join('');
  };

  const renderGrid = () => {
    grid.innerHTML = items.length
      ? items.map((item, index) => galleryItemTemplate(item, index)).join('')
      : '<li class="gallery-grid__empty data-placeholder">No images in this category yet. <a href="gallery.html">View all photos</a>.</li>';
    try {
      initGalleryLightbox(items, grid.parentElement ?? document);
    } catch (error) {
      console.warn('[gallery] Lightbox could not be initialized.', error);
    }
  };

  const updateStatus = () => {
    if (!status) return;
    if (category && category !== 'all') {
      const label = category.charAt(0).toUpperCase() + category.slice(1);
      status.innerHTML = `Showing ${items.length} ${items.length === 1 ? 'photo' : 'photos'} in <strong>${escapeHtml(label)}</strong>. <a href="gallery.html">View all photos</a>`;
      status.hidden = false;
    } else {
      status.hidden = true;
      status.textContent = '';
    }
  };

  setActiveCategory(category);

  Promise.all([getGalleryItems({ category }), getGalleryCategories()])
    .then(([list, categories]) => {
      items = list;
      renderFilters(categories);
      renderGrid();
      updateStatus();
    })
    .catch((error) => {
      const hint =
        window.location.protocol === 'file:'
          ? ' Open this site through a local server (for example <code>python3 -m http.server 8000</code>) instead of the file:// URL.'
          : ' Try a hard refresh. If it continues, check that <code>data/gallery.json</code> is reachable.';
      grid.innerHTML = `<li class="data-placeholder">Gallery could not be loaded right now.${hint}</li>`;
      console.warn('[gallery] Could not load gallery.', error);
    });
}

initGalleryPage();
