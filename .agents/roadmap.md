# SynapseHQ — Project Roadmap

**Project:** SynapseHQ  
**Architecture:** Modular Monolith  
**Status:** Initial product scope complete; production deployment verified by the project owner.
**Current Stage:** Complete — future extensions are optional and out of release scope.
**Completed Phases:** 6 of 6

---

# 1. Project Objective

SynapseHQ's initial release delivers a professional SaaS engineering workspace
application.

The application will provide:

- User authentication and session management.
- Workspace organization.
- Project management.
- Task management.
- Kanban and table-based task views.
- Team collaboration and membership.
- Secure resource-level permissions.
- Responsive dashboards.
- Production-ready deployment.

## Technology Stack

| Layer            | Technology                                |
| ---------------- | ----------------------------------------- |
| Framework        | Next.js 16                                |
| Frontend         | React 19                                  |
| Language         | TypeScript                                |
| Styling          | Tailwind CSS v4                           |
| Database         | Neon PostgreSQL                           |
| ORM              | Drizzle ORM                               |
| Validation       | Zod                                       |
| Password hashing | bcryptjs                                  |
| JWT              | jose                                      |
| Deployment       | Vercel                                    |
| Testing          | Vitest, React Testing Library, Playwright |

All dependencies must be verified in `package.json` before use.

---

# 2. Development Principles

Follow these principles throughout every phase:

1. Build incrementally.
2. Preserve existing working functionality.
3. Follow modular monolith boundaries.
4. Implement security from the beginning.
5. Validate every untrusted input.
6. Test critical business logic.
7. Avoid unnecessary dependencies.
8. Keep documentation synchronized.
9. Complete verification before marking tasks finished.
10. Never mark partially implemented features as complete.

Refer to `AGENTS.md` for mandatory development workflow and `ARCHITECTURE.md` for technical implementation standards.

---

# 3. Phase Overview

| Phase | Name                      | Primary Outcome                                  |
| ----- | ------------------------- | ------------------------------------------------ |
| 1     | Foundation & Architecture | Project infrastructure and modular structure     |
| 2     | Authentication            | Secure custom authentication                     |
| 3     | Workspaces & Projects     | Workspace and project management                 |
| 4     | Task Management           | Kanban and table-based task management           |
| 5     | Polish & Deployment       | Testing, optimization, and production deployment |
| 6     | DevOps & Security         | Containerization, orchestration, and hardened CI |

---

# Phase 1 — Foundation & Modular Architecture

**Objective:** Prepare the existing Next.js starter for the SynapseHQ application.

## 1.1 Repository Inspection

- [x] Inspect the existing repository.
- [x] Review `package.json`.
- [x] Review `tsconfig.json`.
- [x] Review `next.config.ts`.
- [x] Review existing `app/` structure.
- [x] Review `app/globals.css`.
- [x] Review `.env.sample`.
- [x] Verify current npm scripts.
- [x] Verify Git branch and working tree.
- [x] Identify existing functionality that must be preserved.

## 1.2 Project Structure

- [x] Finalize the modular monolith directory structure.
- [x] Create `src/modules/`.
- [x] Create `src/shared/`.
- [x] Establish module naming conventions.
- [x] Establish import conventions.
- [x] Establish public module interfaces.
- [x] Define shared infrastructure boundaries.
- [x] Preserve the root-level `app/` directory.
- [x] Verify the existing `@/*` alias.
- [x] Avoid unnecessary folder creation.

Notes: module interfaces and shared boundaries are documented in
`ARCHITECTURE.md` and ADR-005. All five domain modules are now implemented under
`src/modules/`.

## 1.3 Database Infrastructure

- [x] Install required Neon PostgreSQL dependencies.
- [x] Install Drizzle ORM dependencies.
- [x] Configure Neon database connection.
- [x] Configure Drizzle ORM.
- [x] Configure Drizzle Kit.
- [x] Create shared database client.
- [x] Establish schema organization.
- [x] Configure migration workflow.
- [x] Configure environment variable validation.
- [x] Verify database connectivity.
- [x] Verify migration generation and application.

Notes: Neon connectivity and the `system_health` smoke migration were verified
against the configured Neon database. The temporary `system_health` table exists
only to prove the migration and query workflow.

## 1.4 Application Foundation

- [x] Establish global application layout.
- [x] Configure root providers if required.
- [x] Define global typography.
- [x] Define theme variables.
- [x] Establish light and dark theme behavior if required.
- [x] Configure reusable layout components.
- [x] Establish consistent error and loading UI patterns.
- [x] Configure application metadata.
- [x] Establish shared UI primitives where justified.

Notes: the application now uses root providers for theme and shared UI
components under `components/`; shared page layout infrastructure also lives in
`src/shared/`.

## 1.5 Development Standards

- [x] Verify ESLint.
- [x] Verify TypeScript strict mode.
- [x] Verify Tailwind CSS v4 integration.
- [x] Establish code formatting conventions.
- [x] Establish Git branch conventions.
- [x] Establish documentation conventions.
- [x] Verify development server.
- [x] Verify lint.
- [x] Verify type checking.
- [x] Verify production build.

Historical note: Prettier and CI were deferred when Phase 1 was completed; both
have since been added to the repository.

### Phase 1 Completion Criteria

Phase 1 is complete only when:

- The actual repository has been inspected.
- The target directory structure exists.
- Existing App Router functionality remains intact.
- Neon connection is configured and verified.
- Drizzle configuration and migrations work.
- Environment configuration is validated.
- Global layout and theme foundations are established.
- Lint and TypeScript checks pass.
- Production build passes.

**Expected deliverable:** A clean, working foundation ready for authentication development.

---

# Phase 2 — Custom Authentication & Authorization

**Objective:** Implement secure authentication without depending on external authentication platforms.

**Status:** Implemented and production verified. Database integration tests
use an isolated `TEST_DATABASE_URL`; resource-level workspace, project, and
task authorization is enforced in the domain services.

## 2.1 Authentication Architecture

- [x] Finalize authentication flow.
- [x] Define user identity requirements.
- [x] Define session lifecycle.
- [x] Define token claims.
- [x] Define session expiration policy.
- [x] Define logout and revocation behavior.
- [x] Define authorization strategy.
- [x] Document important security decisions.

## 2.2 Database Schema

- [x] Design users schema.
- [x] Design sessions schema.
- [x] Define unique email constraints.
- [x] Define password hash storage.
- [x] Define account status fields.
- [x] Define timestamps.
- [x] Define indexes.
- [x] Define foreign key relationships.
- [x] Generate migrations.
- [x] Review generated SQL.
- [x] Apply migrations.

## 2.3 Dependencies & Utilities

- [x] Verify `zod` installation (completed in Phase 1).
- [x] Install `bcryptjs`.
- [x] Install `jose`.
- [x] Install required TypeScript types.
- [x] Extend environment validation for authentication-specific variables.
- [x] Implement password hashing utility.
- [x] Implement password verification utility.
- [x] Implement JWT signing utility.
- [x] Implement JWT verification utility.
- [x] Implement secure cookie utilities.
- [x] Implement session utilities.

## 2.4 Registration

- [x] Build signup UI.
- [x] Create signup validation schema.
- [x] Implement registration Server Action.
- [x] Validate email format.
- [x] Validate password requirements.
- [x] Check email uniqueness.
- [x] Hash password securely.
- [x] Create user record.
- [x] Handle duplicate accounts.
- [x] Return safe and predictable responses.

## 2.5 Login

- [x] Build login UI.
- [x] Create login validation schema.
- [x] Implement login Server Action.
- [x] Verify account credentials.
- [x] Issue authenticated session/token.
- [x] Set HTTP-only cookies.
- [x] Configure secure cookie attributes.
- [x] Handle invalid credentials safely.
- [x] Implement login failure handling.
- [x] Implement appropriate rate limiting.

## 2.6 Logout & Session Management

- [x] Implement logout Server Action.
- [x] Clear authentication cookies.
- [x] Revoke persistent sessions where applicable.
- [x] Implement session expiration.
- [x] Implement session validation.
- [x] Handle expired sessions.
- [x] Handle revoked sessions.
- [x] Prevent stale session access.

## 2.7 Route Protection & Authorization

- [x] Protect dashboard routes.
- [x] Implement authentication checks.
- [x] Implement role-based authorization where required (completed in Phase 3).
- [x] Implement resource-level authorization (completed in Phase 3).
- [x] Protect project access (completed in Phase 3).
- [x] Protect workspace access (completed in Phase 3).
- [x] Protect sensitive Server Actions.
- [x] Confirm no protected project/workspace/task Route Handlers are exposed.
- [x] Validate permissions close to database operations (completed in Phase 3).

## 2.8 Authentication Testing

- [x] Test valid registration (service and database integration tests).
- [x] Test duplicate email (service and database integration tests).
- [x] Test invalid registration data (schema tests).
- [x] Test valid login (service and database integration tests).
- [x] Test invalid login (service and database integration tests).
- [x] Test expired sessions (database integration test).
- [x] Test revoked sessions (database integration test).
- [x] Test unauthenticated access (manual route smoke test).
- [x] Test unauthorized resource access (workspace/project/task integration tests).
- [x] Test login throttling (database integration test).

The logout action clears the cookie and revokes its persistent session. A
dedicated automated assertion for the action/cookie pair is a future test
improvement, not an open feature or production-release blocker.

### Phase 2 Completion Criteria

- [x] Registration is implemented.
- [x] Login is implemented.
- [x] Logout is implemented.
- [x] Passwords are securely hashed.
- [x] Session lifecycle is implemented.
- [x] Protected routes work.
- [x] Resource-level authorization works (implemented and tested in Phase 3).
- [x] Sensitive actions use authentication guards.
- [x] Critical authentication integration tests pass with an isolated `TEST_DATABASE_URL`.

**Expected deliverable:** A secure, fully functional custom authentication system.

---

# Phase 3 — Workspaces & Projects Module

**Objective:** Implement the primary workspace and project management functionality.

**Status:** Complete and verified. Workspace membership is managed by adding
existing users; external invitations remain an optional future enhancement.

## 3.1 Workspace Architecture

- [x] Define workspace business rules.
- [x] Design workspace schema.
- [x] Define workspace ownership.
- [x] Design workspace membership schema.
- [x] Define membership roles.
- [x] Define invitation and membership requirements.
- [x] Define workspace permission boundaries.
- [x] Generate and review migrations.

## 3.2 Project Database Design

- [x] Design project schema.
- [x] Define workspace-project relationship.
- [x] Define project ownership.
- [x] Define project status.
- [x] Define project metadata.
- [x] Define project timestamps.
- [x] Add necessary indexes.
- [x] Define deletion behavior.
- [x] Generate and apply migrations.

## 3.3 Workspace Features

- [x] Implement workspace creation.
- [x] Implement workspace listing.
- [x] Implement workspace details.
- [x] Implement workspace updates.
- [x] Implement workspace deletion.
- [x] Implement workspace membership.
- [x] Implement member listing.
- [x] Implement permission checks.

## 3.4 Project Backend

- [x] Implement project validation schemas.
- [x] Implement project services.
- [x] Implement project database operations.
- [x] Implement project creation.
- [x] Implement project listing.
- [x] Implement project details.
- [x] Implement project updates.
- [x] Implement project deletion.
- [x] Implement project ownership checks.
- [x] Implement workspace permission checks.
- [x] Implement predictable error responses.
- [x] Implement cache revalidation where necessary.

## 3.5 Project Frontend

- [x] Build dashboard overview.
- [x] Build workspace navigation.
- [x] Build project grid.
- [x] Build project creation modal.
- [x] Build project editing interface.
- [x] Build project detail page.
- [x] Build project empty states.
- [x] Build loading states.
- [x] Build error states.
- [x] Implement responsive layouts.

## 3.6 Access Control

- [x] Prevent unauthorized workspace access.
- [x] Prevent unauthorized project access.
- [x] Enforce workspace membership permissions.
- [x] Enforce project modification permissions.
- [x] Verify access at the server and database-operation level.

## 3.7 Testing

- [x] Test workspace creation.
- [x] Test workspace updates.
- [x] Test workspace deletion.
- [x] Test membership permissions.
- [x] Test project creation.
- [x] Test project listing.
- [x] Test project updates.
- [x] Test project deletion.
- [x] Test unauthorized project access.
- [x] Test cross-workspace access isolation.

### Phase 3 Completion Criteria

- [x] Users can create and manage workspaces.
- [x] Workspace membership works.
- [x] Users can create and manage projects.
- [x] Project data is correctly associated with workspaces.
- [x] Authorization is enforced.
- [x] Project and workspace workflows pass critical tests.
- [x] Dashboard interfaces are responsive.

**Expected deliverable:** A functional workspace and project management system.

---

# Phase 4 — Task Management & Productivity

**Objective:** Implement task management with Kanban and data-dense table views.

**Status:** Implementation complete and verified.

## 4.1 Task Database Design

- [x] Define task business rules.
- [x] Design task schema.
- [x] Define project-task relationship.
- [x] Define task assignment relationship.
- [x] Define task status.
- [x] Define task priority.
- [x] Define task due dates.
- [x] Define task metadata.
- [x] Define task timestamps.
- [x] Add appropriate indexes.
- [x] Define deletion behavior.
- [x] Generate and review migrations.

## 4.2 Task Backend

- [x] Create task validation schemas.
- [x] Implement task services.
- [x] Implement task creation.
- [x] Implement task listing.
- [x] Implement task details.
- [x] Implement task updates.
- [x] Implement task deletion.
- [x] Implement task assignment.
- [x] Implement status transitions.
- [x] Implement priority changes.
- [x] Implement due-date updates.
- [x] Implement project-level authorization.
- [x] Implement workspace-level authorization.
- [x] Implement appropriate transactions.
- [x] Implement cache revalidation.

## 4.3 Kanban Board

- [x] Design Kanban board layout.
- [x] Define task status columns.
- [x] Build reusable Kanban columns.
- [x] Build task cards.
- [x] Implement task movement between columns.
- [x] Implement drag-and-drop if justified.
- [x] Implement server-side status validation.
- [x] Handle optimistic updates.
- [x] Implement rollback on failed mutations.
- [x] Support responsive horizontal scrolling.

## 4.4 Table View

- [x] Design data-dense task table.
- [x] Implement task rows.
- [x] Implement status indicators.
- [x] Implement priority indicators.
- [x] Display assignments.
- [x] Display due dates.
- [x] Implement sorting.
- [x] Implement pagination where required.
- [x] Implement horizontal scrolling on smaller screens.
- [x] Ensure quantitative values use tabular numerals.

## 4.5 Search & Filtering

- [x] Implement task search.
- [x] Implement status filters.
- [x] Implement priority filters.
- [x] Implement assignee filters.
- [x] Implement due-date filters where required.
- [x] Implement sorting.
- [x] Synchronize shareable filters with URL search parameters where appropriate.
- [x] Validate filter inputs.
- [x] Optimize database queries.

## 4.6 Testing

- [x] Test task creation.
- [x] Test task updates.
- [x] Test task deletion.
- [x] Test task assignment.
- [x] Test status transitions.
- [x] Test unauthorized modifications.
- [x] Test cross-project access.
- [x] Test Kanban updates.
- [x] Test optimistic update rollback.
- [x] Test filters and sorting.
- [x] Test pagination where implemented.

### Phase 4 Completion Criteria

- Task CRUD works.
- Tasks are associated with the correct projects.
- Assignment and permissions work.
- Kanban board works.
- Table view works.
- Status transitions are validated server-side.
- Search, filtering, and sorting work.
- Critical task workflows pass tests.

**Expected deliverable:** A complete task management system with two complementary views.

---

# Phase 5 — Polish, Performance & Production Deployment

**Objective:** Prepare SynapseHQ for production deployment.

## 5.1 Testing Infrastructure

- [x] Select and configure Vitest. (completed in Phase 1)
- [x] Configure React Testing Library.
- [x] Configure Playwright where required.
- [x] Add test scripts to `package.json`. (completed in Phase 1)
- [x] Establish test organization. (completed in Phase 1)
- [x] Configure test database strategy.
- [x] Add unit tests.
- [x] Add integration tests.
- [x] Add end-to-end tests.
- [x] Test critical user workflows.

Note: Vitest and the initial test organization were established in Phase 1 so
that earlier phases can satisfy their testing requirements. Phase 5 extends
coverage and adds component and browser testing.

## 5.2 Security Audit

- [x] Review authentication implementation.
- [x] Review session lifecycle.
- [x] Review cookie security.
- [x] Review password handling.
- [x] Review authorization boundaries.
- [x] Review workspace isolation.
- [x] Review project access.
- [x] Review task access.
- [x] Review Server Actions.
- [x] Review Route Handlers.
- [x] Review environment variable exposure.
- [x] Review error messages and logging.
- [x] Review rate limiting.
- [x] Review dependency vulnerabilities.

## 5.3 UI & Accessibility Audit

- [x] Review mobile layouts.
- [x] Review tablet layouts.
- [x] Review desktop layouts.
- [x] Review widescreen layouts.
- [x] Review navigation.
- [x] Review forms.
- [x] Review modals.
- [x] Review Kanban responsiveness.
- [x] Review table responsiveness.
- [x] Review keyboard navigation.
- [x] Review focus indicators.
- [x] Review color contrast.
- [x] Review loading states.
- [x] Review empty states.
- [x] Review error states.

## 5.4 Performance Optimization

- [x] Review Client Component usage.
- [x] Review React re-renders.
- [x] Review bundle size.
- [x] Optimize image handling.
- [x] Optimize font loading.
- [x] Review database query performance.
- [x] Review N+1 query patterns.
- [x] Review indexes.
- [x] Review pagination.
- [x] Review caching behavior.
- [x] Review cache invalidation.
- [x] Validate user-specific data isolation.

## 5.5 Production Configuration

- [x] Configure production environment variables in Vercel.
- [x] Create and configure the replacement production Neon PostgreSQL project.
- [x] Apply and verify production database migrations.
- [x] Configure Vercel Git deployment from `main`.
- [x] Restrict Vercel deployments to `main`; Preview deployments are disabled.
- [x] Configure the production application URL.
- [x] Verify HTTPS deployment and production-secure session cookies.
- [x] Review external logging/monitoring needs; no additional provider was required for this release.
- [x] Verify the production build through CI.
- [x] Deploy the application and confirm Vercel completed the deployment.
- [x] Project owner verified the live application and confirmed it works.

## 5.6 Final Release

- [x] Review all roadmap phases.
- [x] Verify critical functionality.
- [x] Verify security requirements.
- [x] Verify production database and schema migration.
- [x] Verify production deployment.
- [x] Review documentation.
- [x] Resolve release-blocking issues before production promotion.
- [x] Document the delivered functionality and operating instructions in `README.md`.

### Phase 5 Completion Criteria

- Critical automated tests pass.
- Security audit is completed.
- Responsive and accessibility reviews are completed.
- Production build succeeds.
- Production environment is configured.
- Deployment works.
- Critical production workflows are verified.

**Expected deliverable:** A tested, secure, optimized, deployed SynapseHQ application.

---

# Phase 6 — DevOps & Security Hardening

**Objective:** Add production-grade containerization, local service orchestration, and a hardened CI/CD pipeline.

**Status:** Complete. The production application uses Vercel Git integration;
container publishing and the GitHub deploy hook remain optional, disabled
workflows.

## 6.1 Containerization

- [x] Add a production multi-stage Dockerfile with dependency caching.
- [x] Add `.dockerignore` to exclude secrets and build artifacts.
- [x] Run the application container as a non-root user.
- [x] Verify the container image builds successfully.
- [x] Verify the container starts and serves the application.

## 6.2 Local Orchestration

- [x] Add `docker-compose.yml` with application and PostgreSQL services.
- [x] Add a persistent PostgreSQL volume and healthcheck.
- [x] Isolate services on a dedicated bridge network.
- [x] Bind the database port to loopback only.
- [x] Add local PostgreSQL credentials to `.env.sample`.
- [x] Verify the Docker Compose configuration.

## 6.3 CI/CD

- [x] Add lint and formatting quality gates.
- [x] Add typecheck, test, and production build gates.
- [x] Configure end-to-end tests against the production build.
- [x] Configure optional GHCR publishing, gated off by default and limited to `main`.
- [x] Add a guarded optional production deployment hook; Vercel Git integration is the active deployment path.
- [x] Document required repository variables and secrets.

## 6.4 Security Hardening

- [x] Keep `.env` files out of the repository and container build context.
- [x] Never bake secrets into images or Compose files.
- [x] Run the application container as non-root.
- [x] Apply `no-new-privileges` and drop unnecessary capabilities.
- [x] Review container and CI supply-chain settings.

## 6.5 Verification

- [x] Docker image builds.
- [x] Compose configuration validates.
- [x] CI workflow validates.
- [x] Lint, format, typecheck, tests, and build pass.
- [x] Documentation is synchronized.

### Phase 6 Completion Criteria

- The application runs from a production container image.
- Local Compose orchestration starts the application and PostgreSQL.
- CI enforces lint, format, typecheck, test, build, and E2E quality gates.
- Optional production images can publish only from `main` when explicitly enabled.
- No secrets are committed or embedded in images.
- Documentation reflects the container and CI workflow.

**Expected deliverable:** A containerized, security-hardened SynapseHQ deployment workflow.

---

# 4. Progress Tracking

The initial SynapseHQ product and production release are complete. Update this
record only when the application or its verified deployment materially changes.

## Phase Status

| Phase                           | Status    |
| ------------------------------- | --------- |
| Phase 1 — Foundation            | Completed |
| Phase 2 — Authentication        | Completed |
| Phase 3 — Workspaces & Projects | Completed |
| Phase 4 — Task Management       | Completed |
| Phase 5 — Production Readiness  | Completed |
| Phase 6 — DevOps & Security     | Completed |

All six planned phases are complete:

- [x] Phase 1 — Foundation
- [x] Phase 2 — Authentication
- [x] Phase 3 — Workspaces & Projects
- [x] Phase 4 — Task Management
- [x] Phase 5 — Production Readiness
- [x] Phase 6 — DevOps & Security

## Overall Progress

```text
COMPLETE — The initial product scope is implemented, tested, and deployed to
Vercel Production from main. The owner confirmed the live application works.
Optional ideas below are future product work, not incomplete release tasks.
```

Do not use a percentage until the remaining work has a measurable denominator.

Do not calculate progress by simply counting the number of phases completed if substantial work within a phase remains.

## Phase Completion Record

```text
Historical Phase 1 completion snapshot (preserved for project history; it is
not a statement of current repository status):
Phase: Phase 1 — Foundation & Modular Architecture
Completion date: 2026-10-30
Feature branch: feature/phase-1-foundation
Implemented functionality: Modular foundation, Neon/Drizzle infrastructure, environment validation, application shell, metadata, theme tokens, loading/error/not-found UI, security headers, Vitest setup, and documentation synchronization.
Files created: src/shared/config/env.ts, src/shared/config/env.schema.ts, src/shared/config/env.schema.test.ts, src/shared/db/client.ts, src/shared/db/index.ts, src/shared/db/schema.ts, src/shared/components/layout/page-shell.tsx, src/modules/.gitkeep, drizzle.config.ts, drizzle/0000_keen_ink.sql, drizzle/meta/*, vitest.config.mts, app/loading.tsx, app/error.tsx, app/not-found.tsx, .editorconfig, .nvmrc, docs/architecture/decisions/ADR-001-modular-monolith.md, docs/architecture/decisions/ADR-003-database-selection.md, docs/architecture/decisions/ADR-005-module-boundaries.md
Files modified: package.json, package-lock.json, next.config.ts, app/layout.tsx, app/globals.css, app/page.tsx, .env.sample, .gitignore, README.md, .agents/AGENTS.md, .agents/ARCHITECTURE.md, .agents/roadmap.md
Database changes: Created the temporary public.system_health table through migration 0000_keen_ink for smoke verification.
Dependencies added: zod, drizzle-orm, @neondatabase/serverless, server-only, drizzle-kit, vitest; @types/node upgraded to v24.
Lint result: Passed.
Typecheck result: Passed.
Build result: Passed.
Test result: 5/5 Vitest tests passed.
Known limitations at that historical snapshot: Authentication and domain modules were not implemented; system_health was a temporary smoke table; the configured DATABASE_URL was the direct/unpooled Neon URL; Drizzle Kit had dev-only transitive audit advisories; Prettier, CI, full CSP, React Testing Library, and Playwright were deferred to Phase 5. Neon connectivity from that environment required NODE_OPTIONS=--no-network-family-autoselection under Node 24.
Next phase: Phase 2 — Authentication
```

## Initial Product Release Completion

```text
Status: Complete
Date: 2026-11-01
Production branch: main
Production host: Vercel Git integration; Vercel deployments are enabled only for main.
Database: Replacement Neon production project configured; schema migrations applied and verified.
Verification: CI passed lint/format, typecheck, unit/integration tests, production build, and E2E. Vercel reported the main deployment completed; the project owner confirmed the live application works.
Delivered scope: Custom authentication; workspaces and membership; projects and team allocation; tasks, Kanban/table views, subtasks, comments, activity, attachments, milestones, and in-app notifications; responsive dashboard; repository-managed project Markdown; Docker/Compose and CI configuration.
Deferred: In-app Markdown authoring/storage, workspace invitations, real-time collaboration, external email/push notification delivery, analytics, velocity reporting, and sprint planning.
```

---

# 5. Git Branching Strategy

Use dedicated feature branches for roadmap phases.

Naming convention:

```text
feature/phase-1-foundation
feature/phase-2-auth
feature/phase-3-workspaces-projects
feature/phase-4-task-management
feature/phase-5-production
feature/phase-6-devops-security
```

Before creating a branch:

```bash
git branch --show-current
git status --short
```

Preserve existing uncommitted work.

Do not force-push, discard changes, or create commits without authorization.

Suggested commit conventions:

```text
feat(auth): implement registration
feat(projects): add project creation
feat(tasks): implement task status transitions
fix(auth): validate session expiration
refactor(tasks): separate task service logic
test(projects): add project authorization tests
docs(roadmap): update phase progress
```

---

# 6. Definition of Done

A roadmap item can be marked `[x]` only when:

1. The implementation exists.
2. It meets the intended requirement.
3. It respects the architecture.
4. Security and authorization have been considered.
5. Relevant validation is implemented.
6. Required verification has been performed.
7. No known release-blocking issue remains.
8. Documentation has been updated where necessary.

A phase can be marked completed only when all mandatory phase completion criteria are satisfied.

Do not mark a task complete because its files were created or its UI was generated.

**Implementation must work, not merely exist.**

---

# 7. Future Feature Policy

Additional functionality should be introduced through new roadmap items or phases.

Potential future capabilities may include:

- In-app Markdown document editing and storage
- Workspace invitations
- Email/push notification delivery and preferences
- Real-time collaboration
- Analytics and velocity reporting
- Sprint planning
- Search improvements

These are potential extensions, not committed implementation requirements.

Do not implement them prematurely.

Repository project documentation already exists in `docs/projects/synapsehq/`;
future Markdown editing refers only to an in-app product feature.

Evaluate each feature against actual product requirements, architectural
impact, and development priorities. Do not treat this list as an open release
checklist.
