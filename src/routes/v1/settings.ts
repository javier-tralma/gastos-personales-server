import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { userSettings } from '../../db/schema.js';
import type { HonoContext } from '../../lib/rpc-types.js';
import { parseJson, userSettingsUpdateSchema } from '../../lib/validation.js';

export const settingsRoutes = new Hono<HonoContext>();

async function getOrCreateSettings(userId: string) {
  const [existing] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (existing) return existing;

  const now = new Date();
  const [created] = await db
    .insert(userSettings)
    .values({
      userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
}

settingsRoutes.get('/', async (c) => {
  const data = await getOrCreateSettings(c.get('userId'));
  return c.json({ data });
});

settingsRoutes.patch('/', async (c) => {
  const parsed = parseJson(userSettingsUpdateSchema, await c.req.json());

  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  await getOrCreateSettings(c.get('userId'));

  const [data] = await db
    .update(userSettings)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(userSettings.userId, c.get('userId')))
    .returning();

  return c.json({ data });
});
