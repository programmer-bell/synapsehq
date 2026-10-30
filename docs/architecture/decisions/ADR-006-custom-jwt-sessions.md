# ADR-006: Custom JWT Sessions with Persistent Revocation

## Status

Accepted

## Context

SynapseHQ requires custom authentication without an external identity provider.
The system needs secure password storage, stateless request verification,
explicit logout, and the ability to revoke sessions before their natural
expiration. The application also needs a login throttling strategy that works
in a serverless deployment.

## Decision

Use a signed JWT backed by a persistent session record.

- Passwords are hashed with `bcryptjs` using a cost factor of 12. Passwords are
  limited to 8–72 UTF-8 bytes because bcrypt ignores input beyond 72 bytes.
- Session tokens are signed with `jose` using HS256 and `JWT_SECRET`.
- JWT claims are `sub` (user ID), `sid` (session ID), `iss` (`synapsehq`),
  `aud` (`synapsehq-web`), `iat`, and `exp`.
- Sessions have an absolute lifetime of seven days by default. The lifetime is
  configurable through `AUTH_SESSION_TTL_SECONDS` and is not extended on use.
- Every session has a row in PostgreSQL. The JWT alone is not sufficient for
  authorization: the session row must exist, be unrevoked, be unexpired, and
  belong to an active user.
- Logout revokes the session row and clears the cookie. A revoked token is
  rejected even if its signature and expiration remain valid.
- The session cookie is named `synapse_session` and uses `HttpOnly`,
  `SameSite=Lax`, `Path=/`, an explicit expiration, and `Secure` in production.
- Registration creates the account but does not automatically create a session.
  The user signs in after successful registration.
- `proxy.ts` performs optimistic navigation checks only. Server Components,
  Server Actions, and application services revalidate the session against the
  database.
- Login throttling is database-backed. Failed attempts are tracked separately
  for hashed email and hashed IP identifiers using HMAC-SHA256 with
  `JWT_SECRET` as the key. The policy is five failures in fifteen minutes,
  followed by a fifteen-minute block. Successful login clears both identifiers.
- Resource-level workspace and project authorization is deferred to Phase 3
  because those entities do not exist in Phase 2. Phase 2 establishes identity,
  session validation, and reusable authentication guards.

## Alternatives

- JWT-only sessions: rejected because tokens could not be revoked before
  expiration.
- Opaque database-only sessions: viable, but would require a database lookup
  for every request and would not provide signed, stateless request metadata.
  The chosen hybrid keeps explicit revocation while retaining signed claims.
- In-memory rate limiting: rejected because serverless instances do not share
  memory and the limits would be ineffective.
- External rate-limit or identity services: rejected to preserve the custom,
  lightweight authentication architecture.

## Trade-offs

Every authenticated request requires a database lookup to validate the session.
This is intentional because immediate revocation is a security requirement.
Hashing email and IP identifiers protects sensitive values in the rate-limit
table, but successful attempts clear those identifiers to avoid retaining
unnecessary tracking data.

## Consequences

- `users`, `sessions`, and `auth_login_attempts` are owned by the auth module.
- Session revocation is immediate across application instances.
- Login throttling is shared across serverless instances.
- Protected routes require both the JWT and the database session.
- Workspace and project permission checks must be added in Phase 3 before those
  resources can be exposed.
