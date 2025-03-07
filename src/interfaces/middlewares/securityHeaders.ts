import type { MiddlewareHandler } from 'hono';

export const securityHeaders: MiddlewareHandler = async (ctx, next) => {
  await next();
  ctx.res.headers.set('x-frame-options', 'SAMEORIGIN');
  ctx.res.headers.set('cross-origin-opener-policy', 'same-origin');
  ctx.res.headers.set('referrer-policy', 'same-origin');
  return;
};
