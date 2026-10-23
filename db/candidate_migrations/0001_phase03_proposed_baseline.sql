-- Disposable-database ONLY, copied from Phase03.3 CANDIDATE model. NOT AUTHORIZED FOR NORMAL APP DB.
-- DO NOT APPLY TO PRODUCTION/DEVELOPMENT/STAGING. NO FINAL SCHEMA OR MFA APPROVAL.
-- SRS v1.1 CANDIDATE only. Provider, schema, data types, retention and version NOT LOCKED.
-- PostgreSQL gen_random_uuid() availability must be confirmed for target PG release.

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE auth_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  code_digest text NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_digest text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_seen_at timestamptz,
  CHECK (expires_at > issued_at)
);
CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_digest text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
CREATE TABLE content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('profile','site_settings','project','research','publication','article','education','experience','skill','achievement','social_link','resume','open_source')),
  current_slug text,
  publication_state text NOT NULL DEFAULT 'draft' CHECK (publication_state IN ('draft','published','archived')),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  latest_revision_no integer NOT NULL DEFAULT 0 CHECK (latest_revision_no >= 0),
  created_by uuid NOT NULL REFERENCES admin_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_singleton_content_types ON content_items (content_type)
 WHERE content_type IN ('profile','site_settings');
CREATE TABLE content_revisions (
  item_id uuid NOT NULL REFERENCES content_items(id) ON DELETE RESTRICT,
  revision_no integer NOT NULL CHECK (revision_no > 0),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  schema_version integer NOT NULL CHECK (schema_version > 0),
  payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[[:xdigit:]]{64}$'),
  created_by uuid NOT NULL REFERENCES admin_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  change_note text,
  PRIMARY KEY (item_id, revision_no)
);
CREATE TABLE published_snapshots (
  item_id uuid PRIMARY KEY REFERENCES content_items(id) ON DELETE RESTRICT,
  source_revision_no integer NOT NULL,
  public_path text NOT NULL UNIQUE,
  public_payload jsonb NOT NULL CHECK (jsonb_typeof(public_payload) = 'object'),
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid NOT NULL REFERENCES admin_users(id),
  generation bigint NOT NULL DEFAULT 1 CHECK (generation > 0),
  CONSTRAINT fk_published_source_revision FOREIGN KEY (item_id, source_revision_no)
    REFERENCES content_revisions(item_id, revision_no) ON DELETE RESTRICT,
  CHECK (left(public_path,1) = '/' AND position('?' in public_path) = 0 AND position('#' in public_path) = 0)
);
CREATE TABLE content_relations (
  source_item_id uuid NOT NULL,
  source_revision_no integer NOT NULL,
  target_item_id uuid NOT NULL REFERENCES content_items(id) ON DELETE RESTRICT,
  relation_kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source_item_id, source_revision_no, target_item_id, relation_kind),
  FOREIGN KEY (source_item_id,source_revision_no) REFERENCES content_revisions(item_id,revision_no) ON DELETE CASCADE,
  CHECK (source_item_id <> target_item_id)
);
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  CHECK (char_length(slug) > 0 AND char_length(label) > 0)
);
CREATE TABLE content_tags (
  item_id uuid NOT NULL,
  revision_no integer NOT NULL,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE RESTRICT,
  PRIMARY KEY(item_id, revision_no, tag_id),
  FOREIGN KEY (item_id, revision_no) REFERENCES content_revisions(item_id, revision_no) ON DELETE CASCADE
);
CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key text NOT NULL UNIQUE,
  original_name text,
  declared_mime text NOT NULL,
  observed_mime text,
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  sha256_hex text CHECK (sha256_hex IS NULL OR sha256_hex ~ '^[[:xdigit:]]{64}$'),
  state text NOT NULL DEFAULT 'staging' CHECK (state IN ('staging','ready','rejected','retired')),
  created_by uuid NOT NULL REFERENCES admin_users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE media_references (
  item_id uuid NOT NULL,
  revision_no integer NOT NULL,
  media_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  use_role text NOT NULL,
  PRIMARY KEY(item_id, revision_no, media_id, use_role),
  FOREIGN KEY (item_id,revision_no) REFERENCES content_revisions(item_id,revision_no) ON DELETE CASCADE
);
CREATE TABLE slug_redirects (
  from_path text PRIMARY KEY,
  to_path text NOT NULL,
  http_status integer NOT NULL DEFAULT 308 CHECK (http_status IN (301,308)),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (left(from_path,1) = '/' AND left(to_path,1) = '/' AND from_path <> to_path)
);
CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  message_body text NOT NULL,
  consent_at timestamptz,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','closed','deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE TABLE audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_kind text NOT NULL,
  target_id uuid,
  redacted_metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(redacted_metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  aggregate_id uuid,
  dedupe_key text NOT NULL UNIQUE,
  safe_payload jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(safe_payload) = 'object'),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  available_at timestamptz NOT NULL DEFAULT now(),
  claimed_until timestamptz,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  key_digest text NOT NULL,
  request_digest text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','complete')),
  safe_result jsonb CHECK (safe_result IS NULL OR jsonb_typeof(safe_result) = 'object'),
  expires_at timestamptz NOT NULL,
  UNIQUE (scope, key_digest)
);
CREATE TABLE site_private_config (
  singleton_id smallint PRIMARY KEY DEFAULT 1 CHECK (singleton_id = 1),
  private_config jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(private_config)='object'),
  updated_by uuid REFERENCES admin_users(id),
  lock_version bigint NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Proposed workload indexes; adjust from EXPLAIN in staging, not assumed production-ready.
CREATE INDEX ix_content_type_editor_order ON content_items(content_type,updated_at DESC);
CREATE INDEX ix_revision_history ON content_revisions(item_id,created_at DESC);
CREATE INDEX ix_public_publish_date ON published_snapshots(published_at DESC);
CREATE INDEX ix_admin_session_expiry ON admin_sessions(admin_user_id,expires_at);
CREATE INDEX ix_auth_challenge_expiry ON auth_challenges(admin_user_id,expires_at);
CREATE INDEX ix_contact_retention ON contact_messages(created_at) WHERE deleted_at IS NULL;
CREATE INDEX ix_outbox_due ON outbox_events(available_at,created_at) WHERE processed_at IS NULL;
CREATE INDEX ix_media_references_asset ON media_references(media_id);
CREATE INDEX ix_content_relations_target ON content_relations(target_item_id);

-- OUTSTANDING before implementation: SQL-level check of content_items.publication_state
-- versus published_snapshots existence (cross-table rule); service transaction + tests essential.
-- Plain direct selects by anonymous role are prohibited; runtime grants and RLS ADR pending.
