export const errorHandler = async (
  ctx: { json: (obj: { error: string }, status: number) => Response },
  next: () => Promise<void>,
) => {
  try {
    await next();
  } catch (error) {
    console.error("Unhandled error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return ctx.json({ error: errorMessage }, 500);
  }
};
