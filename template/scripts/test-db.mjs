export function assertTestDatabase(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("A valid test DATABASE_URL is required.");
  }
  const database = decodeURIComponent(url.pathname.slice(1));
  const user = decodeURIComponent(url.username);
  if (
    !["postgresql:", "postgres:"].includes(url.protocol) ||
    !/^[a-z0-9_-]+_test$/.test(database) ||
    !user.endsWith("_test")
  ) {
    throw new Error(
      "Test commands require a database AND a user ending in _test. Refusing database access.",
    );
  }
}
