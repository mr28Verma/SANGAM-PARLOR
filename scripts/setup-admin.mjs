import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function readHidden(prompt) {
  return new Promise((resolvePrompt, reject) => {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
      reject(new Error("Run setup-admin from an interactive terminal so passwords are not echoed."));
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
          reject(new Error("Setup cancelled."));
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
  const username = (await readHidden("Choose the private admin username: ")).trim();
  const first = await readHidden("Choose an admin password (12+ characters): ");
  const second = await readHidden("Enter it again: ");
  if (!/^[a-zA-Z0-9._-]{3,80}$/.test(username)) throw new Error("Use 3–80 letters, numbers, dots, underscores, or hyphens for the username.");
  if (first.length < 12) throw new Error("Use a password with at least 12 characters.");
  if (first !== second) throw new Error("Passwords do not match.");

  const envLines = (existsSync(envPath) ? readFileSync(envPath, "utf8") : "").split(/\r?\n/).filter((line, index, lines) => index < lines.length - 1 || line.length > 0);
  const updates = {
    ADMIN_USERNAME: username,
    ADMIN_PASSWORD: first,
  };
  for (const [key, value] of Object.entries(updates)) {
    const match = new RegExp(`^${key}=`);
    const existing = envLines.findIndex((line) => match.test(line));
    if (existing >= 0) envLines[existing] = `${key}=${value}`;
    else envLines.push(`${key}=${value}`);
  }
  writeFileSync(envPath, `${envLines.join("\n").replace(/\n+$/, "")}\n`, { mode: 0o600 });
  chmodSync(envPath, 0o600);
  process.stdout.write("Admin credentials were saved to the git-ignored .env.local. AUTH_SECRET was left unchanged. Restart the dev server.\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Admin setup failed."}\n`);
  process.exitCode = 1;
}
