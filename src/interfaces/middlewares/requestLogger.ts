export const requestLogger = async (
  ctx: { req: { method: string; url: string } },
  next: () => Promise<void>,
) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`);
  await next();
};
