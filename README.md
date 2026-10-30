# SynapseHQ

> A focused engineering workspace for planning projects, organizing work, and
> understanding team velocity.

SynapseHQ is being built as a full-stack workspace for software engineering
teams. Its product direction combines a clean, modular architecture with a
compact, information-rich interface.

> **Project status:** This repository currently contains the Next.js starter
> application. The workspace, authentication, and database capabilities below
> describe the product direction and are not implemented yet.

## Product direction

- **Workspace and project management** — Organize engineering initiatives and
  manage access for workspace members.
- **Task management** — Bring Kanban boards and data tables together, with
  clear task status transitions.
- **Sprint velocity** — Track team progress and make delivery trends easier to
  understand.
- **Modular architecture** — Keep domain boundaries clear as the application
  grows.
- **Focused interface** — Favor crisp borders, a restrained monochrome palette,
  and responsive, information-dense layouts.

## Technology

| Area | Current or planned technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4, and Lucide Icons (planned) |
| Language | TypeScript |
| Database | Neon Postgres (planned) |
| ORM | Drizzle ORM (planned) |
| Authentication | `jose` and `bcryptjs` (planned) |
| Deployment | Vercel |

The current application is built with Next.js, React, TypeScript, and Tailwind
CSS. Database and authentication tools are part of the planned stack and will
be added as those features are implemented.

## Getting started

### Prerequisites

- Node.js supported by Next.js 16
- npm

### Install and run

```bash
git clone https://github.com/programmer-bell/synapsehq.git
cd synapsehq
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development checks

Run the available checks before submitting changes:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Project structure

```text
.
src/
├── app/                  # Next.js App Router (Thin layout & routing layer)
│   ├── (auth)/           # Authentication routes (Login, Signup)
│   └── (dashboard)/      # Protected workspace & project routes
├── modules/              # Modular Monolith Domains
│   ├── auth/             # JWT utils, auth server actions, auth UI components
│   ├── projects/         # Project schemas, server actions, dashboard grids
│   └── tasks/            # Kanban views, table views, status transition actions
└── shared/               # Shared Application Core
    ├── db/               # Drizzle client instance & relational schema definitions
    └── components/       # Primitive UI components (Buttons, Modals, Inputs)
```
