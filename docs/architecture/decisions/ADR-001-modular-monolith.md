# ADR-001: Modular Monolith Architecture

## Status

Accepted

## Context

SynapseHQ needs clear domain boundaries between authentication, workspaces,
projects, tasks, and future notifications without introducing distributed
systems. The application is currently a single Next.js deployment.

## Decision

Use a modular monolith. Route composition remains in the root-level `app/`
directory. Domain logic belongs in `src/modules/<domain>`, and genuinely
reusable infrastructure belongs in `src/shared`.

Modules expose intentional public interfaces through their `index.ts` files.
Cross-module access must not reach into another module's private repositories.

## Alternatives

- Microservices: rejected because the current scale, team size, and deployment
  model do not justify distributed transactions or service discovery.
- Single-layer application without module boundaries: rejected because it
  would couple unrelated domains and make authorization harder to audit.

## Trade-offs

The modular monolith keeps deployment and debugging simple while requiring
discipline to prevent modules from becoming tightly coupled. Boundaries are
enforced by convention and code review rather than network separation.

## Consequences

- One application and one deployment pipeline.
- Domain schemas and business logic stay close to their owning modules.
- Module public interfaces must be kept small.
- Extraction to services remains possible later if genuine requirements arise.
