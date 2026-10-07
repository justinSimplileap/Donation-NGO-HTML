import { qs } from '../core/dom.js';
import { initAccordions } from '../components/accordion.js';
import { getLatestPost, getPostBySlug } from '../services/blog-service.js';
import { postUrl } from '../templates/blog-card.js';
import { authorBoxTemplate, postBodyTemplate, postInfoTemplate, shareLinksTemplate } from '../templates/post-single.js';

const SITE_NAME = 'ONG Donation';

const elements = {
  hero: qs('[data-post-hero]'),
  title: qs('[data-post-title]'),
  category: qs('[data-post-category]'),
  info: qs('[data-post-info]'),
  infoBlock: qs('[data-post-info-block]'),
  article: qs('[data-post]'),
  authorBox: qs('[data-author-box]'),
  comments: qs('[data-post-comments]'),
};

const setMeta = (selector, attribute, value) => qs(selector)?.setAttribute(attribute, value);

const absoluteUrl = (path) => new URL(path, window.location.href).href;

function updateDocumentMeta(post) {
  const url = absoluteUrl(postUrl(post));
  document.title = `${post.title} – ${SITE_NAME} Blog`;
  setMeta('meta[name="description"]', 'content', post.excerpt);
  setMeta('link[rel="canonical"]', 'href', url);
  setMeta('meta[property="og:type"]', 'content', 'article');
  setMeta('meta[property="og:title"]', 'content', post.title);
  setMeta('meta[property="og:description"]', 'content', post.excerpt);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[property="og:image"]', 'content', absoluteUrl(post.cover.src));
}

function renderPost(post) {
  const url = absoluteUrl(postUrl(post));
  updateDocumentMeta(post);

  elements.hero.style.backgroundImage = `url("${encodeURI(post.cover.src)}")`;
  elements.title.textContent = post.title;
  elements.category.textContent = post.category;

  elements.info.innerHTML = postInfoTemplate(post);
  elements.article.innerHTML = `
    <div class="post__body">${postBodyTemplate(post.content, { url })}</div>
    ${shareLinksTemplate({ url, title: post.title })}`;
  initAccordions(elements.article);

  if (post.author) {
    elements.authorBox.innerHTML = authorBoxTemplate(post.author);
    elements.authorBox.hidden = false;
  }
  elements.comments.hidden = false;
}

function renderMessage(title, heading, message) {
  elements.title.textContent = title;
  elements.category.textContent = 'Stories of Hope From the Field';
  elements.infoBlock.hidden = true;
  elements.article.innerHTML = `
    <div class="post__body">
      <h2 class="post__heading">${heading}</h2>
      <p class="post__text">${message}</p>
      <p><a class="btn btn--accent" href="blogs.html">Browse all posts</a></p>
    </div>`;
}

async function initPost() {
  if (!elements.article) return;
  const slug = new URLSearchParams(window.location.search).get('slug');

  try {
    const post = slug ? await getPostBySlug(slug) : await getLatestPost();
    if (post) {
      renderPost(post);
      return;
    }
    document.title = `Post Not Found – ${SITE_NAME}`;
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.append(robots);
    renderMessage('Post Not Found', 'We couldn’t find that story', 'It may have been moved, or the link may be incomplete.');
  } catch (error) {
    renderMessage('Story Unavailable', 'Something went wrong', 'This story could not be loaded right now. Please try again in a moment.');
    console.warn('[blog-single] Could not load post.', error);
  }
}

initPost();
