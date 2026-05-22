import { Hono } from 'hono';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { categories } from '../../db/schema.js';
import type { HonoContext } from '../../lib/rpc-types.js';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  idParamSchema,
  parseJson,
} from '../../lib/validation.js';

export const categoryRoutes = new Hono<HonoContext>();

categoryRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const data = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name);

  return c.json({ data });
});

categoryRoutes.post('/', async (c) => {
  const parsed = parseJson(categoryCreateSchema, await c.req.json());

  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  const [data] = await db
    .insert(categories)
    .values({
      ...parsed.data,
      userId: c.get('userId'),
    })
    .returning();

  return c.json({ data }, 201);
});

categoryRoutes.get('/:id', async (c) => {
  const params = idParamSchema.safeParse(c.req.param());

  if (!params.success) {
    return c.json({ error: params.error.flatten() }, 400);
  }

  const [data] = await db
    .select()
    .from(categories)
    .where(and(
      eq(categories.id, params.data.id),
      eq(categories.userId, c.get('userId')),
    ))
    .limit(1);

  if (!data) {
    return c.json({ error: 'Categoria no encontrada' }, 404);
  }

  return c.json({ data });
});

categoryRoutes.patch('/:id', async (c) => {
  const params = idParamSchema.safeParse(c.req.param());

  if (!params.success) {
    return c.json({ error: params.error.flatten() }, 400);
  }

  const parsed = parseJson(categoryUpdateSchema, await c.req.json());

  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  const [data] = await db
    .update(categories)
    .set(parsed.data)
    .where(and(
      eq(categories.id, params.data.id),
      eq(categories.userId, c.get('userId')),
    ))
    .returning();

  if (!data) {
    return c.json({ error: 'Categoria no encontrada' }, 404);
  }

  return c.json({ data });
});

categoryRoutes.delete('/:id', async (c) => {
  const params = idParamSchema.safeParse(c.req.param());

  if (!params.success) {
    return c.json({ error: params.error.flatten() }, 400);
  }

  const [data] = await db
    .delete(categories)
    .where(and(
      eq(categories.id, params.data.id),
      eq(categories.userId, c.get('userId')),
    ))
    .returning();

  if (!data) {
    return c.json({ error: 'Categoria no encontrada' }, 404);
  }

  return c.json({ data });
});
