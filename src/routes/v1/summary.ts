import { Hono } from 'hono';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { budgets, transactions } from '../../db/schema.js';
import { getPeriodRange } from '../../lib/period.js';
import type { HonoContext } from '../../lib/rpc-types.js';

export const summaryRoutes = new Hono<HonoContext>();

summaryRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const { month, start, end } = getPeriodRange(c.req.query('month'), c.req.query('startDay'));

  const [monthTotals] = await db
    .select({
      income: sql<number>`cast(coalesce(sum(case when ${transactions.amount} > 0 then ${transactions.amount} else 0 end), 0) as integer)`,
      expense: sql<number>`cast(coalesce(sum(case when ${transactions.amount} < 0 then abs(${transactions.amount}) else 0 end), 0) as integer)`,
      balance: sql<number>`cast(coalesce(sum(${transactions.amount}), 0) as integer)`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.date, start),
      lte(transactions.date, end),
    ));

  const [budgetTotal] = await db
    .select({
      amount: sql<number>`cast(coalesce(sum(${budgets.amount}), 0) as integer)`,
    })
    .from(budgets)
    .where(and(
      eq(budgets.userId, userId),
      eq(budgets.month, month),
    ));

  return c.json({
    data: {
      month,
      income: monthTotals.income,
      expense: monthTotals.expense,
      balance: monthTotals.balance,
      budget: budgetTotal.amount,
      remainingBudget: budgetTotal.amount - monthTotals.expense,
    },
  });
});
