/**
 * Standalone ingestion entrypoint:  `npm run ingest`
 * Loads env, runs the configured source adapter through the pipeline, and
 * persists clustered stories to Postgres. Idempotent — safe to re-run.
 */
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { runIngestion } from './ingestion.runner';

// Load root .env (cwd is apps/api when run via npm script), then local .env.
loadEnv({ path: resolve(__dirname, '../../../../.env') });
loadEnv();

async function main(): Promise<void> {
  const sourceId = process.env.INGEST_SOURCE ?? 'mock-india';
  const prisma = new PrismaClient();
  try {
    const summary = await runIngestion(prisma, sourceId);
    // eslint-disable-next-line no-console
    console.log('[ingest] done', summary);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[ingest] failed', err);
  process.exit(1);
});
