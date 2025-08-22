import { describe, it, expect, vi } from "vitest";
import { corsMiddleware } from "../../../src/interfaces/middlewares/corsMiddleware";
import { Context } from "hono";

vi.mock("hono/cors", () => ({
  cors: () => {
    return async (c: Context, next: () => Promise<void>) => {
      c.res.headers.set("Access-Control-Allow-Origin", "*");
      c.res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      c.res.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
      c.res.headers.set("Access-Control-Max-Age", "86400");
      await next();
    };
  },
}));

describe("corsMiddleware", () => {
  it("CORSヘッダーを適切に設定する", async () => {
    const nextMock = vi.fn().mockResolvedValue(undefined);

    const headerValues: Record<string, string> = {};
    const contextMock = {
      res: {
        headers: {
          set: (key: string, value: string) => {
            headerValues[key] = value;
          },
        },
      },
      req: {
        method: "GET",
      },
    } as unknown as Context;

    await corsMiddleware(contextMock, nextMock);

    expect(nextMock).toHaveBeenCalledTimes(1);

    expect(headerValues["Access-Control-Allow-Origin"]).toBe("*");
    expect(headerValues["Access-Control-Allow-Methods"]).toBe("GET, OPTIONS");
    expect(headerValues["Access-Control-Allow-Headers"]).toBe(
      "Content-Type, Authorization",
    );
  });
});
