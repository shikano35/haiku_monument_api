import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { startWorker, stopWorker, resetDb } from "../setup";
import type { Unstable_DevWorker } from "wrangler";

type PoetResponse = {
  id: number;
  name: string;
  biography: string;
  link_url: string;
  image_url: string;
  created_at: string;
  updated_at: string;
};

describe("Poets API", () => {
  let worker: Unstable_DevWorker;

  beforeAll(async () => {
    worker = await startWorker();
  });

  afterAll(async () => {
    await stopWorker();
  });

  beforeEach(async () => {
    await resetDb();
  });

  describe("GET Endpoints", () => {
    it("GET /poets - すべての俳人一覧が取得できる", async () => {
      const res = await worker.fetch("/poets", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(200);

      const responseBody = (await res.json()) as PoetResponse[];
      expect(Array.isArray(responseBody)).toBe(true);

      // 最初の5件が期待通りの構造を持っているか確認
      const filtered = responseBody.filter(
        (p: PoetResponse) => typeof p.id === "number" && p.id >= 1 && p.id <= 5,
      );
      expect(filtered.length).toBe(5);

      // 各俳人のデータ構造を検証
      filtered.forEach((poet: PoetResponse) => {
        expect(poet).toHaveProperty("id");
        expect(poet).toHaveProperty("name");
        expect(poet).toHaveProperty("biography");
        expect(poet).toHaveProperty("link_url");
        expect(poet).toHaveProperty("image_url");
        expect(poet).toHaveProperty("created_at");
        expect(poet).toHaveProperty("updated_at");
      });

      expect(filtered[0]).toEqual({
        id: 1,
        name: "松尾芭蕉",
        biography: "江戸時代の俳人。奥の細道の著者。",
        link_url: "https://example.com/basho",
        image_url: "https://example.com/basho.jpg",
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it("GET /poets/1 - 指定されたidの俳人が取得できる", async () => {
      const res = await worker.fetch("/poets/1", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(200);

      const responseBody = (await res.json()) as PoetResponse;
      expect(responseBody).toEqual({
        id: 1,
        name: "松尾芭蕉",
        biography: "江戸時代の俳人。奥の細道の著者。",
        link_url: "https://example.com/basho",
        image_url: "https://example.com/basho.jpg",
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it("GET /poets/999 - 存在しないidの場合は404を返す", async () => {
      const res = await worker.fetch("/poets/999", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(404);

      const responseBody = (await res.json()) as { error: string };
      expect(responseBody).toHaveProperty("error");
    });
  });
});
