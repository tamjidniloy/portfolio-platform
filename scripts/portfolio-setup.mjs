import { createInterface } from "node:readline/promises";
import { createInitialOwner, initializeStudio, closeStudio } from "../server/studio/index.js";

async function privatePassword() {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error("Run this setup in the interactive WebStorm PowerShell terminal");
  }
  process.stdout.write("Create a password (minimum 12 characters, hidden): ");
  return new Promise((resolve, reject) => {
    let value = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const cleanup = () => {
      process.stdin.removeListener("data", read);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
    };
    function read(chunk) {
      for (const char of chunk.toString("utf8")) {
        if (char === "\r" || char === "\n") {
          cleanup(); resolve(value); return;
        }
        if (char === "\u0003") {
          cleanup(); reject(new Error("Setup cancelled")); return;
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else if (char >= " " && value.length < 128) value += char;
      }
    }
    process.stdin.on("data", read);
  });
}
const input = createInterface({ input: process.stdin, output: process.stdout });
try {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in your .env first");
  await initializeStudio();
  console.log("\nDEVFOLIO Studio — one-time owner setup\n");
  const email = await input.question("Your admin email: ");
  input.close();
  const password = await privatePassword();
  await createInitialOwner(email, password);
  console.log("\nOwner account saved. Start npm run dev, open /, and click Login.");
  console.log("For local testing, PORTFOLIO_DEV_PRINT_OTP=true prints the code in the terminal.");
  console.log("To receive real emails, configure RESEND_API_KEY and PORTFOLIO_FROM_EMAIL.");
} catch (error) {
  console.error("\nSetup failed:", error.message);
  process.exitCode = 1;
} finally {
  input.close();
  await closeStudio();
}
