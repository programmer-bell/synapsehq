# ADR-007: Workspace and Project Authorization

## Status

Accepted

## Context

Phase 3 introduces workspaces, workspace membership, and projects. Access to
these resources must be enforced on the server and close to database operations.
Phase 2 established identity and persistent sessions, but resource-level
permissions did not yet exist.

## Decision

Use explicit workspace membership roles and centralized permission checks.

Workspace roles:

- `OWNER`
- `ADMIN`
- `MEMBER`

Permission model:

- `OWNER` can read, update, and delete the workspace; manage members; and
  perform all project operations.
- `ADMIN` can read and update the workspace; manage non-owner members; and
  create, read, update, and delete projects.
- `MEMBER` can read the workspace and its projects, and create projects.
- A project creator can update or archive their own project even when their
  workspace role is `MEMBER`.
- Only the workspace owner can delete the workspace or remove the owner
  membership.

Workspace and project identifiers are never trusted from the client. Services
resolve the authenticated user, load the workspace membership, and verify the
required permission before any mutation. Project operations also verify that the
project belongs to the requested workspace.

Slugs are generated from workspace names, normalized to lowercase URL-safe
values, and made unique with a numeric suffix when necessary. Project names must
be unique within a workspace.

Statuses:

- Workspaces do not have a status field in Phase 3.
- Projects use `ACTIVE` or `ARCHIVED`.

Deletion behavior:

- Deleting a workspace cascades to its memberships and projects.
- Deleting a user cascades to owned workspaces, memberships, and created
  projects.
- Removing a member does not delete their created projects.

Membership changes are performed by looking up an existing user by normalized
email. External invitations are deferred to a later phase.

## Consequences

- `workspaces`, `workspace_members`, and `projects` are owned by their modules.
- Authorization rules are centralized in the workspaces module and reused by the
  projects module.
- Cross-workspace access is rejected before project data is returned.
- Tests must verify both successful operations and unauthorized access.
