import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// WebStorm on Windows can terminate npm without terminating the Nodemon/Node tree.
// Track the original terminal/npm ancestors, not just Nodemon's immediate parent.
export function areParentsAlive(pids, probe = isProcessAlive) {
  return pids.length > 0 && pids.every((pid) => Number.isSafeInteger(pid) && pid > 0 && probe(pid));
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

export function getParentPids(startPid, platform = process.platform) {
  if (!Number.isSafeInteger(startPid) || startPid < 1) return [];
  if (platform !== "win32") return [startPid];

  // This is a one-time Windows process-tree lookup; no elevated privileges required.
  const ps = `$next = ${startPid}; for ($i = 0; $i -lt 12 -and $next -gt 4; $i++) { $item = Get-CimInstance Win32_Process -Filter ("ProcessId = " + $next) -ErrorAction SilentlyContinue; if ($null -eq $item) { break }; Write-Output $next; if ($next -eq [int]$item.ParentProcessId) { break }; $next = [int]$item.ParentProcessId }`;
  try {
    const output = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], {
      encoding: "utf8",
      timeout: 5000,
      windowsHide: true,
    });
    const pids = output.split(/\s+/).map(Number).filter((pid) => Number.isSafeInteger(pid) && pid > 4);
    return pids.length ? [...new Set(pids)] : [startPid];
  } catch {
    return [startPid]; // Powershell/CIM restrictions must not prevent local development.
  }
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const nodemon = path.join(root, "node_modules", "nodemon", "bin", "nodemon.js");
  if (!existsSync(nodemon)) {
    console.error("Nodemon is missing. Run npm ci first.");
    process.exitCode = 1;
    return;
  }

  const parents = getParentPids(process.ppid);
  const child = spawn(process.execPath, [nodemon], {
    cwd: root,
    stdio: "inherit",
    windowsHide: false,
    detached: process.platform !== "win32",
    env: { ...process.env, DEV_SUPERVISOR_PID: String(process.pid) },
  });
  let stopping = false;
  let interval;

  function stopTree() {
    if (stopping) return;
    stopping = true;
    clearInterval(interval);
    if (!child.pid || child.exitCode !== null) return;

    if (process.platform === "win32") {
      // Unlike .kill(), taskkill /T also terminates Nodemon's cmd.exe and server.js.
      const killer = spawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
      killer.once("error", () => child.kill("SIGTERM"));
      killer.once("close", (status) => {
        if (status !== 0 && child.exitCode === null) child.kill("SIGTERM");
      });
    } else {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        child.kill("SIGTERM");
      }
      const deadline = setTimeout(() => {
        try { process.kill(-child.pid, "SIGKILL"); } catch { /* Already stopped. */ }
      }, 5000);
      deadline.unref();
    }
  }

  interval = setInterval(() => {
    if (!areParentsAlive(parents)) {
      console.error("[dev] Terminal/npm exited; stopping the portfolio server.");
      stopTree();
    }
  }, 1000);
  interval.unref();

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP", ...(process.platform === "win32" ? ["SIGBREAK"] : [])]) {
    process.once(signal, stopTree);
  }
  child.once("error", (error) => {
    console.error("[dev] Could not start Nodemon:", error.message);
    stopTree();
    process.exitCode = 1;
  });
  child.once("exit", (code, signal) => {
    clearInterval(interval);
    process.exitCode = stopping ? 0 : (code ?? (signal ? 1 : 0));
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
