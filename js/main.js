import { initNavigation } from './components/navigation.js';
import { initSliders } from './components/slider.js';
import { initCounters } from './components/counter.js';
import { initReveal } from './components/reveal.js';
import { initParallax } from './components/parallax.js';
import { initMouseTrack } from './components/mouse-track.js';
import { initAccordions } from './components/accordion.js';
import { initNewsletters } from './components/newsletter.js';
import { renderPostLists } from './components/post-list.js';

/* Shared, site-wide behaviour. Page-specific modules live in js/pages/. */
initNavigation();
initSliders();
initCounters();
initReveal();
initParallax();
initMouseTrack();
initAccordions();
initNewsletters();
renderPostLists();
