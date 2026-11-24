// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initSessionsMenu } from '../../src/scripts/sessions-menu';

describe('desktop sessions disclosure', () => {
  let menu: HTMLDetailsElement;
  let trigger: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList));
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

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('opens on mouse hover and closes after leaving', () => {
    menu.open = false;
    menu.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    expect(menu.open).toBe(true);
    menu.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
    vi.advanceTimersByTime(250);
    expect(menu.open).toBe(false);
  });

  it('stays open while crossing the gap to the panel', () => {
    menu.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
    vi.advanceTimersByTime(100);
    menu.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    vi.advanceTimersByTime(250);
    expect(menu.open).toBe(true);
  });

  it('does not open on touch hover events', () => {
    menu.open = false;
    menu.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'touch' }));
    expect(menu.open).toBe(false);
  });

  it('preserves the open menu while keyboard focus is inside', () => {
    menu.querySelector('a')!.focus();
    menu.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
    vi.advanceTimersByTime(250);
    expect(menu.open).toBe(true);
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
