// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { initNavToggle } from '../../src/scripts/nav-toggle.ts';
import { initLightbox } from '../../src/scripts/lightbox.ts';

// Feature: sandra-cabedo-fotografia, Task 7.3 (interaction tests)
// Requirements: 8.3, 8.4, 3.6, 17.4

function pressKey(key: string): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('initNavToggle — collapsible mobile menu (Req 3.6, 17.2)', () => {
  let toggle: HTMLButtonElement;
  let menu: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <button type="button" data-nav-toggle aria-controls="nav-menu" aria-expanded="false">
        Menú
      </button>
      <nav id="nav-menu" data-nav-menu>
        <a href="/inicio">Inicio</a>
      </nav>
    `;
    toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]')!;
    menu = document.querySelector<HTMLElement>('[data-nav-menu]')!;
    initNavToggle();
  });

  it('starts collapsed with aria-expanded="false" and no data-open', () => {
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('data-open')).toBe(false);
  });

  it('clicking the toggle opens the menu (aria-expanded=true, data-open set)', () => {
    toggle.click();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(menu.getAttribute('data-open')).toBe('true');
  });

  it('clicking again closes the menu (aria-expanded=false, data-open removed)', () => {
    toggle.click();
    toggle.click();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('data-open')).toBe(false);
  });

  it('Escape closes an open menu and returns focus to the toggle', () => {
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    pressKey('Escape');

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('data-open')).toBe(false);
    expect(document.activeElement).toBe(toggle);
  });

  it('Escape is a no-op while the menu is already closed', () => {
    pressKey('Escape');

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('data-open')).toBe(false);
  });
});

describe('initLightbox — accessible viewer (Req 8.3, 8.4, 17.4)', () => {
  let trigger: HTMLButtonElement;
  let secondTrigger: HTMLButtonElement;
  let overlay: HTMLElement;
  let dialog: HTMLElement;
  let image: HTMLImageElement;
  let closeButton: HTMLButtonElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <button
        type="button"
        data-lightbox="/full/photo-1.jpg"
        data-lightbox-alt="Retrato familiar"
      >
        <img src="/thumb/photo-1.jpg" alt="Retrato familiar" width="10" height="10" />
      </button>
      <button
        type="button"
        data-lightbox="/full/photo-2.jpg"
        data-lightbox-alt="Sesión newborn"
      >
        <img src="/thumb/photo-2.jpg" alt="Sesión newborn" width="10" height="10" />
      </button>
      <div data-lightbox-overlay hidden>
        <div data-lightbox-dialog role="dialog" aria-modal="true" tabindex="-1">
          <button type="button" data-lightbox-close>Cerrar</button>
          <img data-lightbox-image alt="" width="10" height="10" />
          <a href="/siguiente">Siguiente</a>
        </div>
      </div>
    `;
    trigger = document.querySelectorAll<HTMLButtonElement>('[data-lightbox]')[0];
    secondTrigger = document.querySelectorAll<HTMLButtonElement>('[data-lightbox]')[1];
    overlay = document.querySelector<HTMLElement>('[data-lightbox-overlay]')!;
    dialog = document.querySelector<HTMLElement>('[data-lightbox-dialog]')!;
    image = document.querySelector<HTMLImageElement>('[data-lightbox-image]')!;
    closeButton = document.querySelector<HTMLButtonElement>('[data-lightbox-close]')!;

    // happy-dom reports offsetParent as null by default; the focus-trap helper
    // filters on visibility, so expose the dialog's focusable controls as visible.
    for (const el of [closeButton, ...dialog.querySelectorAll('a[href]')]) {
      Object.defineProperty(el, 'offsetParent', { configurable: true, get: () => dialog });
    }

    initLightbox();
  });

  it('is server-rendered hidden and closed before any activation', () => {
    expect(overlay.hasAttribute('hidden')).toBe(true);
    expect(overlay.hasAttribute('data-open')).toBe(false);
  });

  it('activating a trigger opens the overlay, loads the image, and moves focus into the dialog', () => {
    trigger.click();

    expect(overlay.hasAttribute('hidden')).toBe(false);
    expect(overlay.getAttribute('data-open')).toBe('true');
    expect(image.getAttribute('src')).toBe('/full/photo-1.jpg');
    expect(image.getAttribute('alt')).toBe('Retrato familiar');
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(closeButton);
  });

  it('traps focus: Shift+Tab from the first control wraps to the last', () => {
    trigger.click();
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button'));
    const last = focusables[focusables.length - 1];

    closeButton.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    document.dispatchEvent(event);

    expect(document.activeElement).toBe(last);
    expect(event.defaultPrevented).toBe(true);
  });

  it('traps focus: Tab from the last control wraps to the first', () => {
    trigger.click();
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button'));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    last.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(event);

    expect(document.activeElement).toBe(first);
    expect(event.defaultPrevented).toBe(true);
  });

  it('Esc closes the overlay, restores hidden, clears the image, and returns focus to the trigger', () => {
    trigger.focus();
    trigger.click();
    expect(overlay.getAttribute('data-open')).toBe('true');

    pressKey('Escape');

    expect(overlay.hasAttribute('data-open')).toBe(false);
    expect(overlay.hasAttribute('hidden')).toBe(true);
    expect(image.hasAttribute('src')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('clicking the close control closes the overlay', () => {
    trigger.click();
    closeButton.click();

    expect(overlay.hasAttribute('data-open')).toBe(false);
    expect(overlay.hasAttribute('hidden')).toBe(true);
  });

  it('clicking the backdrop (overlay itself) closes the overlay', () => {
    trigger.click();
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(overlay.hasAttribute('data-open')).toBe(false);
  });

  it('returns focus to the specific trigger that opened it (Req 8.3)', () => {
    secondTrigger.focus();
    secondTrigger.click();
    expect(image.getAttribute('src')).toBe('/full/photo-2.jpg');

    pressKey('Escape');

    expect(document.activeElement).toBe(secondTrigger);
  });

  it('performs no scripted animation — reduced motion is left to CSS (Req 17.4)', () => {
    // The module only toggles state attributes; it must not set inline styles
    // or call animation APIs, so prefers-reduced-motion handling stays in CSS.
    trigger.click();
    expect(overlay.getAttribute('style')).toBeNull();
    expect(dialog.getAttribute('style')).toBeNull();
  });
});
