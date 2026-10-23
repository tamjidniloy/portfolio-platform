-- Phase 03.3 ONLY: illustrative transaction fragments, NOT executable as a migration.
-- Parameters and JSON payload construction are performed by the server use case.
-- Publication command: use ONE transaction, with owner auth/CSRF/permission validated first.
BEGIN;
SELECT lock_version,latest_revision_no FROM content_items WHERE id=$1::uuid FOR UPDATE;
-- Application: compare lock_version and revision id to expected preconditions; abort if stale.
-- Application: validate the requested content_revisions row, related assets, source version,
-- publish-level schema and allowlisted public_payload before any public write.
INSERT INTO published_snapshots (item_id,source_revision_no,public_path,public_payload,published_by,generation)
VALUES ($1::uuid,$2::integer,$3::text,$4::jsonb,$5::uuid,1)
ON CONFLICT (item_id) DO UPDATE
  SET source_revision_no=EXCLUDED.source_revision_no,
      public_path=EXCLUDED.public_path,
      public_payload=EXCLUDED.public_payload,
      published_by=EXCLUDED.published_by,
      published_at=now(),
      generation=published_snapshots.generation+1;
UPDATE content_items
  SET publication_state='published',lock_version=lock_version+1,updated_at=now()
  WHERE id=$1::uuid;
INSERT INTO audit_events(actor_admin_id,action,target_kind,target_id,redacted_metadata)
  VALUES($5::uuid,'content.publish','content',$1::uuid,'{}'::jsonb);
INSERT INTO outbox_events(event_type,aggregate_id,dedupe_key,safe_payload)
  VALUES('content.published',$1::uuid,$6::text,'{}'::jsonb);
COMMIT;
-- Respond 'published' only after COMMIT succeeds. Do NOT perform SMTP/CDN/network actions in tx.

-- Unpublish: in a NEW transaction, lock item, validate expected version, then:
-- DELETE FROM published_snapshots WHERE item_id=$1::uuid;
-- UPDATE content_items SET publication_state='archived', lock_version=lock_version+1,...;
-- INSERT audit_events and outbox_events; COMMIT.
-- Anonymous reads must consult published_snapshots or security-equivalent live guard.

-- Outbox worker claim, candidate SKIP LOCKED pattern. Transaction claim/lease details
-- depend on worker strategy; idempotency required for retry (exact lock/update TBD).
-- SELECT id FROM outbox_events WHERE processed_at IS NULL AND available_at <= now()
-- AND (claimed_until IS NULL OR claimed_until < now())
-- ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 50;
