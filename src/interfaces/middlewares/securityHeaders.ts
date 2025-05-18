import type { MiddlewareHandler } from "hono";

export const securityHeaders: MiddlewareHandler = async (ctx, next) => {
  await next();
  ctx.res.headers.set("X-Frame-Options", "DENY");
  ctx.res.headers.set("X-Content-Type-Options", "nosniff");
  ctx.res.headers.set("X-XSS-Protection", "1; mode=block");
  ctx.res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  ctx.res.headers.set("Referrer-Policy", "same-origin");
  return;
};
