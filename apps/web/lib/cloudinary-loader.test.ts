import { describe, it, expect } from 'vitest';
import rivetImageLoader from './cloudinary-loader';

describe('rivetImageLoader', () => {
  it('injects Cloudinary transforms after /upload/', () => {
    const out = rivetImageLoader({
      src: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      width: 800,
      quality: 70,
    });
    expect(out).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,c_limit,w_800,q_70/sample.jpg',
    );
  });

  it('replaces an existing Cloudinary transform segment', () => {
    const out = rivetImageLoader({
      src: 'https://res.cloudinary.com/demo/image/upload/w_100,q_50/sample.jpg',
      width: 1200,
    });
    expect(out).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,c_limit,w_1200,q_75/sample.jpg',
    );
  });

  it('defaults quality to 75 when omitted', () => {
    const out = rivetImageLoader({
      src: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      width: 400,
    });
    expect(out).toContain('q_75');
  });

  it('optimizes Unsplash URLs via query params', () => {
    const out = rivetImageLoader({
      src: 'https://images.unsplash.com/photo-123?auto=format',
      width: 640,
      quality: 80,
    });
    const url = new URL(out);
    expect(url.searchParams.get('w')).toBe('640');
    expect(url.searchParams.get('q')).toBe('80');
    expect(url.searchParams.get('auto')).toBe('format');
  });

  it('passes data and blob URIs through unchanged', () => {
    const data = 'data:image/png;base64,AAAA';
    expect(rivetImageLoader({ src: data, width: 10 })).toBe(data);
  });

  it('embeds width on unknown remote hosts so Next.js accepts the loader', () => {
    const src = 'https://example.com/pic.jpg';
    expect(rivetImageLoader({ src, width: 500 })).toBe('https://example.com/pic.jpg?w=500');
  });

  it('embeds width on relative upload paths', () => {
    expect(rivetImageLoader({ src: '/api/uploads/files/hero.jpg', width: 1200 })).toBe(
      '/api/uploads/files/hero.jpg?w=1200',
    );
  });

  it('serves uploads stored with a localhost API URL through the same-origin proxy', () => {
    expect(
      rivetImageLoader({ src: 'http://localhost:4000/api/uploads/files/hero.jpg', width: 640 }),
    ).toBe('/api/uploads/files/hero.jpg?w=640');
    expect(
      rivetImageLoader({ src: 'http://127.0.0.1:4000/api/uploads/files/a.png', width: 640 }),
    ).toBe('/api/uploads/files/a.png?w=640');
  });

  it('leaves uploads on a real API host untouched', () => {
    expect(
      rivetImageLoader({ src: 'https://api.example.com/api/uploads/files/hero.jpg', width: 640 }),
    ).toBe('https://api.example.com/api/uploads/files/hero.jpg?w=640');
  });
});
