import './env.js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { auth, getTrustedOrigins } from './auth/auth.js';
import { migrate } from './db/migrate.js';
import type { HonoContext } from './lib/rpc-types.js';
import { v1Routes } from './routes/v1/index.js';

const app = new Hono<HonoContext>();

await migrate();

/**
 * 1. CORS PRIMERO - antes que cualquier otro middleware
 * Esto asegura que las peticiones OPTIONS no rompan la autenticación
 */
const trustedOrigins = getTrustedOrigins();

app.use(cors({
  origin: (origin) => trustedOrigins.includes(origin) ? origin : null,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true
}));

app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw));
app.route('/api/v1', v1Routes);

// Ruta de prueba inicial
app.get('/', (c) => {
  return c.json({ 
    message: 'ERP Gastos Personales - API v1',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const PORT = Number(process.env.PORT ?? 3000);

console.log(`🚀 Servidor levantado en http://localhost:${PORT}`);
console.log(`📦 API v1: http://localhost:${PORT}/api/v1`);

serve({
  fetch: app.fetch,
  port: PORT,
});

export default app;
