import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages (subpath) — demo default:
const SITE = 'https://sandra-cabedo.github.io';
const BASE = '/sandra-cabedo-fotografia/';

// Custom domain (later) — the ONLY change needed:
// const SITE = 'https://sandracabedofotografia.es';
// const BASE = '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
