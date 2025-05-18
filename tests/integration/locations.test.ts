import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startWorker, stopWorker, resetDb } from '../setup';
import type { Unstable_DevWorker } from 'wrangler';

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

describe('Locations API', () => {
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

  describe('GET Endpoints', () => {
    it('GET /locations - すべてのロケーション一覧が取得できる', async () => {
      const res = await worker.fetch('/locations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(res.status).toBe(200);
      
      const responseBody = await res.json() as LocationResponse[];
      expect(Array.isArray(responseBody)).toBe(true);
      
      const filtered = responseBody.filter((l: LocationResponse) => typeof l.id === 'number' && l.id >= 1 && l.id <= 5);
      expect(filtered.length).toBe(5);
      
      filtered.forEach((location: LocationResponse) => {
        expect(location).toHaveProperty('id');
        expect(location).toHaveProperty('prefecture');
        expect(location).toHaveProperty('region');
        expect(location).toHaveProperty('address');
        expect(location).toHaveProperty('place_name');
        expect(location).toHaveProperty('latitude');
        expect(location).toHaveProperty('longitude');
      });
      
      expect(filtered[0]).toEqual({
        id: 1,
        prefecture: '東京都',
        region: '関東',
        address: '東京都台東区上野公園',
        place_name: '上野恩賜公園',
        municipality: null,
        latitude: 35.715298,
        longitude: 139.773037,
      });
    });

    it('GET /locations/1 - 指定されたidのロケーションが取得できる', async () => {
      const res = await worker.fetch('/locations/1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(res.status).toBe(200);
      
      const responseBody = await res.json() as LocationResponse;
      expect(responseBody).toEqual({
        id: 1,
        prefecture: '東京都',
        region: '関東',
        address: '東京都台東区上野公園',
        place_name: '上野恩賜公園',
        municipality: null,
        latitude: 35.715298,
        longitude: 139.773037,
      });
    });
    
    it('GET /locations/999 - 存在しないidの場合は404を返す', async () => {
      const res = await worker.fetch('/locations/999', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(res.status).toBe(404);
      
      const responseBody = await res.json() as { error: string };
      expect(responseBody).toHaveProperty('error');
    });
  });
});