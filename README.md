# Donation-NGO-HTML

A static, multi-page charity/NGO website built with plain HTML5, CSS3 and vanilla JavaScript (ES modules). There are no frameworks, build tools or runtime dependencies.

The Home page (`index.html`) is implemented. About, Contact, Gallery, Events, Blogs and Donate already have links and routes in place, but the pages themselves haven't been built yet.

## Running locally

ES modules and `fetch()` don't work over `file://`, so serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Project structure

```
index.html              Home page
assets/
  fonts/                Self-hosted Jost and Yantramanav (woff2)
  icons/                SVG sprite and favicon
  images/               WebP photography, icons and PNG shape masks
css/
  reset.css             Minimal reset
  variables.css         Design tokens (colours, type, spacing, z-index)
  base.css              Element defaults and typography
  layout.css            Container, header, footer, grid helpers
  components.css        Buttons, cards, accordion, slider, forms, etc.
  animations.css        Keyframes, scroll reveal, reduced-motion overrides
  pages/home.css        Home page sections
  responsive.css        Breakpoint overrides (1280 / 1024 / 767 / 480 / 360)
data/
  blogs.json            Blog posts
  causes.json           Causes / fundraising campaigns
js/
  config.js             Data source (local JSON or remote API) and routes
  main.js               Site-wide behaviour (navigation, newsletter, reveal)
  core/                 DOM and formatting helpers
  components/           Slider, accordion, counter, parallax, navigation, ...
  services/             API client and domain services (blog, cause, newsletter)
  templates/            HTML template functions for cards and list items
  pages/home.js         Home page wiring
```

## Data layer

The UI never reads JSON directly. Requests flow like this:

```
page script -> service (blog-service, cause-service) -> api-client -> data/*.json
```

To switch to a real backend, set `dataSource: 'remote'` and `apiBaseUrl` in `js/config.js`. Then map the resources in `js/services/api-client.js` to the API's endpoints.

## Accessibility and motion

- Semantic landmarks, ARIA labelling, a skip link and visible focus styles.
- The mobile navigation traps focus and closes on Escape or an outside click.
- Sliders work with the arrow keys, swipe and dot buttons. Inactive slides are marked `inert`.
- `prefers-reduced-motion` turns off autoplay, parallax, the Ken Burns effect and scroll reveals.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari.
