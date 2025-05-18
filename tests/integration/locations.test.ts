import { unstable_dev } from "wrangler";
import type { Unstable_DevWorker } from "wrangler";

describe("Locations API GET Endpoints", () => {
  let worker: Unstable_DevWorker;

  beforeAll(async () => {
    worker = await unstable_dev("./src/index.ts", {
      experimental: {
        disableExperimentalWarning: true,
      },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it("GET /locations - すべてのロケーション一覧が取得できる", async () => {
    const res = await worker.fetch("/locations", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    const responseBody = await res.json();
    expect(responseBody).toEqual([
      {
        id: 1,
        prefecture: "東京都",
        region: "関東",
        address: "東京都台東区上野公園",
        name: "上野恩賜公園",
        latitude: 35.715298,
        longitude: 139.773037,
      },
      {
        id: 2,
        prefecture: "長野県",
        region: "中部",
        address: "長野県長野市",
        name: "一茶記念館",
        latitude: 36.648583,
        longitude: 138.194953,
      },
      {
        id: 3,
        prefecture: "京都府",
        region: "近畿",
        address: "京都府京都市中京区",
        name: "与謝蕪村の句碑",
        latitude: 35.011564,
        longitude: 135.768149,
      },
      {
        id: 4,
        prefecture: "愛媛県",
        region: "四国",
        address: "愛媛県松山市",
        name: "子規記念館",
        latitude: 33.839157,
        longitude: 132.765575,
      },
      {
        id: 5,
        prefecture: "兵庫県",
        region: "近畿",
        address: "兵庫県神戸市",
        name: "高浜虚子の句碑",
        latitude: 34.690084,
        longitude: 135.19551,
      },
    ]);
  });

  it("GET /locations/1 - 指定されたidのロケーションが取得できる", async () => {
    const res = await worker.fetch("/locations/1", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    const responseBody = await res.json();
    expect(responseBody).toEqual({
      id: 1,
      prefecture: "東京都",
      region: "関東",
      address: "東京都台東区上野公園",
      latitude: 35.715298,
      longitude: 139.773037,
      name: "上野恩賜公園",
    });
  });
});
