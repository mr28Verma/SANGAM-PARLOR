import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { test } from "node:test";
import ts from "typescript";
import { readFile } from "node:fs/promises";

async function loadAdminCredentials() {
  const path = resolve(process.cwd(), "lib/admin-credentials.ts");
  const source = await readFile(path, "utf8");
  const compiled = ts.transpile(source, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true });
  const commonJsModule = { exports: {} };
  const require = createRequire(path);
  new Function("require", "module", "exports", compiled)(require, commonJsModule, commonJsModule.exports);
  return commonJsModule.exports;
}

test("admin password verification accepts an exact configured password", async () => {
  const { verifyAdminPassword } = await loadAdminCredentials();
  assert.equal(verifyAdminPassword("test-password-123", "test-password-123"), true);
});

test("admin password verification rejects mismatches and missing configuration", async () => {
  const { verifyAdminPassword } = await loadAdminCredentials();
  assert.equal(verifyAdminPassword("wrong-password", "test-password-123"), false);
  assert.equal(verifyAdminPassword("test-password-123", undefined), false);
  assert.equal(verifyAdminPassword("", ""), false);
});
