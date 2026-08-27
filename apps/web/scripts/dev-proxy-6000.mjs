/**
 * Dev proxy: Next.js blocks port 6000 (X11 reserved), so we run Next on 3000
 * and expose http://localhost:6000 here (IPv4 + IPv6).
 */
import http from 'node:http';
import net from 'node:net';
import { request as httpRequest } from 'node:http';

const LISTEN_PORT = 6000;
const TARGET_HOST = '127.0.0.1';
const TARGET_PORT = 3000;

const server = http.createServer((req, res) => {
  const headers = { ...req.headers, host: `${TARGET_HOST}:${TARGET_PORT}` };
  const proxyReq = httpRequest(
    {
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: req.url,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Proxy error: ${err.message}. Is Next.js running on :${TARGET_PORT}?`);
  });
  req.pipe(proxyReq);
});

server.on('upgrade', (req, socket, head) => {
  const headers = [
    `${req.method} ${req.url} HTTP/1.1`,
    ...Object.entries(req.headers).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`),
    '',
    '',
  ].join('\r\n');

  const target = net.connect(TARGET_PORT, TARGET_HOST, () => {
    target.write(headers);
    if (head?.length) target.write(head);
    socket.pipe(target);
    target.pipe(socket);
  });
  target.on('error', () => socket.destroy());
  socket.on('error', () => target.destroy());
});

server.listen(LISTEN_PORT, '::', () => {
  console.log(`Proxy ready: http://localhost:${LISTEN_PORT} -> http://${TARGET_HOST}:${TARGET_PORT}`);
  console.log(`Also:       http://127.0.0.1:${LISTEN_PORT}`);
});
