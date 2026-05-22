import '../env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import * as schema from './schema.js';

const connectionString = process.env.POSTGRES_DATABASE_URL
  ?? (process.env.DATABASE_URL?.startsWith('postgres') ? process.env.DATABASE_URL : undefined);

if (!connectionString) {
  throw new Error('Define POSTGRES_DATABASE_URL o DATABASE_URL con una URL postgres para migrar Neon/Postgres');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: true } : undefined,
});

const db = drizzle(pool, { schema });
const migrationsFolder = process.env.DRIZZLE_PG_MIGRATIONS_FOLDER ?? resolve(process.cwd(), 'drizzle-pg');

await migrate(db, { migrationsFolder });
await pool.end();

console.log(`Migraciones Postgres aplicadas desde ${migrationsFolder}`);
