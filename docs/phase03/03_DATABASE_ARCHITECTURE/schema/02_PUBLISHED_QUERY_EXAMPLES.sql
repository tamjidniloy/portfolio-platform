-- Phase 03.3 illustrative parameterized queries. DESIGN ONLY. No PostgreSQL runtime tests.
-- Public routes use this safe facade; never join or serialize content_revisions/contacts/auth.
-- $1 is a validated canonical published URL path such as /projects/example.
SELECT p.public_path, p.public_payload, p.published_at, p.generation
  FROM published_snapshots AS p
 WHERE p.public_path = $1;

-- Public collection pagination prototype. Exact JSON keys, ordering and route semantics require SRS.
SELECT p.public_path, p.public_payload, p.published_at
  FROM published_snapshots AS p
 WHERE p.public_path LIKE '/projects/%'
   AND p.published_at < $1::timestamptz
 ORDER BY p.published_at DESC, p.public_path
 LIMIT $2;

-- Strict media eligibility: asset must be ready, referenced by the EXACT published revision.
SELECT m.id, m.storage_key, m.observed_mime, m.byte_size
  FROM media_assets AS m
  JOIN media_references AS mr ON mr.media_id = m.id
  JOIN published_snapshots AS p ON p.item_id = mr.item_id
    AND p.source_revision_no = mr.revision_no
 WHERE m.id = $1::uuid AND m.state = 'ready';
-- Do not return raw storage_key to browser; media delivery proxy enforces object/ACL policy.

-- Public sitemap: canonical published paths only.
SELECT p.public_path, p.published_at FROM published_snapshots p ORDER BY p.public_path;
