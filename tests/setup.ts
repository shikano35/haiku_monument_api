import { unstable_dev } from 'wrangler';
import type { Unstable_DevWorker } from 'wrangler';
import { execSync } from 'node:child_process';

let worker: Unstable_DevWorker;

export async function startWorker() {
  worker = await unstable_dev('./src/index.ts', {
    experimental: { disableExperimentalWarning: true },
  });
  return worker;
}

export async function stopWorker() {
  if (worker) {
    await worker.stop();
  }
}

export async function resetDb() {
  let lastErr;
  for (let i = 0; i < 5; i++) {
    try {
      execSync('bunx wrangler d1 execute DB --file ./src/infrastructure/db/seeds/reset_and_seed.sql');
      return;
    } catch (e) {
      lastErr = e;
      if (String(e).includes('SQLITE_BUSY')) {
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
      throw new Error('DBリセットに失敗しました: ' + (e as Error).message);
    }
  }
  throw new Error('DBリセットに失敗しました（リトライ上限）: ' + (lastErr as Error).message);
} 