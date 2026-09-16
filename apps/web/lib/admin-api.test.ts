import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AUTH_EXPIRED_EVENT,
  adminApi,
  clearSession,
  getStoredToken,
  setSession,
} from './admin-api';

const user = { id: '1', name: 'Admin', email: 'admin@rivet.com', role: 'ADMIN' };

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('adminApi token refresh', () => {
  beforeEach(() => {
    localStorage.clear();
    setSession('expired-token', user, 'refresh-token');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    clearSession();
  });

  it('refreshes the access token and retries a CRUD request', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/auth/refresh')) {
        return jsonResponse(200, { accessToken: 'new-access', refreshToken: 'new-refresh' });
      }
      const auth = new Headers(init?.headers as HeadersInit).get('Authorization');
      if (auth === 'Bearer expired-token') {
        return jsonResponse(401, { error: 'Invalid or expired token' });
      }
      if (auth === 'Bearer new-access' && init?.method === 'DELETE') {
        return jsonResponse(200, { ok: true });
      }
      return jsonResponse(500, { error: `unexpected ${url} ${auth}` });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(adminApi.team.remove('member-1')).resolves.toEqual({ ok: true });
    expect(getStoredToken()).toBe('new-access');
  });

  it('does not try to refresh a failed login', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(401, { error: 'Invalid credentials' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(adminApi.login('a@b.com', 'wrong')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid credentials',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('signals expiry when refresh also fails', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/auth/refresh')) {
        return jsonResponse(401, { error: 'Invalid refresh token' });
      }
      return jsonResponse(401, { error: 'Invalid or expired token' });
    });
    vi.stubGlobal('fetch', fetchMock);

    const expired = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, expired);

    await expect(adminApi.team.remove('member-1')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid or expired token',
    });
    expect(expired).toHaveBeenCalledTimes(1);

    window.removeEventListener(AUTH_EXPIRED_EVENT, expired);
  });
});
