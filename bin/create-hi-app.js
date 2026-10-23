#!/usr/bin/env node
import { cp, mkdir, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const template = resolve(here, "../template");
const usage = `Usage: npm create @elmp/hi-app@latest <project-name> [--skip-install] [--no-git]\n       npx @elmp/create-hi-app@latest generate module <name> [--simple]`;
const args = process.argv.slice(2);
const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const validFlags = args[0] === 'generate' ? ['--simple', '--help', '-h'] : ['--skip-install', '--no-git', '--help', '-h'];
if (args.some((arg) => arg.startsWith('-') && !validFlags.includes(arg))) {
  console.error('Unknown option. Use --help.'); process.exit(1);
}
if (args.includes("--help") || args.includes("-h")) { console.log(usage); process.exit(0); }
const positional = args.filter((arg) => !arg.startsWith('-'));
if ((args[0] === 'generate' && (positional.length !== 3 || args[1] !== 'module')) || (args[0] !== 'generate' && positional.length !== 1)) {
  console.error(usage); process.exit(1);
}
if (args[0] === "generate" && args[1] === "module") {
  const moduleName = args[2];
  if (!moduleName || reserved.test(moduleName) || moduleName.length > 63 || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(moduleName)) {
    console.error("Module name must be lowercase and use letters, numbers, or hyphens."); process.exit(1);
  }
  const root = process.cwd();
  if (!existsSync(join(root, "package.json")) || !existsSync(join(root, "src", "modules"))) {
    console.error("Run this command from a create-hi-app generated project."); process.exit(1);
  }
  const targetModule = join(root, "src", "modules", moduleName);
  if (existsSync(targetModule)) { console.error(`Module already exists: ${moduleName}`); process.exit(1); }
  const pascalName = moduleName.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
  const simple = args.includes("--simple");
  const files = simple ? {
    [`application/${moduleName}.ts`]: `export function list${pascalName}() {\n  return [];\n}\n`,
    [`presentation/${pascalName}List.tsx`]: `export function ${pascalName}List() {\n  return <section>${pascalName}</section>;\n}\n`,
    [`application/${moduleName}.unit.test.ts`]: `import { describe, expect, it } from "vitest";\nimport { list${pascalName} } from "./${moduleName}";\ndescribe("list${pascalName}", () => { it("returns an empty collection initially", () => expect(list${pascalName}()).toEqual([])); });\n`
  } : {
    [`domain/${moduleName}.ts`]: `export type ${pascalName}Id = string;\n`,
    [`application/${moduleName}.service.ts`]: `export interface ${pascalName}Repository {\n  list(): Promise<unknown[]>;\n}\n\nexport async function list${pascalName}(repository: ${pascalName}Repository) {\n  return repository.list();\n}\n`,
    [`application/${moduleName}.service.unit.test.ts`]: `import { describe, expect, it } from "vitest";\nimport { list${pascalName} } from "./${moduleName}.service";\ndescribe("list${pascalName}", () => { it("delegates to its repository", async () => {\n  await expect(list${pascalName}({ list: async () => [] })).resolves.toEqual([]);\n}); });\n`,
    [`infrastructure/${moduleName}.repository.ts`]: `import type { ${pascalName}Repository } from "../application/${moduleName}.service";\n\nexport const ${moduleName.replaceAll("-", "")}Repository: ${pascalName}Repository = {\n  async list() { return []; },\n};\n`,
    [`presentation/${pascalName}List.tsx`]: `export function ${pascalName}List() {\n  return <section>${pascalName}</section>;\n}\n`,
    ["composition.ts"]: `import { list${pascalName} } from "./application/${moduleName}.service";\nimport { ${moduleName.replaceAll("-", "")}Repository } from "./infrastructure/${moduleName}.repository";\n\nexport const ${moduleName.replaceAll("-", "")}Services = {\n  list: () => list${pascalName}(${moduleName.replaceAll("-", "")}Repository),\n};\n`
  };
  for (const [relative, content] of Object.entries(files)) {
    const output = join(targetModule, relative); await mkdir(dirname(output), { recursive: true }); await writeFile(output, content);
  }
  console.log(`✓ Created ${simple ? "simple " : ""}module ${moduleName}. Run npm run format, then npm test. Replace the example repository before using persistence.`); process.exit(0);
}
const name = args.find((arg) => !arg.startsWith("-"));
if (!name || reserved.test(name) || name.length > 58 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
  console.error("Project name must be lowercase, use letters, numbers or single hyphens, and be 1–58 characters. Windows device names are reserved.");
  console.log(usage); process.exit(1);
}
const target = resolve(process.cwd(), name);
if (existsSync(target)) { console.error(`Refusing to overwrite existing path: ${target}`); process.exit(1); }

await cp(template, target, { recursive: true });
// npm omits .gitignore from published tarballs. Keep it under a safe name.
for (const [source, destination] of [['gitignore.template', '.gitignore'], ['dependencies.lock', 'package-lock.json']]) {
  await writeFile(join(target, destination), await readFile(join(target, source)), { flag: 'wx' });
  await unlink(join(target, source));
}
async function replaceTokens(folder) {
  for (const entry of await readdir(folder)) {
    const path = join(folder, entry); const info = await stat(path);
    if (info.isDirectory()) await replaceTokens(path);
    else {
      const content = await readFile(path, "utf8");
      await writeFile(path, content.replaceAll("__PROJECT_NAME__", name));
    }
  }
}
await replaceTokens(target);
console.log(`\n✓ Created ${name}`);
if (!args.includes("--no-git")) {
  const git = spawnSync("git", ["init"], { cwd: target, stdio: "ignore" });
  if (git.status === 0) console.log("✓ Initialized Git repository");
}
if (!args.includes("--skip-install")) {
  console.log("Installing dependencies…");
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const install = spawnSync(npm, ["install"], { cwd: target, stdio: "inherit", shell: process.platform === 'win32' });
  if (install.status !== 0) {
    console.warn("Dependencies were not installed. Run npm install inside the project.");
    process.exitCode = 1;
  } else {
    const generate = spawnSync(npm, ['run', 'db:generate'], { cwd: target, stdio: 'inherit', shell: process.platform === 'win32' });
    if (generate.status !== 0) process.exitCode = 1;
  }
}
console.log(`\nNext steps:\n  cd ${basename(target)}\n  cp .env.example .env\n  docker compose up -d db\n  npm run db:migrate\n  npm run dev\n\nRead README.md before running integration or E2E tests.`);
