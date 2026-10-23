import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

test("package exposes the npm create binary", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url)));
  assert.equal(pkg.bin["create-hi-app"], "bin/create-hi-app.js");
  assert.equal(pkg.type, "module");
});

test("generates a full and a simple module", async () => {
  const project = await mkdtemp(join(tmpdir(), "hi-app-"));
  await mkdir(join(project, "src", "modules"), { recursive: true });
  await writeFile(join(project, "package.json"), "{}");
  const cli = fileURLToPath(new URL("../bin/create-hi-app.js", import.meta.url));
  execFileSync(process.execPath, [cli, "generate", "module", "orders"], { cwd: project });
  execFileSync(process.execPath, [cli, "generate", "module", "settings", "--simple"], { cwd: project });
  await assert.doesNotReject(() => readFile(join(project, "src", "modules", "orders", "composition.ts")));
  await assert.doesNotReject(() => readFile(join(project, "src", "modules", "settings", "presentation", "SettingsList.tsx")));
  await rm(project, { recursive: true, force: true });
});

test("scaffolds the operational template", async () => {
  const parent = await mkdtemp(join(tmpdir(), "hi-app-template-"));
  const cli = fileURLToPath(new URL("../bin/create-hi-app.js", import.meta.url));
  try {
    execFileSync(process.execPath, [cli, "sample", "--skip-install", "--no-git"], { cwd: parent });
    const project = join(parent, "sample");
    const pkg = JSON.parse(await readFile(join(project, "package.json")));
    assert.equal(pkg.engines.node, ">=24.0.0");
    assert.match(await readFile(join(project, '.gitignore'), 'utf8'), /\.env\*/);
    const lock = JSON.parse(await readFile(join(project, 'package-lock.json'), 'utf8'));
    assert.equal(lock.name, 'sample');
    assert.equal(lock.packages[''].name, 'sample');
    assert.throws(() => execFileSync(process.execPath, [cli, 'sample', '--skip-install'], { cwd: parent, stdio: 'pipe' }));
    assert.throws(() => execFileSync(process.execPath, [cli, '../escape', '--skip-install'], { cwd: parent, stdio: 'pipe' }));
    await assert.doesNotReject(() => readFile(join(project, "src", "config", "env.ts")));
    await assert.doesNotReject(() => readFile(join(project, "prisma", "migrations", "20261023000000_init", "migration.sql")));
    await assert.doesNotReject(() => readFile(join(project, ".github", "dependabot.yml")));
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test("rejects malformed arguments and reserved filesystem names", async () => {
  const parent = await mkdtemp(join(tmpdir(), "hi-invalid-"));
  const cli = fileURLToPath(new URL("../bin/create-hi-app.js", import.meta.url));
  try {
    for (const args of [
      ['con'], ['nul'], ['a'.repeat(59)], ['two--hyphens'],
      ['valid', '--unknown'], ['one', 'two'], ['generate', 'unknown', 'orders'],
      ['generate', 'module', 'nul'], ['generate', 'module', '../escape'],
      ['generate', 'module', 'orders', 'extra'],
    ]) {
      assert.throws(() => execFileSync(process.execPath, [cli, ...args], { cwd: parent, stdio: 'pipe' }));
    }
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
