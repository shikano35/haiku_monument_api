import { unstable_dev } from "wrangler";
import type { Unstable_DevWorker } from "wrangler";
import "../setup/mockD1";

describe("Sources API GET Endpoints", () => {
  let worker: Unstable_DevWorker;

  beforeAll(async () => {
    worker = await unstable_dev("./src/index.ts", {
      bindings: { DB: globalThis.DB },
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it("GET /sources - すべてのソース一覧が取得できる", async () => {
    const res = await worker.fetch("/sources", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    const responseBody = await res.json();
    expect(responseBody).toEqual([
      {
        id: 1,
        title: "奥の細道",
        author: "松尾芭蕉",
        year: 1702,
        url: "https://example.com/okuno-hosomichi",
        publisher: "江戸出版",
        created_at: "2025-03-05 23:25:51",
        updated_at: "2025-03-05 23:25:51",
      },
      {
        id: 2,
        title: "おらが春",
        author: "小林一茶",
        year: 1819,
        url: "https://example.com/oraga-haru",
        publisher: "江戸出版",
        created_at: "2025-03-05 23:25:51",
        updated_at: "2025-03-05 23:25:51",
      },
      {
        id: 3,
        title: "蕪村句集",
        author: "与謝蕪村",
        year: 1775,
        url: "https://example.com/buson-kushu",
        publisher: "江戸出版",
        created_at: "2025-03-05 23:25:51",
        updated_at: "2025-03-05 23:25:51",
      },
      {
        id: 4,
        title: "俳句革新",
        author: "正岡子規",
        year: 1893,
        url: "https://example.com/haiku-kakushin",
        publisher: "明治出版社",
        created_at: "2025-03-05 23:25:51",
        updated_at: "2025-03-05 23:25:51",
      },
      {
        id: 5,
        title: "ホトトギス",
        author: "高浜虚子",
        year: 1897,
        url: "https://example.com/hototogisu",
        publisher: "明治出版社",
        created_at: "2025-03-05 23:25:51",
        updated_at: "2025-03-05 23:25:51",
      },
    ]);
  });

  it("GET /sources/1 - 指定されたidのソースが取得できる", async () => {
    const res = await worker.fetch("/sources/1", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    const responseBody = await res.json();
    expect(responseBody).toEqual({
      id: 1,
      title: "奥の細道",
      author: "松尾芭蕉",
      year: 1702,
      url: "https://example.com/okuno-hosomichi",
      publisher: "江戸出版",
      created_at: "2025-03-05 23:25:51",
      updated_at: "2025-03-05 23:25:51",
    });
  });
});
