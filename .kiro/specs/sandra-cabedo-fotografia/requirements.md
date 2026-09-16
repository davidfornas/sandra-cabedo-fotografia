# Requirements Document

## Introduction

This document defines the requirements for the first functional version (demo) of the
professional website of "Sandra Cabedo Fotografía", a photographer specialized mainly in
family, children, and newborn photography and in accompanying the growth of children over
time, based in Castellón (Spain).

The goal of this first version is twofold: to serve as a visual demonstration of the
aesthetic direction of the project and as the technical foundation of the definitive
project. The site must be modern, warm, elegant, and highly visual, built with Astro and
deployable as a static site on GitHub Pages. The experience must convey closeness,
naturalness, and sensitivity, avoiding the look of a corporate or generic photographer
template. Photography is always the protagonist; the design accompanies it and does not
compete with it.

This version is built with provisional texts and photographs (placeholders) so that both
the visual direction and the technical architecture can be evaluated before introducing the
definitive content. It includes no contact form and no backend: conversion is channeled
through WhatsApp.

## Glossary

- **Site**: The static website of Sandra Cabedo Fotografía, built with Astro and deployed
  on GitHub Pages.
- **Visitor**: Person who accesses the Site, frequently from a mobile device through a link
  on Instagram.
- **Home_Page**: Main page of the Site that visually presents the photography types.
- **Hero_Section**: Top block of the Home_Page with a large emotional family photograph as
  the main element.
- **Presentation_Section**: Block of the Home_Page with a brief introduction of Sandra.
- **Session_Types_Section**: Block of the Home_Page that presents the main photographic
  experiences (Newborn, Familia, Crecer juntos, Embarazo).
- **Children_Experience_Section**: Block of the Home_Page that explains how sessions with
  children are conducted and describes the private studio with a play area and a trampoline.
- **Portfolio**: Visual gallery of photographs with an editorial masonry-type composition.
- **Lightbox**: Viewer that enlarges a Portfolio photograph over the page content.
- **Instagram_Section**: Block that visually integrates the Instagram presence with a link
  to the official profile.
- **Contact_Section**: Final block oriented toward booking a session through WhatsApp.
- **WhatsApp_CTA**: Button or link that opens a WhatsApp conversation with a predefined
  initial message.
- **Instagram_CTA**: Button or link that directs to the official Instagram profile.
- **WhatsApp_Config**: Single constant/configuration that defines the WhatsApp number and
  the initial message, reused across the entire Site.
- **Site_Config**: Astro and project configuration that defines `site`, `base`, domain, and
  public URL.
- **Reusable_Component**: Reusable Astro component (Header, Footer, Hero, SessionCard,
  Gallery, WhatsAppCTA, InstagramCTA, SectionTitle).
- **Deployment_Workflow**: GitHub Actions workflow that builds and publishes the Site on
  GitHub Pages.
- **Placeholder_Image**: Provisional sample image located at
  `assets/images/mocks/mock-01.jpg` to `mock-20.jpg`.

## Requirements

### Requirement 1: Visual identity and aesthetics

**User Story:** As a Visitor arriving from Instagram, I want the Site to convey a minimalist, luminous, and warm aesthetic consistent with the identity of Sandra Cabedo Fotografía, so that I feel closeness and trust from the very first moment.

#### Acceptance Criteria

1. THE Site SHALL use as the main background color an off-white or very light cream with a relative luminance equal to or greater than 90% in all sections.
2. THE Site SHALL use very soft beige, sand, or earth tones, with saturation equal to or lower than 20%, as secondary surface colors.
3. THE Site SHALL use a warm gray for secondary text and a dark tone that is not pure black for the main text, ensuring in both cases a contrast ratio with the background of at least 4.5:1.
4. THE Site SHALL apply a single warm and discreet accent tone, limited to a maximum of one color, for highlighted elements such as links, buttons, and calls to action.
5. THE Site SHALL use exactly two typographic families: an elegant editorial typeface applied only to titles, and a light and legible sans-serif typeface applied to navigation, buttons, and body text.
6. THE Site SHALL maintain in each section a margin or whitespace around the content equivalent to a minimum of 10% of the width of the visible area.
7. WHEN a section contains graphic content, THE Site SHALL assign to the photograph the largest visual area of that section relative to any other graphic element.
8. IF a photographic image cannot load, THEN THE Site SHALL display a reserved space with the same dimensions as the image and a visible indicator that the content is unavailable, preserving the composition of the section.

### Requirement 2: Mobile-first responsive design

**User Story:** As a Visitor who opens the Site on a mobile device from Instagram, I want the experience to work perfectly on a small screen, so that I can navigate and make contact comfortably.

#### Acceptance Criteria

1. THE Site SHALL apply a mobile-first design approach in its stylesheet, defining base styles for viewport widths from 320 CSS pixels and applying enhancements through min-width media queries.
2. WHILE the viewport width is between 320 and 767 CSS pixels, THE Site SHALL present the content in a single column without horizontal scrolling.
3. WHILE the viewport width is between 768 and 1023 CSS pixels, THE Site SHALL present the content with a legible layout adapted to tablet without horizontal scrolling.
4. WHILE the viewport width is 1024 CSS pixels or greater, THE Site SHALL present the content with a legible layout adapted to desktop without horizontal scrolling.
5. WHILE the Visitor navigates with a viewport width equal to or lower than 767 CSS pixels, THE Site SHALL display each photograph occupying at least 90 percent of the viewport width.
6. WHILE the Visitor navigates with a viewport width equal to or lower than 767 CSS pixels, THE Site SHALL keep at least one WhatsApp_CTA visible within the initial visible area without requiring scrolling.
7. THE Site SHALL size interactive elements with a minimum touch area of 44 by 44 CSS pixels and a minimum separation of 8 CSS pixels between adjacent touch elements.

### Requirement 3: Navigation and Site structure

**User Story:** As a Visitor, I want simple and elegant navigation between the main sections, so that I can quickly find the type of photography that interests me.

#### Acceptance Criteria

1. THE Site SHALL display the name "Sandra Cabedo Fotografía" as a textual logo in the header, visible on all pages of the Site.
2. THE Site SHALL offer in the main navigation exactly the following eight links: Inicio, Newborn, Familia, Crecer juntos, Embarazo, Sobre mí, and Contacto.
3. WHEN the Visitor selects a navigation link, THE Site SHALL display the page corresponding to that link within a maximum of 3 seconds and visibly indicate which section is active.
4. IF the loading of the page corresponding to a navigation link fails, THEN THE Site SHALL display a message indicating the load failure and keep the main navigation visible to allow selecting another section.
5. WHERE a section does not have definitive content, THE Site SHALL present provisional content that includes at least one sample photograph and a text indicating that the content is provisional.
6. WHILE the width of the Visitor window is equal to or lower than 768 pixels, THE Site SHALL offer a collapsible navigation menu that gives access to the eight links in criterion 2.

### Requirement 4: Hero Section of the Home Page

**User Story:** As a Visitor, I want the first screen to be highly photographic and
emotional, so that I connect immediately with Sandra's style without having to read much.

#### Acceptance Criteria

1. THE Hero_Section SHALL display a large emotional family photograph as the main element.
2. THE Hero_Section SHALL display a brief text such as "Fotografías de vuestra historia".
3. THE Hero_Section SHALL display a brief subtitle about preserving natural family memories
   and the growth of children.
4. THE Hero_Section SHALL include a WhatsApp_CTA with the label "Reserva tu sesión".
5. THE Hero_Section SHALL avoid extensive text blocks and corporate-style buttons.

### Requirement 5: Presentation section of Sandra

**User Story:** As a Visitor, I want to briefly get to know Sandra with a warm tone, so that
I feel the closeness of the person behind the photographs.

#### Acceptance Criteria

1. THE Presentation_Section SHALL display a brief introduction of Sandra with a warm tone
   focused on natural photography.
2. WHERE no real biographical data exists, THE Presentation_Section SHALL use provisional
   text without inventing specific information.
3. THE Presentation_Section SHALL include a photograph of Sandra working or a portrait.
4. THE Presentation_Section SHALL include a CTA with the label "Conóceme".

### Requirement 6: Session types section

**User Story:** As a Visitor, I want to see visually the photographic experiences that
Sandra offers, so that I can identify the session that fits my family.

#### Acceptance Criteria

1. THE Session_Types_Section SHALL visually present the categories Newborn, Familia, Crecer
   juntos, Embarazo.
2. THE Session_Types_Section SHALL describe the Newborn category focused on the baby's first
   days and months, calm, intimacy, and naturalness.
3. THE Session_Types_Section SHALL describe the Familia category focused on relationships,
   play, hugs, and spontaneous moments over poses.
4. THE Session_Types_Section SHALL highlight the Crecer juntos category as photographic
   accompaniment of a family over time, including pregnancy, birth, first months,
   birthdays, and different stages of childhood.
5. THE Session_Types_Section SHALL express the Crecer juntos concept as "No fotografiar
   solamente un momento, sino ver crecer vuestra historia".
6. THE Session_Types_Section SHALL describe the Embarazo category as natural and emotional
   photography.
7. WHEN the Visitor selects a session category, THE Site SHALL give access to the page or
   gallery specific to that category.

### Requirement 7: Children experience section and private studio

**User Story:** As a mother or father, I want to know how sessions with children are
conducted, so that I can trust that my child will be comfortable and behave naturally.

#### Acceptance Criteria

1. THE Children_Experience_Section SHALL explain that the sessions aim for children to be
   comfortable and behave naturally.
2. THE Children_Experience_Section SHALL describe the private studio with a play area and a
   large trampoline that helps children relax before and during the sessions.
3. THE Children_Experience_Section SHALL present the studio as part of the experience and
   not as a commercial feature.
4. THE Children_Experience_Section SHALL omit the exact address of the studio.

### Requirement 8: Portfolio with editorial gallery and lightbox

**User Story:** As a Visitor, I want to see a visual and modern gallery of photographs, so
that I can assess Sandra's style in a comfortable and attractive way.

#### Acceptance Criteria

1. THE Portfolio SHALL present the photographs with an editorial masonry-type composition
   that combines vertical and horizontal images.
2. THE Portfolio SHALL avoid a rigid grid of identical thumbnails.
3. WHEN the Visitor selects a Portfolio photograph, THE Site SHALL open it in a simple
   Lightbox.
4. WHILE the Visitor interacts with a photograph, THE Portfolio SHALL apply smooth
   transitions and a very light hover zoom.
5. THE Portfolio SHALL avoid excessive animations.

### Requirement 9: Visual Instagram integration

**User Story:** As a Visitor, I want to see Sandra's Instagram presence, so that I can
follow her work and discover more photographs.

#### Acceptance Criteria

1. THE Instagram_Section SHALL display a feed-type visual composition using local
   Placeholder_Images.
2. THE Instagram_Section SHALL include an Instagram_CTA with the label "Sígueme en
   Instagram" that links to the official profile.
3. THE Instagram_Section SHALL forgo integration with the Instagram API in this version.

### Requirement 10: Conversion through WhatsApp

**User Story:** As a Visitor interested in booking, I want to contact easily via WhatsApp, so that I can start a conversation with Sandra without friction.

#### Acceptance Criteria

1. THE Site SHALL offer WhatsApp_CTA with one of the following exact labels: "Reserva tu sesión", "Hablemos", or "Consultar disponibilidad".
2. WHEN the Visitor selects a WhatsApp_CTA, THE Site SHALL open in a new tab or window a WhatsApp conversation with the number obtained from WhatsApp_Config and with the exact initial message "Hola Sandra, he visto tu web y me gustaría informarme sobre una sesión de fotos.".
3. THE Site SHALL obtain the WhatsApp number and the initial message exclusively from WhatsApp_Config.
4. THE Site SHALL define the WhatsApp number in a single configuration constant, referenced from all WhatsApp_CTA, without repeating the literal value at any other point in the application.
5. THE Site SHALL avoid displaying the phone number as visible text on any screen or interface content.
6. IF the WhatsApp number in WhatsApp_Config is absent or empty, THEN THE Site SHALL disable the interaction of all WhatsApp_CTA and prevent the conversation from opening, keeping the rest of the page content visible and functional.

### Requirement 11: Contact section

**User Story:** As a Visitor, I want a simple contact section oriented toward booking, so
that I can explain the type of session I want via WhatsApp.

#### Acceptance Criteria

1. THE Contact_Section SHALL display the title "Reserva tu sesión".
2. THE Contact_Section SHALL include a brief text inviting families to explain what type of
   session they want.
3. THE Contact_Section SHALL include a primary WhatsApp_CTA with the label "Hablemos por
   WhatsApp".
4. THE Contact_Section SHALL include a secondary Instagram_CTA with the label "Instagram".
5. THE Contact_Section SHALL forgo a contact form and a backend in this version.

### Requirement 12: Footer

**User Story:** As a Visitor, I want a minimalist footer with the essential data, so that I
can access key links and legal information.

#### Acceptance Criteria

1. THE Footer SHALL display "Sandra Cabedo Fotografía" and "Fotografía familiar · Castellón".
2. THE Footer SHALL include links to Instagram and WhatsApp.
3. THE Footer SHALL include links to "Aviso legal" and "Política de privacidad".
4. THE Footer SHALL display a copyright notice.
5. THE Footer SHALL omit any physical address.

### Requirement 13: Location without public address

**User Story:** As Sandra, I want the Site to communicate the work area without publishing
the studio address, so that I preserve the privacy of the private studio.

#### Acceptance Criteria

1. THE Site SHALL communicate that the activity takes place in Castellón and surroundings.
2. WHERE it is necessary to refer to the studio, THE Site SHALL use expressions such as
   "Estudio privado en Castellón" or "Castellón y alrededores".
3. THE Site SHALL omit on all its pages the specific address of the studio.

### Requirement 14: Technical architecture with Astro

**User Story:** As a developer of the definitive project, I want a clean technical
foundation with Astro and reusable components, so that I can extend the Site easily.

#### Acceptance Criteria

1. THE Site SHALL be built with Astro using semantic HTML and modern CSS.
2. THE Site SHALL use TypeScript where convenient.
3. WHERE a functionality can be resolved with Astro, CSS, or lightweight JavaScript, THE
   Site SHALL avoid the use of React.
4. THE Site SHALL implement the Reusable_Components Header, Footer, Hero, SessionCard,
   Gallery, WhatsAppCTA, InstagramCTA, and SectionTitle.
5. THE Site SHALL organize the code into layouts, components, pages, styles, and assets.
6. THE Site SHALL limit dependencies to those strictly necessary.

### Requirement 15: Image optimization

**User Story:** As a Visitor, I want the photographs to load fast and with high quality, so
that I can enjoy Sandra's work without waits or layout shifts.

#### Acceptance Criteria

1. THE Site SHALL use Astro's image optimization capabilities whenever possible.
2. THE Site SHALL generate responsive sizes and modern formats of the images.
3. THE Site SHALL apply lazy loading to the images outside the initial visible content.
4. THE Site SHALL reserve the space of each image to avoid layout shifts.
5. THE Site SHALL maintain a high visual quality of the photographs.
6. WHERE no definitive photographs exist, THE Site SHALL use Placeholder_Images from
   `assets/images/mocks/mock-01.jpg` to `mock-20.jpg`.
7. THE Site SHALL allow the replacement of the Placeholder_Images with real photographs in a
   simple way.

### Requirement 16: Initial SEO

**User Story:** As Sandra, I want the Site to be prepared for search engines from the demo,
so that it ranks better when the definitive content is published.

#### Acceptance Criteria

1. THE Site SHALL define on each page a title, meta description, canonical, and OpenGraph
   tags.
2. THE Site SHALL generate a sitemap and a robots.txt file.
3. THE Site SHALL maintain a correct structure of H1, H2, and H3 headings on each page.
4. THE Site SHALL include alternative text (alt) on the photographs.
5. THE Site SHALL use clean URLs.
6. THE Site SHALL conceptually orient the content toward searches such as fotógrafo familiar
   Castellón, fotografía newborn Castellón, fotografía infantil Castellón, sesiones
   familiares Castellón, and fotografía embarazo Castellón without keyword saturation.

### Requirement 17: Accessibility and performance

**User Story:** As a Visitor, I want an accessible and well-performing Site, so that I can
navigate comfortably regardless of my device or my abilities.

#### Acceptance Criteria

1. THE Site SHALL maintain sufficient color contrast between text and background according
   to the WCAG AA guidelines.
2. THE Site SHALL allow full navigation through the keyboard.
3. THE Site SHALL provide alternative text on the images with informative content.
4. WHERE the Visitor has enabled prefers-reduced-motion, THE Site SHALL reduce or suppress
   the animations.
5. THE Site SHALL optimize font loading to preserve the Core Web Vitals.

### Requirement 18: Deployment on GitHub Pages under a subpath

**User Story:** As the project owner, I want to deploy the Site as static on GitHub Pages under a subpath, so that I can publish the demo without needing my own domain.

#### Acceptance Criteria

1. THE Site_Config SHALL define `site` with the complete public URL of the GitHub Pages deployment and `base` with the value `/sandra-cabedo-fotografia/`, so that all pages of the Site are accessible under the subpath `/sandra-cabedo-fotografia/`.
2. WHEN the user loads any page of the Site under the configured subpath, THE Site SHALL serve all assets, images, CSS files, and JavaScript files resolving their URLs with the `base` prefix, without any resource request returning a resource-not-found result.
3. WHEN the Site generates an internal navigation link, THE Site SHALL build the URL through Astro's `base`-compatible utilities, so that the resulting URL includes the configured `base` prefix.
4. THE Site SHALL build all internal routes of pages, assets, and images through Astro's path resolution utilities, without containing any hardcoded occurrence of the literal `/sandra-cabedo-fotografia/` in the components nor any absolute path that omits the `base` prefix.
5. WHERE a custom domain such as sandracabedofotografia.es is configured, THE Site_Config SHALL allow setting `base` to the root (`/`) by modifying only the `site` and `base` configuration values, without manually editing components, links, or images, and keeping all internal routes of the Site functional.
6. THE Site_Config SHALL keep the values of `site`, `base`, domain, and public URL identified in a single configuration location, each with a unique name and a defined value.
7. IF a resource or internal link is referenced through a path that omits the configured `base` prefix, THEN THE Site SHALL resolve that reference as a broken link during the build validation, indicating the affected resource or link without modifying the rest of the valid routes.

### Requirement 19: Automatic deployment workflow with GitHub Actions

**User Story:** As the project owner, I want every change on main to be published
automatically, so that the demo stays always up to date without manual steps.

#### Acceptance Criteria

1. THE Deployment_Workflow SHALL be located in `.github/workflows/`.
2. WHEN a push is made to the main branch, THE Deployment_Workflow SHALL install Node.js,
   install dependencies with `npm ci`, run the Astro build, and publish the `dist/`
   directory on GitHub Pages using the current official GitHub Pages Actions.
3. WHEN the owner requests it through workflow_dispatch, THE Deployment_Workflow SHALL allow
   manual execution.

### Requirement 20: Documentation and build verification

**User Story:** As a developer, I want clear execution and deployment documentation, so that
I can run, build, and publish the Site without ambiguities.

#### Acceptance Criteria

1. THE README SHALL include a deployment section that explains how to run locally, how to
   build, how to configure GitHub Pages in the repository, how the automatic deployment
   works, and what configuration to change when adding the custom domain.
2. THE Site SHALL be runnable locally through `npm install` and `npm run dev`.
3. THE Site SHALL be verifiable in production mode through `npm run build` and
   `npm run preview`.
4. WHEN `npm run build` is run, THE Site SHALL complete the build; IF the build produces
   relevant errors or warnings, THEN the project SHALL correct them before this version is
   considered finished.
