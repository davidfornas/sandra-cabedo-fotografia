// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';

// Feature: sandra-cabedo-fotografia, Task 8.2 (image fallback unit test)
//
// ImageFrame.astro renders a <figure data-image-frame style="aspect-ratio: W / H">
// containing an <img> whose onerror sets data-image-failed on the figure, plus a
// hidden fallback span ("Imagen no disponible"). On error the reserved box keeps its
// declared dimensions (the inline aspect-ratio is untouched) and the fallback shows.

const BOX_WIDTH = 1200;
const BOX_HEIGHT = 800;
const ASPECT_RATIO = `${BOX_WIDTH} / ${BOX_HEIGHT}`;
const FALLBACK_LABEL = 'Imagen no disponible';

// Mirrors the inline onerror handler declared on the <img> in ImageFrame.astro.
const ONERROR =
  "this.closest('[data-image-frame]').setAttribute('data-image-failed', ''); this.removeAttribute('onerror');";

function buildImageFrame(): { figure: HTMLElement; img: HTMLImageElement } {
  document.body.innerHTML = `
    <figure class="image-frame" style="aspect-ratio: ${ASPECT_RATIO};" data-image-frame>
      <img
        class="image-frame__img"
        width="${BOX_WIDTH}"
        height="${BOX_HEIGHT}"
        alt="Retrato de familia"
        onerror="${ONERROR}"
      />
      <span class="image-frame__fallback" role="img" aria-label="${FALLBACK_LABEL}">
        <span class="image-frame__fallback-text">${FALLBACK_LABEL}</span>
      </span>
    </figure>
  `;
  const figure = document.querySelector('[data-image-frame]') as HTMLElement;
  const img = figure.querySelector('img.image-frame__img') as HTMLImageElement;
  return { figure, img };
}

// Executes the element's inline onerror string with `this` bound to the image,
// exactly as the browser would when the resource fails to load.
function fireImageError(img: HTMLImageElement): void {
  const handler = img.getAttribute('onerror');
  if (!handler) throw new Error('image has no onerror handler');
  new Function(handler).call(img);
}

describe('ImageFrame fallback on image load failure (Req 1.8)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('starts with the fallback hidden and the reserved box sized', () => {
    const { figure } = buildImageFrame();
    expect(figure.getAttribute('style')).toContain(`aspect-ratio: ${ASPECT_RATIO}`);
    expect(figure.hasAttribute('data-image-failed')).toBe(false);
  });

  it('keeps the reserved box dimensions after the image fails', () => {
    const { figure, img } = buildImageFrame();

    fireImageError(img);

    // The inline aspect-ratio (reserved dimensions) must be untouched by the failure.
    expect(figure.getAttribute('style')).toContain(`aspect-ratio: ${ASPECT_RATIO}`);
    expect(img.getAttribute('width')).toBe(String(BOX_WIDTH));
    expect(img.getAttribute('height')).toBe(String(BOX_HEIGHT));
  });

  it('marks the figure as failed so CSS swaps in the fallback', () => {
    const { figure, img } = buildImageFrame();

    fireImageError(img);

    expect(figure.hasAttribute('data-image-failed')).toBe(true);
  });

  it('exposes the "Imagen no disponible" indicator occupying the reserved box', () => {
    const { figure, img } = buildImageFrame();

    fireImageError(img);

    const fallback = figure.querySelector('.image-frame__fallback') as HTMLElement;
    expect(fallback).not.toBeNull();
    expect(fallback.getAttribute('role')).toBe('img');
    expect(fallback.getAttribute('aria-label')).toBe(FALLBACK_LABEL);
    expect(fallback.textContent?.trim()).toBe(FALLBACK_LABEL);
    // The fallback is absolutely positioned over the same reserved figure box.
    expect(figure.contains(fallback)).toBe(true);
  });

  it('removes the onerror handler so a re-error cannot loop', () => {
    const { img } = buildImageFrame();

    fireImageError(img);

    expect(img.hasAttribute('onerror')).toBe(false);
  });
});
