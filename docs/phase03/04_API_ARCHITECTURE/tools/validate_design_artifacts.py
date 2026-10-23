from pathlib import Path
import csv,json,sys
try:
 import yaml
 from jsonschema import Draft202012Validator
except ImportError as e:
 print('Install PyYAML and jsonschema to run the optional source validator:',e)
 sys.exit(2)
root=Path(__file__).resolve().parents[1]
with (root/'api/openapi-3.1.2-candidate.yaml').open(encoding='utf8') as f:oas=yaml.safe_load(f)
jsondoc=json.loads((root/'api/openapi-3.1.2-candidate.json').read_text(encoding='utf8'))
assert oas==jsondoc, 'YAML and JSON do not match'
assert oas['openapi']=='3.1.2'
ops={(m.upper(),p) for p,methods in oas['paths'].items() for m in methods if m.lower() in ('get','post','patch','delete','put')}
with (root/'matrices/API_OPERATION_INVENTORY.csv').open(encoding='utf8') as f:inventory=list(csv.DictReader(f))
assert len(ops)==len(inventory), (len(ops),len(inventory))
assert ops=={(x['method'],x['path']) for x in inventory}
with (root/'matrices/SECURITY_POLICY_MATRIX.csv').open(encoding='utf8') as f:policies=list(csv.DictReader(f))
assert len(policies)==len(inventory)
for p in policies:
 if p['owner_session']=='REQUIRED': assert p['path'].startswith('/api/v1/admin/') or p['path'].endswith('/logout')
 if p['method']=='PATCH': assert p['precondition']=='IF_MATCH'
for path in (root/'schemas').glob('*.schema.json'):
 s=json.loads(path.read_text(encoding='utf8'));Draft202012Validator.check_schema(s)
for filename,schema in {'public_project.json':'PublicContent','contact_receipt.json':'ContactReceipt','draft_saved.json':'DraftSaved','publish_receipt.json':'PublishReceipt','problem_412.json':'Problem','private_draft.json':'PrivateDraft','session_created.json':'SessionCreated','public_site.json':'PublicSite'}.items():
 s=json.loads((root/'schemas'/(schema+'.schema.json')).read_text(encoding='utf8'))
 example=json.loads((root/'examples'/filename).read_text(encoding='utf8')); Draft202012Validator(s).validate(example)
with (root/'review/API34_QA_REGISTER.csv').open(encoding='utf8') as f:qa=list(csv.DictReader(f))
assert len(qa)==60 and all(x['status']=='NOT_RUN' for x in qa)
assert not (root/'api/openapi-3.1.2-candidate.json').stat().st_size<1000
print('STATIC DOCUMENT VALIDATION PASSED: 29 proposed API operations,',len(inventory),'inventory entries,',len(qa),'unexecuted QA plans.')
print('NOT EVIDENCE OF RUNNING HTTP, AUTH, DATABASE, SECURITY, BROWSER OR WCAG TESTS')
