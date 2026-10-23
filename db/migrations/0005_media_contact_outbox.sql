-- Phase 04.4 additive security metadata. 19 DB-R1 base tables unchanged.
ALTER TABLE contact_messages ADD COLUMN request_ip_digest text
  CHECK (request_ip_digest IS NULL OR request_ip_digest ~ '^[a-f0-9]{64}$');
ALTER TABLE contact_messages ADD COLUMN message_sha256 text
  CHECK (message_sha256 IS NULL OR message_sha256 ~ '^[a-f0-9]{64}$');
CREATE INDEX ix_contact_abuse_window ON contact_messages(request_ip_digest,created_at DESC)
 WHERE request_ip_digest IS NOT NULL;
ALTER TABLE outbox_events ADD COLUMN dead_lettered_at timestamptz;
ALTER TABLE outbox_events ADD COLUMN last_error_code text
  CHECK (last_error_code IS NULL OR char_length(last_error_code) <= 80);
CREATE INDEX ix_outbox_dead_letter ON outbox_events(dead_lettered_at)
 WHERE dead_lettered_at IS NOT NULL;
