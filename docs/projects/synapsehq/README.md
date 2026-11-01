# SynapseHQ Project Documentation

This directory contains documentation scoped to the SynapseHQ project. Keep
project-specific design notes and operational guidance here; use the repository
[`README.md`](../../../README.md) for the general project introduction and
`.agents/` for engineering workflow and roadmap documents.

## Project Overview

SynapseHQ is an engineering workspace for organizing teams, projects, and
delivery work. The application supports workspace and project management,
task collaboration, milestones, team allocation, and in-app notifications.

## Architecture

SynapseHQ is a modular monolith built with the Next.js App Router. The root
`app/` directory contains routes and layouts, while domain functionality lives
in `src/modules/`. Shared infrastructure belongs in `src/shared/`.

The application uses TypeScript, React, Tailwind CSS, PostgreSQL, Drizzle ORM,
and Zod. Authentication uses application-managed sessions with `jose` and
`bcryptjs`. Protected operations must authorize access to the relevant
workspace, project, or task on the server.

See the architecture overview and accepted decisions:

- [Architecture](../../../.agents/ARCHITECTURE.md)
- [ADR-001: Modular monolith](../../architecture/decisions/ADR-001-modular-monolith.md)
- [ADR-005: Module boundaries](../../architecture/decisions/ADR-005-module-boundaries.md)
- [ADR-006: Custom JWT sessions](../../architecture/decisions/ADR-006-custom-jwt-sessions.md)
- [ADR-007: Workspace and project authorization](../../architecture/decisions/ADR-007-workspace-project-authorization.md)
- [ADR-008: Task data model and authorization](../../architecture/decisions/ADR-008-task-management.md)

## Documentation Conventions

- Keep content specific to SynapseHQ; put cross-project engineering rules in
  `.agents/AGENTS.md`.
- Record significant technical choices as architecture decision records under
  `docs/architecture/decisions/`.
- Link to existing canonical documents instead of copying their content.
- Describe current behavior as implemented only after verifying the code.
- Never include credentials, session tokens, private user data, or production
  connection strings in documentation.

## Scope

This is repository-managed Markdown documentation for SynapseHQ. It does not
provide an in-app editor or project-specific document storage in the application.
