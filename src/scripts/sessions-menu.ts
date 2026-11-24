/** Native details supplies click/keyboard activation and expanded semantics. */
export function initSessionsMenu(root: ParentNode = document): void {
  const menu = root.querySelector<HTMLDetailsElement>('[data-sessions-menu]');
  const trigger = menu?.querySelector('summary');
  if (!menu || !trigger) return;

  const desktop = window.matchMedia('(min-width: 769px)');
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  function cancelClose(): void {
    clearTimeout(closeTimer);
    closeTimer = undefined;
  }

  function close(): void {
    cancelClose();
    menu!.open = false;
  }

  menu.addEventListener('pointerenter', (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || !desktop.matches || !hover.matches) return;
    cancelClose();
    menu.open = true;
  });

  menu.addEventListener('pointerleave', (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || !desktop.matches || !hover.matches) return;
    cancelClose();
    // Allow the pointer to cross the space between the trigger and panel.
    closeTimer = setTimeout(() => {
      if (!menu.contains(document.activeElement)) close();
    }, 250);
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !menu.open) return;
    event.preventDefault();
    close();
    trigger.focus();
  });

  document.addEventListener('click', (event: MouseEvent) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) {
      close();
    }
  });

  document.addEventListener('focusin', (event: FocusEvent) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) {
      close();
    }
  });

  desktop.addEventListener('change', close);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initSessionsMenu());
  } else {
    initSessionsMenu();
  }
}
