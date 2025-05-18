import { startWorker, stopWorker, resetDb } from '../setup';
import type { Unstable_DevWorker } from 'wrangler';

let worker: Unstable_DevWorker;

describe('Poets API GET Endpoints', () => {
  beforeAll(async () => {
    worker = await startWorker();
  });

  afterAll(async () => {
    await stopWorker();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('GET /poets - すべての俳人一覧が取得できる', async () => {
    const res = await worker.fetch('/poets', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);
    const responseBody = await res.json();
    if (!Array.isArray(responseBody)) throw new Error('レスポンスが配列ではありません');
    const filtered = responseBody.filter((p) => typeof p.id === 'number' && p.id >= 1 && p.id <= 5);
    expect(filtered).toEqual([
      {
        id: 1,
        name: '松尾芭蕉',
        biography: '江戸時代の俳人。奥の細道の著者。',
        link_url: 'https://example.com/basho',
        image_url: 'https://example.com/basho.jpg',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
      {
        id: 2,
        name: '小林一茶',
        biography: '江戸時代後期の俳人。自然や日常を詠んだ。',
        link_url: 'https://example.com/issa',
        image_url: 'https://example.com/issa.jpg',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
      {
        id: 3,
        name: '与謝蕪村',
        biography: '江戸時代中期の俳人、画家。',
        link_url: 'https://example.com/buson',
        image_url: 'https://example.com/buson.jpg',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
      {
        id: 4,
        name: '正岡子規',
        biography: '明治時代の俳人。俳句改革を行った。',
        link_url: 'https://example.com/shiki',
        image_url: 'https://example.com/shiki.jpg',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
      {
        id: 5,
        name: '高浜虚子',
        biography: '正岡子規の弟子で俳壇の指導者。',
        link_url: 'https://example.com/kyooshi',
        image_url: 'https://example.com/kyooshi.jpg',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
    ]);
  });

  it('GET /poets/1 - 指定されたidの俳人が取得できる', async () => {
    const res = await worker.fetch('/poets/1', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);
    const responseBody = await res.json();
    expect(responseBody).toEqual({
      id: 1,
      name: '松尾芭蕉',
      biography: '江戸時代の俳人。奥の細道の著者。',
      link_url: 'https://example.com/basho',
      image_url: 'https://example.com/basho.jpg',
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });
});
