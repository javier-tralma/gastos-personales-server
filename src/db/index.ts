import '../env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

function resolvePostgresUrl() {
  const databaseUrl = process.env.POSTGRES_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl?.startsWith('postgres')) {
    throw new Error('Define DATABASE_URL o POSTGRES_DATABASE_URL con una connection string PostgreSQL');
  }

  return databaseUrl;
}

const connectionString = resolvePostgresUrl();

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
    ? undefined
    : { rejectUnauthorized: true },
});

export const db = drizzle(pool, { schema });

export type DB = typeof db;
