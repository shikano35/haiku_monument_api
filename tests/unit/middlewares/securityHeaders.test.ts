import { describe, it, expect, vi } from "vitest";
import { securityHeaders } from "../../../src/interfaces/middlewares/securityHeaders";
import { Context } from "hono";

describe("securityHeaders", () => {
  it("セキュリティヘッダーを適切に設定する", async () => {
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
    } as unknown as Context;

    await securityHeaders(contextMock, nextMock);

    expect(nextMock).toHaveBeenCalledTimes(1);

    expect(headerValues["X-Content-Type-Options"]).toBe("nosniff");
    expect(headerValues["X-Frame-Options"]).toBe("DENY");
    expect(headerValues["X-XSS-Protection"]).toBe("1; mode=block");
    expect(headerValues["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(headerValues["Referrer-Policy"]).toBe("same-origin");
  });
});
