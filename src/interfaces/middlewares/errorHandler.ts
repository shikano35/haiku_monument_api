import type { Context, Next } from "hono";

export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error("Unhandled error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return ctx.json({ error: errorMessage }, 500);
  }
};
