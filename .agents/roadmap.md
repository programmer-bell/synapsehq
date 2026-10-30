# SynapseHQ — Project Roadmap

**Project:** SynapseHQ  
**Architecture:** Modular Monolith  
**Status:** Phase 1 complete / Phase 2 next
**Current Stage:** Phase 2 — Authentication
**Total Phases:** 5

---

# 1. Project Objective

Build SynapseHQ as a professional SaaS engineering workspace application.

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

| Layer | Technology |
|---|---|
| Framework | Next.js 16 |
| Frontend | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| Validation | Zod |
| Password hashing | bcryptjs |
| JWT | jose |
| Deployment | Vercel |
| Testing | Vitest, React Testing Library, Playwright (planned) |

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

| Phase | Name | Primary Outcome |
|---|---|---|
| 1 | Foundation & Architecture | Project infrastructure and modular structure |
| 2 | Authentication | Secure custom authentication |
| 3 | Workspaces & Projects | Workspace and project management |
| 4 | Task Management | Kanban and table-based task management |
| 5 | Polish & Deployment | Testing, optimization, and production deployment |

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
`ARCHITECTURE.md` and ADR-005. `src/modules/` intentionally contains only a
placeholder until Phase 2.

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

Notes: no root providers are required yet. Shared UI primitives are not yet
justified beyond the reusable `PageShell` layout component.

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

Notes: `.editorconfig` and ESLint establish formatting conventions. Prettier and
CI are deferred to Phase 5 by project decision.

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

## 2.1 Authentication Architecture

- [ ] Finalize authentication flow.
- [ ] Define user identity requirements.
- [ ] Define session lifecycle.
- [ ] Define token claims.
- [ ] Define session expiration policy.
- [ ] Define logout and revocation behavior.
- [ ] Define authorization strategy.
- [ ] Document important security decisions.

## 2.2 Database Schema

- [ ] Design users schema.
- [ ] Design sessions schema.
- [ ] Define unique email constraints.
- [ ] Define password hash storage.
- [ ] Define account status fields.
- [ ] Define timestamps.
- [ ] Define indexes.
- [ ] Define foreign key relationships.
- [ ] Generate migrations.
- [ ] Review generated SQL.
- [ ] Apply migrations.

## 2.3 Dependencies & Utilities

- [ ] Verify `zod` installation (completed in Phase 1).
- [ ] Install `bcryptjs`.
- [ ] Install `jose`.
- [ ] Install required TypeScript types.
- [ ] Extend environment validation for authentication-specific variables.
- [ ] Implement password hashing utility.
- [ ] Implement password verification utility.
- [ ] Implement JWT signing utility.
- [ ] Implement JWT verification utility.
- [ ] Implement secure cookie utilities.
- [ ] Implement session utilities.

## 2.4 Registration

- [ ] Build signup UI.
- [ ] Create signup validation schema.
- [ ] Implement registration Server Action.
- [ ] Validate email format.
- [ ] Validate password requirements.
- [ ] Check email uniqueness.
- [ ] Hash password securely.
- [ ] Create user record.
- [ ] Handle duplicate accounts.
- [ ] Return safe and predictable responses.

## 2.5 Login

- [ ] Build login UI.
- [ ] Create login validation schema.
- [ ] Implement login Server Action.
- [ ] Verify account credentials.
- [ ] Issue authenticated session/token.
- [ ] Set HTTP-only cookies.
- [ ] Configure secure cookie attributes.
- [ ] Handle invalid credentials safely.
- [ ] Implement login failure handling.
- [ ] Implement appropriate rate limiting.

## 2.6 Logout & Session Management

- [ ] Implement logout Server Action.
- [ ] Clear authentication cookies.
- [ ] Revoke persistent sessions where applicable.
- [ ] Implement session expiration.
- [ ] Implement session validation.
- [ ] Handle expired sessions.
- [ ] Handle revoked sessions.
- [ ] Prevent stale session access.

## 2.7 Route Protection & Authorization

- [ ] Protect dashboard routes.
- [ ] Implement authentication checks.
- [ ] Implement role-based authorization where required.
- [ ] Implement resource-level authorization.
- [ ] Protect project access.
- [ ] Protect workspace access.
- [ ] Protect sensitive Server Actions.
- [ ] Protect Route Handlers.
- [ ] Validate permissions close to database operations.

## 2.8 Authentication Testing

- [ ] Test valid registration.
- [ ] Test duplicate email.
- [ ] Test invalid registration data.
- [ ] Test valid login.
- [ ] Test invalid login.
- [ ] Test logout.
- [ ] Test expired sessions.
- [ ] Test revoked sessions.
- [ ] Test unauthenticated access.
- [ ] Test unauthorized resource access.
- [ ] Test session cookie behavior.

### Phase 2 Completion Criteria

- Registration works.
- Login works.
- Logout works.
- Passwords are securely hashed.
- Session lifecycle is implemented.
- Protected routes work.
- Resource-level authorization works.
- Sensitive actions enforce permissions.
- Critical authentication tests pass.

**Expected deliverable:** A secure, fully functional custom authentication system.

---

# Phase 3 — Workspaces & Projects Module

**Objective:** Implement the primary workspace and project management functionality.

## 3.1 Workspace Architecture

- [ ] Define workspace business rules.
- [ ] Design workspace schema.
- [ ] Define workspace ownership.
- [ ] Design workspace membership schema.
- [ ] Define membership roles.
- [ ] Define invitation and membership requirements.
- [ ] Define workspace permission boundaries.
- [ ] Generate and review migrations.

## 3.2 Project Database Design

- [ ] Design project schema.
- [ ] Define workspace-project relationship.
- [ ] Define project ownership.
- [ ] Define project status.
- [ ] Define project metadata.
- [ ] Define project timestamps.
- [ ] Add necessary indexes.
- [ ] Define deletion behavior.
- [ ] Generate and apply migrations.

## 3.3 Workspace Features

- [ ] Implement workspace creation.
- [ ] Implement workspace listing.
- [ ] Implement workspace details.
- [ ] Implement workspace updates.
- [ ] Implement workspace deletion.
- [ ] Implement workspace membership.
- [ ] Implement member listing.
- [ ] Implement permission checks.

## 3.4 Project Backend

- [ ] Implement project validation schemas.
- [ ] Implement project services.
- [ ] Implement project database operations.
- [ ] Implement project creation.
- [ ] Implement project listing.
- [ ] Implement project details.
- [ ] Implement project updates.
- [ ] Implement project deletion.
- [ ] Implement project ownership checks.
- [ ] Implement workspace permission checks.
- [ ] Implement predictable error responses.
- [ ] Implement cache revalidation where necessary.

## 3.5 Project Frontend

- [ ] Build dashboard overview.
- [ ] Build workspace navigation.
- [ ] Build project grid.
- [ ] Build project creation modal.
- [ ] Build project editing interface.
- [ ] Build project detail page.
- [ ] Build project empty states.
- [ ] Build loading states.
- [ ] Build error states.
- [ ] Implement responsive layouts.

## 3.6 Access Control

- [ ] Prevent unauthorized workspace access.
- [ ] Prevent unauthorized project access.
- [ ] Enforce workspace membership permissions.
- [ ] Enforce project modification permissions.
- [ ] Verify access at the server and database-operation level.

## 3.7 Testing

- [ ] Test workspace creation.
- [ ] Test workspace updates.
- [ ] Test workspace deletion.
- [ ] Test membership permissions.
- [ ] Test project creation.
- [ ] Test project listing.
- [ ] Test project updates.
- [ ] Test project deletion.
- [ ] Test unauthorized project access.
- [ ] Test cross-workspace access isolation.

### Phase 3 Completion Criteria

- Users can create and manage workspaces.
- Workspace membership works.
- Users can create and manage projects.
- Project data is correctly associated with workspaces.
- Authorization is enforced.
- Project and workspace workflows pass critical tests.
- Dashboard interfaces are responsive.

**Expected deliverable:** A functional workspace and project management system.

---

# Phase 4 — Task Management & Productivity

**Objective:** Implement task management with Kanban and data-dense table views.

## 4.1 Task Database Design

- [ ] Define task business rules.
- [ ] Design task schema.
- [ ] Define project-task relationship.
- [ ] Define task assignment relationship.
- [ ] Define task status.
- [ ] Define task priority.
- [ ] Define task due dates.
- [ ] Define task metadata.
- [ ] Define task timestamps.
- [ ] Add appropriate indexes.
- [ ] Define deletion behavior.
- [ ] Generate and review migrations.

## 4.2 Task Backend

- [ ] Create task validation schemas.
- [ ] Implement task services.
- [ ] Implement task creation.
- [ ] Implement task listing.
- [ ] Implement task details.
- [ ] Implement task updates.
- [ ] Implement task deletion.
- [ ] Implement task assignment.
- [ ] Implement status transitions.
- [ ] Implement priority changes.
- [ ] Implement due-date updates.
- [ ] Implement project-level authorization.
- [ ] Implement workspace-level authorization.
- [ ] Implement appropriate transactions.
- [ ] Implement cache revalidation.

## 4.3 Kanban Board

- [ ] Design Kanban board layout.
- [ ] Define task status columns.
- [ ] Build reusable Kanban columns.
- [ ] Build task cards.
- [ ] Implement task movement between columns.
- [ ] Implement drag-and-drop if justified.
- [ ] Implement server-side status validation.
- [ ] Handle optimistic updates.
- [ ] Implement rollback on failed mutations.
- [ ] Support responsive horizontal scrolling.

## 4.4 Table View

- [ ] Design data-dense task table.
- [ ] Implement task rows.
- [ ] Implement status indicators.
- [ ] Implement priority indicators.
- [ ] Display assignments.
- [ ] Display due dates.
- [ ] Implement sorting.
- [ ] Implement pagination where required.
- [ ] Implement horizontal scrolling on smaller screens.
- [ ] Ensure quantitative values use tabular numerals.

## 4.5 Search & Filtering

- [ ] Implement task search.
- [ ] Implement status filters.
- [ ] Implement priority filters.
- [ ] Implement assignee filters.
- [ ] Implement due-date filters where required.
- [ ] Implement sorting.
- [ ] Synchronize shareable filters with URL search parameters where appropriate.
- [ ] Validate filter inputs.
- [ ] Optimize database queries.

## 4.6 Testing

- [ ] Test task creation.
- [ ] Test task updates.
- [ ] Test task deletion.
- [ ] Test task assignment.
- [ ] Test status transitions.
- [ ] Test unauthorized modifications.
- [ ] Test cross-project access.
- [ ] Test Kanban updates.
- [ ] Test optimistic update rollback.
- [ ] Test filters and sorting.
- [ ] Test pagination where implemented.

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
- [ ] Configure React Testing Library.
- [ ] Configure Playwright where required.
- [x] Add test scripts to `package.json`. (completed in Phase 1)
- [x] Establish test organization. (completed in Phase 1)
- [ ] Configure test database strategy.
- [ ] Add unit tests.
- [ ] Add integration tests.
- [ ] Add end-to-end tests.
- [ ] Test critical user workflows.

Note: Vitest and the initial test organization were established in Phase 1 so
that earlier phases can satisfy their testing requirements. Phase 5 extends
coverage and adds component and browser testing.

## 5.2 Security Audit

- [ ] Review authentication implementation.
- [ ] Review session lifecycle.
- [ ] Review cookie security.
- [ ] Review password handling.
- [ ] Review authorization boundaries.
- [ ] Review workspace isolation.
- [ ] Review project access.
- [ ] Review task access.
- [ ] Review Server Actions.
- [ ] Review Route Handlers.
- [ ] Review environment variable exposure.
- [ ] Review error messages and logging.
- [ ] Review rate limiting.
- [ ] Review dependency vulnerabilities.

## 5.3 UI & Accessibility Audit

- [ ] Review mobile layouts.
- [ ] Review tablet layouts.
- [ ] Review desktop layouts.
- [ ] Review widescreen layouts.
- [ ] Review navigation.
- [ ] Review forms.
- [ ] Review modals.
- [ ] Review Kanban responsiveness.
- [ ] Review table responsiveness.
- [ ] Review keyboard navigation.
- [ ] Review focus indicators.
- [ ] Review color contrast.
- [ ] Review loading states.
- [ ] Review empty states.
- [ ] Review error states.

## 5.4 Performance Optimization

- [ ] Review Client Component usage.
- [ ] Review React re-renders.
- [ ] Review bundle size.
- [ ] Optimize image handling.
- [ ] Optimize font loading.
- [ ] Review database query performance.
- [ ] Review N+1 query patterns.
- [ ] Review indexes.
- [ ] Review pagination.
- [ ] Review caching behavior.
- [ ] Review cache invalidation.
- [ ] Validate user-specific data isolation.

## 5.5 Production Configuration

- [ ] Configure production environment variables.
- [ ] Configure production Neon PostgreSQL.
- [ ] Verify production database migrations.
- [ ] Configure Vercel project.
- [ ] Configure deployment settings.
- [ ] Configure production URL.
- [ ] Verify HTTPS and secure cookies.
- [ ] Configure logging and error monitoring where required.
- [ ] Verify production build.
- [ ] Verify deployment.
- [ ] Perform production smoke tests.

## 5.6 Final Release

- [ ] Review all roadmap phases.
- [ ] Verify critical functionality.
- [ ] Verify security requirements.
- [ ] Verify production database.
- [ ] Verify deployment.
- [ ] Review documentation.
- [ ] Resolve release-blocking issues.
- [ ] Prepare release notes.

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

# 4. Progress Tracking

Use this section to maintain the actual project status.

## Phase Status

| Phase | Status |
|---|---|
| Phase 1 — Foundation | Completed |
| Phase 2 — Authentication | Not started |
| Phase 3 — Workspaces & Projects | Not started |
| Phase 4 — Task Management | Not started |
| Phase 5 — Production Readiness | Not started |

Allowed statuses:

- Not started
- In progress
- Blocked
- Completed

Update statuses only when supported by actual implementation evidence.

## Overall Progress

```text
[████░░░░░░░░░░░░░░░░] 20% Complete | Phase 1/5 Done
```

The progress bar is updated from actual completed roadmap work. Phase 1 is complete; overall progress reflects one fully completed phase out of five.

Do not calculate progress by simply counting the number of phases completed if substantial work within a phase remains.

## Phase Completion Record

```text
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
Known limitations: Authentication and domain modules are not implemented; system_health is a temporary smoke table; the configured DATABASE_URL is the direct/unpooled Neon URL; Drizzle Kit has dev-only transitive audit advisories; Prettier, CI, full CSP, React Testing Library, and Playwright are deferred to Phase 5. Neon connectivity from this environment required NODE_OPTIONS=--no-network-family-autoselection under Node 24.
Next phase: Phase 2 — Authentication
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

- Notifications
- Activity history
- Workspace invitations
- Advanced permissions
- Real-time collaboration
- File attachments
- Analytics
- Search improvements

These are potential extensions, not committed implementation requirements.

Do not implement them prematurely.

Evaluate each feature against actual product requirements, architectural impact, and development priorities.