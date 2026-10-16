#!/usr/bin/env python3
"""Build original notebook prose and real DSL from editorial.py; recompute evidence from CSV.
No network, shell commands, arbitrary eval, fabricated rows, or synthetic measurements.
"""
from __future__ import annotations
import csv,hashlib,json,re,sys,math
from pathlib import Path
import numpy as np
import pandas as pd
from editorial import NOTEBOOKS
ROOT=Path(__file__).resolve().parents[2]
TABLES=json.loads((ROOT/'evidence/prepared-tables.json').read_text())
CATALOG=[]

def dump(path,obj):
    path=Path(path);path.parent.mkdir(exist_ok=True,parents=True)
    path.write_text(json.dumps(obj,ensure_ascii=False,indent=2,allow_nan=False)+'\n')

def quote(s): return json.dumps(str(s),ensure_ascii=False)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def source(family,query):
    # Every notebook uses an explicit source identity query. Linked dashboard queries are handled explicitly.
    return pd.read_csv(ROOT/TABLES[family][query]['path'],dtype={'id':str})

def select(df,where):
    out=df
    for field,op,value in where or []:
        v=out[field]
        if op=='eq': mask=v.eq(value)
        elif op=='ne':mask=v.ne(value)
        elif op=='lt':mask=v.lt(value)
        elif op=='le':mask=v.le(value)
        elif op=='gt':mask=v.gt(value)
        elif op=='ge':mask=v.ge(value)
        elif op=='in':mask=v.isin(value)
        else:raise ValueError(f'Unknown predicate {op}')
        out=out[mask]
    return out

def calculate(family,query,spec):
    df=source(family,query);d=select(df,spec.get('where',[]));op=spec['op'];field=spec['field']
    if op in ['share','missing_share','missing_count','count','nunique']:
        valid=d;denominator=len(d)
    elif op=='corr':valid=d.dropna(subset=[field,spec['other']]);denominator=len(valid)
    elif op in ['ratio_sums','weighted_mean']:valid=d.dropna(subset=[field,spec.get('other',spec.get('weight'))]);denominator=float(valid[spec.get('other',spec.get('weight'))].sum())
    else:valid=d.dropna(subset=[field]);denominator=len(valid)
    assert denominator>0,(family,query,spec,'empty denominator')
    v=valid[field]
    numerator=None
    if op=='mean':value=float(v.mean())
    elif op=='median':value=float(v.median())
    elif op=='min':value=float(v.min())
    elif op=='max':value=float(v.max())
    elif op=='sum':value=float(v.sum())
    elif op=='quantile':value=float(v.quantile(spec['q'],interpolation='linear'))
    elif op=='corr':value=float(valid[field].corr(valid[spec['other']]))
    elif op=='count':value=float(len(d))
    elif op=='nunique':value=float(d[field].nunique())
    elif op=='missing_count':value=float(d[field].isna().sum())
    elif op=='missing_share':numerator=int(d[field].isna().sum());value=100*numerator/len(d)
    elif op=='share':numerator=len(select(d,spec['condition']));value=100*numerator/len(d)
    elif op=='ratio_sums':numerator=float(v.sum());value=spec.get('scale',1)*numerator/denominator
    elif op=='weighted_mean':numerator=float((valid[field]*valid[spec['weight']]).sum());value=numerator/denominator
    elif op=='top_share':
        denominator=float(v.sum());numerator=float(v.nlargest(spec['k']).sum());value=100*numerator/denominator
    else:raise ValueError(op)
    assert math.isfinite(value),(family,query,spec)
    text=spec['sentence'].format(value=value)
    rounding=re.search(r'\{value:([^}]+)\}',spec['sentence'])
    unit=next(f['unit'] for f in TABLES[family][query]['fields'] if f['name']==field)
    return dict(statement=text,value=value,operation=op,field=field,unit=('%' if op in ['share','missing_share','top_share'] else 'Pearson correlation coefficient' if op=='corr' else '%' if op=='ratio_sums' and spec.get('scale')==100 else unit),
                denominator=denominator,denominator_definition='sum of denominator/weight values' if op in ['ratio_sums','weighted_mean','top_share'] else 'eligible rows after the declared filter and required-field null exclusions',
                numerator=numerator,input_rows=len(df),filtered_rows=len(d),eligible_rows=len(valid),excluded_for_missing=len(d)-len(valid),
                filter=spec.get('where',[]),expression=spec,rounding=rounding.group(1) if rounding else 'none',
                data_path=TABLES[family][query]['path'],data_sha256=sha(ROOT/TABLES[family][query]['path']),
                contributing_row_ids=valid.id.tolist(),reproduction='python evidence/scripts/build.py; calculate() uses the archived expression, no narrative constants')

def label(family,query,field):
    fields={f['name']:f for f in TABLES[family][query]['fields']}
    f=fields.get(field)
    if not f:return field.replace('_',' ')
    name=field.replace('_',' ')
    if field=='date':return 'UTC supplied hour' if family=='ercot' and query=='r' else 'Calendar date'
    if f['type']!='number' or field in ['year','month','quarter','order','sequence']:return name.capitalize()
    unit=f['unit']
    if 'ppmv' in unit:unit='ppmv'
    elif 'MWh' in unit:unit='MWh'
    elif 'degrees Celsius' in unit:unit='°C'
    elif 'source assay units' in unit or 'source units' in unit:unit='source units'
    elif '1947-dollar' in unit:unit='source 1947-dollar units'
    elif 'chained 2005' in unit:unit='billions, chained 2005 US$'
    elif 'Belgian francs' in unit:unit='Belgian francs, 1857'
    elif 'births per woman per' in unit:unit='births/woman/year'
    elif 'births per woman' in unit:unit='births/woman'
    elif 'centimetres' in unit:unit='cm'
    elif 'source rate fractions' in unit or 'rate units (fraction)' in unit:unit='source rate fractions'
    elif '10^8 cubic' in unit:unit='10^8 m³'
    elif '%' in unit:unit='%'
    elif 'sunspot' in unit:unit='sunspot number'
    elif len(unit)>38:unit='source units; see dictionary'
    return name.capitalize()+' ('+unit+')'

RESERVED=set('scatter hist histogram bar row metric table summary composition boxplot calendar ecdf heatmap line pivot parallel sankey hierarchy markdown map scale group rows filter eda dashboard grid theme source calc field chart view layout'.split())
def alias_name(field):return field+'_field' if field in RESERVED else field

def aliases(family,query):
    kinds={'number':'num','date':'date','string':'cat'}
    return '\n'.join(f'{alias_name(f["name"])}:{kinds[f["type"]]}={query}.{f["name"]} label={quote(label(family,query,f["name"]))}' for f in TABLES[family][query]['fields'])

def chart(step,id_,position=None,note=None,family=None,query=None):
    args,*children=step['args'].split(' | ')
    if family and query:
        for f in TABLES[family][query]['fields']:
            if f['name'] in RESERVED:
                args=re.sub(r'(?<![\w.])'+re.escape(f['name'])+r'(?![\w]|=)',alias_name(f['name']),args)
    s=f'{step["kind"]} @{id_} {args} title={quote(step["title"])}'
    if position:s+=f' at={position}'
    if note:s+=f' note={quote(note)}'
    if family and query:
        x=re.search(r'(?:^| )x=([a-z_][a-z0-9_]*)',args);y=re.search(r'(?:^| )y=([a-z_][a-z0-9_,]*)',args)
        if x:s+=' x.title='+quote(label(family,query,x.group(1)))
        if y:
            ys=y.group(1).split(',');title=label(family,query,ys[0]) if len(ys)==1 else ' / '.join(label(family,query,v) for v in ys)
            s+=' y.title='+quote(title)
        if step['kind'] in ['hist','ecdf','boxplot']:
            field=args.split()[0];axis='y' if step['kind']=='boxplot' else 'x'
            s+=f' {axis}.title='+quote(label(family,query,field))
            if step['kind']=='hist':s+=' y.title="Source rows"'
        if step['kind']=='row':s+=' x.title="Source rows"'
    if children:s+=' {\n  '+'\n  '.join(children)+'\n}'
    return s

def evidence_for(n,id_):
    fs=[]
    for i,spec in enumerate(n['findings']):
        result=calculate(n['family'],n['query'],spec);result['id']=f'{id_}-finding-{i+1}';fs.append(result)
    path=f'evidence/findings/{id_}.json'
    dump(ROOT/path,dict(piece_id=id_,data_query=n['query'],findings=fs))
    return fs,path

def base_record(n,id_,kind,path,fs,evidence):
    return dict(id=id_,kind=kind,title=n['title'],description=n['question']+' '+n['conclusion'],topic=n['family'],question=n['question'],dataset_ids=[n['family']],
                entry_path=path,project_path=f'projects/{n["family"]}/exploreda.eda',query_id=n['query'],
                verified_findings=[dict(id=f['id'],statement=f['statement'],evidence_path=evidence+'#'+f['id']) for f in fs],evidence_paths=[evidence,f'evidence/fields/{n["family"]}.json'],
                capability_tags=[],related_ids=[],series_id='different-questions-same-data' if n['family'] in ['ercot','co2','elnino','fertility','football'] else 'measurement-and-comparison',
                search_intent=n['question'],proposed_slug=n['slug'],readiness='pending-local-compiler-verification',
                content_status='authored-with-local-data-and-computed-evidence',compiler_status='not-run',browser_status='not-run',release_order=0)

def build_notebooks():
    for n in NOTEBOOKS:
        family,query=n['family'],n['query'];id_=f'nb-{family}-{n["slug"]}'
        fs,ep=evidence_for(n,id_);path=f'projects/{family}/{n["slug"]}.eda.md'
        lines=[f'# {n["title"]}','',f'**Reader question.** {n["question"]}','',
               f'**Population.** {TABLES[family][query]["grain"]}. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.','',
               '```eda',f'eda query={query}',aliases(family,query),'```','']
        for i,step in enumerate(n['steps']):
            lines.extend([f'## {i+1}. {step["title"]}','',step['prose'],'','```eda',chart(step,f'{id_}-chart-{i+1}',family=family,query=query),'```',''])
            if i in [1,3]:
                f=fs[0 if i==1 else 1]
                lines.extend([f'**Computed finding.** {f["statement"]} This calculation uses {f["eligible_rows"]:,} eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../{ep}).',''])
        lines+=['## 5. Inspect the records behind the comparison','',
                'The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.','',
                '```eda',f'table @{id_}-records '+','.join(alias_name(f) for f in n['table'])+' title="Records behind this comparison"','```','',
                '## What the comparison supports','',n['conclusion'],'','## Limits','',n['caveat'],'',
                '## Source and preparation','', next(d['required_page_credit'] for d in json.loads((ROOT/'datasets.json').read_text()) if d['id']==family),'',
                f'Data credit and license: [{family} provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/{family}.json) gives units and missingness for every field. '
                f'[Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../{ep}) records filters, denominators, source-row IDs, and CSV hashes.','',
                '**Reading units.** '+ '; '.join(f'{f["name"]}: {f["unit"]}' for f in TABLES[family][query]['fields'] if f['name'] in n['table'] and f['type']=='number')+'.','']
        (ROOT/path).write_text('\n'.join(lines),encoding='utf-8')
        r=base_record(n,id_,'notebook',path,fs,ep);r['capability_tags']=sorted({s['kind'] for s in n['steps']}|{'narrative','field-contracts','source-table','chart-local-selection'});r['chart_steps']=5
        CATALOG.append(r)
        print('AUTHORED',id_)
    dump(ROOT/'catalog.json',CATALOG)
    dump(ROOT/'evidence/editorial-specifications.json',NOTEBOOKS)

if __name__=='__main__':
    build_notebooks()
    # Optional modules are imported only after notebooks have been preserved.
    from composed import build_compositions, build_dashboards
    build_compositions(CATALOG)
    build_dashboards(CATALOG)
    dump(ROOT/'catalog.json',CATALOG)
    print('CORPUS ENTRIES',len(CATALOG))
