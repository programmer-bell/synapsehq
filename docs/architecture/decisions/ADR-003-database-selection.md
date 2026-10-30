# ADR-003: Neon PostgreSQL with Drizzle ORM

## Status

Accepted

## Context

SynapseHQ needs a relational database with typed queries, transactional
integrity, and a migration workflow that fits Vercel serverless deployment.

## Decision

Use Neon PostgreSQL with Drizzle ORM and the Neon serverless WebSocket driver
(`@neondatabase/serverless` with `drizzle-orm/neon-serverless`).

- `DATABASE_URL` is used by the application runtime and should be the pooled
  Neon connection string.
- `DATABASE_URL_UNPOOLED` is used by Drizzle Kit migrations when available and
  falls back to `DATABASE_URL` otherwise.
- Database access stays server-side behind `src/shared/db/client.ts`.
- Domain schemas are owned by their modules; the shared schema file aggregates
  them for Drizzle configuration.

## Alternatives

- `drizzle-orm/neon-http`: fast and stateless, but does not support interactive
  transactions, which the architecture requires.
- `drizzle-orm/node-postgres` with `pg`: supports transactions, but adds a
  separate TCP connection strategy rather than using Neon's serverless driver.
- Prisma or another ORM: rejected to keep the stack lightweight and
  SQL-oriented, and because Drizzle was already selected in the architecture.

## Trade-offs

The WebSocket driver supports transactions and fits serverless deployment, but
requires connection lifecycle care. A development singleton prevents connection
churn. Migration commands use the direct connection where possible to avoid
pooler limitations.

## Consequences

- Transactions are available for multi-record domain operations.
- Drizzle Kit remains the only migration mechanism.
- Schema changes must be generated, reviewed, and applied deliberately.
- Database credentials remain server-only environment variables.
