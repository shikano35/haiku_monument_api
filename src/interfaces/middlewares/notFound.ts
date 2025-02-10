import type { Context } from 'hono';

export const notFound = (ctx: Context) => {
  return ctx.json({ error: 'Not Found' }, 404);
};