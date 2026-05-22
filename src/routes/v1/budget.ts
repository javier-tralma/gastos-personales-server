import { Hono } from 'hono';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { budgets } from '../../db/schema.js';
import type { HonoContext } from '../../lib/rpc-types.js';
import {
  budgetCreateSchema,
  budgetUpdateSchema,
  idParamSchema,
  parseJson,
} from '../../lib/validation.js';

export const budgetRoutes = new Hono<HonoContext>();

budgetRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const data = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .orderBy(budgets.month);

  return c.json({ data });
});

budgetRoutes.post('/', async (c) => {
  const parsed = parseJson(budgetCreateSchema, await c.req.json());

  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  const [data] = await db
    .insert(budgets)
    .values({
      ...parsed.data,
      userId: c.get('userId'),
    })
    .returning();

  return c.json({ data }, 201);
});

budgetRoutes.get('/:id', async (c) => {
  const params = idParamSchema.safeParse(c.req.param());

  if (!params.success) {
    return c.json({ error: params.error.flatten() }, 400);
  }

  const [data] = await db
    .select()
    .from(budgets)
    .where(and(
      eq(budgets.id, params.data.id),
      eq(budgets.userId, c.get('userId')),
    ))
    .limit(1);

  if (!data) {
    return c.json({ error: 'Presupuesto no encontrado' }, 404);
  }

  return c.json({ data });
});

budgetRoutes.patch('/:id', async (c) => {
  const params = idParamSchema.safeParse(c.req.param());

  if (!params.success) {
    return c.json({ error: params.error.flatten() }, 400);
  }

  const parsed = parseJson(budgetUpdateSchema, await c.req.json());

  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  const [data] = await db
    .update(budgets)
    .set(parsed.data)
    .where(and(
      eq(budgets.id, params.data.id),
      eq(budgets.userId, c.get('userId')),
    ))
    .returning();

  if (!data) {
    return c.json({ error: 'Presupuesto no encontrado' }, 404);
  }

  return c.json({ data });
});

budgetRoutes.delete('/:id', async (c) => {
  const params = idParamSchema.safeParse(c.req.param());

  if (!params.success) {
    return c.json({ error: params.error.flatten() }, 400);
  }

  const [data] = await db
    .delete(budgets)
    .where(and(
      eq(budgets.id, params.data.id),
      eq(budgets.userId, c.get('userId')),
    ))
    .returning();

  if (!data) {
    return c.json({ error: 'Presupuesto no encontrado' }, 404);
  }

  return c.json({ data });
});
