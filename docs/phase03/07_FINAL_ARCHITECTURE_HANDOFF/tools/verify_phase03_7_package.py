#!/usr/bin/env python3
"""Static delivery validation: hashes and source ZIP integrity. Does not run application QA."""
import csv, hashlib, sys, zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
with (root/'MANIFEST_SHA256.csv').open(newline='',encoding='utf-8') as f:
 items=list(csv.DictReader(f))
for row in items:
 file=root/row['path'];assert file.is_file(),f'Missing {row["path"]}'
 digest=hashlib.sha256(file.read_bytes()).hexdigest()
 assert digest==row['sha256'],f'Hash mismatch: {file}'
 assert file.stat().st_size==int(row['bytes']),f'Length mismatch: {file}'
 forphase = row['path'].startswith('original_source_archives/') and row['path'].endswith('.zip')
 if forphase:
  with zipfile.ZipFile(file) as z:assert z.testzip() is None,f'Damaged original ZIP: {file}'
print(f'STATIC HANDOFF INTEGRITY PASSED: {len(items)} files. Does not mean QA/owner approval.')
