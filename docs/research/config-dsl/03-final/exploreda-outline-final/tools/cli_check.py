"""Exercise published CLI commands and refresh example evidence without writes."""
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile

root = Path(__file__).resolve().parent.parent
cli = ['node', 'checker/cli.mjs']
results = []

def run(*args):
    return subprocess.run(cli + list(args), cwd=root, text=True, capture_output=True, timeout=15)

for example in sorted((root / 'examples').glob('*.final.eda')):
    result = run('check', str(example), '--catalog', 'examples/final-catalog.json', '--json')
    expected = 1 if example.name == 'invalid.final.eda' else 0
    assert result.returncode == expected, (example.name, result.stdout, result.stderr)
    response = json.loads(result.stdout)
    assert response['productionReady'] is False
    assert response['documentSHA256'] == hashlib.sha256(example.read_bytes()).hexdigest()
    (root / 'evidence' / (example.stem + '.json')).write_text(result.stdout)
    results.append({'case': example.name, 'pass': True, 'exit': result.returncode})

invalid = root / 'examples/invalid.final.eda'
before = invalid.read_text()
repaired = run('apply', str(invalid), 'examples/repair.patch.json')
assert repaired.returncode == 0, repaired.stderr
assert repaired.stdout == before.replace('cots', 'cost')
assert invalid.read_text() == before
results.append({'case': 'guarded repair changes only the expected typo, stdout only', 'pass': True})

request = json.loads((root / 'examples/repair.patch.json').read_text())
request['documentSHA256'] = '0' * 64
with tempfile.TemporaryDirectory() as directory:
    bad_patch = Path(directory) / 'stale.patch.json'
    bad_patch.write_text(json.dumps(request))
    result = run('apply', str(invalid), str(bad_patch), '--write')
    assert result.returncode == 2 and 'Stale documentSHA256' in result.stderr
    assert invalid.read_text() == before
results.append({'case': 'stale SHA-256 rejects --write and leaves source unchanged', 'pass': True})

result = run('check', 'examples/order-book.final.eda', '--catalog', 'examples/final-catalog.json', '--strict')
assert result.returncode == 0, result.stdout
results.append({'case': 'strict complete fixture passes', 'pass': True})

result = run('check', 'examples/order-book.final.eda', '--strict')
assert result.returncode == 2, result.stdout
results.append({'case': 'strict mode blocks deferred source validation', 'pass': True})

result = run('explain', 'examples/order-book.final.eda', '--chart', 'profit', '--catalog', 'examples/final-catalog.json')
assert result.returncode == 0, result.stderr
response = json.loads(result.stdout)
assert response['chart']['id'] == 'profit'
assert response['chart']['filters'] == [{'type': 'range', 'field': 'profit', 'min': 0}]
assert response['productionReady'] is False
(root / 'evidence/explain-profit.json').write_text(result.stdout)
results.append({'case': 'explain reports the intended chart and its filter', 'pass': True})

result = run('format', 'examples/order-book.final.eda', '--width', '50')
assert result.returncode == 0
assert 'calc rate=revenue==0 ? null : profit/revenue' in result.stdout
results.append({'case': 'formatter keeps expression body intact', 'pass': True})

result = run('schema')
assert result.returncode == 0 and json.loads(result.stdout)['language'] == 'eda 3 flat'
results.append({'case': 'schema returns machine-readable capabilities', 'pass': True})

result = run('check', 'examples/invalid.final.eda', '--catalog', 'examples/final-catalog.json')
(root / 'evidence/invalid-diagnostics.txt').write_text(result.stdout)
(root / 'evidence/cli-checks.json').write_text(json.dumps({'cases': results}, indent=2) + '\n')
print(f'[outline] {len(results)} CLI checks passed; all final example evidence refreshed.')
