import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("release must be manual from main, environment-scoped and use OIDC", () => {
  const y = read(".github/workflows/phase045-release.yml");
  assert.match(y, /workflow_dispatch:/);
  assert.match(y, /github\.ref == 'refs\/heads\/main'/);
  assert.match(y, /environment: \$\{\{ inputs\.environment \}\}/);
  assert.match(y, /id-token: write/);
  assert.match(y, /--if-none-match/);
  assert.match(y, /sha256sum release\.tgz/);
  assert.match(y, /npm sbom/);
  assert.doesNotMatch(y, /aws-access-key-id:/i);
});
test("reference infra is private and fail-closed on deletion and ingress", () => {
  const tf = read("infra/aws/main.tf");
  assert.match(tf, /publicly_accessible = false/);
  assert.match(tf, /backup_retention_period = 30/);
  assert.match(tf, /deletion_protection = var\.environment == "production"/);
  assert.match(tf, /block_public_acls = true/);
  assert.match(tf, /http_tokens = "required"/);
  assert.match(tf, /ssm:SendCommand/);
  assert.match(tf, /github_oidc_subject/);
  assert.match(tf, /aws_cloudwatch_log_metric_filter" "outbox_dlq"/);
  assert.doesNotMatch(tf, /from_port = 22/);
});
test("host deployment verifies digest and has rollback and private secret checks", () => {
  const bash = read("ops/aws/deploy-host.sh");
  assert.match(bash, /sha256sum --check --status/);
  assert.match(bash, /secretsmanager get-secret-value/);
  assert.match(bash, /systemctl restart devfolio\.service/);
  assert.match(bash, /old=.*readlink/);
  assert.match(bash, /Readiness failed, reverting previous release/);
});
test("new live tracker has exact planned 62 work item IDs with gates", () => {
  const tracker = read("docs/phase04/PHASE04_LIVE_STATUS.csv").trim().split("\n");
  assert.equal(tracker.length, 63);
  assert.equal(tracker[1].split(",")[0], "P4-001");
  assert.equal(tracker[62].split(",")[0], "P4-062");
  assert.match(tracker[45], /04\.5,AWS_REFERENCE_IMPLEMENTED/);
  assert.match(tracker[62], /NOT_EXECUTED/);
});
