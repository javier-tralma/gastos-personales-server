import { loadEnvFile } from 'node:process';

try {
  loadEnvFile(new URL('../.env', import.meta.url));
} catch {
  // Production hosts usually inject env vars directly.
}

const requiredProductionEnv = [
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'DATABASE_URL',
  'FRONTEND_URL',
  'CORS_ORIGIN',
];

if (process.env.NODE_ENV === 'production') {
  const missing = requiredProductionEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas en produccion: ${missing.join(', ')}`);
  }

  if ((process.env.BETTER_AUTH_SECRET?.length ?? 0) < 32) {
    throw new Error('BETTER_AUTH_SECRET debe tener al menos 32 caracteres en produccion');
  }
}
