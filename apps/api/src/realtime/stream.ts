import { EventEmitter } from 'node:events';
import type { Request, Response } from 'express';

export const bus = new EventEmitter();
bus.setMaxListeners(0);

export type StreamEvent = { type: string; data: unknown };

export function emitEvent(event: StreamEvent) {
  bus.emit('event', event);
}

/** SSE endpoint handler — pushes live events (e.g. new quotation requests) to admins. */
export function sseHandler(req: Request, res: Response) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
  res.write('retry: 5000\n\n');

  const listener = (event: StreamEvent) => {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event.data)}\n\n`);
  };
  bus.on('event', listener);

  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    bus.off('event', listener);
    res.end();
  });
}
