import { describe, expect, it } from 'vitest';
import { sameOriginUploadUrl, toAbsoluteMediaUrl } from './media';

const FILE = '/api/uploads/files/1790772323886-f7dd4943eefb6898.jpg';

describe('sameOriginUploadUrl', () => {
  it.each([
    `http://localhost:4000${FILE}`,
    `http://127.0.0.1:4000${FILE}`,
    `http://[::1]:4000${FILE}`,
    `http://0.0.0.0:4000${FILE}`,
    `http://192.168.100.201:3000${FILE}`,
    `http://10.0.0.5${FILE}`,
    `http://172.16.4.2:8080${FILE}`,
    `http://172.31.255.1${FILE}`,
    `http://169.254.10.10${FILE}`,
  ])('maps private-host upload %s to the same-origin path', (src) => {
    expect(sameOriginUploadUrl(src)).toBe(FILE);
  });

  it.each([
    `https://api.rivetplc.com${FILE}`,
    `http://172.32.0.1${FILE}`, // outside 172.16/12
    `http://192.169.1.1${FILE}`, // not 192.168
    'https://images.unsplash.com/photo-1?w=800',
    'https://res.cloudinary.com/demo/image/upload/v1/a.jpg',
    'http://192.168.1.10/some/other/path.jpg', // not an upload path — left as is
    FILE,
    '/images/rivet-elevator-hero.webp',
  ])('leaves %s unchanged', (src) => {
    expect(sameOriginUploadUrl(src)).toBe(src);
  });
});

describe('toAbsoluteMediaUrl', () => {
  const SITE = 'https://rivetplc.com';

  it('publishes private-host uploads on the public site origin', () => {
    expect(toAbsoluteMediaUrl(`http://192.168.100.201:3000${FILE}`, SITE)).toBe(`${SITE}${FILE}`);
    expect(toAbsoluteMediaUrl(`http://localhost:4000${FILE}`, `${SITE}/`)).toBe(`${SITE}${FILE}`);
  });

  it('keeps public absolute URLs and resolves relative ones', () => {
    expect(toAbsoluteMediaUrl('https://images.unsplash.com/p?w=1', SITE)).toBe('https://images.unsplash.com/p?w=1');
    expect(toAbsoluteMediaUrl('/images/hero.webp', SITE)).toBe(`${SITE}/images/hero.webp`);
    expect(toAbsoluteMediaUrl('', SITE)).toBe('');
  });
});
