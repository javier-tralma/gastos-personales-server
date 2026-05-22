import { Hono } from 'hono';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { budgets, categories, transactions } from '../../db/schema.js';
import { getPeriodRange } from '../../lib/period.js';
import type { HonoContext } from '../../lib/rpc-types.js';

export const analyticsRoutes = new Hono<HonoContext>();

analyticsRoutes.get('/weekly-flow', async (c) => {
  const userId = c.get('userId');
  const { month, start, end } = getPeriodRange(c.req.query('month'), c.req.query('startDay'));

  const rows = await db
    .select({
      date: transactions.date,
      amount: transactions.amount,
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.date, start),
      lte(transactions.date, end),
    ));

  const labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  const buckets = labels.map((label) => ({ label, income: 0, expense: 0 }));

  for (const row of rows) {
    const day = (row.date.getDay() + 6) % 7;
    if (row.amount > 0) {
      buckets[day].income += row.amount;
    } else {
      buckets[day].expense += Math.abs(row.amount);
    }
  }

  return c.json({
    data: {
      month,
      points: buckets,
    },
  });
});

analyticsRoutes.get('/category-spend', async (c) => {
  const userId = c.get('userId');
  const { month, start, end } = getPeriodRange(c.req.query('month'), c.req.query('startDay'));

  const rows = await db
    .select({
      categoryId: categories.id,
      name: categories.name,
      color: categories.color,
      amount: sql<number>`cast(coalesce(sum(abs(${transactions.amount})), 0) as integer)`,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(
      eq(transactions.userId, userId),
      lte(transactions.amount, -1),
      gte(transactions.date, start),
      lte(transactions.date, end),
    ))
    .groupBy(categories.id, categories.name, categories.color)
    .orderBy(sql`sum(abs(${transactions.amount})) desc`);

  return c.json({
    data: {
      month,
      categories: rows,
    },
  });
});

analyticsRoutes.get('/budget-usage', async (c) => {
  const userId = c.get('userId');
  const { month, start, end } = getPeriodRange(c.req.query('month'), c.req.query('startDay'));

  const budgetRows = await db
    .select({
      budgetId: budgets.id,
      categoryId: budgets.categoryId,
      categoryName: categories.name,
      color: categories.color,
      budget: budgets.amount,
    })
    .from(budgets)
    .innerJoin(categories, eq(budgets.categoryId, categories.id))
    .where(and(
      eq(budgets.userId, userId),
      eq(budgets.month, month),
    ));

  const spendRows = await db
    .select({
      categoryId: transactions.categoryId,
      spent: sql<number>`cast(coalesce(sum(abs(${transactions.amount})), 0) as integer)`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      lte(transactions.amount, -1),
      gte(transactions.date, start),
      lte(transactions.date, end),
    ))
    .groupBy(transactions.categoryId);

  const spentByCategory = new Map(
    spendRows
      .filter((row) => row.categoryId !== null)
      .map((row) => [row.categoryId as number, row.spent]),
  );

  const items = budgetRows.map((row) => {
    const spent = spentByCategory.get(row.categoryId) ?? 0;
    const remaining = row.budget - spent;
    const percent = row.budget > 0 ? Math.round((spent / row.budget) * 100) : 0;

    return {
      budgetId: row.budgetId,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      color: row.color,
      budget: row.budget,
      spent,
      remaining,
      percent,
      status: percent >= 100 ? 'exceeded' : percent >= 80 ? 'warning' : 'ok',
    };
  });

  return c.json({
    data: {
      month,
      totalBudget: items.reduce((sum, item) => sum + item.budget, 0),
      totalSpent: items.reduce((sum, item) => sum + item.spent, 0),
      totalRemaining: items.reduce((sum, item) => sum + item.remaining, 0),
      items,
    },
  });
});
