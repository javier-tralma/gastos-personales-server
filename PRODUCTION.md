# Produccion y migraciones

## Estado actual

El backend usa Hono, Better Auth, Drizzle ORM y PostgreSQL.
Las migraciones principales viven en `backend/drizzle-pg` y se aplican al iniciar el servidor y tambien manualmente con:

```bash
npm run db:migrate
```

Para crear migraciones nuevas despues de modificar `src/db/schema.ts`:

```bash
npm run db:generate
```

El carril principal usa:

- Schema: `src/db/schema.ts`
- Config: `drizzle.pg.config.ts`
- Migraciones: `drizzle-pg`
- Connection string: `POSTGRES_DATABASE_URL`


## Variables requeridas

En produccion `NODE_ENV=production` exige:

- `BETTER_AUTH_SECRET`: secreto fuerte de al menos 32 caracteres.
- `BETTER_AUTH_URL`: URL publica del backend, por ejemplo `https://api.example.com`.
- `DATABASE_URL`: connection string PostgreSQL.
- `FRONTEND_URL`: origen publico del frontend, por ejemplo `https://app.example.com`.
- `CORS_ORIGIN`: origins permitidos para CORS, separados por coma.

Para migraciones Postgres/Neon:

- `POSTGRES_DATABASE_URL`: opcional si `DATABASE_URL` ya es Postgres.
- `DRIZZLE_MIGRATIONS_FOLDER`: opcional, por defecto `./drizzle-pg`.

El frontend necesita:

```bash
VITE_API_BASE_URL=https://api.example.com
```

## Neon Free

Neon mantiene un plan Free oficial para construir y aprender sin limite de tiempo y sin tarjeta. A mayo de 2026, su pagina de precios indica 100 proyectos, 100 CU-hours mensuales por proyecto y 0.5 GB de storage por proyecto en el plan Free.

Para este ERP personal es suficiente como punto de partida si el uso es liviano. Hay que vigilar storage, compute mensual y latencia de cold start.

## Vercel + Render + Neon

Para frontend en Vercel y backend en Render:

- En Vercel, configura `VITE_API_BASE_URL` con la URL publica del backend.
- En Render, configura las variables del backend sin wildcard en `CORS_ORIGIN`.
- En Neon, copia el connection string Postgres y configuralo como `POSTGRES_DATABASE_URL`.
- Si frontend y backend quedan en dominios distintos, Better Auth debe emitir cookies `Secure` y `SameSite=None` en produccion.
- Mantener `BETTER_AUTH_URL` igual a la URL publica real del backend evita cookies mal emitidas y callbacks contra localhost.

## SQLite legacy

La implementacion anterior SQLite queda solo como referencia legacy:

- Schema: `src/db/schema.sqlite.ts`
- Config: `drizzle.sqlite.config.ts`
- Migraciones antiguas: `drizzle`

No debe usarse para produccion. En servicios gratuitos con filesystem efimero, como un web service sin disco persistente, SQLite puede perder datos al redeploy o reinicio.
