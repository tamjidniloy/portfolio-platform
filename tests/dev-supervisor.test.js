import test from "node:test";
import assert from "node:assert/strict";
import { areParentsAlive, getParentPids } from "../scripts/dev-supervisor.mjs";

test("supervisor detects any terminated npm or terminal ancestor", () => {
  const alive = new Set([101, 202, 303]);
  assert.equal(areParentsAlive([101, 202, 303], (pid) => alive.has(pid)), true);
  alive.delete(202);
  assert.equal(areParentsAlive([101, 202, 303], (pid) => alive.has(pid)), false);
});

test("supervisor rejects empty or invalid ancestry instead of leaving orphan", () => {
  assert.equal(areParentsAlive([], () => true), false);
  assert.equal(areParentsAlive([-1], () => true), false);
  assert.equal(areParentsAlive([NaN], () => true), false);
});

test("POSIX mode tracks its immediate parent without launching PowerShell", () => {
  assert.deepEqual(getParentPids(12345, "linux"), [12345]);
  assert.deepEqual(getParentPids(0, "linux"), []);
});

test("supervisor can verify its own live process", () => {
  assert.equal(areParentsAlive([process.pid]), true);
});
