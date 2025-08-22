import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { startWorker, stopWorker, resetDb } from "../setup";
import type { Unstable_DevWorker } from "wrangler";

type LocationResponse = {
  id: number;
  prefecture: string;
  region: string;
  address: string | null;
  place_name: string | null;
  municipality: string | null;
  latitude: number;
  longitude: number;
};

describe("Locations API", () => {
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
    it("GET /locations - すべてのロケーション一覧が取得できる", async () => {
      const res = await worker.fetch("/locations", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(200);

      const responseBody = (await res.json()) as LocationResponse[];
      expect(Array.isArray(responseBody)).toBe(true);

      const filtered = responseBody.filter(
        (l: LocationResponse) =>
          typeof l.id === "number" && l.id >= 1 && l.id <= 5,
      );
      expect(filtered.length).toBe(5);

      filtered.forEach((location: LocationResponse) => {
        expect(location).toHaveProperty("id");
        expect(location).toHaveProperty("prefecture");
        expect(location).toHaveProperty("region");
        expect(location).toHaveProperty("address");
        expect(location).toHaveProperty("place_name");
        expect(location).toHaveProperty("latitude");
        expect(location).toHaveProperty("longitude");
      });

      expect(filtered[0]).toEqual({
        id: 1,
        imi_pref_code: "24",
        region: "東海",
        prefecture: "三重県",
        municipality: "桑名市",
        address: "桑名市北寺町47",
        place_name: "本統寺",
        latitude: 35.065502,
        longitude: 136.692193,
        geohash: null,
        geom_geojson: null,
        accuracy_m: null,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it("GET /locations/1 - 指定されたidのロケーションが取得できる", async () => {
      const res = await worker.fetch("/locations/1", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(200);

      const responseBody = (await res.json()) as LocationResponse;
      expect(responseBody).toEqual({
        id: 1,
        imi_pref_code: "24",
        region: "東海",
        prefecture: "三重県",
        municipality: "桑名市",
        address: "桑名市北寺町47",
        place_name: "本統寺",
        latitude: 35.065502,
        longitude: 136.692193,
        geohash: null,
        geom_geojson: null,
        accuracy_m: null,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it("GET /locations/999 - 存在しないidの場合は404を返す", async () => {
      const res = await worker.fetch("/locations/999", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(404);

      const responseBody = (await res.json()) as { error: string };
      expect(responseBody).toHaveProperty("error");
    });
  });
});
