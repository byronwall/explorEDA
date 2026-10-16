#!/usr/bin/env python3
"""Offline corpus audit. This is NOT the explorEDA DSL compiler or renderer.
Run from any directory: python /path/to/corpus/evidence/scripts/validate.py
Only reads trusted corpus files and writes evidence/validation/static-audit.json.
"""
from __future__ import annotations
import collections, csv, hashlib, json, math, re, sys
from pathlib import Path, PurePosixPath
import pandas as pd
import build as B
ROOT=Path(__file__).resolve().parents[2]
ERRORS=[]; CHECKS=[]
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def require(ok, message):
    if not ok: ERRORS.append(message)
def load(path): return json.loads((ROOT/path).read_text(encoding='utf-8'))
def safe(path):
    p=PurePosixPath(path)
    return bool(path) and not p.is_absolute() and '..' not in p.parts and '\\' not in path

def unquote(text):
    return re.sub(r'"(?:\\.|[^"\\])*"', '""', text)

def main():
    catalog=load('catalog.json');datasets=load('datasets.json');tables=load('evidence/prepared-tables.json')
    ids=[x['id'] for x in catalog]
    require(len(ids)==len(set(ids)), 'Duplicate catalog IDs')
    counts=dict(collections.Counter(x['kind'] for x in catalog))
    require(counts=={'notebook':40,'composition':25,'dashboard':10}, f'Wrong counts {counts}')
    require(len({x['entry_path'] for x in catalog})==75,'Entry path reused')
    require(len({x['title'] for x in catalog})==75,'Duplicate editorial titles')
    require(len({x['proposed_slug'] for x in catalog})==75,'Duplicate public slugs')
    require(sorted(x['release_order'] for x in catalog)==list(range(1,76)),'Release order is not 1–75')
    require(len(datasets)==17,'Dataset count not 17')
    required=('id','kind','title','description','topic','question','dataset_ids','entry_path','project_path','verified_findings','evidence_paths','capability_tags','related_ids','series_id','search_intent','proposed_slug','readiness','release_order')
    file_hashes=set();chart_counts=collections.Counter();finding_count=0;unique_findings=set();field_bindings=0
    json_paths=list(ROOT.rglob('*.json'))
    for path in json_paths:
        try: json.loads(path.read_text(encoding='utf-8'),parse_constant=lambda x: (_ for _ in ()).throw(ValueError(x)))
        except Exception as e: require(False,f'Invalid JSON {path.relative_to(ROOT)}: {e}')
    csv_paths=list(ROOT.rglob('*.csv'))
    for path in csv_paths:
        with path.open(newline='',encoding='utf-8-sig') as f:
            rows=list(csv.reader(f))
        require(bool(rows),f'Empty CSV {path}')
        # Scikit-learn's first CSV row is metadata, not a standard header.
        special=path.parent.name=='raw' and path.name in ('iris.csv','wine.csv')
        widths=[len(row) for row in rows[1:] if row]
        require(len(set(widths))<=1 and (special or not widths or widths[0]==len(rows[0])),f'Ragged CSV {path}')
    project_queries={};qualified={}; table_count=0;prepared_rows=0
    for family, ts in tables.items():
        text=(ROOT/f'projects/{family}/exploreda.eda').read_text()
        project_queries[family]=set(re.findall(r'^query @([\w-]+)',text,re.M))
        qualified[family]={f'{sid}.{f["name"]}' for sid,t in ts.items() for f in t['fields']}
        for sid,t in ts.items():
            table_count+=1;require(safe(t['path']),f'Unsafe table path {t["path"]}')
            p=ROOT/t['path'];require(p.is_file(),f'Missing table {p}')
            require(sha(p)==t['sha256'],f'Table hash mismatch {p}')
            df=pd.read_csv(p,dtype={f['name']:str for f in t['fields'] if f['type']=='string'})
            prepared_rows+=len(df)
            require(len(df)==t['row_count'],f'Wrong row count {p}')
            require(df.columns.tolist()==[f['name'] for f in t['fields']],f'Field order/names mismatch {p}')
            require(df[t['key']].notna().all() and df[t['key']].is_unique,f'Invalid primary key {p}')
            require(sid in project_queries[family],f'Missing explicit identity query {family}/{sid}')
            m=re.search(r'^source @'+re.escape(sid)+r'\b[^\n]*path=([^\s]+)\s*\{([\s\S]*?)^\}',text,re.M)
            require(m is not None,f'Missing source declaration {family}/{sid}')
            if m:
                require(safe(m[1]) and (ROOT/f'projects/{family}'/m[1]).resolve()==p.resolve(),f'Source path mismatch {family}/{sid}')
                declarations=re.findall(r'^\s*field ([\w]+) "([^"]+)" (string|number|date)\s*$',m[2],re.M)
                require(declarations==[(f['name'],f['name'].replace('_',' '),f['type']) for f in t['fields']],f'Source field contract mismatch {family}/{sid}')
            for f in t['fields']:
                require(int(df[f['name']].isna().sum())==f['missing_count'],f'Missingness mismatch {family}/{sid}/{f["name"]}')
                if f['type']=='number':
                    v=df[f['name']].dropna();require(pd.to_numeric(v,errors='coerce').notna().all(),f'Non-numeric value {family}/{sid}/{f["name"]}')
        if family=='grunfeld': qualified[family]|={f'company.{f["name"]}' for f in ts['firms']['fields']}
        if family=='football':
            qualified[family]|={f'squad.{f["name"]}' for f in ts['teams']['fields']}
            qualified[family]|={f'match.{f["name"]}' for f in ts['r']['fields']}
    require(table_count==32, f'Expected 32 tables, got {table_count}')
    notebook_index={x['id']:x for x in load('evidence/validation/notebook-parser.json')['results']}
    for item in catalog:
        id_=item['id'];family=item['dataset_ids'][0]
        for key in required: require(key in item and item[key] not in ('',[],None),f'{id_}: missing {key}')
        for path in [item['entry_path'],item['project_path'],*item['evidence_paths'],*([item['companion_path']] if 'companion_path' in item else [])]:
            require(safe(path) and (ROOT/path).is_file(),f'{id_}: unresolved path {path}')
        require(all(x in ids and x!=id_ for x in item['related_ids']),f'{id_}: invalid related IDs')
        require(item['query_id'] in project_queries[family],f'{id_}: unknown query')
        require(item['readiness']=='pending-local-compiler-verification' and item['compiler_status']=='not-run',f'{id_}: false compiler status')
        text=(ROOT/item['entry_path']).read_text();require(len(text)>500,f'{id_}: empty/outline entry')
        h=sha(ROOT/item['entry_path']);require(h not in file_hashes,f'{id_}: duplicate piece bytes');file_hashes.add(h)
        blocks=re.findall(r'^```eda\s*\n(.*?)^```\s*$',text,re.M|re.S) if item['kind']=='notebook' else [text]
        dsl='\n'.join(blocks)
        require(f'eda query={item["query_id"]}' in dsl,f'{id_}: wrong query binding')
        naked=unquote(dsl);require(naked.count('{')==naked.count('}'),f'{id_}: unbalanced braces')
        aliases=re.findall(r'^([\w]+):(num|cat|date)=([\w]+\.[\w]+)',dsl,re.M)
        for name,type_,field in aliases:
            require(name not in B.RESERVED,f'{id_}: reserved alias {name}')
            require(field in qualified[family],f'{id_}: unknown source field {field}');field_bindings+=1
        # Exact source namespaces, including explicit lookup aliases. Not a general DSL parser.
        namespaces={v.split('.')[0] for v in qualified[family]}
        for ns in namespaces:
            for field in re.findall(r'(?<![\w.])'+re.escape(ns)+r'\.([A-Za-z_][A-Za-z0-9_]*)',dsl):
                require(f'{ns}.{field}' in qualified[family],f'{id_}: unknown qualified field {ns}.{field}');field_bindings+=1
        declarations=re.findall(r'^\s*(scatter|hist|row|bar|line|boxplot|ecdf|heatmap|parallel|metric|table|markdown|composition)\s+@',dsl,re.M)
        chart_counts.update(declarations)
        if item['kind']=='notebook':
            require(len(blocks)==6 and len(declarations)==5,f'{id_}: notebook needs four analytical steps plus table')
            require(id_ in notebook_index,f'{id_}: actual fence parser proof absent')
            require('## Limits' in text and '## What the comparison supports' in text,f'{id_}: missing interpretation or caveat')
        elif item['kind']=='dashboard':require(len(declarations)==8,f'{id_}: dashboard panel count {len(declarations)}')
        else: require(declarations==['composition'],f'{id_}: composition container count')
        ev=load(item['evidence_paths'][0]);require(len(ev['findings'])>=2,f'{id_}: not enough verified findings')
        visible=text+'\n'+((ROOT/item['companion_path']).read_text() if 'companion_path' in item else '')
        for f in ev['findings']:
            finding_count+=1
            actual=B.calculate(family,ev['data_query'],f['expression'])
            for key in actual:
                require(math.isclose(actual[key], f[key], rel_tol=1e-12, abs_tol=1e-12) if key == 'value' else actual[key] == f[key], f'{id_}: recomputation mismatch {f["id"]}/{key}')
            require(f['statement'] in visible,f'{id_}: evidence statement missing from entry or companion')
            require(any(v['id']==f['id'] and v['statement']==f['statement'] for v in item['verified_findings']),f'{id_}: catalog finding mismatch')
            unique_findings.add(json.dumps([family,ev['data_query'],f['expression']],sort_keys=True))
    # Audits of the exact related tables, independent of native query execution.
    gr=B.source('grunfeld','r'); firms=B.source('grunfeld','firms')
    gj=gr.merge(firms,on='firm',how='left',validate='many_to_one',suffixes=('','_company'),indicator=True)
    require(len(gj)==len(gr) and gj['_merge'].eq('both').all(),'Grunfeld lookup changes population or misses firm')
    require(math.isclose(gj.invest.sum(),gr.invest.sum()),'Grunfeld lookup changes investment total')
    ap=B.source('football','appearances'); teams=B.source('football','teams'); matches=B.source('football','r')
    fj=ap.merge(teams,on='team',how='left',validate='many_to_one',suffixes=('','_squad'),indicator=True)
    require(len(fj)==96 and fj['_merge'].eq('both').all(),'Team lookup cardinality/coverage')
    mj=ap.merge(matches,left_on='match_id',right_on='id',how='left',validate='many_to_one',suffixes=('','_match'),indicator=True)
    require(len(mj)==96 and mj['_merge'].eq('both').all(),'Match lookup cardinality/coverage')
    require(ap.match_id.value_counts().eq(2).all() and ap.team.value_counts().eq(3).all(),'Football match/team grain invariants')
    # Inspect documented license basis and retained source/output fingerprints; not legal certification.
    for d in datasets:
        require(d['license_status']=='redistribution-supported-by-publisher-statement',f'License blocked {d["id"]}')
        for key in ('source_landing_url','direct_download_url','license_url','license_evidence_url'):
            require(d[key].startswith('https://'),f'{d["id"]}: missing authoritative URL {key}')
        require(sha(ROOT/d['raw_path'])==d['source_sha256'],f'{d["id"]}: raw hash mismatch')
        require((ROOT/d['license_evidence_path']).is_file(),f'{d["id"]}: no rights record')
    require(not any('barley' in p.name for p in ROOT.rglob('*')), 'Blocked barley data accidentally bundled')
    release=list(csv.DictReader((ROOT/'release-plan.csv').open(newline='')))
    require(len(release)==75 and [x['id'] for x in release]==[x['id'] for x in sorted(catalog,key=lambda x:x['release_order'])],'Release CSV does not match catalog')
    CHECKS.extend(['JSON strict parse','CSV rectangularity with documented scikit-learn metadata exception','distinct physical artifact counts and content hashes','catalog paths and related IDs','release order and CSV parity','local project sources, identity queries and typed field contracts','declared field missingness and table primary keys','qualified field references and reserved aliases','notebook structure and actual fence-parser proof references','all finding expressions recomputed from exact CSV bytes','raw and prepared SHA-256 verification','many-to-one lookup cardinality, coverage and population preservation','documented license records present; blocked barley excluded'])
    out=dict(status='passed' if not ERRORS else 'failed',scope='offline structural/data/evidence audit; NOT native DSL compilation or rendering',delivered_counts=counts,dataset_families=len(datasets),prepared_tables=table_count,prepared_rows=prepared_rows,computed_finding_records=finding_count,distinct_finding_expressions=len(unique_findings),qualified_bindings_checked=field_bindings,json_files_parsed=len(json_paths),csv_files_parsed=len(csv_paths),chart_declarations=dict(chart_counts),checks=CHECKS,lookup_audits={'grunfeld':{'base_rows':len(gr),'joined_rows':len(gj),'matched_rows':int(gj['_merge'].eq('both').sum()),'cardinality':'many-to-one'},'football_teams':{'base_rows':len(ap),'joined_rows':len(fj),'matched_rows':int(fj['_merge'].eq('both').sum()),'cardinality':'many-to-one'},'football_matches':{'base_rows':len(ap),'joined_rows':len(mj),'matched_rows':int(mj['_merge'].eq('both').sum()),'cardinality':'many-to-one'}},native_dsl_compilations=0,browser_checks=0,errors=ERRORS)
    B.dump(ROOT/'evidence/validation/static-audit.json',out)
    print(json.dumps(out,indent=2));return 0 if not ERRORS else 1
if __name__=='__main__':sys.exit(main())
