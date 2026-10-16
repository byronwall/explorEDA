#!/usr/bin/env python3
"""Create and verify the portable archive and manifest. No network or repository writes.
Run after rebuilding and reviewing validation reports. Existing ZIP is replaced.
"""
from __future__ import annotations
import collections,hashlib,json,stat,sys,zipfile
from pathlib import Path,PurePosixPath
ROOT=Path(__file__).resolve().parents[2]
ZIP=ROOT/'exploreda-daily-viz-corpus.zip'
MANIFEST=ROOT/'manifest.json'
AUDIT=ROOT/'evidence/validation/archive-audit.json'
def sha(data:bytes)->str:return hashlib.sha256(data).hexdigest()
def safe(name:str)->bool:
    p=PurePosixPath(name)
    return bool(name) and not p.is_absolute() and '..' not in p.parts and '\\' not in name

def payload():
    return sorted(p for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix!='.pyc' and p not in (ZIP, ZIP.with_name(ZIP.name+'.sha256')))

def write_manifest():
    catalog=json.loads((ROOT/'catalog.json').read_text());datasets=json.loads((ROOT/'datasets.json').read_text())
    paths=[p for p in payload() if p!=MANIFEST]
    records=[{'path':p.relative_to(ROOT).as_posix(),'size_bytes':p.stat().st_size,'sha256':sha(p.read_bytes())} for p in paths]
    records.append({'path':'manifest.json','size_bytes':0,'sha256':None,'hash_omission_reason':'The manifest does not hash itself; ZIP SHA-256 is supplied in an external companion.'})
    records.sort(key=lambda x:x['path'])
    result={'schema_version':1,'repository':'byronwall/explorEDA','baseline':'ea8b52ff742f11d1fb89457acabbcd27b0bd04e7','delivery_status':'authored-local-data-evidence-complete; pending native compiler, browser and integration verification','delivered_counts':dict(collections.Counter(p['kind'] for p in catalog)),'target_counts':{'notebook':40,'composition':25,'dashboard':10},'dataset_families':len(datasets),'new_dataset_families_conservative':sum(d['existing_material_status']=='new' for d in datasets),'prepared_tables':sum(len(d['output_tables']) for d in datasets),'prepared_rows_across_grains':sum(d['output_row_count'] for d in datasets),'computed_finding_records':150,'distinct_finding_expressions':80,'native_compiler_verified_entries':0,'browser_verified_entries':0,'repository_files_or_commits_created':False,'file_count':len(records),'total_uncompressed_bytes':0,'files':records}
    if (ROOT/'integration.json').exists():
        local=json.loads((ROOT/'integration.json').read_text())
        result.update(delivery_status=local['status'],native_compiler_verified_entries=local['native_compiler_verified_entries'],browser_verified_entries=local['browser_verified_entries'],repository_files_or_commits_created=True)
    own=next(x for x in records if x['path']=='manifest.json')
    for _ in range(20):
        result['total_uncompressed_bytes']=sum(x['size_bytes'] for x in records)
        data=(json.dumps(result,ensure_ascii=False,indent=2,allow_nan=False)+'\n').encode()
        if own['size_bytes']==len(data):MANIFEST.write_bytes(data);return result
        own['size_bytes']=len(data)
    raise RuntimeError('Manifest own-size did not converge')

def write_zip():
    with zipfile.ZipFile(ZIP,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for p in payload():
            name=p.relative_to(ROOT).as_posix()
            if not safe(name) or p.is_symlink():raise ValueError(f'Unsafe archive member {name}')
            # Fixed archive timestamps make packaging independent of filesystem mtimes.
            info=zipfile.ZipInfo(name,date_time=(1980,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
            info.external_attr=(stat.S_IFREG|0o644)<<16
            z.writestr(info,p.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)

def audit_zip():
    with zipfile.ZipFile(ZIP) as z:
        infos=z.infolist();names=[i.filename for i in infos]
        if len(names)!=len(set(names)):raise ValueError('Duplicate ZIP members')
        if not all(safe(n) for n in names):raise ValueError('Unsafe ZIP path')
        if any(stat.S_ISLNK(i.external_attr>>16) for i in infos):raise ValueError('ZIP symlink')
        bad=z.testzip()
        if bad:raise ValueError(f'ZIP CRC failure {bad}')
        manifest=json.loads(z.read('manifest.json'));records=manifest['files']
        if set(names)!={r['path'] for r in records}:raise ValueError('Manifest member mismatch')
        for r in records:
            data=z.read(r['path'])
            if len(data)!=r['size_bytes']:raise ValueError(f'Size mismatch {r["path"]}')
            if r['sha256'] is not None and sha(data)!=r['sha256']:raise ValueError(f'Hash mismatch {r["path"]}')
        catalog=json.loads(z.read('catalog.json'))
        for p in catalog:
            for ref in [p['entry_path'],p['project_path'],*p['evidence_paths']]:
                if ref not in names:raise ValueError(f'Unresolved catalogue path in ZIP: {ref}')
        return {'status':'passed','archive_file_name':ZIP.name,'member_count':len(names),'safe_relative_paths':True,'duplicate_members':0,'symlinks':0,'crc_test':'passed','member_sizes_match_manifest':True,'sha256_matches_manifest_except_self':True,'catalogue_entries_resolve_inside_archive':len(catalog),'manifest_self_hash':'intentionally omitted; own size verified','archive_sha256':'external .zip.sha256 companion, not recursively embedded','native_dsl_compilation':'see integration.json','browser_rendering':'see integration.json for exact scope'}

if __name__=='__main__':
    for name in ('static-audit.json','reproducibility.json','notebook-parser.json'):
        report=json.loads((ROOT/'evidence/validation'/name).read_text())
        if report['status']!='passed':raise RuntimeError(f'Cannot package a failed audit: {name}')
    AUDIT.parent.mkdir(parents=True,exist_ok=True)
    if not AUDIT.exists():AUDIT.write_text('{}\n')
    write_manifest();write_zip();first=audit_zip()
    AUDIT.write_text(json.dumps(first,indent=2)+'\n')
    manifest=write_manifest();write_zip();final=audit_zip()
    if final!=first:raise RuntimeError('Final archive audit changed after embedding report')
    digest=sha(ZIP.read_bytes());checksum=ZIP.with_name(ZIP.name+'.sha256')
    checksum.write_text(f'{digest}  {ZIP.name}\n')
    print(json.dumps({'zip':str(ZIP),'zip_size_bytes':ZIP.stat().st_size,'sha256':digest,'file_count':manifest['file_count'],'uncompressed_bytes':manifest['total_uncompressed_bytes'],'archive_status':final['status'],'delivered_counts':manifest['delivered_counts']},indent=2))
