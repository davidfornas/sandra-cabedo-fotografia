/**
 * Progressive enhancement for the collapsible mobile navigation menu.
 *
 * Markup contract (wired by Header.astro):
 * - The toggle button carries `data-nav-toggle` and `aria-controls="<menu id>"`.
 *   It starts with `aria-expanded="false"` in the server-rendered HTML.
 * - The navigation menu carries `data-nav-menu` and a matching `id`.
 *   Its open/closed state is exposed via the `data-open` attribute
 *   ("true" when open, absent/"false" when closed) so CSS drives visibility.
 *
 * Without JavaScript the menu remains reachable: CSS should show the menu when
 * `data-nav-toggle` is absent or leave it visible on wider viewports, so links
 * stay navigable. This module only enhances the collapsed mobile experience and
 * does nothing when the toggle markup is missing.
 */

const TOGGLE_SELECTOR = '[data-nav-toggle]';
const MENU_SELECTOR = '[data-nav-menu]';

function setExpanded(toggle: HTMLElement, menu: HTMLElement, expanded: boolean): void {
  toggle.setAttribute('aria-expanded', String(expanded));
  if (expanded) {
    menu.setAttribute('data-open', 'true');
  } else {
    menu.removeAttribute('data-open');
  }
}

function isExpanded(toggle: HTMLElement): boolean {
  return toggle.getAttribute('aria-expanded') === 'true';
}

export function initNavToggle(root: ParentNode = document): void {
  const toggle = root.querySelector<HTMLElement>(TOGGLE_SELECTOR);
  const menu = root.querySelector<HTMLElement>(MENU_SELECTOR);

  if (!toggle || !menu) {
    return;
  }

  setExpanded(toggle, menu, isExpanded(toggle));

  toggle.addEventListener('click', () => {
    setExpanded(toggle, menu, !isExpanded(toggle));
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isExpanded(toggle)) {
      setExpanded(toggle, menu, false);
      toggle.focus();
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initNavToggle());
  } else {
    initNavToggle();
  }
}
