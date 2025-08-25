interface CorsMiddlewareContext {
  res: {
    headers: {
      set: (key: string, value: string) => void;
    };
  };
  req: {
    method: string;
  };
}

export const corsMiddleware = async (ctx: CorsMiddlewareContext, next: () => Promise<void>) => {
  ctx.res.headers.set("Access-Control-Allow-Origin", "*");
  ctx.res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  ctx.res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (ctx.req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  await next();
};
