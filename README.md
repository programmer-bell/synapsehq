# SynapseHQ — Engineering Task & Velocity Workspace

![SynapseHQ logo](./public/logo.png)

**A modular project management workspace for software engineering teams.**

SynapseHQ helps engineering teams organize workspaces and projects, manage tasks and milestones, coordinate team allocations, and track progress through a structured, data-dense interface.

The project is designed around a **Modular Monolith architecture**, with clearly defined domain boundaries, strict TypeScript practices, server-driven business logic, and custom authentication.

> **Project status:** The application is deployed to Vercel from `main`; the project owner has confirmed the live application works. CI, database-backed tests, and authenticated browser workflows are configured.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Authentication & Security](#authentication--security)
- [Database Design](#database-design)
- [Development Roadmap](#development-roadmap)
- [Getting Started](#getting-started)
- [Development Commands](#development-commands)
- [Engineering Principles](#engineering-principles)
- [Deployment](#deployment)
- [Future Work](#future-work)

---

## Project Overview

Engineering teams need more than a simple task list. They need a centralized workspace for projects, team responsibilities, development progress, and project documentation.

SynapseHQ provides that environment as a server-first Next.js application.

The application centers on three product workflows, complemented by
repository-managed project documentation:

- **Workspace Management:** Organize engineering teams and their projects.
- **Project Management:** Track project progress, milestones, and team allocation.
- **Task Management:** Manage development tasks through Kanban boards and structured data tables.
- **Project documentation:** Repository-managed Markdown for SynapseHQ's project context and architecture. This is not an in-app document editor or storage feature.

The application follows a server-first approach using Next.js App Router, Server Components, Server Actions, and a PostgreSQL database.

---

## Core Features

The repository currently implements the following product capabilities.

### 1. Custom Authentication

A custom authentication system built without relying on a heavy third-party authentication SDK.

Implemented capabilities:

- User registration and login.
- Secure bcrypt password hashing.
- JWT-based authentication with persistent session records.
- HTTP-only cookie-based sessions with immediate revocation.
- Logout and session lifecycle management.
- Protected application routes.
- Database-backed login throttling.
- Role-based, resource-level authorization for workspace, project, and task operations.

Technologies: `jose`, `bcryptjs`, and secure cookies.

### 2. Workspace & Project Management

Organize engineering work into dedicated workspaces and projects.

Implemented capabilities:

- Create and manage workspaces.
- Add and manage workspace members.
- Assign workspace roles.
- Create and update projects.
- Track project creators and manage project lifecycle.
- Control project access based on workspace membership.

Workspaces provide owner/admin/member roles. Projects inherit workspace access;
project creators can manage their own projects.

### 3. Hybrid Task Management

A task management experience designed for both visual workflows and structured data management.

Implemented capabilities include database-backed task creation, assignment to
workspace members, status and priority updates, due dates, filtering, sorting,
pagination, and access checks.

**Kanban Board**

- Organize tasks by status.
- Update task status across workflow columns.
- Track task assignments and priorities.
- View task progress within a project.

**Data Table**

- Display tasks in a structured table.
- Filter and sort task records.
- Search by relevant task information.
- Manage task assignments and status transitions.

### 4. Task Details & Collaboration

Task detail pages support a focused workflow for coordinating implementation.

Implemented capabilities:

- Create one-level subtasks and associate tasks with project milestones.
- Add comments and review task activity history.
- Upload and download authorized task attachments (up to 3 MB; selected MIME
  types only), stored in PostgreSQL.
- Validate project/workspace access before task collaboration operations.

### 5. Milestone & Progress Tracking

Provide project-level visibility into engineering progress.

Implemented capabilities:

- Define project milestones.
- Associate tasks with project goals.
- Monitor milestone completion.
- Display project and milestone completion progress.

### 6. Team Allocation

Give project managers and team members visibility into responsibilities.

Workspace membership and task assignment are implemented, along with project
team allocation:

- Allocate workspace members to projects with an allocation percentage.
- View project team membership and allocation values.
- Enforce manager/creator permissions for allocation changes.

### 7. In-App Notifications

Notifications provide an in-product record of relevant task and project events.

Implemented capabilities:

- Notify users of task assignments, status changes, comments, milestone creation,
  and project team changes.
- View and mark notifications as read from the application header.
- Restrict notification access to the owning user.

Notifications are in-app only; email and push delivery are not implemented.

### 8. Project Documentation

Repository-managed project documentation is available in
[`docs/projects/synapsehq/`](./docs/projects/synapsehq/README.md). Users cannot
create or edit Markdown documents inside the application.

---

## Technology Stack

The project uses the following installed stack.

| Layer             | Technology      | Purpose                        |
| ----------------- | --------------- | ------------------------------ |
| Framework         | Next.js 16+     | Full-stack React application   |
| UI Library        | React 19        | Component-based interface      |
| Language          | TypeScript      | Strict type safety             |
| Styling           | Tailwind CSS v4 | Utility-first styling          |
| Theme             | next-themes     | Class-based light/dark mode    |
| Database          | Neon PostgreSQL | Serverless relational database |
| ORM               | Drizzle ORM     | Type-safe database queries     |
| Validation        | Zod             | Input and schema validation    |
| Authentication    | jose            | JWT creation and verification  |
| Password Security | bcryptjs        | Password hashing               |
| Container         | Docker          | Production application image   |
| Database Hosting  | Neon            | PostgreSQL hosting             |

**Testing:** Vitest covers unit and database integration tests, React Testing
Library covers component behavior, and Playwright covers browser smoke and
authenticated workflows. Database-backed tests and authenticated E2E require
an isolated `TEST_DATABASE_URL`.

---

## Architecture

### Modular Monolith

SynapseHQ follows a Modular Monolith architecture.

The application runs as one deployable application while organizing business
logic into independent domain modules.

This approach provides:

- Clear separation of responsibilities.
- Explicit domain boundaries.
- Easier maintenance and testing.
- Reduced coupling between features.
- A practical foundation for future scaling.

The project does not require microservices or distributed infrastructure at its initial stage.

### Domain Modules

| Module        | Responsibility                                     |
| ------------- | -------------------------------------------------- |
| Auth          | Registration, login, sessions, and authorization   |
| Workspaces    | Workspace creation, membership, roles, and access  |
| Projects      | Project lifecycle, milestones, and team allocation |
| Tasks         | Task workflows, assignment, and collaboration      |
| Notifications | In-app notifications and read state                |

Each module owns its domain-specific schemas, actions, services, repositories,
and components where appropriate. Shared database, environment, layout, and
utility infrastructure lives in `src/shared/`.

### Request & Data Flow

The intended server-side request flow is:

```text
User Interaction
       |
       v
Server Action / Route Handler
       |
       v
Input Validation (Zod)
       |
       v
Authentication
       |
       v
Authorization
       |
       v
Domain Service
       |
       v
Repository (when useful)
       |
       v
Drizzle ORM
       |
       v
Neon PostgreSQL
```

Server Actions should remain thin entry points. Business rules belong in domain services, while database access should remain behind appropriate data-access boundaries.

---

## Repository Structure

The following is a condensed view of the current tracked repository:

```text
SynapseHQ/
│
├── .agents/
│   ├── AGENTS.md
│   ├── ARCHITECTURE.md
│   └── roadmap.md
│
├── app/                        # Root-level Next.js App Router
│   ├── (auth)/                 # Login and signup
│   ├── (dashboard)/            # Dashboard, workspaces, projects, tasks, milestones
│   ├── api/                    # Authentication and task attachment endpoints
│   ├── error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── page.tsx
│
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── actions/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── schemas/
│   │   │   ├── db/
│   │   │   └── index.ts
│   │   │
│   │   ├── workspaces/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── notifications/
│   │
│   ├── shared/
│       ├── components/
│       │   └── layout/
│       ├── config/
│       ├── db/
│       ├── lib/
│   └── test/                   # Vitest setup and test-only support
│
├── components/
│   ├── layout/                 # Application shell and theme providers
│   └── ui/                     # Shared UI primitives
├── drizzle/
│
├── docs/
│   ├── architecture/decisions/ # Architecture decision records
│   └── projects/synapsehq/     # Project-scoped repository documentation
│
├── e2e/                        # Playwright tests
├── public/
│
├── .github/workflows/          # GitHub Actions CI/CD
├── Dockerfile
├── docker-compose.yml
├── README.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── vitest.config.mts
├── playwright.config.ts
├── proxy.ts
└── .env.sample
```

The Next.js App Router is at the repository root (`app/`, not `src/app/`).
Domain code is organized under `src/modules/`; cross-cutting infrastructure
lives under `src/shared/`.

### Main Application Routes

| Route                                       | Purpose                          |
| ------------------------------------------- | -------------------------------- |
| `/`                                         | Public landing page              |
| `/signup`, `/login`                         | Account registration and sign-in |
| `/dashboard`                                | Authenticated dashboard          |
| `/workspaces`, `/workspaces/[workspaceId]`  | Workspace list and details       |
| `/projects/[projectId]`                     | Project overview and team        |
| `/projects/[projectId]/tasks`               | Project task board and table     |
| `/projects/[projectId]/tasks/[taskId]`      | Task details and collaboration   |
| `/projects/[projectId]/tasks/[taskId]/edit` | Task editing                     |
| `/projects/[projectId]/milestones`          | Project milestones and progress  |

---

## Authentication & Security

SynapseHQ implements custom authentication using:

- **bcryptjs:** Password hashing and verification at cost factor 12.
- **jose:** HS256 JWT signing and verification.
- **HTTP-only cookies:** Secure `synapse_session` token transport.
- **Persistent sessions:** Every JWT is backed by a revocable PostgreSQL session row.
- **Server-side authorization:** Authentication guards protect routes and sensitive actions.

Security measures include:

- Passwords are never stored in plaintext and are limited to 8–72 UTF-8 bytes.
- All authentication input is validated with Zod.
- Authentication secrets stay server-side.
- Cookies use HTTP-only, Secure in production, SameSite=Lax, and an explicit expiration.
- JWT signature, issuer, audience, expiration, claims, session state, and account status are verified.
- Logout revokes the persistent session immediately.
- Login throttling uses hashed email and IP identifiers in PostgreSQL.
- Server Actions rely on Next.js origin checks and SameSite cookies for CSRF mitigation.

`proxy.ts` performs optimistic navigation redirects only. The dashboard layout
and server-side session guards validate the JWT and persistent session against
the database. Proxy checks are never the only security boundary.

---

## Database Design

Neon PostgreSQL is the primary relational database, with Drizzle ORM providing type-safe database access.

### Implemented Core Entities

| Entity                               | Purpose                                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| Users, sessions, login attempts      | Accounts, revocable sessions, and login throttling                                       |
| Workspaces, workspace members        | Workspace ownership, membership, and roles                                               |
| Projects, project members            | Project records and team allocation                                                      |
| Milestones                           | Project delivery goals and due dates                                                     |
| Tasks                                | Project tasks, one-level subtasks, status, priority, assignee, and milestone association |
| Task comments, activity, attachments | Task collaboration and audit history                                                     |
| Notifications                        | Per-user in-app notifications and read state                                             |

### Relationships

- Sessions belong to users and cascade on user deletion.
- A user can have multiple active sessions.
- Login attempts are keyed by hashed email or IP identifiers.
- Users can belong to multiple workspaces.
- Workspaces contain projects, and projects contain tasks.

Schema changes are managed through version-controlled Drizzle migrations.

---

## Development Roadmap

Development will follow the phases defined in [`roadmap.md`](./.agents/roadmap.md).

| Phase   | Status      | Focus                     | Main Deliverables                                             |
| ------- | ----------- | ------------------------- | ------------------------------------------------------------- |
| Phase 1 | Complete    | Foundation & Architecture | Project structure, database foundation, development standards |
| Phase 2 | Implemented | Custom Authentication     | Registration, login, sessions, route protection               |
| Phase 3 | Implemented | Workspaces & Projects     | Workspace membership and project management                   |
| Phase 4 | Implemented | Task Management           | Kanban, table views, filtering, and sorting                   |
| Phase 5 | Complete    | Polish & Deployment       | Hardening, verification, and production deployment            |
| Phase 6 | In progress | DevOps & Security         | Containerization, CI/CD, and security hardening               |

Each phase has its own implementation tasks and completion criteria.

A feature should only be marked complete after its implementation and relevant verification are finished.

---

## Getting Started

### Prerequisites

Before starting development, install:

- Node.js (compatible with the project's Next.js version).
- npm.
- Git.

A Neon PostgreSQL database is required for local development. Vercel hosts the
production application.

### 1. Clone the Repository

```bash
git clone https://github.com/programmer-bell/synapsehq.git
cd synapsehq
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the sample environment file:

```bash
cp .env.sample .env
```

On Windows Command Prompt:

```cmd
copy .env.sample .env
```

The sample configuration contains templates for:

```env
DATABASE_URL=
DATABASE_URL_UNPOOLED=
JWT_SECRET=
AUTH_SESSION_TTL_SECONDS=604800
NEXT_PUBLIC_APP_URL=http://localhost:3000
TEST_DATABASE_URL=
POSTGRES_DB=synapsehq
POSTGRES_USER=synapsehq
POSTGRES_PASSWORD=
```

| Variable                                            | Required     | Purpose                                                                  |
| --------------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| `DATABASE_URL`                                      | Yes          | PostgreSQL connection for application runtime                            |
| `JWT_SECRET`                                        | Yes          | Server-only signing and auth identifier secret; at least 32 characters   |
| `NEXT_PUBLIC_APP_URL`                               | Yes          | Canonical application URL                                                |
| `DATABASE_URL_UNPOOLED`                             | No           | Direct connection preferred by Drizzle Kit; falls back to `DATABASE_URL` |
| `AUTH_SESSION_TTL_SECONDS`                          | No           | Session lifetime; defaults to 604800 seconds (7 days)                    |
| `TEST_DATABASE_URL`                                 | No           | Isolated database for integration and authenticated E2E tests            |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Compose only | Local Docker PostgreSQL configuration                                    |

Keep `.env` private and never use the production database as a test database.
Runtime environment values are validated on the server.

### 4. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Development Commands

| Command                | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `npm install`          | Install project dependencies                            |
| `npm run dev`          | Start the Next.js development server                    |
| `npm run lint`         | Run ESLint                                              |
| `npm run format:check` | Check Prettier formatting                               |
| `npm run typecheck`    | Run TypeScript type checking                            |
| `npm test`             | Run unit tests and DB integration tests when configured |
| `npm run test:e2e`     | Run Playwright browser smoke tests                      |
| `npm run build`        | Create a production build                               |
| `npm run db:generate`  | Generate Drizzle migrations                             |
| `npm run db:migrate`   | Apply Drizzle migrations                                |
| `npm run db:check`     | Check Drizzle migration consistency                     |
| `npm run db:studio`    | Open Drizzle Studio                                     |

Run linting, type checking, and tests after implementation changes. Run a production build when changes affect routing, configuration, or production rendering.

Vitest covers unit and integration tests, React Testing Library covers
component behavior, and Playwright covers browser smoke and authenticated
workflows. GitHub Actions runs lint, formatting, type checking, tests, a
production build, and E2E checks. Database-backed integration tests and the
authenticated E2E workflow require `TEST_DATABASE_URL`; those cases are skipped
when it is not configured.

### Optional Docker Workflow

Build the production image:

```bash
docker build --target production -t synapsehq:local .
```

Run the application and a local PostgreSQL instance:

```bash
docker compose up --build
```

Set `POSTGRES_PASSWORD` and `JWT_SECRET` in `.env` before starting Compose. The
Compose database is bound to loopback only and communicates with the application
over the `synapsehq_net` network. Apply migrations against the Compose database
before using the application:

```bash
DATABASE_URL="postgresql://synapsehq:<password>@localhost:5432/synapsehq?sslmode=disable" npm run db:migrate
```

Docker image publishing is disabled by default and can be enabled in GitHub
Actions with the `ENABLE_CONTAINER_PUBLISH=true` repository variable. The
optional GitHub deploy-hook job additionally requires
`ENABLE_PRODUCTION_DEPLOY=true`, production migration and deploy-hook secrets,
and the image publishing job. These optional jobs are separate from the Vercel
Git integration used for the normal production release.

### Database Integration Tests and Authenticated E2E

Database integration tests and the authenticated browser workflow require an
isolated `TEST_DATABASE_URL`. Point it to a dedicated Neon branch or database,
apply migrations to that database, then run:

```bash
export TEST_DATABASE_URL="postgresql://..."
export DATABASE_URL="$TEST_DATABASE_URL"
export DATABASE_URL_UNPOOLED="$TEST_DATABASE_URL"
NODE_OPTIONS=--no-network-family-autoselection npm run db:migrate
npm test
npm run test:e2e
```

The test setup maps `TEST_DATABASE_URL` to `DATABASE_URL` for Vitest and E2E.
Keep both database variables pointed at the isolated test database when
applying migrations. CI applies test migrations and runs database-backed checks
only when the `TEST_DATABASE_URL` repository secret is configured.

### Neon Connectivity Troubleshooting

If Node.js 24 times out while connecting to Neon in a restricted network
environment, run database commands with:

```bash
NODE_OPTIONS=--no-network-family-autoselection npm run db:migrate
```

This was required for the Phase 1 smoke verification.

If the application reports PostgreSQL error `42P01` (`relation does not exist`),
the configured runtime database is missing a migration. Verify that
`DATABASE_URL` targets the intended application database, then apply its
pending migrations with `npm run db:migrate`. Do not point that command at the
development database when you intend to migrate production, or at
`TEST_DATABASE_URL` unless you are preparing the isolated test database.

Login throttling reads `auth_login_attempts`, created by the initial auth
migration. If login fails on a query to that table, apply pending migrations
using the same `DATABASE_URL` used by the running app, then retry the login.

---

## Deployment

The production application is hosted on Vercel. Vercel Git deployments are
restricted to `main` by [`vercel.json`](./vercel.json); Preview deployments are
disabled in this repository configuration. The project owner has confirmed the
live production application works.

Configure these values in Vercel's **Production** environment:

- `DATABASE_URL`: pooled Neon connection string for runtime use.
- `JWT_SECRET`: strong server-only secret, at least 32 characters.
- `NEXT_PUBLIC_APP_URL`: the deployed application's canonical HTTPS URL.

Apply database migrations separately using `DATABASE_URL_UNPOOLED` (direct
connection) or the intended database URL. Never run production migrations
against the test database. GitHub Actions' optional Docker image publishing and
deploy-hook jobs are disabled unless explicitly enabled; they are not required
for Vercel's Git-based production deployment.

---

## Engineering Principles

SynapseHQ is being developed with the following engineering principles:

**1. Modular by Design**

Keep domain responsibilities separate and avoid unnecessary coupling between modules.

**2. Strict Type Safety**

Use TypeScript strict mode and explicit types. Avoid unnecessary `any` usage and unsafe type assertions.

**3. Server-First Development**

Prefer React Server Components and server-side data access. Introduce Client Components when browser-side interaction requires them.

**4. Secure by Default**

Validate input, enforce authorization, protect authentication credentials, and keep secrets out of client-side code.

**5. Maintainable Database Design**

Use relational constraints, appropriate indexes, transactions, and controlled schema migrations.

**6. Incremental Implementation**

Build and verify one feature at a time. Avoid implementing future infrastructure before the application requires it.

**7. Testable Business Logic**

Keep business rules independent of UI components and introduce automated tests as the testing infrastructure is established.

---

## UI & Design Direction

The interface aims for a classic engineering-focused SaaS experience.

Design principles:

- Restrained zinc and slate monochrome palette.
- A maximum of one primary accent color.
- Crisp 1px borders and clear visual hierarchy.
- Compact, information-dense layouts.
- Tabular numerals for metrics and data tables.
- Tight typography and consistent spacing.
- Responsive dashboards, boards, and tables.
- Accessible controls and keyboard navigation.

The goal is to prioritize clarity, usability, and information density over unnecessary visual decoration.

---

## Future Work

These are not current application capabilities; they are potential future
extensions rather than release blockers:

- In-app Markdown document editing and storage (repository documentation exists, but this is not implemented in the product).
- Real-time task updates and external email/push notification delivery.
- Workspace invitations and more granular permission administration.
- Project analytics, velocity reporting, and sprint planning.

---

## Project Documentation

The repository maintains separate documents for product development and engineering decisions:

| Document                                                                   | Purpose                                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [`AGENTS.md`](./.agents/AGENTS.md)                                         | Repository-specific instructions and development rules              |
| [`roadmap.md`](./.agents/roadmap.md)                                       | Phased implementation roadmap and progress tracking                 |
| [`ARCHITECTURE.md`](./.agents/ARCHITECTURE.md)                             | Architectural boundaries, design decisions, and technical standards |
| [`docs/projects/synapsehq/README.md`](./docs/projects/synapsehq/README.md) | Project-scoped repository documentation                             |
| [`docs/architecture/decisions/`](./docs/architecture/decisions/)           | Accepted architecture decision records                              |
| [`README.md`](./README.md)                                                 | Project overview, actual structure, features, and setup             |

These documents should remain synchronized as the project evolves.

---

**SynapseHQ — Build better workflows. Track meaningful progress. Keep engineering teams aligned.**
