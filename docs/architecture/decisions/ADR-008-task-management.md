# ADR-008: Task Data Model and Authorization

## Status

Accepted

## Context

Phase 4 introduces tasks within projects. Tasks need status, priority, optional
assignment, optional due dates, filtering, sorting, and two complementary UI
views. Task access must follow project and workspace authorization.

## Decision

Tasks belong to projects and are managed through the tasks module.

Task statuses:
- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW`
- `DONE`

Task priorities:
- `LOW`
- `MEDIUM`
- `HIGH`
- `URGENT`

Task fields:
- `id`
- `projectId`
- `title`
- `description`
- `status`
- `priority`
- `assigneeId` (nullable)
- `dueDate` (nullable)
- `createdBy`
- `createdAt`
- `updatedAt`

Authorization:
- Reading tasks requires project read access.
- Creating tasks requires project read access.
- Updating, assigning, transitioning, or deleting a task requires project
  update permission or task ownership/assignment.
- Task assignment is limited to users who are members of the task's workspace.
- Cross-project task access is rejected before task data is returned.

Filtering and sorting:
- Filters and sort parameters are validated server-side.
- Search matches title and description.
- Pagination uses bounded limits.
- URL search parameters may represent shareable filters.

Kanban movement uses server-validated status updates. Drag-and-drop is not
required in Phase 4; explicit status controls provide accessible movement.

## Consequences

- `tasks` is owned by the tasks module.
- The tasks module depends on the projects module for project access.
- Task queries must remain project-scoped and indexed.
- Task tests must cover CRUD, assignment, authorization, filtering, and sorting.