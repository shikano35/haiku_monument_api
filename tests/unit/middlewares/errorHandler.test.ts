import type { Context } from "hono";
import { describe, expect, it, vi } from "vitest";
import { errorHandler } from "../../../src/interfaces/middlewares/errorHandler";

describe("errorHandler", () => {
  it("エラーなしの場合は次のハンドラーを呼び出す", async () => {
    const nextMock = vi.fn().mockResolvedValue(undefined);
    const contextMock = {} as Context;

    await errorHandler(contextMock, nextMock);

    expect(nextMock).toHaveBeenCalledTimes(1);
  });

  it("エラーが発生した場合はJSONレスポンスを返す", async () => {
    const errorMsg = "テストエラー";
    const error = new Error(errorMsg);

    const nextMock = vi.fn().mockImplementation(() => {
      throw error;
    });

    const jsonMock = vi.fn().mockReturnValue(undefined);
    const contextMock = {
      json: jsonMock,
    } as unknown as Context;

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await errorHandler(contextMock, nextMock);

    expect(consoleErrorSpy).toHaveBeenCalledWith("Unhandled error:", error);

    expect(jsonMock).toHaveBeenCalledWith(
      { error: expect.stringContaining(errorMsg) },
      500,
    );

    consoleErrorSpy.mockRestore();
  });
});
