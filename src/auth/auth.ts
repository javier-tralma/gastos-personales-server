import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

const localOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

function splitOrigins(value?: string) {
  return value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
}

export function getTrustedOrigins() {
  return Array.from(new Set([
    ...localOrigins,
    ...splitOrigins(process.env.FRONTEND_URL),
    ...splitOrigins(process.env.CORS_ORIGIN),
  ]));
}

const isSecureDeployment = process.env.NODE_ENV === 'production'
  && (process.env.BETTER_AUTH_URL ?? '').startsWith('https://');

export const auth = betterAuth({
  appName: 'Gastos Personales',
  basePath: '/api/auth',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    camelCase: true,
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  trustedOrigins: getTrustedOrigins,
  advanced: {
    cookiePrefix: 'gp',
    useSecureCookies: isSecureDeployment,
    defaultCookieAttributes: {
      sameSite: isSecureDeployment ? 'none' : 'lax',
      secure: isSecureDeployment,
      httpOnly: true,
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
