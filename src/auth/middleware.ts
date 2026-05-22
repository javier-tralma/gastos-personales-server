import type { Context, Next } from 'hono';
import { auth } from './auth.js';
import type { HonoContext } from '../lib/rpc-types.js';

export type AuthUser = {
  id: string;
  email: string;
};

export async function getAuthSession(c: Context<HonoContext>) {
  return auth.api.getSession({
    headers: c.req.raw.headers,
  });
}

export async function getAuthUser(c: Context<HonoContext>): Promise<AuthUser | null> {
  const session = await getAuthSession(c);

  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email,
  };
}

export async function requireUser(c: Context<HonoContext>, next: Next) {
  const session = await getAuthSession(c);

  if (!session?.user) {
    return c.json({ error: 'No autenticado' }, 401);
  }

  c.set('userId', session.user.id);
  c.set('userEmail', session.user.email);
  c.set('session', session.session);
  await next();
}
