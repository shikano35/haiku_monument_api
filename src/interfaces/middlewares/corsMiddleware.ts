import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: '*',
  allowMethods: ['GET'],
  allowHeaders: ['Content-Type', 'Authorization'],
});
