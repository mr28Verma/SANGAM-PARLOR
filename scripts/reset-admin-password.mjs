import { randomBytes } from "node:crypto";
import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";

function readHidden(prompt) {
  return new Promise((resolvePrompt, reject) => {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
      reject(new Error("Run this command from an interactive terminal so the password is not echoed."));
      return;
    }
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    let value = "";
    const onData = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") {
          process.stdin.off("data", onData);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          reject(new Error("Password reset cancelled."));
          return;
        }
        if (char === "\r" || char === "\n") {
          process.stdin.off("data", onData);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write("\n");
          resolvePrompt(value);
          return;
        }
        if (char === "\u0008" || char === "\u007f") value = value.slice(0, -1);
        else if (char >= " ") value += char;
      }
    };
    process.stdin.on("data", onData);
  });
}

const envPath = resolve(process.cwd(), ".env.local");
try {
  const envLines = readFileSync(envPath, "utf8").split(/\r?\n/);
  const existingUsername = process.env.ADMIN_USERNAME?.trim() || envLines.find((line) => line.startsWith("ADMIN_USERNAME="))?.slice("ADMIN_USERNAME=".length).trim();
  if (!existingUsername) throw new Error("ADMIN_USERNAME is not configured. This reset script will not create or guess an admin username.");

  const first = await readHidden("Enter a new admin password (12+ characters): ");
  const second = await readHidden("Enter it again: ");
  if (first.length < 12) throw new Error("Use a password with at least 12 characters.");
  if (first !== second) throw new Error("Passwords do not match.");

  const updates = {
    ADMIN_PASSWORD_HASH: await bcrypt.hash(first, 12),
    AUTH_SECRET: randomBytes(32).toString("base64url"),
  };
  for (const [key, value] of Object.entries(updates)) {
    const prefix = `${key}=`;
    const index = envLines.findIndex((line) => line.startsWith(prefix));
    if (index >= 0) envLines[index] = `${prefix}${value}`;
    else envLines.push(`${prefix}${value}`);
  }
  writeFileSync(envPath, `${envLines.join("\n").replace(/\n+$/, "")}\n`, { mode: 0o600 });
  chmodSync(envPath, 0o600);
  process.stdout.write("The configured admin password hash was updated and sessions were invalidated. Restart the dev server.\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Password reset failed."}\n`);
  process.exitCode = 1;
}
