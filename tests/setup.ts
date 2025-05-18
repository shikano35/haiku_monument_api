import { unstable_dev } from 'wrangler';
import type { Unstable_DevWorker, Unstable_DevOptions } from 'wrangler';
import { execSync } from 'node:child_process';

let worker: Unstable_DevWorker;
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

export async function startWorker() {
  const options: Unstable_DevOptions = {
    experimental: { disableExperimentalWarning: true },
    ip: "127.0.0.1",
    vars: { D1_MAX_DURATION_MS: "3600000" }
  };
  
  worker = await unstable_dev('./src/index.ts', options);
  
  await new Promise(resolve => setTimeout(resolve, isGithubActions ? 2000 : 500));
  
  return worker;
}

export async function stopWorker() {
  if (worker) {
    await worker.stop();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

export async function resetDb() {
  const maxRetries = isGithubActions ? 10 : 5;
  const retryDelay = isGithubActions ? 1000 : 300;
  let lastErr;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (isGithubActions) {
        execSync('bunx wrangler d1 execute DB --file ./src/infrastructure/db/seeds/reset_and_seed.sql --test', { timeout: 10000 });
      } else {
        execSync('bunx wrangler d1 execute DB --file ./src/infrastructure/db/seeds/reset_and_seed.sql', { timeout: 5000 });
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    } catch (e) {
      lastErr = e;
      console.warn(`DBリセット試行 ${i+1}/${maxRetries} 失敗: ${e}`);
      
      if (String(e).includes('SQLITE_BUSY')) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        continue;
      }
      
      if (i === maxRetries - 1) {
        throw new Error('DBリセットに失敗しました: ' + (e as Error).message);
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('DBリセットに失敗しました（リトライ上限）: ' + (lastErr as Error).message);
} 