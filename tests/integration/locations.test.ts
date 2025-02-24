import { z } from "zod";
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../../src/index";

const locationSchema = z.object({
  id: z.number(),
  prefecture: z.string(),
  region: z.string().nullable(),
  address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  name: z.string().nullable(),
});

describe("Locations API GET Endpoints", () => {
  
  it("GET /locations - すべてのロケーション一覧が取得できる", async () => {
    const request = new Request("http://localhost:8787/locations");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("GET /locations/1 - 存在するロケーションの詳細を取得できるか、存在しなければ404", async () => {
    const request = new Request("http://localhost:8787/locations/1");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    if (response.status === 200) {
      const json = await response.json();
      const location = locationSchema.parse(json);
      expect(location.id).toBe(1);
      expect(typeof location.prefecture).toBe("string");
    } else {
      expect(response.status).toBe(404);
    }
  });

  it("GET /locations/1/haiku-monuments - 該当ロケーションの句碑一覧が取得できる", async () => {
    const request = new Request("http://localhost:8787/locations/1/haiku-monuments");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
