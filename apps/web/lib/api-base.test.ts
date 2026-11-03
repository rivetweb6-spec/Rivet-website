import { describe, expect, it } from 'vitest';
import { browserApiBase } from './api-base';

describe('browserApiBase', () => {
  it('uses the same-origin proxy when no API URL is configured', () => {
    expect(browserApiBase(undefined, 'localhost')).toBe('/api');
  });

  it('uses the configured URL when the page is on localhost', () => {
    expect(browserApiBase('http://localhost:4000/api', 'localhost')).toBe('http://localhost:4000/api');
  });

  it('falls back to the proxy when a phone on the LAN would hit its own localhost', () => {
    expect(browserApiBase('http://localhost:4000/api', '192.168.100.201')).toBe('/api');
    expect(browserApiBase('http://127.0.0.1:4000/api', '192.168.0.150')).toBe('/api');
  });

  it('keeps a real public API URL regardless of where the page is opened', () => {
    expect(browserApiBase('https://api.example.com/api', '192.168.100.201')).toBe(
      'https://api.example.com/api',
    );
    expect(browserApiBase('https://api.example.com/api', 'www.example.com')).toBe(
      'https://api.example.com/api',
    );
  });
});
