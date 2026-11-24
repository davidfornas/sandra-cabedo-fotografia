/** Native details supplies click/keyboard activation and expanded semantics. */
export function initSessionsMenu(root: ParentNode = document): void {
  const menu = root.querySelector<HTMLDetailsElement>('[data-sessions-menu]');
  const trigger = menu?.querySelector('summary');
  if (!menu || !trigger) return;

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !menu.open) return;
    event.preventDefault();
    menu.open = false;
    trigger.focus();
  });

  document.addEventListener('click', (event: MouseEvent) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) {
      menu.open = false;
    }
  });

  document.addEventListener('focusin', (event: FocusEvent) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) {
      menu.open = false;
    }
  });

  window.matchMedia('(min-width: 769px)').addEventListener('change', () => {
    menu.open = false;
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initSessionsMenu());
  } else {
    initSessionsMenu();
  }
}
