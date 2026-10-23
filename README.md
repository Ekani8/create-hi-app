# create-hi-app

The House Innovation application generator. It creates a modular Next.js application with a separately protected test database.

## Use it

```bash
npm create @elmp/hi-app my-product
```

Options: `--skip-install` skips `npm install`; `--no-git` skips `git init`.

Generate a module inside a generated project:

```bash
npx @elmp/create-hi-app generate module orders
npx @elmp/create-hi-app generate module settings --simple
```

The default mode creates all architecture layers. `--simple` creates a lighter application/presentation feature for straightforward CRUD screens.

## Develop this package

Version 1.1.0 is prepared locally. Before publishing, require a successful
`.github/workflows/template-ci.yml` run, including integration, browser tests,
production build and Docker build. Preparing the workflow is not a successful run.

```bash
npm test
npm run pack:check
npm publish --access public
```

This package is published as `@elmp/create-hi-app`; use `npm create @elmp/hi-app my-product` to scaffold a project.

To evaluate an unpublished archive, run:

```powershell
npm pack --pack-destination outputs
npm exec --yes --package=./outputs/elmp-create-hi-app-1.1.0.tgz -- create-hi-app demo --skip-install --no-git
```

The generated project's README contains its setup, testing, security, and CI instructions.

See CHANGELOG.md for changes and UPGRADING.md to migrate existing applications. Node 24 is required. New generator versions do not automatically update existing projects.
