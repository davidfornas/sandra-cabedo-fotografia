// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { initSessionsMenu } from '../../src/scripts/sessions-menu';

describe('desktop sessions disclosure', () => {
  let menu: HTMLDetailsElement;
  let trigger: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <details data-sessions-menu>
        <summary>Sesiones</summary>
        <a href="/embarazo/">Embarazo</a>
      </details>
      <button id="outside">Fuera</button>
    `;
    menu = document.querySelector('details')!;
    trigger = menu.querySelector('summary')!;
    initSessionsMenu();
    menu.open = true;
  });

  it('Escape closes and restores focus to the disclosure', () => {
    menu.querySelector('a')!.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('an outside click closes without taking focus back', () => {
    const outside = document.querySelector<HTMLButtonElement>('#outside')!;
    outside.click();
    expect(menu.open).toBe(false);
    expect(document.activeElement).not.toBe(trigger);
  });

  it('moving focus outside closes the menu', () => {
    menu.querySelector('a')!.focus();
    document.querySelector<HTMLButtonElement>('#outside')!.focus();
    expect(menu.open).toBe(false);
  });

  it('moving focus between the trigger and cards keeps it open', () => {
    trigger.focus();
    menu.querySelector('a')!.focus();
    expect(menu.open).toBe(true);
  });
});
