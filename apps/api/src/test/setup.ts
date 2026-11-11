// Runs before every test file. Points the app at the test database (or a
// placeholder when none is configured, so pure unit tests still run).
process.env.NODE_ENV = "test";
process.env.WEB_URL ??= "http://localhost:5173";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://placeholder:placeholder@127.0.0.1:1/placeholder";

export const hasTestDb = Boolean(process.env.TEST_DATABASE_URL);
