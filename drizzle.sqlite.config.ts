import { defineConfig } from 'drizzle-kit';
import { loadEnvFile } from 'node:process';

try {
  loadEnvFile('./.env');
} catch {
  // CI/production usually injects env vars directly.
}

function sqliteUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:./app.db';
  return databaseUrl.startsWith('file:') ? databaseUrl.slice('file:'.length) : databaseUrl;
}

export default defineConfig({
  schema: './src/db/schema.sqlite.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: sqliteUrl(),
  },
  strict: true,
  verbose: true,
});
