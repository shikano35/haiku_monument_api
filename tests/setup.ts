import { readD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import { env, applyD1Migrations } from 'cloudflare:test';

(async () => {
  const migrations = await readD1Migrations('./src/infrastructure/db/migrations');
  await applyD1Migrations(env.DB, migrations);
})();
