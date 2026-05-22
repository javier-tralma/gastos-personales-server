import { migrate as runDrizzleMigrations } from 'drizzle-orm/node-postgres/migrator';
import { resolve } from 'node:path';
import { db } from './index.js';

export function migrationsFolder() {
  return process.env.DRIZZLE_MIGRATIONS_FOLDER ?? resolve(process.cwd(), 'drizzle-pg');
}

export async function migrate() {
  await runDrizzleMigrations(db, {
    migrationsFolder: migrationsFolder(),
  });
}
