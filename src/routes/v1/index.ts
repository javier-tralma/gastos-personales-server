import { Hono } from 'hono';
import { requireUser } from '../../auth/middleware.js';
import type { HonoContext } from '../../lib/rpc-types.js';
import { analyticsRoutes } from './analytics.js';
import { budgetRoutes } from './budget.js';
import { categoryRoutes } from './category.js';
import { settingsRoutes } from './settings.js';
import { summaryRoutes } from './summary.js';
import { transactionRoutes } from './transaction.js';

export const v1Routes = new Hono<HonoContext>();

v1Routes.use('*', requireUser);

v1Routes.route('/analytics', analyticsRoutes);
v1Routes.route('/budgets', budgetRoutes);
v1Routes.route('/categories', categoryRoutes);
v1Routes.route('/settings', settingsRoutes);
v1Routes.route('/summary', summaryRoutes);
v1Routes.route('/transactions', transactionRoutes);
