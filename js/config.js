/**
 * Data source configuration.
 *
 * `local`  – reads the JSON files in /data (current development mode).
 * `remote` – calls a REST API / headless CMS at `apiBaseUrl`.
 */
export const config = {
  dataSource: 'local',
  apiBaseUrl: '',
  localDataUrl: new URL('../data/', import.meta.url),
  routes: {
    blogSingle: 'blog-single.html',
    donate: 'donate.html',
  },
};
