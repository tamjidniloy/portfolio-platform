-- Phase 03.3 proposed staging verification queries. NOT_EXECUTED, non-authoritative.
-- False/editor-state and missing snapshot inconsistency (these should be zero after transactions).
SELECT ci.id,ci.publication_state
FROM content_items ci LEFT JOIN published_snapshots ps ON ps.item_id=ci.id
WHERE (ci.publication_state='published' AND ps.item_id IS NULL)
   OR (ci.publication_state<>'published' AND ps.item_id IS NOT NULL);

-- Canonical path collisions (unique index should make result empty).
SELECT public_path, count(*) FROM published_snapshots GROUP BY public_path HAVING count(*)>1;

-- Published snapshots with nonready media: visibility should be blocked/remediated.
SELECT p.item_id, m.id AS media_id, m.state
FROM published_snapshots p
JOIN media_references r ON r.item_id=p.item_id AND r.revision_no=p.source_revision_no
JOIN media_assets m ON m.id=r.media_id
WHERE m.state <> 'ready';

-- Outbox work overdue (operations threshold is a policy decision).
SELECT id,event_type,attempts,available_at
FROM outbox_events WHERE processed_at IS NULL AND available_at<now() ORDER BY available_at LIMIT 50;
