# SynapseHQ — Engineering Task & Velocity Workspace

**A modular project management workspace designed for software engineering teams.**

SynapseHQ is a full-stack workspace application concept focused on helping engineering teams organize projects, manage tasks, track milestones, and monitor team progress through a structured, data-dense interface.

The project is designed around a **Modular Monolith architecture**, with clearly defined domain boundaries, strict TypeScript practices, server-driven business logic, and custom authentication.

Its goal is to demonstrate practical full-stack engineering skills through a production-minded application rather than a basic CRUD tutorial.

> **Project status:** Initial development. The repository currently contains a Create Next App starter. The features and architecture described below represent the planned product direction, not necessarily implemented functionality.

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

**Note:** The repository's installed dependencies are authoritative. Some technologies listed above are planned and must be installed and configured before they can be used.

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
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   └── globals.css
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
│       ├── db/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── utils/
│       ├── types/
│       ├── config/
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
├── AGENTS.md
├── ARCHITECTURE.md
├── README.md
├── roadmap.md
├── package.json
├── next.config.ts
├── tsconfig.json
└── .env.sample
```

The Next.js App Router currently lives in the repository-root `app/` directory. The `src/` structure is planned and should be introduced incrementally without unnecessarily moving existing files.

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

Development will follow the phases defined in [`roadmap.md`](./roadmap.md).

| Phase | Focus | Main Deliverables |
|---|---|---|
| Phase 1 | Foundation & Architecture | Project structure, database foundation, development standards |
| Phase 2 | Custom Authentication | Registration, login, sessions, authorization |
| Phase 3 | Workspaces & Projects | Workspace membership and project management |
| Phase 4 | Task Management | Task lifecycle, Kanban board, and data tables |
| Phase 5 | Polish & Deployment | Testing, security, accessibility, and deployment |

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
JWT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

These variables are intended for future application configuration. The current starter does not necessarily read them yet.

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
| `npx tsc --noEmit` | Run TypeScript type checking |
| `npm run build` | Create a production build |

**Important:** The current repository does not define a test script or configured testing framework. Automated testing will be introduced during the relevant development phases.

Run linting and type checking after implementation changes. Run a production build when changes affect routing, configuration, or production rendering.

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
| [`AGENTS.md`](./AGENTS.md) | Repository-specific instructions and development rules |
| [`roadmap.md`](./roadmap.md) | Phased implementation roadmap and progress tracking |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Architectural boundaries, design decisions, and technical standards |
| [`README.md`](./README.md) | Project overview, setup, features, and documentation entry point |

These documents should remain synchronized as the project evolves.

---

**SynapseHQ — Build better workflows. Track meaningful progress. Keep engineering teams aligned.**