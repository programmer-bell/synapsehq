# ADR-005: Module Boundaries and Import Conventions

## Status

Accepted

## Context

The target architecture introduces `src/modules` and `src/shared` while the
Next.js App Router remains at the repository root. The existing `@/*` alias
maps to the repository root.

## Decision

- Keep the root-level `app/` directory.
- Keep the existing `@/*` root alias.
- Import module code with `@/src/modules/...`.
- Import shared code with `@/src/shared/...`.
- `app/` handles routing, layouts, loading/error boundaries, and page
  composition only.
- `src/modules/<domain>` owns domain actions, services, repositories, schemas,
  database schema, types, and feature components.
- `src/shared` contains only cross-domain infrastructure and utilities.
- Modules communicate through explicit public exports, not private internals.

## Alternatives

- Moving the App Router to `src/app`: rejected for Phase 1 because it would
  require a migration with no product benefit.
- Adding a second alias for `src`: rejected to avoid two competing import
  conventions.

## Trade-offs

The `@/src/...` convention is slightly verbose but unambiguous and preserves
the existing alias. Module boundaries remain enforceable without restructuring
the App Router.

## Consequences

- No route files contain business logic.
- No domain-specific code is placed in `src/shared`.
- Cross-module imports must go through module entry points.
