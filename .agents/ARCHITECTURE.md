# SynapseHQ — System Architecture

**Document:** ARCHITECTURE.md  
**Project:** SynapseHQ  
**Architecture Style:** Modular Monolith  
**Application Type:** SaaS Engineering Workspace  
**Status:** Active System Architecture
**Primary Framework:** Next.js App Router

---

# 1. Architecture Overview

SynapseHQ follows a **Modular Monolith Architecture**.

The application is deployed as one cohesive application while maintaining clear internal boundaries between business domains.

The architecture is intended to provide:

- Clear separation of concerns.
- Independent domain ownership.
- Maintainable business logic.
- Secure database access.
- Reusable infrastructure.
- Testable application services.
- Future flexibility for scaling.

## Core Architecture Principles

1. Domain-oriented modularity.
2. Separation of business logic and presentation.
3. Explicit module boundaries.
4. Server-side database access.
5. Centralized authentication and authorization.
6. Reusable shared infrastructure.
7. Minimal cross-module coupling.
8. Transactional data integrity.
9. Security by design.
10. Incremental architectural evolution.

## Why Modular Monolith?

SynapseHQ does not currently require independently deployed microservices.

A modular monolith provides sufficient separation without introducing:

- Distributed transactions.
- Inter-service network communication.
- Service discovery.
- Multiple deployment pipelines.
- Unnecessary infrastructure.
- Distributed debugging complexity.

Microservices should only be considered when genuine organizational, deployment, scaling, or operational requirements justify extraction.

---

# 2. Technology Architecture

## Application Stack

| Layer                  | Technology                      | Responsibility                    |
| ---------------------- | ------------------------------- | --------------------------------- |
| Application framework  | Next.js 16                      | Routing and application runtime   |
| UI                     | React 19                        | User interface                    |
| Language               | TypeScript                      | Static typing                     |
| Styling                | Tailwind CSS v4                 | Design system and responsive UI   |
| Validation             | Zod                             | Runtime input validation          |
| Theme                  | next-themes                     | Class-based light/dark mode       |
| Database               | Neon PostgreSQL                 | Persistent relational data        |
| ORM                    | Drizzle ORM                     | Typed database operations         |
| Password security      | bcryptjs                        | Password hashing and verification |
| Token management       | jose                            | JWT signing and verification      |
| Application interfaces | Server Actions / Route Handlers | Server-side operations            |
| Container              | Docker                          | Production application image      |
| Testing                | Vitest / Playwright             | Unit, integration, and E2E tests  |

The installed dependency manifest (`package.json`) is authoritative. Production
deployment has not been verified.

## High-Level Architecture

```text
                    USER
                     |
                     v
             NEXT.JS APPLICATION
                     |
          +----------+----------+
          |                     |
          v                     v
    SERVER COMPONENTS     CLIENT COMPONENTS
          |                     |
          |                Interactive UI
          |                     |
          +----------+----------+
                     |
                     v
             SERVER ENTRY POINTS
          +----------+----------+
          |                     |
          v                     v
    SERVER ACTIONS        ROUTE HANDLERS
          |                     |
          +----------+----------+
                     |
                     v
              APPLICATION LAYER
                     |
          +----------+----------+
          |                     |
          v                     v
     AUTHORIZATION        DOMAIN SERVICES
          |                     |
          +----------+----------+
                     |
                     v
              DATA ACCESS LAYER
                     |
                     v
                DRIZZLE ORM
                     |
                     v
              NEON POSTGRESQL
```

---

# 3. Repository Structure

## Current Repository Reality

The existing Next.js App Router is located at the repository root:

```text
app/
```

The current `@/*` TypeScript alias maps to the repository root.

Phase 1 established the initial modular foundation: `src/shared/`, `src/modules/`, and `drizzle/`. Domain modules are still introduced incrementally as their functionality is implemented.

The canonical engineering documents live in `.agents/`:

```text
.agents/
├── AGENTS.md
├── ARCHITECTURE.md
└── roadmap.md
```

Do not move the existing App Router into `src/app/` without a deliberate migration.

Import conventions:

- Use `@/src/modules/...` for domain code.
- Use `@/src/shared/...` for shared infrastructure.
- Keep the existing `@/*` root alias.

## Target Directory Structure

The following is the intended organization after the modular architecture is introduced.

```text
synapsehq/
│
├── app/                              # Existing Next.js App Router
│   │
│   ├── (auth)/                       # Authentication route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/                  # Protected application routes
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [projectId]/
│   │   │       └── page.tsx
│   │   │
│   │   └── tasks/
│   │       └── page.tsx
│   │
│   ├── api/                          # HTTP Route Handlers
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── src/
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── actions/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── schemas/
│   │   │   ├── db/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── workspaces/
│   │   │   ├── actions/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── schemas/
│   │   │   ├── db/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── projects/
│   │   │   ├── actions/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── schemas/
│   │   │   ├── db/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── tasks/
│   │   │   ├── actions/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── schemas/
│   │   │   ├── db/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   └── notifications/
│   │       ├── services/
│   │       ├── repositories/
│   │       ├── schemas/
│   │       ├── db/
│   │       ├── types/
│   │       └── index.ts
│   │
│   └── shared/
│       ├── db/
│       │   ├── client.ts
│       │   └── index.ts
│       │
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── utils/
│       ├── types/
│       ├── config/
│       └── errors/
│
├── drizzle/                          # Generated SQL migrations
│
├── docs/
│   └── architecture/
│       ├── decisions/
│       └── diagrams/
│
├── public/
│
├── .env.sample
├── .gitignore
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
├── vitest.config.mts
└── .agents/
    ├── AGENTS.md
    ├── ARCHITECTURE.md
    └── roadmap.md
```

This is a target structure, not a requirement to create every directory immediately.

Create directories only when the corresponding functionality is introduced.

## Directory Responsibilities

### `app/`

Responsible for:

- URL routing.
- Route groups.
- Page composition.
- Layout composition.
- Loading and error boundaries.
- API Route Handlers.

Keep route-level files thin.

Import business functionality from the appropriate module.

### `src/modules/`

Contains business-domain functionality.

Each module owns its own:

- Business rules.
- Application services.
- Validation schemas.
- Domain types.
- Database schema definitions.
- Repositories where useful.
- Server Actions.
- Feature-specific components.

### `src/shared/`

Contains genuinely reusable cross-domain functionality.

Examples:

- Database connection.
- Shared UI primitives.
- General utilities.
- Shared types.
- Configuration.
- Error definitions.
- Reusable hooks.

Do not place domain-specific functionality in `shared/`.

### `drizzle/`

Contains generated database migration files.

Migration files represent changes to the database schema over time.

Domain schema definitions remain owned by their respective modules.

The Drizzle configuration should discover the actual schema locations.

---

# 4. Modular Boundaries

The initial business modules are:

1. Auth
2. Workspaces
3. Projects
4. Tasks
5. Notifications

Each module should expose a small, intentional public interface.

## Auth Module

Responsibilities:

- Registration.
- Login.
- Logout.
- Password hashing.
- JWT management.
- Session management.
- Authentication verification.
- Identity resolution.

The Auth module is responsible for establishing user identity.

It should not own project or task business logic.

## Workspaces Module

Responsibilities:

- Workspace creation.
- Workspace management.
- Workspace ownership.
- Membership management.
- Member permissions.
- Workspace-level access rules.

The workspace module defines the organizational boundary for projects and members.

## Projects Module

Responsibilities:

- Project creation.
- Project listing.
- Project details.
- Project updates.
- Project deletion.
- Project ownership.
- Project-level permissions.

Projects belong to workspaces.

Project operations must respect workspace authorization.

## Tasks Module

Responsibilities:

- Task creation.
- Task listing.
- Task updates.
- Task deletion.
- Task assignments.
- Task priorities.
- Task status transitions.
- Due dates.
- Task filtering and sorting.
- Kanban and table presentation support.

Tasks belong to projects.

Task operations must respect the associated project's workspace permissions.

## Notifications Module

Implemented responsibilities:

- Notification creation.
- User-scoped notification listing.
- Read/unread status.
- In-app delivery for task assignments, task status changes, comments,
  milestones, and project team changes.

Email, push delivery, and notification preferences are not implemented.

---

# 5. Module Communication Rules

Modules must communicate through intentional interfaces.

Do not directly access another module's internal implementation.

Example:

```text
Tasks Module
     |
     v
Projects Public Interface
     |
     v
Project Authorization
     |
     v
Result
```

## Rules

1. Avoid circular dependencies.
2. Avoid importing another module's private repository.
3. Expose necessary functionality through module entry points.
4. Keep business ownership within the responsible module.
5. Avoid duplicating authorization rules.
6. Avoid unnecessary abstraction layers.
7. Keep cross-module interactions explicit.

Example public interface:

```ts
// src/modules/projects/index.ts

export {
  getProjectById,
  verifyProjectAccess,
} from "./services/project.service";
```

Only expose functionality that other modules genuinely need.

The exact API should follow the actual implementation.

---

# 6. Backend Architecture

Separate backend responsibilities into clear layers.

## Request Processing Flow

```text
Client
  |
  v
Server Action / Route Handler
  |
  v
Input Validation
  |
  v
Authentication
  |
  v
Authorization
  |
  v
Application Service
  |
  v
Repository
  |
  v
Drizzle ORM
  |
  v
Neon PostgreSQL
```

## Layer Responsibilities

### 6.1 Server Actions

Server Actions are application entry points for mutations and other appropriate server operations.

Responsibilities:

- Receive untrusted input.
- Validate input.
- Resolve the current user.
- Enforce authorization.
- Invoke application services.
- Translate expected errors into safe results.
- Revalidate affected UI when necessary.

Server Actions should not contain large amounts of business logic.

### 6.2 Route Handlers

Use Route Handlers when an HTTP endpoint is required.

Examples:

- External integrations.
- Webhooks.
- Machine-to-machine endpoints.
- APIs consumed outside the application.
- HTTP operations that require explicit request/response semantics.

Do not create Route Handlers merely to duplicate functionality already served appropriately by Server Actions.

### 6.3 Application Services

Services implement business use cases.

Examples:

- Register user.
- Create workspace.
- Create project.
- Update task status.
- Assign task to member.

Services should:

- Implement business rules.
- Enforce important domain invariants.
- Coordinate repositories.
- Manage transactional operations.
- Remain independent of React components.

### 6.4 Repositories

Repositories manage database access where centralized query ownership provides meaningful value.

Examples:

- User lookup.
- Workspace membership lookup.
- Project retrieval.
- Task updates.

Repositories should not contain UI behavior.

Do not create repository wrappers for every trivial database operation without a clear benefit.

### 6.5 Validation

Zod schemas validate untrusted input at application boundaries.

Keep schemas close to the domain that owns them.

Example:

```ts
// src/modules/tasks/schemas/task.schema.ts

import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
```

The example illustrates the intended pattern. Actual task fields and enums must follow the finalized domain model.

---

# 7. Server Action Design

Use predictable response structures.

Example:

```ts
export type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };
```

Example execution structure:

```ts
/**
 * @domain Tasks
 * @description Updates task status after validating access.
 */

"use server";

export async function updateTaskStatus(input: unknown) {
  // 1. Validate untrusted input.
  // 2. Resolve authenticated user.
  // 3. Verify task and workspace permissions.
  // 4. Execute the domain operation.
  // 5. Revalidate affected UI.
  // 6. Return a predictable result.
}
```

This is an architectural example, not a complete implementation.

## Error Handling

Separate:

- Validation errors.
- Authentication errors.
- Authorization errors.
- Not-found errors.
- Business rule violations.
- Database errors.
- Unexpected application failures.

Do not expose raw database errors or stack traces to clients.

Log meaningful server-side failures.

Do not use broad catch blocks that silently convert programming errors into generic success or failure responses.

---

# 8. Database Architecture

## Database Technology

Primary database:

**Neon PostgreSQL**

ORM:

**Drizzle ORM**

The database is the source of truth for persistent application data.

## Database Connection

Shared connection infrastructure belongs under:

```text
src/shared/db/
├── client.ts
├── index.ts
└── schema.ts
```

Use the Neon serverless WebSocket driver (`@neondatabase/serverless` with
`drizzle-orm/neon-serverless`) so transactions remain available for domain
operations. See `docs/architecture/decisions/ADR-003-database-selection.md`.

Environment variables:

- `DATABASE_URL`: pooled connection string for application runtime queries.
- `DATABASE_URL_UNPOOLED`: optional direct connection string for Drizzle Kit migrations.
- `JWT_SECRET`: server-only authentication secret, minimum 32 characters.
- `AUTH_SESSION_TTL_SECONDS`: optional absolute session lifetime, defaulting to seven days.
- `NEXT_PUBLIC_APP_URL`: public application URL.
- `TEST_DATABASE_URL`: optional isolated database for integration tests; tests map it to `DATABASE_URL`.

Environment variables are validated on the server by
`src/shared/config/env.ts`.

Keep the database client server-only.

Never import database connection code into Client Components.

## Schema Ownership

Each module owns its domain schema.

Example:

```text
src/modules/
├── auth/db/
│   └── schema.ts
├── workspaces/db/
│   └── schema.ts
├── projects/db/
│   └── schema.ts
└── tasks/db/
    └── schema.ts
```

The shared database configuration can discover and combine these schema definitions through Drizzle configuration.

Avoid a single enormous schema file that mixes unrelated business domains.

## Core Entities

The current Drizzle schemas and version-controlled migrations are authoritative.
This section summarizes the primary domain entities.

### Users

Represents application accounts.

Implemented fields:

- `id`: UUID primary key.
- `name`: display name.
- `email`: normalized, case-insensitive application email with a unique index.
- `passwordHash`: bcrypt hash with cost factor 12.
- `status`: `ACTIVE` or `DISABLED`.
- `createdAt`, `updatedAt`: timezone-aware timestamps.

### Sessions

Represents persistent authenticated sessions.

Implemented fields:

- `id`: UUID primary key, also used as the JWT `sid` claim.
- `userId`: foreign key to `users`, cascading on user deletion.
- `expiresAt`: absolute expiration, aligned with the JWT expiration.
- `revokedAt`: nullable revocation timestamp.
- `createdAt`: timezone-aware timestamp.

The database stores only the session identifier, never the raw JWT. Session
rows are indexed by user and expiration. See
`docs/architecture/decisions/ADR-006-custom-jwt-sessions.md`.

### Auth Login Attempts

Stores shared rate-limit state for serverless deployments.

- `key`: HMAC-SHA256 identifier for a normalized email or client IP.
- `failedCount`: failures in the current window.
- `windowStartedAt`: start of the current fixed window.
- `blockedUntil`: nullable active lockout expiration.
- `updatedAt`: last update timestamp.

### Workspaces

Represents an organizational workspace. Implemented in Phase 3.

Fields:

- `id`: UUID primary key.
- `name`: workspace display name.
- `slug`: unique URL-safe slug generated from the name.
- `ownerId`: foreign key to `users`, cascading on user deletion.
- `createdAt`, `updatedAt`: timezone-aware timestamps.

### Workspace Members

Represents membership within a workspace. Implemented in Phase 3.

Fields:

- `id`: UUID primary key.
- `workspaceId`: foreign key to `workspaces`, cascading on workspace deletion.
- `userId`: foreign key to `users`, cascading on user deletion.
- `role`: `OWNER`, `ADMIN`, or `MEMBER`.
- `joinedAt`: timezone-aware timestamp.

Membership is unique per workspace and user. The workspace owner also has an
`OWNER` membership row.

### Projects

Represents projects inside workspaces. Implemented in Phase 3.

Fields:

- `id`: UUID primary key.
- `workspaceId`: foreign key to `workspaces`, cascading on workspace deletion.
- `name`: project name, unique within a workspace.
- `description`: optional project description.
- `status`: `ACTIVE` or `ARCHIVED`.
- `createdBy`: foreign key to `users`, cascading on user deletion.
- `createdAt`, `updatedAt`: timezone-aware timestamps.

Projects must belong to a valid workspace.

### Tasks

Represents actionable work within projects. Implemented in Phase 4.

Fields:

- `id`: UUID primary key.
- `projectId`: foreign key to `projects`, cascading on project deletion.
- `parentTaskId`: optional self-reference for one-level subtasks.
- `milestoneId`: optional project milestone association.
- `title`: task title.
- `description`: optional task description.
- `status`: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, or `DONE`.
- `priority`: `LOW`, `MEDIUM`, `HIGH`, or `URGENT`.
- `assigneeId`: nullable foreign key to `users`, set null on user deletion.
- `dueDate`: optional timezone-aware due date.
- `createdBy`: foreign key to `users`, cascading on user deletion.
- `createdAt`, `updatedAt`: timezone-aware timestamps.

Tasks must belong to valid projects. Assignments must respect workspace
membership and permissions.

Task comments, activity records, and size-limited PostgreSQL-backed attachments
support task collaboration. Attachment downloads require task access.

### Project Members & Milestones

Projects can have allocated workspace members and dated milestones. Project
team changes are restricted to project managers/creators. Milestone progress
is derived from linked tasks; project progress is derived from top-level tasks.

### Notifications

Notifications are persisted for an individual user and support a read timestamp
and in-app destination. Access is scoped to the owning user.

## Relationships

Conceptually:

```text
USER
 |
 +------ WORKSPACE_MEMBERS
 |               |
 |               v
 |           WORKSPACE
 |               |
 |               v
 |             PROJECT
 |               |
 |               v
 |              TASK
 |
 +------ SESSION
 |
 +------ NOTIFICATION
```

Projects are owned by workspaces.

Tasks are owned by projects.

Workspace membership controls access to workspace resources.

---

# 9. Database Integrity and Performance

## Constraints

Use appropriate:

- Primary keys.
- Foreign keys.
- Unique constraints.
- Check constraints.
- Not-null constraints.
- Indexes.

Important business invariants should be enforced at the database level where possible.

## Transactions

Use transactions when multiple related database operations must succeed or fail together.

Examples:

- Creating related records.
- Updating related domain state.
- Performing multi-record membership changes.

Do not use transactions unnecessarily for unrelated reads.

## Indexing

Create indexes based on actual query patterns.

Potential candidates:

- User email.
- Session user ID.
- Session expiration.
- Workspace owner.
- Workspace membership lookup.
- Project workspace ID.
- Task project ID.
- Task assignee ID.
- Task status.

These are candidates, not mandatory indexes. Evaluate query patterns and database constraints before creating them.

## Query Efficiency

Avoid:

- N+1 queries.
- Unnecessary repeated queries.
- Fetching unused columns.
- Unbounded data retrieval.
- Unnecessary full-table scans.

Use pagination for growing datasets.

Review query performance before introducing advanced optimization.

## Migrations

Use Drizzle Kit for migration generation and management.

Rules:

1. Review generated SQL.
2. Preserve migration history.
3. Avoid casually modifying applied production migrations.
4. Never run destructive migrations without explicit authorization.
5. Verify schema changes in the intended environment.
6. Keep database schema and TypeScript types synchronized.

---

# 10. Authentication Architecture

## Authentication Strategy

SynapseHQ implements custom authentication without an external identity
provider. See `docs/architecture/decisions/ADR-006-custom-jwt-sessions.md`.

| Technology        | Responsibility                                   |
| ----------------- | ------------------------------------------------ |
| bcryptjs          | Password hashing and verification                |
| jose              | JWT creation and verification                    |
| Zod               | Input validation                                 |
| HTTP-only cookies | Secure token transport                           |
| PostgreSQL        | Persistent users, sessions, and login throttling |

Passwords are hashed with bcrypt at cost factor 12 and limited to 8–72 UTF-8
bytes. Email addresses are trimmed and lowercased before validation, lookup,
and persistence.

## Authentication Flow

### Registration

```text
Signup Form
    |
    v
Server Action
    |
    v
Zod Validation
    |
    v
Email Uniqueness Check
    |
    v
Password Hashing
    |
    v
Create User
    |
    v
Redirect to Login
```

Registration does not create an authenticated session automatically.

### Login

```text
Login Form
    |
    v
Server Action
    |
    v
Zod Validation
    |
    v
Email and IP Throttle Check
    |
    v
Find User
    |
    v
Verify Password
    |
    v
Create Session Row
    |
    v
Issue JWT
    |
    v
Set HTTP-only Cookie
    |
    v
Authenticated User
```

### Logout

```text
Logout Request
    |
    v
Verify JWT
    |
    v
Revoke Session Row
    |
    v
Clear Cookie
    |
    v
Unauthenticated User
```

## JWT Requirements

Session tokens use HS256 with `JWT_SECRET`.

Required claims:

- `sub`: user ID.
- `sid`: persistent session ID.
- `iss`: `synapsehq`.
- `aud`: `synapsehq-web`.
- `iat`: issue time.
- `exp`: absolute expiration.

Verification checks the signature, algorithm, issuer, audience, expiration,
claim types, session row, revocation state, and user status. A decoded JWT is
never trusted without verification.

## Cookie Security

The `synapse_session` cookie uses:

- HTTP-only.
- Secure in production.
- `SameSite=Lax`.
- `Path=/`.
- An explicit expiration matching the session.

Next.js Server Actions retain their built-in origin checks and the cookie policy
provides additional CSRF mitigation.

## Session Management

Sessions have an absolute lifetime of seven days by default, configured through
`AUTH_SESSION_TTL_SECONDS`. The lifetime is not extended on use.

The application supports:

- Session expiration.
- Immediate session revocation.
- Logout.
- Session verification against PostgreSQL.
- Disabled-account rejection.
- Multiple concurrent sessions.

JWT validity alone is not proof that a session remains active. Every protected
page and sensitive server operation must resolve the persistent session.

## Route Protection

`proxy.ts` performs optimistic navigation checks for protected route prefixes.
It may redirect unauthenticated navigation, but it is not an authorization
boundary.

The protected dashboard layout calls `requireUser()`, which verifies the JWT and
the persistent session before rendering. Server Actions must use the same guard
before sensitive operations. `proxy.ts` protects `/dashboard`, `/workspaces`,
`/projects`, and `/tasks` as an optimistic navigation guard only.
Resource-level authorization for workspaces and projects is implemented in
Phase 3.

## Login Throttling

Login throttling is database-backed so it works across serverless instances.
Failed attempts are tracked separately by HMAC-SHA256 hashes of the normalized
email and the client IP. Five failures within fifteen minutes trigger a
fifteen-minute block. Successful login clears both identifiers.

## Authorization

Authentication answers:

"Who is the current user?"

Authorization answers:

"What is this user allowed to do?"

These remain separate responsibilities.

Authentication guards establish identity and validate persistent sessions.
Workspace, project, and task services enforce resource-level permissions close
to the corresponding data operations. Server Actions and page visibility are
not substitutes for these service-level checks.

---

# 11. Authorization and Permission Model

Use explicit workspace and resource permissions.

The implemented workspace role model is:

- `OWNER`: full workspace control, member management, and all project operations.
- `ADMIN`: workspace updates, member management, and all project operations.
- `MEMBER`: workspace and project read access, plus project creation.
- Project creators can update or archive their own projects.
- Task permissions are checked against the member's role, task creator, and
  assignee relationship.

Centralized authorization policies live in
`src/modules/workspaces/lib/permissions.ts` and are reused by the projects
module. Verify authorization in Server Actions and services, close to database
operations. Never use client-side visibility as a substitute for server-side
authorization.

Example conceptual operation:

```text
User
 |
 v
Resolve Workspace Membership
 |
 v
Check Required Permission
 |
 +------ Authorized ------> Execute Operation
 |
 +------ Denied ----------> Reject Operation
```

Verify authorization as close as practical to sensitive data operations.

Never use client-side visibility as a substitute for server-side authorization.

---

# 12. Frontend Architecture

## Server Components by Default

Use React Server Components for:

- Initial data fetching.
- Static or server-rendered content.
- Page composition.
- Server-side access to application services.

Use Client Components when browser-side interaction is necessary.

Examples:

- Interactive dropdowns.
- Modals.
- Drag-and-drop.
- Local interactive state.
- Browser APIs.
- Optimistic updates.

Do not add `'use client'` to entire page trees unnecessarily.

## Component Organization

### Route Components

Located in `app/`.

Responsibilities:

- Route composition.
- Layout composition.
- Loading and error boundaries.
- Connecting route parameters to feature functionality.

### Feature Components

Located in their respective domain modules.

Examples:

```text
src/modules/projects/components/
├── project-card.tsx
├── project-grid.tsx
├── project-form.tsx
└── project-dialog.tsx
```

### Shared Components

Located in:

```text
src/shared/components/
```

Examples:

- Button.
- Input.
- Modal.
- Dialog.
- Dropdown.
- Badge.
- Avatar.
- Table.
- Tooltip.
- Skeleton.

Only place components here when they are genuinely reusable across domains.

---

# 13. State Management and Data Fetching

Use the simplest state management approach that satisfies the requirement.

## State Strategy

| Requirement             | Preferred Approach                            |
| ----------------------- | --------------------------------------------- |
| Initial server data     | Server Components                             |
| Local UI state          | React useState                                |
| Complex local state     | useReducer where appropriate                  |
| Shareable filters       | URL search parameters                         |
| Server mutations        | Server Actions where appropriate              |
| Optimistic interactions | useOptimistic or an appropriate React pattern |

Do not introduce a global state library without a genuine requirement.

Avoid duplicating server data in client state unnecessarily.

## Optimistic Updates

Optimistic updates are appropriate for interactions such as:

- Task status changes.
- Kanban movement.
- Simple UI mutations.

Requirements:

1. Validate input server-side.
2. Perform the optimistic update.
3. Handle server failure.
4. Roll back or reconcile failed changes.
5. Keep the server as the source of truth.

Never assume an optimistic update means the database mutation succeeded.

---

# 14. Design System — Professional SaaS UI

## Visual Direction

The visual language should be restrained, professional, and functional.

Design references:

- Linear.
- Vercel.
- Stripe.

Use them as inspiration for visual quality, not as templates to copy.

Avoid generic AI-generated dashboard aesthetics.

## Color System

Use a monochromatic foundation:

- Zinc.
- Slate.

Use one intentional accent color.

Recommended starting direction:

```text
Light:
Background: zinc-50
Surface: white
Border: zinc-200
Primary text: zinc-950
Secondary text: zinc-500

Dark:
Background: zinc-950
Surface: zinc-900
Border: zinc-800
Primary text: zinc-50
Secondary text: zinc-400
```

These are design recommendations, not finalized theme tokens.

## Surface Design

Prefer crisp borders:

```tsx
border border-zinc-200 dark:border-zinc-800
```

Use restrained shadows only when elevation is meaningful.

Avoid excessive:

- Glowing effects.
- Blurred shadows.
- Gradient backgrounds.
- Decorative card effects.
- Competing accent colors.

## Typography

Use:

- `tracking-tight` for headings.
- `font-medium` for labels.
- `font-normal` for body text.
- `tabular-nums` for numeric data.
- Consistent font sizes and hierarchy.

Use readable line heights and deliberate spacing.

## Data-Dense UI

Tables and dashboards should prioritize readability.

Use tabular numerals for:

- Counts.
- Dates.
- Metrics.
- Durations.
- Quantitative values.

Use clear alignment and consistent column spacing.

## Responsive Design

Support:

- Mobile.
- Tablet.
- Desktop.
- Widescreen.

For complex tables:

```tsx
<div className="overflow-x-auto">{/* Responsive data table */}</div>
```

For responsive grids:

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Grid content */}
</div>
```

For Kanban boards, use appropriate horizontal scrolling or a responsive alternative.

Do not force a desktop table into a narrow mobile viewport.

## Accessibility

Follow:

- Semantic HTML.
- Keyboard accessibility.
- Visible focus states.
- Accessible form labels.
- Sufficient color contrast.
- Appropriate ARIA attributes.
- Screen-reader-friendly feedback.
- Accessible modal behavior.

Accessibility is a core requirement, not a final cosmetic improvement.

---

# 15. Performance and Caching Architecture

## Performance Priorities

Frontend:

- Minimize unnecessary Client Components.
- Avoid unnecessary re-renders.
- Optimize image loading.
- Optimize font loading.
- Monitor JavaScript bundle size.
- Avoid unnecessary dependencies.

Backend:

- Optimize database queries.
- Use pagination.
- Prevent N+1 queries.
- Use appropriate indexes.
- Avoid unnecessary database round trips.

## Next.js Caching

The existing application enables:

- `cacheComponents`.
- `partialPrefetching`.

`cacheComponents` enables Partial Prerendering and the `use cache` directive.
`partialPrefetching` requires `cacheComponents` and limits prefetching to static
route content. Both remain enabled in Phase 1.

Caching policy:

- Do not use `use cache` for data that depends on the authenticated user,
  workspace membership, or resource permissions.
- Keep authenticated reads dynamic through `cookies()` and server-side
  authorization.
- If a cached function is introduced later, include every isolation dimension
  in its cache key or tags, and invalidate it after mutations.
- Do not cache error, loading, or authentication responses.

## Cache Safety

User-specific data must never be shared across users through an incorrectly configured cache.

Before caching any data, establish:

1. Whether the data is public or private.
2. Whether it depends on the authenticated user.
3. Whether it depends on workspace membership.
4. How invalidation will work.
5. How stale data will be handled.

Use deliberate cache invalidation after mutations.

Do not cache everything by default.

---

# 16. Error Handling and Logging

Create a consistent application error strategy.

Distinguish:

- Validation failures.
- Authentication failures.
- Authorization failures.
- Missing resources.
- Business rule violations.
- Database failures.
- Unexpected system failures.

Use predictable error codes.

Do not expose:

- Database connection strings.
- JWT secrets.
- Password hashes.
- Stack traces.
- Internal infrastructure details.

Log meaningful server-side failures.

Avoid logging sensitive user information or authentication tokens.

Provide users with understandable error messages.

---

# 17. Testing Architecture

Vitest and Playwright are configured for unit, integration, and browser tests.
React Testing Library is installed and used by component tests.

Testing stack:

| Tool                  | Purpose                    |
| --------------------- | -------------------------- |
| Vitest                | Unit and integration tests |
| React Testing Library | Component testing          |
| Playwright            | Browser end-to-end testing |

## Unit Testing

Prioritize:

- Validation schemas.
- Domain services.
- Permission functions.
- Business rules.
- Utility functions.

## Integration Testing

Prioritize:

- Database operations.
- Authentication services.
- Session management.
- Project CRUD.
- Task CRUD.
- Workspace permissions.

## End-to-End Testing

Test important user workflows:

1. User registration.
2. User login.
3. Protected dashboard access.
4. Workspace creation.
5. Project creation.
6. Task creation.
7. Task status updates.
8. Unauthorized access handling.
9. Logout.

## Test Isolation

Use an appropriate test database or isolated test environment.

Never run destructive test operations against production data.

Test failure cases as well as successful cases.

---

# 18. Deployment Architecture

## Target Deployment

Application hosting:

**Vercel**

Database:

**Neon PostgreSQL**

## Environment Separation

Maintain separate configuration for:

- Local development.
- Automated testing.
- Production.

Do not reuse production credentials in local development or automated tests.

## Deployment Requirements

- Configure environment variables.
- Configure production database connection.
- Apply reviewed migrations.
- Verify production build.
- Verify secure cookie behavior.
- Verify authentication.
- Verify critical database operations.
- Verify production URL.
- Perform smoke testing.

Never assume a successful build guarantees a successful production deployment.

---

# 19. Architectural Decision Records

For significant architectural decisions, maintain Architecture Decision Records.

Location:

```text
docs/architecture/decisions/
```

Naming:

```text
ADR-001-modular-monolith.md
ADR-002-custom-authentication.md
ADR-003-database-selection.md
ADR-004-session-management.md
ADR-005-module-boundaries.md
```

## ADR Template

```markdown
# ADR-XXX: Decision Title

## Status

Proposed / Accepted / Superseded

## Context

What problem are we solving?

## Decision

What approach are we choosing?

## Alternatives

What other approaches were considered?

## Trade-offs

What are the benefits and disadvantages?

## Consequences

What changes will this decision introduce?
```

Create ADRs when a decision has meaningful long-term architectural consequences.

Do not create an ADR for every small implementation detail.

---

# 20. Architecture Evolution Rules

The architecture must evolve with actual application requirements.

When proposing a major change:

1. Identify the existing limitation.
2. Explain why the current architecture is insufficient.
3. Identify alternatives.
4. Evaluate complexity and trade-offs.
5. Consider migration requirements.
6. Consider data integrity.
7. Consider security.
8. Document the decision.
9. Update affected architecture documentation.

Do not introduce technologies or architectural patterns merely because they are popular.

Avoid premature microservices, event-driven infrastructure, distributed caching, and unnecessary abstraction layers.

Keep the system simple until real requirements justify additional complexity.

---

# 21. Final Architectural Principles

SynapseHQ must remain:

- Modular but not fragmented.
- Scalable but not prematurely distributed.
- Secure by design.
- Database-consistent.
- Testable.
- Maintainable.
- Responsive.
- Accessible.
- Performance-conscious.
- Production-oriented.

**Final Principle:**

Build a strong modular monolith first. Maintain strict domain boundaries, explicit ownership, secure data access, and clear application flows.

The objective is not to build the most complicated architecture. It is to build the simplest architecture that can reliably support SynapseHQ's current and reasonably anticipated requirements.
