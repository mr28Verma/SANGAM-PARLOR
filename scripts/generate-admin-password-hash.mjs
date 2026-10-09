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
          reject(new Error("Hash generation cancelled."));
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

try {
  const password = await readHidden("Admin password to hash (input hidden): ");
  if (password.length < 12) throw new Error("Use a password with at least 12 characters.");
  const hash = await bcrypt.hash(password, 12);
  process.stdout.write(`ADMIN_PASSWORD_HASH=${hash}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Hash generation failed."}\n`);
  process.exitCode = 1;
}
