-- Add additional performance and privacy indexes; no destructive actions.
CREATE INDEX ix_sessions_idle_lookup ON admin_sessions(last_seen_at) WHERE revoked_at IS NULL;
CREATE INDEX ix_private_content_owner ON content_items(created_by,updated_at DESC);
CREATE INDEX ix_snapshot_type_path ON published_snapshots(public_path);
CREATE INDEX ix_recovery_active ON recovery_codes(admin_user_id) WHERE used_at IS NULL AND revoked_at IS NULL;
CREATE INDEX ix_audit_retention ON audit_events(created_at);
