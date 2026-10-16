#!/usr/bin/env python3
"""Capture installed public datasets without network access. Reference acquisition only.
Normal regeneration uses bundled raw files, not installed dataset libraries.
"""
from pathlib import Path
import importlib, importlib.metadata, json, hashlib, shutil
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[2]
RAW=ROOT/'evidence/raw'; RAW.mkdir(exist_ok=True,parents=True)
def sha(b): return hashlib.sha256(b).hexdigest()
records=[]
for name in ['co2','elnino','sunspots','nile','macrodata','grunfeld','stackloss','engel','strikes','danish_data','fertility','longley']:
    m=importlib.import_module(f'statsmodels.datasets.{name}.data')
    assert 'public domain' in m.COPYRIGHT.lower() or name=='fertility', f'License gate: {name}'
    files=list(Path(m.__file__).parent.glob('*.csv'))
    assert len(files)==1,(name,files)
    original=files[0]; target=RAW/(name+'.csv'); shutil.copyfile(original,target)
    rec={'id':name,'acquisition_method':'copied from installed package; no network download claimed',
         'package':'statsmodels','package_version':importlib.metadata.version('statsmodels'),
         'package_relative_path':f'statsmodels/datasets/{name}/{original.name}',
         'source_landing_url':f'https://www.statsmodels.org/stable/datasets/generated/{name}.html',
         'direct_download_url':f'https://raw.githubusercontent.com/statsmodels/statsmodels/v{importlib.metadata.version("statsmodels")}/statsmodels/datasets/{name}/{original.name}',
         'title':m.TITLE,'copyright':m.COPYRIGHT,'original_source':m.SOURCE,'source_notes':m.NOTE,
         'retrieval_time_utc':datetime.now(timezone.utc).isoformat(),'raw_path':str(target.relative_to(ROOT)),
         'sha256':sha(target.read_bytes()),'bytes':target.stat().st_size}
    records.append(rec)
    print('PRESERVED', name,target.stat().st_size)
for name,filename in [('iris','iris.csv'),('wine','wine_data.csv')]:
    import sklearn
    original=Path(sklearn.__file__).parent/'datasets/data'/filename
    target=RAW/(name+'.csv');shutil.copyfile(original,target)
    records.append({'id':name,'acquisition_method':'copied from installed package; no network download claimed',
        'package':'scikit-learn','package_version':importlib.metadata.version('scikit-learn'),
        'package_relative_path':f'sklearn/datasets/data/{filename}',
        'source_landing_url':'https://archive.ics.uci.edu/dataset/'+('53/iris' if name=='iris' else '109/wine'),
        'direct_download_url':f'https://raw.githubusercontent.com/scikit-learn/scikit-learn/{sklearn.__version__}/sklearn/datasets/data/{filename}',
        'retrieval_time_utc':datetime.now(timezone.utc).isoformat(),'raw_path':str(target.relative_to(ROOT)),
        'sha256':sha(target.read_bytes()),'bytes':target.stat().st_size})
(ROOT/'evidence/acquisition.json').write_text(json.dumps(records,indent=2)+'\n')
