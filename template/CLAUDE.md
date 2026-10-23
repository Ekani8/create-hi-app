# Engineering rules

## Architecture

- Put feature code in `src/modules/<feature>/{domain,application,infrastructure,presentation}`.
- Keep `domain` pure: no React, Next.js, Prisma, network or environment access.
- Route handlers and Server Actions are thin adapters; put rules in application services.
- Depend on repository interfaces in application code, not Prisma directly.
- Build concrete dependencies in each module's `composition.ts`; route handlers and Server Actions call that composition root, never Prisma directly.
- Use the full four-layer module for workflows with business rules or persistence. For a straightforward CRUD screen, a light application/presentation module is permitted.

## Quality gate

- Add or update tests with every behavior change. Unit tests cover domain/application logic; integration tests use real Prisma/PostgreSQL; E2E tests cover critical user paths.
- Before declaring work ready: `npm run lint`, `npm run typecheck`, `npm test` and applicable integration/E2E tests must pass.
- Never weaken tests, bypass type checking, or expose secrets to make a change pass.

## Data safety

- Never run migrations, reset, or seed against a database unless the URL is confirmed.
- Test tooling only accepts a database AND user ending in `_test`. Do not alter that guard. Integration files run serially; do not run concurrent suites against the same database.
- Do not commit `.env`, credentials, tokens, or production database URLs.
- Validate environment variables through `src/config/env.ts`; log structured events through `src/lib/logger`; throw `AppError` for expected application failures.
- At HTTP boundaries use `toErrorResponse`. Only safe, public messages belong in AppError. Authenticate and authorize callers before calling services. No authentication system is included in this starter.
