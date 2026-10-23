-- Extend WebAuthn challenge metadata for durable rate limits; remains 19 tables.
ALTER TABLE auth_challenges ADD COLUMN client_ip_digest text
  CHECK (client_ip_digest IS NULL OR client_ip_digest ~ '^[a-f0-9]{64}$');
CREATE INDEX ix_auth_challenges_ip_window ON auth_challenges(client_ip_digest,created_at DESC);
