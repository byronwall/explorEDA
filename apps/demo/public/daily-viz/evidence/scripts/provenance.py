#!/usr/bin/env python3
"""Build provenance records from preserved acquisition receipts and prepared-file hashes.
No refreshed API values are substituted for the historical source versions.
"""
from pathlib import Path
import json,hashlib,csv
import pandas as pd
ROOT=Path(__file__).resolve().parents[2]
BASE='ea8b52ff742f11d1fb89457acabbcd27b0bd04e7'
def dump(path,obj):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(obj,ensure_ascii=False,indent=2,allow_nan=False)+'\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
# Dataset-level facts come from the exact acquisition receipts and cited publisher documentation.
INFO={
'ercot':('ERCOT hourly served demand and day-ahead forecast','U.S. Energy Information Administration / ERCOT','time / energy','existing-repository-family','EIA source data already appears in packages/explorEDA/examples/forecast; new editorial analyses, not a new data source.'),
'co2':('Historical weekly Mauna Loa CO2','Keeling and Whorf; Scripps / CDIAC; distributed by statsmodels','environment / measurement','new','Atmospheric concentration is distinct from the demo’s per-capita emissions data.'),
'elnino':('Niño 1+2 monthly sea-surface temperatures','NOAA Climate Prediction Center, ERSST v3b; distributed by statsmodels','ocean / climate','new','Real monthly Niño 1+2 measurements; not the existing synthetic global-temperature fixture.'),
'sunspots':('Historical annual sunspot numbers','NOAA historical solar series; distributed by statsmodels','science / astronomy','new','Historical supplied revision; no current solar-series substitution.'),
'nile':('Annual Nile flow at Aswan','Historical Aswan observations; distributed by statsmodels','geography / water','new','Annual flow, not the existing weather or earthquake families.'),
'macro':('Historical US quarterly macroeconomic panel','U.S. public statistical sources; curated in statsmodels','economy / time','new','New historical quarterly panel; not World Bank country-year data.'),
'grunfeld':('Grunfeld firm investment panel','Grunfeld; Kleiber and Zeileis; distributed by statsmodels','industry / related tables','new','Historical firm-year investment observations, not synthetic shop transactions.'),
'stackloss':('Plant operating conditions and stack loss','Brownlee historical plant data; distributed by statsmodels','science / industry','new','Small real operating-day process sample.'),
'engel':('Engel household food expenditure','Engel historical Belgian household survey; distributed by statsmodels','everyday life / expenditure','new','Historical food expenditure, not a modern spending or time-use survey.'),
'strikes':('Selected manufacturing strike durations','U.S. Bureau of Labor Statistics; Kennan; distributed by statsmodels','labor / duration','new','Selected historical labor disputes; completed recorded durations.'),
'danish':('Danish quarterly money and income data','Johansen and Juselius; distributed by statsmodels','economy / rates','new','Historical Danish monetary sample with source log and rate-fraction units.'),
'fertility':('Selected historical World Bank fertility rates','World Bank; UN Population Division and national statistical sources; historical statsmodels snapshot','geography / demographic measurement','related-existing-demo-family','New SP.DYN.TFRT.IN indicator and historical vintage within the already represented World Bank family.'),
'iris':('Iris flower measurements, corrected variant','R. A. Fisher / UCI Machine Learning Repository; scikit-learn corrected variant','science / measurements','new','Different biological measurement dataset from Palmer Penguins.'),
'wine':('UCI Wine cultivar-recognition assays','S. Aeberhard and M. Forina / UCI Machine Learning Repository; scikit-learn distribution','science / food chemistry','related-existing-demo-family','UCI Wine 109 is not UCI Wine Quality 186: different rows, fields and task; counted conservatively as a related wine family.'),
'longley':('Longley historical US employment benchmark','Longley historical regression benchmark; distributed by statsmodels','labor / statistical practice','new','Annual benchmark distinct from the quarterly macro panel; not current employment reporting.'),
'football':('2018 World Cup group-stage final scores','OpenFootball community, football.db','sport / transportable event records','new','Different sport and population from the existing NBA player-season example.'),
'tate':('Tate artist-metadata alphabetic prefix','Tate; October 2014 collection metadata archive','culture / data quality','new','Catalogue metadata only, no artwork images or inferred current biographies.')}

def main():
 acquisitions={a['id']:a for a in json.loads((ROOT/'evidence/acquisition.json').read_text())}
 captures={a['id']:a for a in json.loads((ROOT/'evidence/source-capture.json').read_text())}
 tables=json.loads((ROOT/'evidence/prepared-tables.json').read_text())
 records=[];sources=[]
 for family,ts in tables.items():
  key={'macro':'macrodata','danish':'danish_data'}.get(family,family)
  info=INFO[family];rawmap={'ercot':'ercot-demand.csv','football':'worldcup-group-matches.csv','tate':'tate-artists-prefix.csv'}
  raw=ROOT/'evidence/raw'/rawmap.get(family,key+'.csv')
  if key in acquisitions:
   a=acquisitions[key];landing=a['source_landing_url'];url=a['direct_download_url'];time=a['retrieval_time_utc'];method=a['acquisition_method'];upstream_sha=sha(raw)
   version=f'{a["package"]} {a["package_version"]}; original historical series, not a live revision'
   original=a.get('original_source','UCI source dataset as distributed by scikit-learn')
   notes=a.get('source_notes','');rights=a.get('copyright','UCI dataset-specific CC BY 4.0 declaration; scikit-learn transformations acknowledged')
  elif family in captures:
   a=captures[family];url=a['source_url'];landing='https://github.com/'+('openfootball/worldcup/tree/master/2018--russia' if family=='football' else 'tategallery/collection')
   # Receipt timestamp means local capture time, not a fabricated upstream download timestamp.
   from datetime import datetime,timezone
   time=datetime.fromtimestamp(raw.stat().st_mtime,timezone.utc).isoformat();method=a['capture'];upstream_sha=None
   version='Git blob '+a['source_blob_sha1'];original=landing;notes=method
   rights='Publisher public-domain dedication in README' if family=='football' else 'Publisher CC0 1.0 metadata dedication; artwork images excluded'
  else:
   landing='https://www.eia.gov/electricity/gridmonitor/';url=f'https://raw.githubusercontent.com/byronwall/explorEDA/{BASE}/packages/explorEDA/examples/forecast/data/ercot-demand.csv'
   from datetime import datetime,timezone
   time=datetime.fromtimestamp(raw.stat().st_mtime,timezone.utc).isoformat();method='Exact CSV bytes from authorized source packet; SHA-256 matches packet manifest';upstream_sha=sha(raw)
   version='Authorized repository baseline '+BASE;original='U.S. EIA ERCOT hourly demand and day-ahead forecast, as credited in the baseline forecast notebook';notes='Original EIA API request and original acquisition timestamp are not present in the packet. Do not describe the local extraction time as an EIA retrieval time.';rights='U.S. EIA information is public domain; attribution requested'
  if family in ['iris','wine','fertility']:
   license_name='Creative Commons Attribution 4.0 International';license_url='https://creativecommons.org/licenses/by/4.0/'
   rights_url=landing if family!='fertility' else 'https://data.worldbank.org/indicator/SP.DYN.TFRT.IN'
  elif family=='tate':license_name='CC0 1.0 Universal';license_url='https://creativecommons.org/publicdomain/zero/1.0/';rights_url='https://github.com/tategallery/collection/blob/master/README.md'
  elif family=='football':license_name='Public-domain dedication (OpenFootball publisher statement)';license_url='https://github.com/openfootball/worldcup/blob/master/README.md';rights_url=license_url
  elif family=='ercot':license_name='U.S. public domain (EIA-authored data)';license_url='https://www.eia.gov/about/copyrights_reuse.php';rights_url=license_url
  else:license_name='Public domain (dataset-specific distributor statement)';license_url=landing+'#copyright';rights_url=license_url
  if family in ['iris','wine']:source_rows=len(pd.read_csv(raw,skiprows=1,header=None))
  else:source_rows=len(pd.read_csv(raw))
  base_table=ts['r'];df=pd.read_csv(ROOT/base_table['path']);cov={}
  for col in ['date','year','period']:
   if col in df:cov[col]={'minimum':str(df[col].min()),'maximum':str(df[col].max())}
  cov['geography_or_population']=info[0];cov['grain']=base_table['grain']
  if family=='fertility':cov['published_numeric_years']='1960–2011 in the selected country cohort; 2012 and 2013 cells retained as null';cov['selected_codes']=sorted(df.code.unique().tolist())
  if family=='football':cov['scope']='48 group-stage final scores only; knockout stage not included'
  if family=='tate':cov['scope']='First 60 data records in alphabetic archive order; source lines 2–61; not a representative sample'
  rec=dict(id=family,title=info[0],publisher=info[1],topic=info[2],source_landing_url=landing,direct_download_url=url,
      source_id='source-'+family,license_name=license_name,license_url=license_url,license_evidence_url=rights_url,
      license_status='redistribution-supported-by-publisher-statement',license_evidence_path=f'evidence/licenses/{family}.md',
      retrieval_time_utc=time,retrieval_time_meaning='local preservation/capture timestamp; see acquisition method',
      acquisition_method=method,version=version,original_source=original,source_notes=notes,
      raw_path=raw.relative_to(ROOT).as_posix(),source_row_count=source_rows,source_total_row_count=None if family=='tate' else source_rows,
      source_row_count_definition='Rows in the captured source table; wide source rows count before unpivoting',
      source_sha256=sha(raw),original_download_bytes_sha256=upstream_sha,
      original_download_hash_limitation='Original whole-file bytes were not available; this SHA-256 fingerprints the supplied selected-field capture, with upstream Git blob SHA-1 recorded.' if upstream_sha is None else None,
      source_blob_sha1=a.get('source_blob_sha1') if family in captures else None,
      source_bytes=raw.stat().st_size,base_output_row_count=base_table['row_count'],output_row_count=sum(t['row_count'] for t in ts.values()),
      output_row_count_definition='Sum of rows across prepared tables, including derived/long/summary grains; not independent observations',
      output_tables=list(ts.values()),coverage=cov,units={k:{f['name']:f['unit'] for f in t['fields']} for k,t in ts.items()},
      missing_value_rules='Empty cells are null; valid zeros retained. Transformations document denominator checks, first differences and edge windows. No interpolation or synthetic measurements.',
      transformations=[dict(table=k,description=t['transformations']) for k,t in ts.items()],
      preparation_path='evidence/scripts/prepare.py',analysis_path='evidence/scripts/build.py',
      existing_material_status=info[3],reuse_disclosure=info[4],required_page_credit=info[1]+'; '+license_name+'. Historical source version: '+version)
  records.append(rec)
  license_text=f'''# {info[0]} — redistribution record\n\n**Publisher / credit:** {info[1]}.\n\n**Recorded license:** {license_name}.\n\n**Publisher rights evidence:** {rights_url}\n\n**License text / policy:** {license_url}\n\n**Evidence consulted:** {rights}.\n\n**Acquisition method:** {method}.\n\n**Preserved raw SHA-256:** `{sha(raw)}`.\n\n**Source version:** {version}.\n\n**Changes:** The prepared tables are derived as recorded in datasets.json and prepare.py. No claim of publisher endorsement is made. For CC BY data retain the source credit, license link, historical version and transformation disclosure on the page.\n\n**Scope limitation:** {notes}\n'''
  (ROOT/rec['license_evidence_path']).write_text(license_text)
  sources.append(dict(id='source-'+family,authoritative_urls=[landing,url,rights_url,license_url],retrieval_time_utc=time,
                      supports=['dataset attribution','historical snapshot identity','field definitions and units','documented redistribution basis'],local_evidence_paths=[rec['raw_path'],rec['license_evidence_path'],f'evidence/fields/{family}.json'],
                      acquisition_method=method,original_source=original))
 sources += [dict(id='source-repository',authoritative_urls=[f'https://github.com/byronwall/explorEDA/tree/{BASE}'],retrieval_time_utc=None,supports=['DSL and notebook syntax','demo integration contracts','source baseline'],local_evidence_paths=['evidence/source-inspection.json']),
             dict(id='source-blocked-barley',authoritative_urls=['https://github.com/vega/vega-datasets/blob/main/datapackage.md#barley'],retrieval_time_utc=None,supports=['Barley replacement decision: dataset license unspecified, unlike repository code license'],local_evidence_paths=['gaps.json'])]
 dump(ROOT/'datasets.json',records);dump(ROOT/'sources.json',sources)
 print('PROVENANCE',len(records),'datasets;',sum(x['existing_material_status']=='new' for x in records),'new families under conservative disclosure')

if __name__=='__main__':main()
