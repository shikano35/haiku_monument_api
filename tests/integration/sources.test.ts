import { startWorker, stopWorker, resetDb } from '../setup';
import type { Unstable_DevWorker } from 'wrangler';

let worker: Unstable_DevWorker;

describe('Sources API GET Endpoints', () => {
  beforeAll(async () => {
    worker = await startWorker();
  });

  afterAll(async () => {
    await stopWorker();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('GET /sources - すべてのソース一覧が取得できる', async () => {
    const res = await worker.fetch('/sources', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);
    const responseBody = await res.json();
    if (!Array.isArray(responseBody)) throw new Error('レスポンスが配列ではありません');
    const filtered = responseBody.filter((s) => typeof s.id === 'number' && s.id >= 1 && s.id <= 5);
    expect(filtered).toEqual([
      {
        id: 1,
        title: '奥の細道',
        author: '松尾芭蕉',
        source_year: 1702,
        url: 'https://example.com/okuno-hosomichi',
        publisher: '江戸出版',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
      {
        id: 2,
        title: 'おらが春',
        author: '小林一茶',
        source_year: 1819,
        url: 'https://example.com/oraga-haru',
        publisher: '江戸出版',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
      {
        id: 3,
        title: '蕪村句集',
        author: '与謝蕪村',
        source_year: 1775,
        url: 'https://example.com/buson-kushu',
        publisher: '江戸出版',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
      {
        id: 4,
        title: '俳句革新',
        author: '正岡子規',
        source_year: 1893,
        url: 'https://example.com/haiku-kakushin',
        publisher: '明治出版社',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
      {
        id: 5,
        title: 'ホトトギス',
        author: '高浜虚子',
        source_year: 1897,
        url: 'https://example.com/hototogisu',
        publisher: '明治出版社',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
    ]);
  });

  it('GET /sources/1 - 指定されたidのソースが取得できる', async () => {
    const res = await worker.fetch('/sources/1', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);
    const responseBody = await res.json();
    expect(responseBody).toEqual({
      id: 1,
      title: '奥の細道',
      author: '松尾芭蕉',
      source_year: 1702,
      url: 'https://example.com/okuno-hosomichi',
      publisher: '江戸出版',
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });
});
