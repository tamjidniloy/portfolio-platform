-- R1 compatible additive privacy constraint; 19-table count unchanged.
ALTER TABLE contact_messages ADD COLUMN legal_hold_until timestamptz;
CREATE INDEX ix_contact_legal_hold ON contact_messages(legal_hold_until)
  WHERE legal_hold_until IS NOT NULL;
