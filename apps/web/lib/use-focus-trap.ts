'use client';

import * as React from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const FORM_FIELD = 'input:not([disabled]):not([type="hidden"]):not([type="file"]), select:not([disabled]), textarea:not([disabled])';

function isVisible(el: HTMLElement): boolean {
  if (el.closest('[inert]')) return false;
  // sr-only inputs (e.g. visually hidden file inputs) still count as focusable.
  return el.getClientRects().length > 0 || el.matches('input');
}

function focusablesIn(roots: HTMLElement[]): HTMLElement[] {
  // A root may itself be focusable (e.g. the header button that closes a drawer).
  const all = roots.flatMap((root) => [
    ...(root.matches(FOCUSABLE) ? [root] : []),
    ...Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)),
  ]);
  return all
    .filter((el) => el.tabIndex >= 0 && isVisible(el))
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}

type Options = {
  /**
   * Where focus goes when the trap activates. Defaults to the first form
   * field, then the first focusable element.
   */
  initialFocus?: () => HTMLElement | null | undefined;
  /** Return focus to the previously focused element on deactivate (default true). */
  restoreFocus?: boolean;
};

/**
 * Keep keyboard focus inside an open overlay (dialog, drawer, lightbox):
 * - moves focus in when `active` turns on,
 * - cycles Tab / Shift+Tab within the given containers,
 * - pulls focus back if it escapes (e.g. a click behind the overlay),
 * - restores focus to where it was when the overlay closes.
 *
 * Several containers can form one trap — e.g. a drawer plus the header
 * button that closes it — and are cycled in document order.
 */
export function useFocusTrap(
  refs: React.RefObject<HTMLElement | null> | React.RefObject<HTMLElement | null>[],
  active: boolean,
  options: Options = {},
): void {
  // Latest options/refs without re-running the trap on every render.
  const optionsRef = React.useRef(options);
  const refsRef = React.useRef(refs);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
    refsRef.current = refs;
  });

  React.useEffect(() => {
    if (!active) return;

    const roots = () =>
      (Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current])
        .map((r) => r.current)
        .filter((el): el is HTMLElement => !!el);
    const inside = (node: Node | null) => !!node && roots().some((root) => root.contains(node));

    const previous = document.activeElement as HTMLElement | null;

    const focusInitial = () => {
      const explicit = optionsRef.current.initialFocus?.();
      if (explicit) return explicit.focus();
      const list = roots();
      const field = list.map((root) => root.querySelector<HTMLElement>(FORM_FIELD)).find(Boolean);
      (field ?? focusablesIn(list)[0])?.focus();
    };
    // Wait a frame so portals / enter animations have mounted the content.
    const frame = requestAnimationFrame(focusInitial);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusablesIn(roots());
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const current = document.activeElement as HTMLElement | null;
      if (!inside(current)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!inside(e.target as Node)) focusablesIn(roots())[0]?.focus();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      if (optionsRef.current.restoreFocus !== false && previous?.isConnected) {
        previous.focus();
      }
    };
  }, [active]);
}
