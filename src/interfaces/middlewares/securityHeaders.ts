export const securityHeaders = async (ctx: { res: { headers: { set: (key: string, value: string) => void } } }, next: () => Promise<void>) => {
  await next();
  ctx.res.headers.set("X-Frame-Options", "DENY");
  ctx.res.headers.set("X-Content-Type-Options", "nosniff");
  ctx.res.headers.set("X-XSS-Protection", "1; mode=block");
  ctx.res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  ctx.res.headers.set("Referrer-Policy", "same-origin");
};
