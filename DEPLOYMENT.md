# Deploy en Render

## Proyecto

- Service type: Web Service
- Runtime: Node
- Build command: `npm ci --include=dev && npm run build`
- Start command: `npm start`
- Health check path: `/health`

El servidor aplica migraciones Drizzle al arrancar usando `DRIZZLE_MIGRATIONS_FOLDER`.

## Variables

```bash
NODE_ENV=production
BETTER_AUTH_SECRET=replace-with-openssl-rand-base64-32
BETTER_AUTH_URL=https://your-render-service.onrender.com
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=verify-full&channel_binding=require
POSTGRES_DATABASE_URL=postgresql://user:password@host/dbname?sslmode=verify-full&channel_binding=require
FRONTEND_URL=https://your-vercel-app.vercel.app
CORS_ORIGIN=https://your-vercel-app.vercel.app
DRIZZLE_MIGRATIONS_FOLDER=./drizzle-pg
```

Genera el secreto con:

```bash
openssl rand -base64 32
```

## Orden recomendado

1. Crea la base en Neon y copia el connection string.
2. Despliega este backend en Render.
3. Copia la URL publica de Render.
4. Configura `BETTER_AUTH_URL` con esa URL.
5. Configura `VITE_API_BASE_URL` en Vercel con esa URL.
6. Configura `FRONTEND_URL` y `CORS_ORIGIN` en Render con la URL final de Vercel.
7. Redeploy de Render y Vercel.

## Validacion

```bash
curl https://your-render-service.onrender.com/health
```

Luego prueba registro/login desde Vercel y confirma filas en Neon en `user`, `session` y `user_settings`.
