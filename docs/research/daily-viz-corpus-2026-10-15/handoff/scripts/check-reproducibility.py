#!/usr/bin/env python3
"""Run the reviewed deterministic build twice and compare all generated payload bytes.
No network or Git operations. This invokes only the named, bundled Python scripts.
"""
from __future__ import annotations
import hashlib,json,os,platform,subprocess,sys
from pathlib import Path
import numpy,pandas
ROOT=Path(__file__).resolve().parents[2]
SCRIPTS=Path(__file__).resolve().parent
NAMES=('prepare.py','provenance.py','build.py','finalize.py')
def fingerprint():
    paths=[]
    for folder in ('projects','evidence/fields','evidence/findings','evidence/licenses'):
        paths.extend((ROOT/folder).rglob('*'))
    paths.extend(ROOT/x for x in ('catalog.json','datasets.json','sources.json','README.md','report.md','release-plan.csv','gaps.json','evidence/prepared-tables.json','evidence/editorial-specifications.json','evidence/composition-specifications.json','evidence/dashboard-specifications.json','evidence/RUNSHEET.md','evidence/requirements.txt'))
    return {p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(paths)) if p.is_file()}
def run():
    env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1')
    for name in NAMES:
        result=subprocess.run([sys.executable,str(SCRIPTS/name)],cwd=ROOT,env=env,text=True,capture_output=True,check=False)
        if result.returncode:
            print(result.stdout);print(result.stderr,file=sys.stderr);raise RuntimeError(f'{name} failed: {result.returncode}')
        print('REBUILT',name)
if __name__=='__main__':
    run();first=fingerprint();run();second=fingerprint()
    changes=[p for p in sorted(set(first)|set(second)) if first.get(p)!=second.get(p)]
    result={'status':'passed' if not changes else 'failed','method':'Two complete offline builds from the same bundled raw inputs; compare every generated project, prepared table, narrative/design, finding and catalogue/provenance/document byte','scripts':list(NAMES),'generated_files_compared':len(second),'identical_files':len(second)-len(changes),'changed_paths':changes,'input_policy':'Preserved source files are hash-checked by prepare.py; optional acquisition scripts not invoked','environment':{'python':platform.python_version(),'pandas':pandas.__version__,'numpy':numpy.__version__},'build_payload_sha256':second,'not_tested':['native DSL compilation','native query evaluation','browser rendering and interactions','independent original-source re-download']}
    (ROOT/'evidence/validation/reproducibility.json').write_text(json.dumps(result,indent=2)+'\n')
    print('REPRODUCIBILITY',result['status'],len(second),'files')
    if changes:sys.exit(1)
