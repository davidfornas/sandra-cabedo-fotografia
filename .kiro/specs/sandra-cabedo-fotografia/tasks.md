# Implementation Plan: Sandra Cabedo Fotografía

## Overview

This plan builds the static Astro demo site incrementally. It starts with the project
scaffold and the base-safe configuration layer (`astro.config.mjs`, `src/config/site.ts`,
and the pure helpers `url.ts` / `whatsapp.ts` / `nav.ts`) so that every later component and
page derives its URLs, WhatsApp links, and navigation from a single source. Design tokens
and styles come next, then layouts and reusable components, then the content collection and
the ten pages, then interaction scripts (lightbox, mobile menu), SEO/robots/sitemap,
accessibility wiring, and error handling. The final tasks wire everything together, add the
GitHub Actions deploy workflow and README, and verify a clean `npm run build`.

All UI-facing strings stay in Spanish (e.g. "Reserva tu sesión", "Sígueme en Instagram",
"Fotografía familiar · Castellón"). Tasks marked with `*` are optional (tests and
non-blocking hardening); core implementation tasks are required.

## Tasks

- [x] 1. Scaffold the Astro project and dependencies
  - Initialize an Astro project (`output: 'static'`) with `package.json`, `tsconfig.json`, and the `src/` tree from the design's project structure (`config`, `lib`, `content`, `images`, `layouts`, `components`, `scripts`, `styles`, `pages`)
  - Add runtime deps: `astro`, `@astrojs/sitemap`; dev deps: `vitest`, `fast-check`, `axe-core`, and a lightweight HTML/DOM parser for `dist/` assertions
  - Add `npm` scripts: `dev`, `build`, `preview`, `test`, plus a `check:links` script placeholder
  - Add an `engines` field documenting Node 20 LTS
  - _Requirements: 14.1, 14.2, 14.6, 20.2, 20.3_

- [x] 2. Base-safe configuration and pure helper layer
  - [x] 2.1 Create `astro.config.mjs` as the single source of deployment identity
    - Set `site` to the GitHub Pages URL, `base` to `/sandra-cabedo-fotografia/`, `output: 'static'`, `trailingSlash: 'always'`, and register `sitemap()`
    - Include the commented one-line custom-domain switch (`site` + `base = '/'`)
    - _Requirements: 18.1, 18.5, 18.6, 16.2_

  - [x] 2.2 Create `src/config/site.ts` (brand/nav/WhatsApp/Instagram config)
    - Define `NavItem`, `WhatsAppConfig`, `InstagramConfig`, `BrandConfig`, `SiteConfig` types and the `site` constant
    - Set `whatsapp.message` to the exact Spanish string "Hola Sandra, he visto tu web y me gustaría informarme sobre una sesión de fotos.", `whatsapp.phone` as the single phone constant, brand `name` "Sandra Cabedo Fotografía", `tagline` "Fotografía familiar · Castellón", `locationLabel` "Castellón y alrededores"
    - Do NOT duplicate `site`/`base` here
    - _Requirements: 10.3, 10.4, 13.1, 13.2, 18.6_

  - [x] 2.3 Implement `src/lib/url.ts` (base-safe link/asset helpers)
    - Implement `withBase(path)` composing `import.meta.env.BASE_URL`, collapsing duplicate slashes, and `absoluteUrl(path, site)` for canonical/OG
    - _Requirements: 18.2, 18.3, 18.4, 6.8_

  - [x] 2.4 Implement `src/lib/whatsapp.ts` (WhatsApp URL builder + guard)
    - Implement `isWhatsAppEnabled()` and `whatsappUrl()` returning `wa.me/{digits}?text={encoded message}` or `null` when the phone is empty/whitespace
    - _Requirements: 10.2, 10.3, 10.6_

  - [x] 2.5 Implement `src/lib/nav.ts` (exactly the eight nav items)
    - Return the eight `NavItem`s in order: Inicio, Newborn, Familia, Crecer juntos, Embarazo, Sobre mí, Contacto, sourced from `site.ts`
    - _Requirements: 3.2_

  - [x]* 2.6 Write property test for base-safe URLs
    - **Property 1: Base-safe internal URLs** — generate base ∈ {`/`, `/sandra-cabedo-fotografia/`} and arbitrary paths; assert `withBase(path)` starts with the base and has no duplicate slash at the join; ≥100 iterations, tagged `// Feature: sandra-cabedo-fotografia, Property 1`
    - **Validates: Requirements 18.2, 18.3, 18.5, 6.8**

  - [x]* 2.7 Write property test for WhatsApp URL round trip
    - **Property 3: WhatsApp URL preserves the configured number and message** — generate arbitrary phone formatting and message strings; assert path equals digits-only phone and `decode(text) === message`; ≥100 iterations, tagged Property 3
    - **Validates: Requirements 10.2**

  - [x]* 2.8 Write property test for the WhatsApp disabled path
    - **Property 4: WhatsApp disabled path and hidden phone** — generate empty/whitespace phones with arbitrary messages; assert `isWhatsAppEnabled()===false` and `whatsappUrl()===null`; ≥100 iterations, tagged Property 4
    - **Validates: Requirements 10.6, 10.5**

- [x] 3. Design tokens and global styles
  - [x] 3.1 Create `src/styles/tokens.css` (warm palette + typography tokens)
    - Define background token with relative luminance ≥ 90%, secondary surface tokens with saturation ≤ 20%, warm-gray secondary text and non-pure-black main text tokens each ≥ 4.5:1 contrast on the background, a single warm accent token, spacing/whitespace tokens (≥ 10% side margin), and two font-family tokens (editorial serif for titles, light sans-serif for body/nav/buttons)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 17.1_

  - [x] 3.2 Create `src/styles/base.css` (reset, elements, typography, a11y)
    - Mobile-first reset from 320px, element/typography defaults binding the two font families, visible focus states, skip-link styles, and a `prefers-reduced-motion` block that reduces/suppresses transitions; add CWV-friendly font loading (`font-display`, preload)
    - _Requirements: 2.1, 1.5, 17.2, 17.4, 17.5_

  - [x] 3.3 Create `src/styles/utilities.css` (layout helpers)
    - Container/section/grid helpers enforcing the ≥ 10% whitespace, single-column ≤767px, tablet 768–1023px, desktop ≥1024px layouts with no horizontal overflow, and ≥ 44×44px touch targets with ≥ 8px spacing
    - _Requirements: 1.6, 2.2, 2.3, 2.4, 2.7_

  - [x]* 3.4 Write token/example tests (contrast, luminance, saturation, touch, responsive, reduced motion)
    - Assert background luminance ≥ 90% (1.1), secondary surfaces saturation ≤ 20% (1.2), each text token ≥ 4.5:1 contrast (1.3, 17.1), touch targets ≥ 44×44 with ≥ 8px spacing (2.7), single/tablet/desktop layout with no horizontal overflow at 320/768/1024px (2.2–2.4), and reduced-motion disables transitions (17.4)
    - _Requirements: 1.1, 1.2, 1.3, 2.2, 2.3, 2.4, 2.7, 17.1, 17.4_

- [x] 4. Content collection schema and session entries
  - [x] 4.1 Define the sessions content collection schema
    - Create `src/content/config.ts` with the `sessions` collection (`slug`, `title`, `description`, `coverImage: image()`, non-empty `coverAlt`, `images[]` with `src: image()`, non-empty `alt`, `orientation` enum, `provisional` default true)
    - _Requirements: 6.1, 15.6, 16.4_

  - [x] 4.2 Wire mock placeholders and author the five session entries
    - Make `mock-01.jpg`..`mock-20.jpg` available as imported ESM assets under `src/images/mocks/`; add a README note explaining the `assets/` → `src/images/` swap for real photos
    - Author entries for newborn, familia, crecer-juntos, embarazo with Spanish copy per Req 6.2–6.7, the Crecer juntos concept line "No fotografiar solamente un momento, sino ver crecer vuestra historia", cover + gallery images with authored `orientation`
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 15.6, 15.7_

- [x] 5. Layouts and SEO head
  - [x] 5.1 Implement `Seo.astro`
    - Prop-driven `<head>` fragment: non-empty title, meta description, canonical, and OpenGraph tags; build canonical/OG URLs with `absoluteUrl` (site + base)
    - _Requirements: 16.1_

  - [x] 5.2 Implement `BaseLayout.astro`
    - `<html lang="es">`, `<head>` via `Seo.astro`, global CSS imports, skip-to-content link, and document landmarks; props are `SeoProps` + `activePath`
    - _Requirements: 14.1, 14.5, 17.2, 16.1_

  - [x] 5.3 Implement `PageLayout.astro`
    - Wrap `BaseLayout`, add `Header`, `<main id="main">` skip target, and `Footer`
    - _Requirements: 3.1, 12.1, 14.5_

- [x] 6. Reusable components
  - [x] 6.1 Implement `SectionTitle.astro`
    - Editorial serif heading with configurable `as` (h1/h2/h3), optional eyebrow, and alignment; keeps valid heading hierarchy
    - _Requirements: 1.5, 16.3_

  - [x] 6.2 Implement `Header.astro` (logo + nav + active state)
    - Textual logo "Sandra Cabedo Fotografía", eight nav items from `nav.ts` with base-safe hrefs, `aria-current="page"` for the active path, and a collapsible menu with an accessible toggle button for ≤768px
    - _Requirements: 3.1, 3.2, 3.3, 3.6_

  - [x] 6.3 Implement `Footer.astro`
    - Brand line + "Fotografía familiar · Castellón", Instagram + WhatsApp links, "Aviso legal" / "Política de privacidad" links, copyright; omit any physical address
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 13.3_

  - [x] 6.4 Implement `WhatsAppCTA.astro`
    - Label constrained to the allowed set ("Reserva tu sesión", "Hablemos", "Consultar disponibilidad", "Hablemos por WhatsApp"); `href` from `whatsapp.ts`, opens in a new tab; when disabled render inert (`aria-disabled="true"`, `tabindex="-1"`, no `href`); never render the phone as text
    - _Requirements: 10.1, 10.2, 10.5, 10.6, 11.3_

  - [x] 6.5 Implement `InstagramCTA.astro`
    - Link to the official Instagram profile with a configurable label (e.g. "Sígueme en Instagram", "Instagram") from `site.ts`
    - _Requirements: 9.2, 11.4_

  - [x] 6.6 Implement `Hero.astro`
    - Eager-loaded large family photograph via `astro:assets` `<Image>` with explicit dimensions and alt, headline "Fotografías de vuestra historia", subtitle about natural memories/growth, and a primary WhatsApp CTA "Reserva tu sesión"; avoid long text/corporate buttons
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 15.1, 15.4_

  - [x] 6.7 Implement `SessionCard.astro`
    - Visual card with cover image (`astro:assets`), title, description, and a base-safe link to the session page via `url.ts`
    - _Requirements: 6.1, 6.8, 15.1, 15.4_

  - [x] 6.8 Implement `Gallery.astro` (editorial masonry)
    - Masonry mixing portrait/landscape images (no rigid identical-thumbnail grid), light hover zoom and smooth transitions, `astro:assets` images with explicit width/height and non-empty alt, and lightbox trigger hooks; lazy-load below-the-fold images
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 15.2, 15.3, 15.4, 16.4_

  - [x]* 6.9 Write WhatsApp label constraint unit test
    - Assert only the allowed labels are accepted by `WhatsAppCTA`
    - _Requirements: 10.1, 11.3_

- [x] 7. Interaction scripts (progressive enhancement)
  - [x] 7.1 Implement `src/scripts/nav-toggle.ts`
    - Collapsible mobile menu attached only when the toggle markup exists; keyboard operable, toggles `aria-expanded`; degrades gracefully without JS
    - _Requirements: 3.6, 17.2_

  - [x] 7.2 Implement `src/scripts/lightbox.ts`
    - Accessible vanilla lightbox: opens on activation, focus trap while open, `Esc` closes and returns focus to the trigger, respects `prefers-reduced-motion`; images stay inline/navigable without JS
    - _Requirements: 8.3, 8.4, 17.2, 17.4_

  - [x]* 7.3 Write interaction tests for lightbox and mobile menu
    - Lightbox: open on activation, focus trap, `Esc` closes + restores focus, reduced-motion respected; mobile menu: toggle keyboard operable and exposes `aria-expanded`
    - _Requirements: 8.3, 8.4, 3.6, 17.4_

- [x] 8. Image fallback error handling
  - [x] 8.1 Add image load-failure fallback
    - Wrap rendered images so a runtime load failure keeps the reserved box (explicit width/height) and shows a visible "imagen no disponible" indicator with no layout shift, via an `onerror` handler
    - _Requirements: 1.8, 15.4_

  - [x]* 8.2 Write image fallback unit test
    - Simulate a failed image; assert the reserved box keeps declared dimensions and shows the unavailable indicator
    - _Requirements: 1.8_

- [x] 9. Home page (index.astro)
  - Compose Hero, Presentation (warm provisional intro + Sandra portrait + "Conóceme" CTA), Session_Types (5× `SessionCard`), Children_Experience (comfort + private studio with play area/trampoline, no address, framed as experience), Portfolio (`Gallery`), Instagram_Section (feed-style placeholders + "Sígueme en Instagram" CTA, no API), and Contact_Section; use `PageLayout` and per-page SEO; keep a WhatsApp CTA in the initial mobile viewport
  - _Requirements: 4.1-4.5, 5.1-5.4, 6.1, 7.1-7.4, 8.1, 9.1-9.3, 11.1-11.5, 2.5, 2.6, 13.1, 13.2_

- [x] 10. Session pages
  - [x] 10.1 Implement the five session pages (newborn, familia, crecer-juntos, embarazo)
    - Each reads its content entry and renders `SectionTitle`, `Gallery`, a WhatsApp CTA, and a provisional notice with at least one sample photograph; crecer-juntos includes the concept line; use `PageLayout` + per-page SEO and clean URLs
    - _Requirements: 3.5, 6.1-6.8, 8.1, 16.1, 16.5_

- [x] 11. Sobre mí, Contacto, and legal pages
  - [x] 11.1 Implement `sobre-mi.astro`
    - Portrait, warm provisional intro (no invented biographical data), and "Conóceme" context; `PageLayout` + SEO
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 16.1_

  - [x] 11.2 Implement `contacto.astro`
    - Title "Reserva tu sesión", inviting text, primary WhatsApp CTA "Hablemos por WhatsApp", secondary Instagram CTA "Instagram"; no form/backend
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 16.1_

  - [x] 11.3 Implement `aviso-legal.astro` and `politica-de-privacidad.astro`
    - Provisional static legal text using `PageLayout` + SEO; omit any physical address
    - _Requirements: 12.3, 13.3, 16.1_

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. SEO assets, robots, and sitemap
  - [x] 13.1 Add `public/robots.txt` and confirm sitemap generation
    - `robots.txt` references the absolute sitemap URL (site-based); confirm `@astrojs/sitemap` emits a sitemap in `dist/`
    - _Requirements: 16.2_

  - [x] 13.2 Apply per-page SEO metadata across all ten pages
    - Ensure each page passes title/description/path (+ optional OG image) to SEO with content oriented to searches like "fotógrafo familiar Castellón", "fotografía newborn Castellón", etc., without keyword saturation; verify H1/H2/H3 hierarchy per page
    - _Requirements: 16.1, 16.3, 16.5, 16.6_

- [x] 14. Build-time link checking (broken/base-omitting links)
  - [x] 14.1 Implement the `dist/` link-check script
    - Scan emitted HTML for internal `href`/`src`; report any that do not resolve to an existing file or that omit the `base` prefix, naming the affected resource, and fail the build; leave valid routes untouched. Wire it into the `check:links` script
    - _Requirements: 18.7, 3.4_

- [x] 15. Universal page-invariant property tests (over built pages)
  - [x]* 15.1 Write property test for no hardcoded base/phone literals
    - **Property 2: No hardcoded base or phone literal in source** — static scan over all source files except `astro.config.mjs` (base) and `src/config/site.ts` (phone); assert neither the `/sandra-cabedo-fotografia/` literal nor the phone literal appears; tagged Property 2
    - **Validates: Requirements 18.4, 10.4**

  - [x]* 15.2 Write property test for rendered image integrity
    - **Property 5: Rendered image integrity** — over all `<img>` in built pages, assert non-empty `alt` and positive explicit `width`/`height`; tagged Property 5
    - **Validates: Requirements 15.4, 16.4, 17.3**

  - [x]* 15.3 Write property test for navigation completeness
    - **Property 6: Navigation exposes exactly the eight sections** — over all built pages, assert the header nav equals the eight items in order with base-safe hrefs and exactly one active `aria-current="page"`; tagged Property 6
    - **Validates: Requirements 3.2, 3.3**

  - [x]* 15.4 Write property test for per-page SEO head completeness
    - **Property 7: Per-page SEO head is complete** — over all built pages, assert non-empty title, meta description, canonical, and OpenGraph tags, and canonical is an absolute base-safe URL; tagged Property 7
    - **Validates: Requirements 16.1**

  - [x]* 15.5 Write property test for valid heading hierarchy
    - **Property 8: Valid heading hierarchy** — over all built pages, assert exactly one `<h1>` and no skipped heading level; tagged Property 8
    - **Validates: Requirements 16.3**

  - [x]* 15.6 Write axe-core accessibility checks
    - Run `axe-core` against the built Home and a session page; assert no serious violations; assert keyboard reachability and visible focus for interactive elements
    - _Requirements: 17.1, 17.2, 17.3_

- [x] 16. GitHub Actions deployment workflow
  - [x] 16.1 Create `.github/workflows/deploy.yml`
    - Triggers: `push` to `main` and `workflow_dispatch`; permissions `pages: write`, `id-token: write`, `contents: read`; concurrency group; build job (`actions/checkout` → `actions/setup-node` Node 20 → `npm ci` → `npm run build` → `actions/configure-pages` → `actions/upload-pages-artifact` at `dist/`) and deploy job (`actions/deploy-pages`, environment `github-pages`)
    - _Requirements: 19.1, 19.2, 19.3_

- [x] 17. Documentation
  - [x] 17.1 Write the README Deployment section
    - Document run locally (`npm install` + `npm run dev`), build & preview (`npm run build` + `npm run preview`), configuring Pages source to GitHub Actions, how the automatic workflow publishes on push to `main` and via manual dispatch, and the two-value (`site`/`base`) custom-domain switch plus `CNAME`/DNS steps
    - _Requirements: 20.1, 20.2, 20.3, 18.5_

- [x] 18. Final wiring and build verification
  - [x] 18.1 Run `npm run build` and the link check; fix all relevant errors/warnings
    - Ensure `astro build` completes cleanly, `dist/` contains the sitemap and `robots.txt`, the link check reports no broken/base-omitting links, and every page renders with full navigation, SEO head, and base-safe assets; correct any relevant errors or warnings before considering the version finished
    - _Requirements: 20.4, 16.2, 18.2, 18.7_

  - [x]* 18.2 Run the full test suite and confirm green
    - Execute all property, example, interaction, and accessibility tests; confirm each property test runs ≥100 iterations
    - _Requirements: 20.4_

- [x] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional (tests and non-blocking hardening) and can be skipped for a faster MVP; core implementation tasks are never optional.
- Each task references specific requirement clauses for traceability.
- The base-safe config and pure helpers (tasks 1–2) are built before any component or page that depends on them, so there is no orphaned code.
- Property tests use `vitest` + `fast-check` at ≥100 iterations each and are tagged `// Feature: sandra-cabedo-fotografia, Property {n}`.
- All UI strings remain in Spanish exactly as referenced in the requirements.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1"] },
    { "id": 2, "tasks": ["2.3", "2.4", "2.5", "3.2", "3.3", "4.1"] },
    { "id": 3, "tasks": ["2.6", "2.7", "2.8", "3.4", "4.2", "5.1", "8.1"] },
    { "id": 4, "tasks": ["5.2", "6.1", "6.4", "6.5", "7.1", "7.2"] },
    { "id": 5, "tasks": ["5.3", "6.2", "6.3", "6.6", "6.7", "6.8", "8.2"] },
    { "id": 6, "tasks": ["6.9", "7.3", "9", "10.1", "11.1", "11.2", "11.3"] },
    { "id": 7, "tasks": ["13.1", "13.2", "14.1", "16.1", "17.1"] },
    { "id": 8, "tasks": ["15.1", "15.2", "15.3", "15.4", "15.5", "15.6", "18.1"] },
    { "id": 9, "tasks": ["18.2"] }
  ]
}
```
