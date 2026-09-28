import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Custom domain:
const SITE = 'https://sandracabedo.es';
const BASE = '/';

// GitHub Pages (subpath) — previous demo default:
// const SITE = 'https://sandra-cabedo.github.io';
// const BASE = '/sandra-cabedo-fotografia/';

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
