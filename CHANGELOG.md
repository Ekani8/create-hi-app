# Changelog

## 1.1.0 - 2026-10-23

- Node 24 baseline across generated projects, CI and Docker. Requires upgrading Node before using this version.
- Full and lightweight module generators; explicit composition roots.
- Zod environment validation, structured logs with allowlisted metadata and safe HTTP error responses.
- Initial Prisma migration, deployment migration command and local demo seed.
- Test-only database/user checks, serial integration files and a dedicated E2E server.
- Packaged gitignore restored by the CLI (including .env.test protection).
- Generator CI exercises the packed CLI, generated modules, quality checks, build, PostgreSQL integration and Chromium E2E.
- Dependabot, team documentation and manual migration instructions.
- Next.js 15.5.28 / React 19.1.10; reviewed security patch updates without switching framework major.

## 1.0.0

Initial Next.js, Prisma, PostgreSQL, Docker and test starter.
