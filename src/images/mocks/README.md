# Mock images for `astro:assets`

These are the placeholder photos imported by the site's components and content
collection (`<Image>` / `image()`). They are optimized at build time by
`astro:assets`, which needs images to live under `src/` and be referenced as
imported ESM assets — that is why they are here and not only under the top-level
`assets/` folder.

## Files

- `mock-01.jpg` .. `mock-20.jpg`.
- Odd numbers are portrait (800x1200); even numbers are landscape (1200x800), so
  galleries mix vertical and horizontal shots.

These are generated solid/gradient warm-tone placeholders, not real photography.

## Swapping in real photos (`assets/` -> `src/images/`)

The top-level `assets/images/mocks/` folder is the human-facing drop zone where new
photos are collected. The build only reads images from `src/images/mocks/`.

To replace a placeholder with a real photo without touching any component or content
code:

1. Drop the real photo into `assets/images/mocks/`.
2. Copy (or move) it into `src/images/mocks/`, keeping the same file name
   (`mock-03.jpg` stays `mock-03.jpg`).
3. Keep the same portrait/landscape orientation as the placeholder it replaces, or
   update the `orientation` field of that image in the matching
   `src/content/sessions/*.md` entry so the masonry layout stays correct.

Because every reference points at the file name in `src/images/mocks/`, the imports,
dimensions, and component code all keep working after the swap — `astro:assets`
re-derives width/height from the new file automatically.
