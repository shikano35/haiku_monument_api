import type { Context, Next } from 'hono';

export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);
    ctx.status(500);
    return ctx.json({ error: 'Internal Server Error' });
  }
};
