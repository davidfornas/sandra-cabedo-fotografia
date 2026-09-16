/**
 * Progressive enhancement for the accessible Portfolio lightbox.
 *
 * Markup contract (wired by Gallery.astro):
 * - Each gallery trigger is an activatable element (a `<button type="button">`)
 *   carrying `data-lightbox` with the full-size image URL, and `data-lightbox-alt`
 *   with the alternative text. The trigger wraps the inline (thumbnail) image so
 *   the photograph stays visible and navigable without JavaScript.
 * - A single overlay element carries `data-lightbox-overlay`. It is server-rendered
 *   hidden (via the `hidden` attribute) and contains:
 *     - a dialog container with `data-lightbox-dialog`, `role="dialog"` and
 *       `aria-modal="true"`,
 *     - an `<img data-lightbox-image>` whose `src`/`alt` are populated on open,
 *     - a close control with `data-lightbox-close`.
 *   Its open state is exposed via the `data-open` attribute ("true" when open),
 *   so CSS drives visibility and (reduced) transitions.
 *
 * Behavior when enhanced:
 * - Activating a trigger (click / Enter / Space, all native to `<button>`) opens
 *   the overlay showing the enlarged image and moves focus into the dialog.
 * - While open, focus is trapped within the dialog (Tab / Shift+Tab cycle).
 * - `Esc`, a click on the close control, or a click on the backdrop closes the
 *   overlay and returns focus to the trigger that opened it.
 * - `prefers-reduced-motion` is honoured by CSS (this module only toggles state);
 *   no scripted animation is performed here.
 *
 * Without JavaScript the lightbox simply does nothing: the inline images remain
 * visible and their triggers are inert. This module attaches only when both the
 * triggers and the overlay markup exist, and is a no-op otherwise.
 */

const TRIGGER_SELECTOR = '[data-lightbox]';
const OVERLAY_SELECTOR = '[data-lightbox-overlay]';
const DIALOG_SELECTOR = '[data-lightbox-dialog]';
const IMAGE_SELECTOR = '[data-lightbox-image]';
const CLOSE_SELECTOR = '[data-lightbox-close]';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  );
}

export function initLightbox(root: ParentNode = document): void {
  const triggers = Array.from(root.querySelectorAll<HTMLElement>(TRIGGER_SELECTOR));
  const overlay = root.querySelector<HTMLElement>(OVERLAY_SELECTOR);

  if (triggers.length === 0 || !overlay) {
    return;
  }

  const dialog = overlay.querySelector<HTMLElement>(DIALOG_SELECTOR);
  const image = overlay.querySelector<HTMLImageElement>(IMAGE_SELECTOR);
  const closeButton = overlay.querySelector<HTMLElement>(CLOSE_SELECTOR);

  if (!dialog || !image) {
    return;
  }

  let activeTrigger: HTMLElement | null = null;

  function open(trigger: HTMLElement): void {
    const src = trigger.getAttribute('data-lightbox');
    if (!src) {
      return;
    }

    activeTrigger = trigger;
    image!.setAttribute('src', src);
    image!.setAttribute('alt', trigger.getAttribute('data-lightbox-alt') ?? '');

    overlay!.removeAttribute('hidden');
    overlay!.setAttribute('data-open', 'true');

    const focusTarget = closeButton ?? getFocusable(dialog!)[0] ?? dialog!;
    focusTarget.focus();
  }

  function close(): void {
    if (!overlay!.hasAttribute('data-open')) {
      return;
    }

    overlay!.removeAttribute('data-open');
    overlay!.setAttribute('hidden', '');
    image!.removeAttribute('src');

    const trigger = activeTrigger;
    activeTrigger = null;
    trigger?.focus();
  }

  function isOpen(): boolean {
    return overlay!.hasAttribute('data-open');
  }

  function trapFocus(event: KeyboardEvent): void {
    const focusable = getFocusable(dialog!);
    if (focusable.length === 0) {
      event.preventDefault();
      dialog!.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (current === first || !dialog!.contains(current)) {
        event.preventDefault();
        last.focus();
      }
    } else if (current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      open(trigger);
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', () => close());
  }

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!isOpen()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      trapFocus(event);
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initLightbox());
  } else {
    initLightbox();
  }
}
