import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ImageLightbox } from './image-lightbox';

// jsdom does no layout, so every element reports zero client rects; the focus
// trap treats that as "hidden". Pretend everything is laid out.
const original = HTMLElement.prototype.getClientRects;
beforeAll(() => {
  HTMLElement.prototype.getClientRects = function () {
    return [{ width: 1, height: 1 }] as unknown as DOMRectList;
  };
});
afterAll(() => {
  HTMLElement.prototype.getClientRects = original;
});

const items = [
  { src: '/a.jpg', title: 'First' },
  { src: '/b.jpg', title: 'Second' },
];

async function nextFrame() {
  await act(async () => {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  });
}

describe('ImageLightbox focus handling', () => {
  it('focuses the visible Close button when it opens', async () => {
    render(<ImageLightbox items={items} index={0} onClose={() => {}} onIndexChange={() => {}} />);
    await nextFrame();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
  });

  it('keeps the full-screen backdrop out of the Tab order', () => {
    render(<ImageLightbox items={items} index={0} onClose={() => {}} onIndexChange={() => {}} />);
    const buttons = Array.from(document.querySelectorAll('[role="dialog"] button'));
    const tabbable = buttons.filter((b) => (b as HTMLElement).tabIndex >= 0);
    expect(tabbable.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Close',
      'Previous image',
      'Next image',
    ]);
  });

  it('wraps Tab and Shift+Tab inside the dialog', async () => {
    render(<ImageLightbox items={items} index={0} onClose={() => {}} onIndexChange={() => {}} />);
    await nextFrame();
    const close = screen.getByRole('button', { name: 'Close' });
    const next = screen.getByRole('button', { name: 'Next image' });

    next.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(close);

    close.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(next);
  });

  it('closes on Escape and returns focus to the opener', async () => {
    const opener = document.createElement('button');
    opener.textContent = 'Open image';
    document.body.appendChild(opener);
    opener.focus();

    const onClose = vi.fn();
    const { unmount } = render(
      <ImageLightbox items={items} index={0} onClose={onClose} onIndexChange={() => {}} />,
    );
    await nextFrame();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();

    unmount();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });
});
