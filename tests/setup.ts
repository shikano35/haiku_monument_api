import { execSync } from "node:child_process";
import { unstable_dev } from "wrangler";
import type { Unstable_DevOptions, Unstable_DevWorker } from "wrangler";

let worker: Unstable_DevWorker;
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const useLocalDatabase = process.env.D1_LOCAL_DATABASE === "true";

export async function startWorker() {
  const options: Unstable_DevOptions = {
    experimental: { disableExperimentalWarning: true },
    ip: "127.0.0.1",
    vars: {
      D1_MAX_DURATION_MS: "3600000",
      ...(useLocalDatabase ? { D1_LOCAL_DATABASE: "true" } : {}),
    },
  };

  worker = await unstable_dev("./src/index.ts", options);

  await new Promise((resolve) =>
    setTimeout(resolve, isGithubActions ? 2000 : 500),
  );

  return worker;
}

export async function stopWorker() {
  if (worker) {
    await worker.stop();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export async function resetDb() {
  const maxRetries = isGithubActions ? 10 : 5;
  const retryDelay = isGithubActions ? 2000 : 500;
  let lastErr: unknown;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  for (let i = 0; i < maxRetries; i++) {
    try {
      execSync(
        "bunx wrangler d1 execute haiku-monument-db --local --file ./src/infrastructure/db/seeds/new_schema_seed.sql",
        {
          timeout: isGithubActions ? 15000 : 10000,
          env: {
            ...process.env,
            ...(useLocalDatabase ? { D1_LOCAL_DATABASE: "true" } : {}),
          },
        },
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));
      return;
    } catch (e) {
      lastErr = e;
      console.warn(`DBリセット試行 ${i + 1}/${maxRetries} 失敗: ${e}`);

      if (String(e).includes("SQLITE_BUSY")) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (i + 1)),
        );
        continue;
      }

      if (i === maxRetries - 1) {
        throw new Error(`DBリセットに失敗しました: ${(e as Error).message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error(
    `DBリセットに失敗しました（リトライ上限）: ${(lastErr as Error).message}`,
  );
}
