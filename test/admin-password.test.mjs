import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { test } from "node:test";
import ts from "typescript";
import { readFile } from "node:fs/promises";
import bcrypt from "bcryptjs";

async function loadAdminPasswordHelpers() {
  const source = await readFile(resolve(process.cwd(), "lib/admin-password.ts"), "utf8");
  const compiled = ts.transpile(source, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true });
  const commonJsModule = { exports: {} };
  const require = createRequire(resolve(process.cwd(), "lib/admin-password.ts"));
  new Function("require", "module", "exports", compiled)(require, commonJsModule, commonJsModule.exports);
  return commonJsModule.exports;
}

test("admin password verification accepts and compares bcryptjs hashes", async () => {
  const password = "temporary-test-password";
  const hash = await bcrypt.hash(password, 4);
  const { isBcryptHash, verifyAdminPassword } = await loadAdminPasswordHelpers();

  assert.equal(isBcryptHash(hash), true);
  assert.equal(await verifyAdminPassword(password, hash), true);
  assert.equal(await verifyAdminPassword("different-password", hash), false);
});

test("admin password verification rejects malformed hashes safely", async () => {
  const { isBcryptHash, verifyAdminPassword } = await loadAdminPasswordHelpers();

  assert.equal(isBcryptHash("not-a-bcrypt-hash"), false);
  assert.equal(await verifyAdminPassword("any-password", "not-a-bcrypt-hash"), false);
});
