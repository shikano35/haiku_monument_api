import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { startWorker, stopWorker, resetDb } from "../setup";
import type { Unstable_DevWorker } from "wrangler";

type SourceResponse = {
  id: number;
  title: string;
  author: string | null;
  source_year: number | null;
  url: string | null;
  publisher: string | null;
  created_at: string;
  updated_at: string;
};

describe("Sources API", () => {
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
    it("GET /sources - すべてのソース一覧が取得できる", async () => {
      const res = await worker.fetch("/sources", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(200);

      const responseBody = (await res.json()) as SourceResponse[];
      expect(Array.isArray(responseBody)).toBe(true);

      const filtered = responseBody.filter(
        (s: SourceResponse) =>
          typeof s.id === "number" && s.id >= 1 && s.id <= 5,
      );
      expect(filtered.length).toBe(5);

      expect(filtered).toEqual([
        {
          id: 1,
          citation: "俳句のくに・三重（三重県庁、2011年）",
          title: "俳句のくに・三重",
          author: "三重県庁",
          publisher: "三重県庁",
          source_year: 2011,
          url: "https://www.bunka.pref.mie.lg.jp/haiku/",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
        {
          id: 2,
          citation: "奥の細道（岩波文庫、1957年）",
          title: "奥の細道",
          author: "松尾芭蕉",
          publisher: "岩波書店",
          source_year: 1957,
          url: "https://example.com/okuno-hosomichi",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
        {
          id: 3,
          citation: "おらが春（岩波文庫、1960年）",
          title: "おらが春",
          author: "小林一茶",
          publisher: "岩波書店",
          source_year: 1960,
          url: "https://example.com/oraga-haru",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
        {
          id: 4,
          citation: "蕪村句集（岩波文庫、1963年）",
          title: "蕪村句集",
          author: "与謝蕪村",
          publisher: "岩波書店",
          source_year: 1963,
          url: "https://example.com/buson-kushu",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
        {
          id: 5,
          citation: "子規全集（講談社、1975年）",
          title: "子規全集",
          author: "正岡子規",
          publisher: "講談社",
          source_year: 1975,
          url: "https://example.com/shiki-zenshu",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      ]);
    });

    it("GET /sources/1 - 指定されたidのソースが取得できる", async () => {
      const res = await worker.fetch("/sources/1", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(200);

      const responseBody = (await res.json()) as SourceResponse;
      expect(responseBody).toEqual({
        id: 1,
        citation: "俳句のくに・三重（三重県庁、2011年）",
        title: "俳句のくに・三重",
        author: "三重県庁",
        publisher: "三重県庁",
        source_year: 2011,
        url: "https://www.bunka.pref.mie.lg.jp/haiku/",
        monuments: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            canonical_name: "本統寺 句碑（松尾芭蕉）",
          }),
        ]),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it("GET /sources/999 - 存在しないidの場合は404を返す", async () => {
      const res = await worker.fetch("/sources/999", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(404);

      const responseBody = (await res.json()) as { error: string };
      expect(responseBody).toHaveProperty("error");
    });
  });
});
