const pageButton = (page, current, { label = String(page), ariaLabel = `Page ${page}`, modifier = '' } = {}) => {
  const isCurrent = page === current && !modifier;
  return `<li><button class="pagination__link${modifier}" type="button" data-page="${page}" aria-label="${ariaLabel}"${
    isCurrent ? ' aria-current="page"' : ''
  }>${label}</button></li>`;
};

/** Numbered pagination with Previous/Next, rendered as buttons for client-side paging. */
export const paginationTemplate = ({ current, total }) => {
  if (total < 2) return '';
  const items = [];
  if (current > 1) {
    items.push(pageButton(current - 1, current, { label: '&laquo; Previous', ariaLabel: 'Previous page', modifier: ' pagination__link--prev' }));
  }
  for (let page = 1; page <= total; page += 1) items.push(pageButton(page, current));
  if (current < total) {
    items.push(pageButton(current + 1, current, { label: 'Next &raquo;', ariaLabel: 'Next page', modifier: ' pagination__link--next' }));
  }
  return `<ul class="pagination__list">${items.join('')}</ul>`;
};
