import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The module under test uses `typeof window` to decide the API base.
// vitest.setup.ts sets jsdom so `window` exists and getApiUrl() returns '/api'.

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('api.quotationRequest cold-start retry', () => {
  let api: typeof import('./api')['api'];
  let ApiError: typeof import('./api')['ApiError'];

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./api');
    api = mod.api;
    ApiError = mod.ApiError;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const validPayload = {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '+251911111111',
    productInterest: 'Elevators',
    productName: 'Passenger Elevator',
    quantity: '2',
  };

  it('succeeds on first attempt without probing health', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(201, { ok: true, id: 'q1' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.quotationRequest(validPayload);

    expect(result).toEqual({ ok: true, id: 'q1' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/quotation-requests',
      expect.anything(),
    );
  });

  it('retries after network failure when health probe wakes the server', async () => {
    let callIndex = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      callIndex++;

      // 1st call: original POST → network failure (cold start)
      if (callIndex === 1) {
        expect(url).toContain('/quotation-requests');
        throw new TypeError('fetch failed');
      }
      // 2nd call: health probe → server is now awake
      if (callIndex === 2) {
        expect(url).toContain('/health');
        return jsonResponse(200, { status: 'ok' });
      }
      // 3rd call: retried POST → success
      if (callIndex === 3) {
        expect(url).toContain('/quotation-requests');
        return jsonResponse(201, { ok: true, id: 'q-retry' });
      }
      throw new Error(`unexpected call #${callIndex} to ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.quotationRequest(validPayload);

    expect(result).toEqual({ ok: true, id: 'q-retry' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does NOT retry on 400 validation error (server received the request)', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(400, { error: 'Validation failed' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.quotationRequest(validPayload)).rejects.toMatchObject({
      status: 400,
      message: 'Validation failed',
    });
    // Only 1 call — no probe, no retry
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on 500 server error (server received the request)', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(500, { error: 'Internal server error' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.quotationRequest(validPayload)).rejects.toMatchObject({
      status: 500,
      message: 'Internal server error',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on 504 gateway timeout (request may have been processed)', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(504, { error: 'Gateway Timeout' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.quotationRequest(validPayload)).rejects.toMatchObject({
      status: 504,
      message: 'Gateway Timeout',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gives up when health probe also fails (server truly unreachable)', async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.quotationRequest(validPayload)).rejects.toMatchObject({
      status: 0,
      message: 'Cannot reach the server. Please check your connection and try again.',
    });
    // 1st: original POST, 2nd: health probe — both fail, no 3rd call
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('gives up when health probe succeeds but retried POST also fails', async () => {
    let callIndex = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      callIndex++;
      const url = String(input);

      // 1st call: original POST → network failure
      if (callIndex === 1) throw new TypeError('fetch failed');
      // 2nd call: health probe → OK
      if (callIndex === 2) return jsonResponse(200, { status: 'ok' });
      // 3rd call: retried POST → also network failure
      if (callIndex === 3) throw new TypeError('fetch failed');
      throw new Error(`unexpected call #${callIndex} to ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.quotationRequest(validPayload)).rejects.toMatchObject({
      status: 0,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does NOT retry for a non-ApiError exception (e.g. JSON parse error)', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn(async () => {
        throw new SyntaxError('Unexpected token in JSON');
      }),
    } as unknown as Response));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.quotationRequest(validPayload)).rejects.toThrow(
      SyntaxError,
    );
    // fetch was called exactly once — no /health probe and no retry
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/quotation-requests',
      expect.anything(),
    );
  });
});

describe('GET retry on transient failures', () => {
  let api: typeof import('./api')['api'];
  let ApiError: typeof import('./api')['ApiError'];

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./api');
    api = mod.api;
    ApiError = mod.ApiError;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('retries once after a dropped connection and returns the data', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(jsonResponse(200, { categories: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.categories.list()).resolves.toEqual({ categories: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([502, 503, 504])('retries once after a %i gateway response', async (status) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(status, { error: 'gateway' }))
      .mockResolvedValueOnce(jsonResponse(200, { categories: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.categories.list()).resolves.toEqual({ categories: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry a 404, so detail pages still resolve to not found', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(404, { error: 'Not found' }));
    vi.stubGlobal('fetch', fetchMock);
    const err = await api.categories.bySlug('missing').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry a 429 rate-limit response', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(429, { error: 'Too many requests' }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.categories.list()).rejects.toMatchObject({ status: 429 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gives up after one retry', async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.categories.list()).rejects.toMatchObject({ status: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
