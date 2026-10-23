# House Innovation application

Generated with create-hi-app 1.1. Node 24, npm, Git and Docker Desktop are required.

## Start (PowerShell)

```powershell
Copy-Item .env.example .env
npm ci
npm run db:generate
docker compose up -d --wait db
npm run db:migrate:deploy
npm run dev
```

Open http://localhost:3000. The initial User migration is included. After changing the schema, use `npm run db:migrate -- --name your_change` and commit the new migration. Use `npm run db:migrate:deploy` in deployment jobs, never `migrate dev` against production.

The generated lockfile provides reproducible installation. Commit it, and update it with every dependency change. The generator does not configure authentication, authorization, backups or monitoring; add those for your product.

## Tests

```powershell
Copy-Item .env.test.example .env.test
docker compose -f docker-compose.test.yml up -d --wait
npx playwright install chromium
npm run test:all
```

| Command                    | Purpose                                                               |
| -------------------------- | --------------------------------------------------------------------- |
| `npm test`                 | Pure unit tests, no database                                          |
| `npm run test:integration` | Committed migrations then Prisma tests on the test database           |
| `npm run test:e2e`         | Migrations then Chromium smoke tests on a dedicated server, port 3100 |
| `npm run test:all`         | Lint, format check, types, units, integration, E2E                    |
| `npm run build`            | Production compilation, separate from test:all                        |

Only `.env.test` is explicitly loaded by the test runner. An existing process DATABASE_URL takes precedence (as in CI); an unsafe URL fails before database access. Both the parsed database name and PostgreSQL user must end in `_test`. This is a guard, not proof that a database is disposable: always use the separate test instance. Tests delete fixture rows, but no longer reset/drop the database. Integration files run serially with one worker; do not run two suites concurrently against the same database. E2E never reuses a running development server.

Development: localhost:5432. Tests: localhost:5433, separate credentials, ephemeral storage. All real `.env*` files are ignored by Git and excluded from Docker builds; example files contain local demo values only.

## Architecture and composition

- `src/app`: routes, layouts and thin HTTP/UI adapters.
- `src/modules/<feature>/domain`: pure business rules.
- `application`: use cases and repository contracts.
- `infrastructure`: Prisma/external implementations.
- `presentation`: feature-specific components.
- `composition.ts`: concrete dependencies wired to use cases.

The Users module demonstrates this wiring. From a server-side adapter, import `userServices` from `@/modules/users/composition`, authenticate/authorize the caller, then call `userServices.create(input)`. Do not import server modules into client components. The example is not an authentication service.

```powershell
npx @elmp/create-hi-app@1.1.0 generate module orders
npx @elmp/create-hi-app@1.1.0 generate module settings --simple
npm run format
npm test
```

Run these commands at the application root. Full modules include repository contracts, composition and a test. Simple modules contain application/presentation code and a test. The generated repositories return empty example collections; implement persistence and migrations before use. No routes or Prisma models are created automatically. Existing module folders are never overwritten. Promote a simple feature when business rules or external dependencies justify it.

## Environment, errors and logs

`src/instrumentation.ts` loads `src/config/env.ts` on Node server initialization; database infrastructure uses the same validated configuration. Add new server variables there. The schema checks URL syntax/protocol, not connectivity. A build-time placeholder is not a production credential. Runtime startup requires DATABASE_URL.

Use `AppError` only for expected errors with safe public messages. `toErrorResponse` maps validation errors to 400, expected failures to their status, and unexpected failures to a generic 500 with a request ID. Use the structured `logger` with only requestId, code and durationMs metadata. Never put tokens, email addresses or connection strings in event names/messages.

`npm run db:seed` loads local .env and idempotently creates admin@example.com as demo data. It refuses NODE_ENV=production and remote hosts. This record has no login or admin permissions.

## Docker and delivery

```powershell
docker build -t hi-app:local .
```

Node 24 multi-stage image, standalone output, non-root runtime. Apply migrations from a release job with the project's Prisma CLI and deployment DATABASE*URL before starting the image. The runtime image does not contain migration tooling. Supply runtime secrets through the deployment platform. Inside Docker, localhost is the container itself; use an accessible DB hostname, for example host.docker.internal for a host database. NEXT_PUBLIC*\* values are public and normally fixed at build time.

The two application CI jobs execute quality/build checks and PostgreSQL/Chromium tests. They do not deploy. Dependabot opens weekly update PRs. Husky checks staged files; it does not replace CI. The generator repository separately tests the packed generator and both module modes against a generated project.

## Existing applications

Generator updates do not update existing applications. Review CHANGELOG.md and UPGRADING.md in the generator package. Compare a fresh reference project on a branch; preserve application code, secrets and migration history. Never copy the starter's initial migration into an existing migration chain blindly.
