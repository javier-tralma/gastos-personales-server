import { Hono } from 'hono';
import { and, desc, eq, gte, lte, like } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { transactions } from '../../db/schema.js';
import { parseCalendarDate, parseCalendarDateEnd } from '../../lib/dates.js';
import type { HonoContext } from '../../lib/rpc-types.js';
import {
  idParamSchema,
  parseJson,
  transactionCreateSchema,
  transactionUpdateSchema,
} from '../../lib/validation.js';

export const transactionRoutes = new Hono<HonoContext>();

transactionRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const query = c.req.query();
  const filters = [eq(transactions.userId, userId)];

  if (query.categoryId) {
    filters.push(eq(transactions.categoryId, Number(query.categoryId)));
  }

  if (query.type === 'income') {
    filters.push(gte(transactions.amount, 1));
  }

  if (query.type === 'expense') {
    filters.push(lte(transactions.amount, -1));
  }

  if (query.from) {
    filters.push(gte(transactions.date, parseCalendarDate(query.from)));
  }

  if (query.to) {
    filters.push(lte(transactions.date, parseCalendarDateEnd(query.to)));
  }

  if (query.search) {
    filters.push(like(transactions.description, `%${query.search}%`));
  }

  const data = await db
    .select()
    .from(transactions)
    .where(and(...filters))
    .orderBy(desc(transactions.date));

  return c.json({ data });
});

transactionRoutes.post('/', async (c) => {
  const parsed = parseJson(transactionCreateSchema, await c.req.json());

  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  const [data] = await db
    .insert(transactions)
    .values({
      ...parsed.data,
      userId: c.get('userId'),
      categoryId: parsed.data.categoryId ?? null,
    })
    .returning();

  return c.json({ data }, 201);
});

transactionRoutes.get('/:id', async (c) => {
  const params = idParamSchema.safeParse(c.req.param());

  if (!params.success) {
    return c.json({ error: params.error.flatten() }, 400);
  }

  const [data] = await db
    .select()
    .from(transactions)
    .where(and(
      eq(transactions.id, params.data.id),
      eq(transactions.userId, c.get('userId')),
    ))
    .limit(1);

  if (!data) {
    return c.json({ error: 'Transaccion no encontrada' }, 404);
  }

  return c.json({ data });
});

transactionRoutes.patch('/:id', async (c) => {
  const params = idParamSchema.safeParse(c.req.param());

  if (!params.success) {
    return c.json({ error: params.error.flatten() }, 400);
  }

  const parsed = parseJson(transactionUpdateSchema, await c.req.json());

  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  const [data] = await db
    .update(transactions)
    .set(parsed.data)
    .where(and(
      eq(transactions.id, params.data.id),
      eq(transactions.userId, c.get('userId')),
    ))
    .returning();

  if (!data) {
    return c.json({ error: 'Transaccion no encontrada' }, 404);
  }

  return c.json({ data });
});

transactionRoutes.delete('/:id', async (c) => {
  const params = idParamSchema.safeParse(c.req.param());

  if (!params.success) {
    return c.json({ error: params.error.flatten() }, 400);
  }

  const [data] = await db
    .delete(transactions)
    .where(and(
      eq(transactions.id, params.data.id),
      eq(transactions.userId, c.get('userId')),
    ))
    .returning();

  if (!data) {
    return c.json({ error: 'Transaccion no encontrada' }, 404);
  }

  return c.json({ data });
});
