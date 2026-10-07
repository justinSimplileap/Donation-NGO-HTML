import { config } from '../config.js';

/** Maps logical API resources to the local JSON files used during development. */
const LOCAL_RESOURCES = {
  posts: 'blogs.json',
  causes: 'causes.json',
  events: 'events.json',
  gallery: 'gallery.json',
};

const cache = new Map();

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const resolveUrl = (resource) => {
  if (config.dataSource === 'remote') {
    return `${config.apiBaseUrl.replace(/\/$/, '')}/${resource}`;
  }
  const file = LOCAL_RESOURCES[resource];
  if (!file) throw new ApiError(`Unknown local resource "${resource}"`, 404);
  return new URL(file, config.localDataUrl).href;
};

export const apiClient = {
  async get(resource) {
    const url = resolveUrl(resource);
    if (!cache.has(url)) {
      const request = fetch(url, { headers: { Accept: 'application/json' } }).then((response) => {
        if (!response.ok) throw new ApiError(`Request failed: ${response.status}`, response.status);
        return response.json();
      });
      cache.set(url, request);
    }
    try {
      return await cache.get(url);
    } catch (error) {
      cache.delete(url);
      throw error;
    }
  },

  async post(resource, body) {
    if (config.dataSource !== 'remote') {
      throw new ApiError(`"${resource}" is not available without a backend`, 501);
    }
    const response = await fetch(resolveUrl(resource), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new ApiError(`Request failed: ${response.status}`, response.status);
    return response.json();
  },
};
