# Migrating an existing v1.0 application

Generated applications are independent copies. Installing a newer generator does not update them.
Do this on a branch and keep your application code and migration history.

1. Upgrade local Node, CI and Docker to Node 24. The generator's runtime requirement changes in 1.1.
2. Generate a separate comparison project with `npm create @elmp/hi-app@1.1.0 reference-app` after publication (or use the local archive before publication).
3. Compare package.json and config files; update dependencies and regenerate your own lockfile. Do not replace the package name or scripts you added.
4. Merge the gitignore rules, especially `.env*` with exceptions for examples. Check whether secrets were previously tracked with `git ls-files .env*`; rotate any exposed secrets, then remove those files from tracking while preserving local copies.
5. Add scripts/run-tests.mjs, test-db.mjs, its type declaration and integration-setup.ts; merge the test and Playwright configs. Use a DB and a PostgreSQL user ending in `_test`. Never point tests at shared data.
6. Add composition.ts to each non-trivial module and switch adapters to those services. Keep domain/application layers independent of concrete Prisma repositories.
7. Merge environment validation, instrumentation, error mapping and logging; add every application-specific variable to the schema.
8. Keep your existing Prisma migrations. Do NOT copy the starter's initial User migration into an existing database history. Use `prisma migrate dev` for schema changes, and review `prisma migrate deploy` against a disposable staging database.
9. Merge CI and Dependabot; commit your own package-lock.json. Run lint, formatting, types, units, integration, E2E and a production build before release.

No automatic overwrite/update command is provided. A reviewed diff is safer for applications that have already diverged.

Security source for the Next.js update: https://nextjs.org/blog/nextjs-security-update-october-14-2026
