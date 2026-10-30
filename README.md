# SynapseHQ — Engineering Task & Velocity Workspace

**A modular project management workspace designed for software engineering teams.**

SynapseHQ is a full-stack workspace application concept focused on helping engineering teams organize projects, manage tasks, track milestones, and monitor team progress through a structured, data-dense interface.

The project is designed around a **Modular Monolith architecture**, with clearly defined domain boundaries, strict TypeScript practices, server-driven business logic, and custom authentication.

Its goal is to demonstrate practical full-stack engineering skills through a production-minded application rather than a basic CRUD tutorial.

> **Project status:** Phase 1 foundation complete. The repository now includes the modular directory foundation, Neon/Drizzle infrastructure, environment validation, and the application shell. Authentication, workspaces, projects, and tasks remain planned features.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Planned Project Structure](#planned-project-structure)
- [Authentication & Security](#authentication--security)
- [Database Design](#database-design)
- [Development Roadmap](#development-roadmap)
- [Getting Started](#getting-started)
- [Development Commands](#development-commands)
- [Environment Configuration](#environment-configuration)
- [Engineering Principles](#engineering-principles)
- [Future Improvements](#future-improvements)

---

## Project Overview

Engineering teams need more than a simple task list. They need a centralized workspace where projects, team responsibilities, development progress, and technical documentation can be managed together.

SynapseHQ aims to provide that environment.

The application is designed around four primary areas:

- **Workspace Management:** Organize engineering teams and their projects.
- **Project Management:** Track project progress, milestones, and team allocation.
- **Task Management:** Manage development tasks through Kanban boards and structured data tables.
- **Engineering Documentation:** Maintain project-related technical documentation using Markdown.

The application follows a server-first approach using Next.js App Router, Server Components, Server Actions, and a PostgreSQL database.

---

## Core Features

The following features represent the planned product scope.

### 1. Custom Authentication

A custom authentication system built without relying on a heavy third-party authentication SDK.

Planned capabilities:

- User registration and login.
- Secure password hashing.
- JWT-based authentication.
- HTTP-only cookie-based sessions.
- Logout and session lifecycle management.
- Protected application routes.
- Role-based and resource-level authorization.

Technologies: `jose`, `bcryptjs`, and secure cookies.

### 2. Workspace & Project Management

Organize engineering work into dedicated workspaces and projects.

Planned capabilities:

- Create and manage workspaces.
- Add and manage workspace members.
- Assign workspace roles.
- Create and update projects.
- Manage project ownership and membership.
- Control project access based on workspace membership.

### 3. Hybrid Task Management

A task management experience designed for both visual workflows and structured data management.

**Kanban Board**
- Organize tasks by status.
- Move tasks between workflow columns.
- Track task assignments and priorities.
- View task progress within a project.

**Data Table**
- Display tasks in a structured table.
- Filter and sort task records.
- Search by relevant task information.
- Manage task assignments and status transitions.

### 4. Milestone & Progress Tracking

Provide project-level visibility into engineering progress.

Planned capabilities:

- Define project milestones.
- Associate tasks with project goals.
- Monitor milestone completion.
- Display project progress indicators.
- Track project activity and development status.

### 5. Team Allocation

Give project managers and team members visibility into responsibilities.

Planned capabilities:

- View workspace members.
- Assign members to projects.
- Track task ownership.
- Display team allocation information.
- Provide visibility into individual responsibilities.

### 6. Engineering Documentation

A centralized documentation area for project-specific technical knowledge.

Planned capabilities:

- Create and edit project documentation.
- Write documentation using Markdown.
- Organize technical notes and project information.
- Maintain documentation within project boundaries.

---

## Technology Stack

The project targets a modern Next.js and TypeScript ecosystem.

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16+ | Full-stack React application |
| UI Library | React 19 | Component-based interface |
| Language | TypeScript | Strict type safety |
| Styling | Tailwind CSS v4 | Utility-first styling |
| Icons | Lucide React | Interface iconography |
| Database | Neon PostgreSQL | Serverless relational database |
| ORM | Drizzle ORM | Type-safe database queries |
| Validation | Zod | Input and schema validation |
| Authentication | jose | JWT creation and verification |
| Password Security | bcryptjs | Password hashing |
| Deployment | Vercel | Application hosting |
| Database Hosting | Neon | PostgreSQL hosting |

**Note:** The repository's installed dependencies are authoritative. Neon PostgreSQL, Drizzle ORM, Zod, and Vitest are installed as part of the Phase 1 foundation. `jose`, `bcryptjs`, Lucide React, React Testing Library, and Playwright remain planned for later phases.

---

## Architecture

### Modular Monolith

SynapseHQ follows a Modular Monolith architecture.

The application will run as one deployable application while organizing business logic into independent domain modules.

This approach provides:

- Clear separation of responsibilities.
- Explicit domain boundaries.
- Easier maintenance and testing.
- Reduced coupling between features.
- A practical foundation for future scaling.

The project does not require microservices or distributed infrastructure at its initial stage.

### Planned Domain Modules

| Module | Responsibility |
|---|---|
| Auth | Registration, login, sessions, and authorization |
| Workspaces | Workspace creation and membership |
| Projects | Project lifecycle and ownership |
| Tasks | Task creation, assignment, and workflow |
| Notifications | Future notification functionality |

Each module should own its domain-specific schemas, validation, services, and components where appropriate.

Shared infrastructure and genuinely reusable utilities belong in the shared layer.

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

## Planned Project Structure

The following is the target architectural layout, not the current repository tree. Directories and modules will be introduced incrementally as their implementation becomes necessary.

```text
SynapseHQ/
│
├── .agents/
│   ├── AGENTS.md
│   ├── ARCHITECTURE.md
│   └── roadmap.md
│
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
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
│   └── shared/
│       ├── components/
│       │   └── layout/
│       ├── config/
│       ├── db/
│       ├── hooks/
│       ├── lib/
│       ├── types/
│       ├── utils/
│       └── errors/
│
├── drizzle/
│
├── docs/
│   └── architecture/
│       └── decisions/
│
├── public/
│
├── README.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── vitest.config.mts
└── .env.sample
```

The Next.js App Router remains in the repository-root `app/` directory. The `src/` foundation was introduced in Phase 1; domain modules are added incrementally as their functionality is implemented.

---

## Authentication & Security

SynapseHQ plans to implement custom authentication using:

- **bcryptjs:** Password hashing and verification.
- **jose:** JWT signing and verification.
- **HTTP-only cookies:** Secure token storage.
- **Server-side authorization:** Resource-level access checks.

Security considerations include:

- Never store plaintext passwords.
- Validate all user-controlled input.
- Keep authentication secrets server-side.
- Configure secure cookie attributes.
- Validate JWT expiration and relevant claims.
- Consider session revocation and CSRF protection.
- Enforce authorization on the server, not just through frontend visibility or middleware.

Middleware will be treated as an early navigation guard, not as the only security boundary.

---

## Database Design

Neon PostgreSQL will serve as the primary relational database, with Drizzle ORM providing type-safe database access.

### Planned Core Entities

| Entity | Purpose |
|---|---|
| Users | User accounts and identity |
| Sessions | Authentication session records |
| Workspaces | Team workspaces |
| WorkspaceMembers | Workspace membership and roles |
| Projects | Projects belonging to workspaces |
| Tasks | Development tasks belonging to projects |
| Notifications | Future user notifications |

### Planned Relationships

- A user can belong to multiple workspaces.
- A workspace can have multiple members.
- A workspace can contain multiple projects.
- A project can contain multiple tasks.
- Tasks can be assigned to workspace members.
- Sessions belong to users.

Database constraints, foreign keys, indexes, and transactions will be introduced according to actual domain requirements.

Schema changes will be managed through version-controlled Drizzle migrations.

---

## Development Roadmap

Development will follow the phases defined in [`roadmap.md`](./.agents/roadmap.md).

| Phase | Status | Focus | Main Deliverables |
|---|---|---|---|
| Phase 1 | Complete | Foundation & Architecture | Project structure, database foundation, development standards |
| Phase 2 | Planned | Custom Authentication | Registration, login, sessions, authorization |
| Phase 3 | Planned | Workspaces & Projects | Workspace membership and project management |
| Phase 4 | Planned | Task Management | Task lifecycle, Kanban board, and data tables |
| Phase 5 | Planned | Polish & Deployment | Testing, security, accessibility, and deployment |

Each phase has its own implementation tasks and completion criteria.

A feature should only be marked complete after its implementation and relevant verification are finished.

---

## Getting Started

### Prerequisites

Before starting development, install:

- Node.js (compatible with the project's Next.js version).
- npm.
- Git.

A Neon PostgreSQL account and Vercel account will be needed when the database and deployment phases are implemented.

### 1. Clone the Repository

```bash
git clone https://github.com/programmer-bell/synapsehq.git
cd SynapseHQ
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
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`DATABASE_URL` and `NEXT_PUBLIC_APP_URL` are required by the environment validator. `JWT_SECRET` must be at least 32 characters and is required for authentication work. `DATABASE_URL_UNPOOLED` is optional and is used by Drizzle Kit when available. The application validates these variables on the server and fails clearly when required configuration is missing.

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

| Command | Description |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the Next.js development server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run the Vitest suite |
| `npm run build` | Create a production build |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:check` | Check Drizzle migration consistency |
| `npm run db:studio` | Open Drizzle Studio |

Run linting, type checking, and tests after implementation changes. Run a production build when changes affect routing, configuration, or production rendering.

React Testing Library and Playwright remain planned for later phases.

### Neon Connectivity Troubleshooting

If Node.js 24 times out while connecting to Neon in a restricted network
environment, run database commands with:

```bash
NODE_OPTIONS=--no-network-family-autoselection npm run db:migrate
```

This was required for the Phase 1 smoke verification.

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

## Future Improvements

The initial development scope focuses on authentication, workspaces, projects, and task management.

Potential future extensions include:

- Real-time task updates.
- Workspace invitations.
- Advanced permission management.
- Notifications and activity feeds.
- File attachments.
- Project analytics and velocity reporting.
- Sprint planning and reporting.
- More advanced team allocation insights.

These are potential extensions, not commitments for the initial release.

---

## Project Documentation

The repository maintains separate documents for product development and engineering decisions:

| Document | Purpose |
|---|---|
| [`AGENTS.md`](./.agents/AGENTS.md) | Repository-specific instructions and development rules |
| [`roadmap.md`](./.agents/roadmap.md) | Phased implementation roadmap and progress tracking |
| [`ARCHITECTURE.md`](./.agents/ARCHITECTURE.md) | Architectural boundaries, design decisions, and technical standards |
| [`README.md`](./README.md) | Project overview, setup, features, and documentation entry point |

These documents should remain synchronized as the project evolves.

---

**SynapseHQ — Build better workflows. Track meaningful progress. Keep engineering teams aligned.**