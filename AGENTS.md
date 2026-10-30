# Project Roadmap: SynapseHQ (Modular Monolith)

## Phase 1: Foundation & Modular Directory Structure
- [ ] Initialize Next.js app with TypeScript, Tailwind CSS, and App Router.
- [ ] Set up project folder structure following a modular monolith pattern:
      `src/modules/auth/`, `src/modules/projects/`, `src/modules/tasks/`, `src/modules/shared/`
- [ ] Configure Neon Postgres connection and Drizzle ORM schema configuration.
- [ ] Implement global layout, root providers, and custom typography/theme variables.

## Phase 2: Custom Authentication Module
- [ ] Create database schema for `users` and `sessions`.
- [ ] Implement secure password hashing utility (`bcryptjs`).
- [ ] Build Server Actions for Login, Signup, and Logout with validation (`zod`).
- [ ] Implement custom JWT issuing/verification via HTTP-only cookies (`jose`).
- [ ] Create middleware to protect dashboard routes and handle role-based redirection.

## Phase 3: Core Workspace & Projects Module
- [ ] Create database schema for `projects` and `workspace_members`.
- [ ] Build UI views: Dashboard overview, project grid, and creation modal.
- [ ] Implement Server Actions for CRUD operations on projects with optimistic updates.
- [ ] Build granular access boundaries (ensure users only view their assigned projects).

## Phase 4: Task Management & Kanban / Table Views Module
- [ ] Create database schema for `tasks` (relational mapping to projects and users).
- [ ] Build hybrid view toggle: Kanban board columns vs. Data Dense Table view.
- [ ] Implement drag-and-drop or state-driven status transitions using Server Actions.
- [ ] Add search, filtering (by priority/status), and sorting mechanisms.

## Phase 5: Polish, Performance & Deployment
- [ ] Write unit and integration tests for critical authentication and data flows.
- [ ] Audit responsive design across mobile, tablet, and widescreen viewports.
- [ ] Optimize bundle size, image handling, and font loading.
- [ ] Deploy seamlessly to Vercel with environment variables tied to Neon Postgres.


## Example Comment Style (Clean & Self-Documenting)

```bash
// src/modules/tasks/actions.ts

/**
 * @domain Tasks Module
 * @description Server Action to update task status with transactional integrity 
 * and validation against user workspace permissions.
 */

'use server';

import { db } from '@/shared/db';
import { tasks } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateTaskStatus(taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') {
  try {
    // 1. Perform database mutation
    const updatedTask = await db
      .update(tasks)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask.length) {
      throw new Error('Task not found or unauthorized.');
    }

    // 2. Revalidate cache for the active project dashboard view
    revalidatePath('/dashboard/projects');
    
    return { success: true, data: updatedTask[0] };
  } catch (error) {
    console.error('[Task Action Error]: Failed to update task status', error);
    return { success: false, error: 'Internal server error' };
  }
}
```

## Frontend UI Guidelines: Avoiding "AI Slop" for a Classic UI
```
Recruiters review hundreds of portfolios filled with generic AI-generated templates (often overloaded with random glowing gradients, messy shadows, and unreadable neon text). To build a classic, high-end SaaS UI that proves your professional frontend capability:

Strict Color Discipline: Stick to a monochromatic neutral foundation (e.g., Tailwind's zinc or slate palettes) with a single, intentional accent color (like a restrained indigo, emerald, or classic blue). Never mix more than two accent colors.

Borders Over Shadows: Instead of heavy, blurry drop-shadows everywhere, rely on clean, razor-sharp borders (border border-zinc-200 dark:border-zinc-800). This immediately elevates an app to look like Linear, Vercel, or Stripe dashboards.

Data Density & Typography: Use crisp typographic hierarchies. Utilize tabular numbers (font-mono or tabular-nums) for metrics, explicit font weights (font-medium for labels, font-normal for body text), and tight tracking (tracking-tight) on headings.

Flawless Responsiveness: Ensure that complex layouts (like data tables or Kanban boards) gracefully collapse into stacked card lists or horizontally scrollable containers on mobile devices using Tailwind's overflow-x-auto and grid modifiers (grid-cols-1 md:grid-cols-3).
```