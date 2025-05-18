import type { Context, Next } from "hono";

export const requestLogger = async (ctx: Context, next: Next) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`);
  await next();
};
