#!/usr/bin/env bash
# Controlled RDS PITR rehearsal. Creates an isolated DB but never modifies the source.
set -euo pipefail
source_db="${SOURCE_DB:?Set SOURCE_DB to approved source RDS identifier}"
target_db="${TARGET_DB:?Set TARGET_DB to NEW restore-drill identifier}"
subnet_group="${DB_SUBNET_GROUP:?Set approved private DB subnet group}"
security_group="${ISOLATED_DB_SECURITY_GROUP:?Set an isolated SG with NO app ingress}"
confirmation="${RESTORE_CONFIRM:?Set RESTORE_CONFIRM to RESTORE_TO_ISOLATED_DB}"
[[ "$confirmation" == "RESTORE_TO_ISOLATED_DB" ]] || { echo "Approval required" >&2; exit 2; }
[[ "$source_db" != "$target_db" ]] || { echo "Cannot overwrite source" >&2; exit 2; }
[[ "$target_db" =~ -restore-[a-z0-9-]+$ ]] || { echo "Target must contain -restore- suffix" >&2; exit 2; }
if aws rds describe-db-instances --db-instance-identifier "$target_db" >/dev/null 2>&1; then
  echo "Target already exists, refusing" >&2; exit 2
fi
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier "$source_db" \
  --target-db-instance-identifier "$target_db" \
  --use-latest-restorable-time \
  --db-subnet-group-name "$subnet_group" \
  --vpc-security-group-ids "$security_group" \
  --no-publicly-accessible >/dev/null
aws rds wait db-instance-available --db-instance-identifier "$target_db"
aws rds describe-db-instances --db-instance-identifier "$target_db" \
  --query 'DBInstances[0].{Status:DBInstanceStatus,Public:PubliclyAccessible,Engine:Engine,StorageEncrypted:StorageEncrypted}' \
  --output json
echo "Provisioning verified only. Run private SQL integrity and timed RTO/RPO test, record results, then approve and delete isolated target."
