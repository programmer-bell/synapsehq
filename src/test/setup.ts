if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

process.env.DATABASE_URL ??=
  "postgresql://user:password@localhost:5432/synapsehq_test";
process.env.JWT_SECRET ??= "test-secret-that-is-at-least-32-characters";
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
