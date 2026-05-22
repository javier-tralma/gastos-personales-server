import { defineConfig } from 'drizzle-kit';
import { loadEnvFile } from 'node:process';

try {
  loadEnvFile('./.env');
} catch {
  // CI/production usually injects env vars directly.
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle-pg',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_DATABASE_URL
      ?? (process.env.DATABASE_URL?.startsWith('postgres') ? process.env.DATABASE_URL : undefined)
      ?? 'postgres://postgres:postgres@localhost:5432/gastos_personales',
  },
  strict: true,
  verbose: true,
});
