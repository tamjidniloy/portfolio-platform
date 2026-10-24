import { createInterface } from "node:readline/promises";
import { changeStudioPassword, initializeStudio, closeStudio } from "../server/studio/index.js";

function readHidden(prompt) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error("Run this command in an interactive WebStorm PowerShell terminal.");
  }
  process.stdout.write(prompt);
  return new Promise((resolve, reject) => {
    let value = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const cleanup = () => {
      process.stdin.removeListener("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
    };
    function onData(chunk) {
      for (const char of chunk.toString("utf8")) {
        if (char === "\r" || char === "\n") {
          cleanup();
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          cleanup();
          reject(new Error("Password change cancelled."));
          return;
        }
        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
        } else if (char >= " " && value.length < 128) {
          value += char;
        }
      }
    }
    process.stdin.on("data", onData);
  });
}

const input = createInterface({ input: process.stdin, output: process.stdout });
try {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in .env first.");
  await initializeStudio();
  console.log("\nDEVFOLIO Studio — change owner password\n");
  const email = await input.question("Your existing admin email: ");
  input.close();

  const current = await readHidden("Current password (hidden): ");
  const replacement = await readHidden("New password (minimum 12 characters, hidden): ");
  const confirmation = await readHidden("Confirm new password (hidden): ");

  if (replacement !== confirmation) throw new Error("New passwords do not match. No changes were made.");
  await changeStudioPassword(email, current, replacement);
  console.log("\nPassword changed successfully. All previous sign-in sessions and pending codes were invalidated.");
  console.log("Open /admin/login and sign in using your existing email and NEW password.");
} catch (error) {
  console.error("\nPassword not changed:", error.message);
  process.exitCode = 1;
} finally {
  input.close();
  await closeStudio();
}
