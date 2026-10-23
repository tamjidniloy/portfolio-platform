#!/usr/bin/env bash
# Invoked as root by AWS SSM RunCommand. No credentials, environment values or URL parameters in logs.
set -euo pipefail
umask 077
release_sha="$1"
artifact_bucket="$2"
environment="$3"
if [[ ! "$release_sha" =~ ^[0-9a-f]{64}$ ]]; then echo "Invalid release SHA-256" >&2; exit 2; fi
if [[ ! "$artifact_bucket" =~ ^[a-z0-9][a-z0-9.-]{2,62}$ ]]; then echo "Invalid bucket" >&2; exit 2; fi
if [[ ! "$environment" =~ ^(staging|production)$ ]]; then echo "Invalid environment" >&2; exit 2; fi
command -v aws >/dev/null
command -v node-22 >/dev/null
command -v systemctl >/dev/null
source /etc/devfolio/host.env
test -n "$ENV_SECRET_ARN" && test -n "$AWS_REGION"
aws secretsmanager get-secret-value --region "$AWS_REGION" --secret-id "$ENV_SECRET_ARN" \
  --query SecretString --output text > /etc/devfolio/runtime.env.next
test -s /etc/devfolio/runtime.env.next || { echo "Runtime secret is unset" >&2; exit 3; }
grep -q '^DATABASE_URL=postgres' /etc/devfolio/runtime.env.next || { echo "DATABASE_URL missing" >&2; exit 3; }
grep -q '^CMS_DATABASE_URL=postgres' /etc/devfolio/runtime.env.next || { echo "CMS_DATABASE_URL missing" >&2; exit 3; }
grep -q '^CMS_PUBLIC_DATABASE_URL=postgres' /etc/devfolio/runtime.env.next || { echo "Public DB credentials missing" >&2; exit 3; }
chown root:devfolio /etc/devfolio/runtime.env.next
chmod 0640 /etc/devfolio/runtime.env.next
if grep -q '^NODE_ENV=' /etc/devfolio/runtime.env.next; then
  grep -q '^NODE_ENV=productiongrep -q '^CMS_API_ENABLED=true$' /etc/devfolio/runtime.env || { echo "CMS not explicitly enabled" >&2; exit 3; }
directory="/opt/devfolio/releases/$release_sha"
temp="$(mktemp -d)"
trap 'rm -rf "$temp"' EXIT
aws s3 cp "s3://$artifact_bucket/releases/$environment/$release_sha.tgz" "$temp/release.tgz" --only-show-errors
echo "$release_sha  $temp/release.tgz" | sha256sum --check --status
mkdir -p "$directory"
if [[ -e "$directory/.ready" ]]; then
  echo "Reusing previously verified release"
else
  tar -tzf "$temp/release.tgz" | awk '/^\// || /(^|\/)\.\.($|\/)/ {bad=1} END {exit bad ? 1 : 0}'
  tar -xzf "$temp/release.tgz" -C "$directory" --no-same-owner
  test -f "$directory/build/server/index.js"
  test -f "$directory/server.js"
  test -d "$directory/node_modules"
  chown -R devfolio:devfolio "$directory"
  touch "$directory/.ready"
fi
old="$(readlink -f /opt/devfolio/current || true)"
ln -sfn "$directory" /opt/devfolio/current.next
mv -Tf /opt/devfolio/current.next /opt/devfolio/current
systemctl daemon-reload
systemctl enable devfolio.service
if ! systemctl restart devfolio.service; then
  echo "Service restart failed; beginning rollback" >&2
  if [[ -n "$old" && -f "$old/.ready" ]]; then
    ln -sfn "$old" /opt/devfolio/current.next
    mv -Tf /opt/devfolio/current.next /opt/devfolio/current
    systemctl restart devfolio.service || true
  fi
  exit 4
fi
healthy=0
for n in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 2 http://127.0.0.1:3000/readyz >/dev/null 2>&1; then healthy=1; break; fi
  sleep 2
done
if [[ "$healthy" != 1 ]]; then
  echo "Readiness failed, reverting previous release" >&2
  if [[ -n "$old" && -f "$old/.ready" ]]; then
    ln -sfn "$old" /opt/devfolio/current.next
    mv -Tf /opt/devfolio/current.next /opt/devfolio/current
    systemctl restart devfolio.service || true
  else
    systemctl stop devfolio.service || true
  fi
  exit 4
fi
echo "Release verified, readiness passed; SHA-256: $release_sha"
 /etc/devfolio/runtime.env.next || { echo "Nonproduction runtime secret refused" >&2; exit 3; }
fi
grep -q '^CMS_PUBLIC_ORIGIN=https://' /etc/devfolio/runtime.env.next || { echo "Production HTTPS origin missing" >&2; exit 3; }
grep -q '^CMS_AUTH_ENABLED=truegrep -q '^CMS_API_ENABLED=true$' /etc/devfolio/runtime.env || { echo "CMS not explicitly enabled" >&2; exit 3; }
directory="/opt/devfolio/releases/$release_sha"
temp="$(mktemp -d)"
trap 'rm -rf "$temp"' EXIT
aws s3 cp "s3://$artifact_bucket/releases/$environment/$release_sha.tgz" "$temp/release.tgz" --only-show-errors
echo "$release_sha  $temp/release.tgz" | sha256sum --check --status
mkdir -p "$directory"
if [[ -e "$directory/.ready" ]]; then
  echo "Reusing previously verified release"
else
  tar -tzf "$temp/release.tgz" | awk '/^\// || /(^|\/)\.\.($|\/)/ {bad=1} END {exit bad ? 1 : 0}'
  tar -xzf "$temp/release.tgz" -C "$directory" --no-same-owner
  test -f "$directory/build/server/index.js"
  test -f "$directory/server.js"
  test -d "$directory/node_modules"
  chown -R devfolio:devfolio "$directory"
  touch "$directory/.ready"
fi
old="$(readlink -f /opt/devfolio/current || true)"
ln -sfn "$directory" /opt/devfolio/current.next
mv -Tf /opt/devfolio/current.next /opt/devfolio/current
systemctl daemon-reload
systemctl enable --now devfolio.service
systemctl restart devfolio.service
healthy=0
for n in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 2 http://127.0.0.1:3000/readyz >/dev/null 2>&1; then healthy=1; break; fi
  sleep 2
done
if [[ "$healthy" != 1 ]]; then
  echo "Readiness failed, reverting previous release" >&2
  if [[ -n "$old" && -f "$old/.ready" ]]; then
    ln -sfn "$old" /opt/devfolio/current.next
    mv -Tf /opt/devfolio/current.next /opt/devfolio/current
    systemctl restart devfolio.service || true
  else
    systemctl stop devfolio.service || true
  fi
  exit 4
fi
echo "Release verified, readiness passed; SHA-256: $release_sha"
 /etc/devfolio/runtime.env.next || { echo "Passkey auth not enabled" >&2; exit 3; }
grep -q '^CMS_API_ENABLED=truegrep -q '^CMS_API_ENABLED=true$' /etc/devfolio/runtime.env || { echo "CMS not explicitly enabled" >&2; exit 3; }
directory="/opt/devfolio/releases/$release_sha"
temp="$(mktemp -d)"
trap 'rm -rf "$temp"' EXIT
aws s3 cp "s3://$artifact_bucket/releases/$environment/$release_sha.tgz" "$temp/release.tgz" --only-show-errors
echo "$release_sha  $temp/release.tgz" | sha256sum --check --status
mkdir -p "$directory"
if [[ -e "$directory/.ready" ]]; then
  echo "Reusing previously verified release"
else
  tar -tzf "$temp/release.tgz" | awk '/^\// || /(^|\/)\.\.($|\/)/ {bad=1} END {exit bad ? 1 : 0}'
  tar -xzf "$temp/release.tgz" -C "$directory" --no-same-owner
  test -f "$directory/build/server/index.js"
  test -f "$directory/server.js"
  test -d "$directory/node_modules"
  chown -R devfolio:devfolio "$directory"
  touch "$directory/.ready"
fi
old="$(readlink -f /opt/devfolio/current || true)"
ln -sfn "$directory" /opt/devfolio/current.next
mv -Tf /opt/devfolio/current.next /opt/devfolio/current
systemctl daemon-reload
systemctl enable --now devfolio.service
systemctl restart devfolio.service
healthy=0
for n in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 2 http://127.0.0.1:3000/readyz >/dev/null 2>&1; then healthy=1; break; fi
  sleep 2
done
if [[ "$healthy" != 1 ]]; then
  echo "Readiness failed, reverting previous release" >&2
  if [[ -n "$old" && -f "$old/.ready" ]]; then
    ln -sfn "$old" /opt/devfolio/current.next
    mv -Tf /opt/devfolio/current.next /opt/devfolio/current
    systemctl restart devfolio.service || true
  else
    systemctl stop devfolio.service || true
  fi
  exit 4
fi
echo "Release verified, readiness passed; SHA-256: $release_sha"
 /etc/devfolio/runtime.env.next || { echo "CMS is disabled" >&2; exit 3; }
mv -f /etc/devfolio/runtime.env.next /etc/devfolio/runtime.env
grep -q '^CMS_API_ENABLED=true$' /etc/devfolio/runtime.env || { echo "CMS not explicitly enabled" >&2; exit 3; }
directory="/opt/devfolio/releases/$release_sha"
temp="$(mktemp -d)"
trap 'rm -rf "$temp"' EXIT
aws s3 cp "s3://$artifact_bucket/releases/$environment/$release_sha.tgz" "$temp/release.tgz" --only-show-errors
echo "$release_sha  $temp/release.tgz" | sha256sum --check --status
mkdir -p "$directory"
if [[ -e "$directory/.ready" ]]; then
  echo "Reusing previously verified release"
else
  tar -tzf "$temp/release.tgz" | awk '/^\// || /(^|\/)\.\.($|\/)/ {bad=1} END {exit bad ? 1 : 0}'
  tar -xzf "$temp/release.tgz" -C "$directory" --no-same-owner
  test -f "$directory/build/server/index.js"
  test -f "$directory/server.js"
  test -d "$directory/node_modules"
  chown -R devfolio:devfolio "$directory"
  touch "$directory/.ready"
fi
old="$(readlink -f /opt/devfolio/current || true)"
ln -sfn "$directory" /opt/devfolio/current.next
mv -Tf /opt/devfolio/current.next /opt/devfolio/current
systemctl daemon-reload
systemctl enable --now devfolio.service
systemctl restart devfolio.service
healthy=0
for n in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 2 http://127.0.0.1:3000/readyz >/dev/null 2>&1; then healthy=1; break; fi
  sleep 2
done
if [[ "$healthy" != 1 ]]; then
  echo "Readiness failed, reverting previous release" >&2
  if [[ -n "$old" && -f "$old/.ready" ]]; then
    ln -sfn "$old" /opt/devfolio/current.next
    mv -Tf /opt/devfolio/current.next /opt/devfolio/current
    systemctl restart devfolio.service || true
  else
    systemctl stop devfolio.service || true
  fi
  exit 4
fi
echo "Release verified, readiness passed; SHA-256: $release_sha"
