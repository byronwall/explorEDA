#!/usr/bin/env python3
"""Check the design fixture's arithmetic, ranges, graph and artifact integrity.

This is an acceptance-oracle checker, not a DSL parser or navigation implementation.
Run from any directory: python3 verify-fixtures.py
Use replay-source-checks.mjs separately for original baseline parser/lowerer checks.
"""
from pathlib import Path
from fractions import Fraction
import json
import re
import struct
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
def read_json(name):
    return json.loads((ROOT / name).read_text())

rows = read_json('fixture-data.json')
graph = read_json('expected-graph.json')
nav = read_json('navigation-cases.json')
cases = read_json('edge-cases.json')
source = (ROOT / 'six-block.eda.md').read_text()
checks = []
def checked(name, condition):
    if not condition:
        raise AssertionError(name)
    checks.append(name)

gross = [row['Revenue'] - row['Cost'] for row in rows]
net = [Fraction(value, 2) for value in gross]
unused = [row['Cost'] * 2 for row in rows]
west = [i for i, row in enumerate(rows) if row['Region'] == 'West']
checked('exact row arithmetic', gross == [60,120,90,100] and net == [30,60,45,50] and unused == [80,160,120,40])
checked('main metric and finding = 125', sum(net[i] for i in west) == 125)
checked('composition all-row measure = 185', sum(net) == 185)
checked('edited metric = 250, unchanged finding = 125', sum(gross[i] for i in west) == 250 and sum(net[i] for i in west) == 125)
changed = net.copy(); changed[0] = Fraction(140-40, 2)
checked('NAV-12 current-data fallback: West145/all205', sum(changed[i] for i in west) == 145 and sum(changed) == 205)
workspace = [i for i,r in enumerate(rows) if 100 <= r['Revenue'] <= 150]
eligible = [i for i in workspace if rows[i]['Region']=='West']
selected = [i for i in eligible if 40 <= rows[i]['Cost'] <= 60]
own = [i for i in selected if rows[i]['Cost'] <= 40]
checked('EC20 population IDs', (eligible, selected, own) == ([0,2,3],[0,2],[0]))
checked('EC20 card250/selected75/eligible125/own30/unbound185',
        (sum(gross[i] for i in eligible),sum(net[i] for i in selected),sum(net[i] for i in eligible),sum(net[i] for i in own),sum(net)) == (250,75,125,30,185))

nodes = {n['id']:n for n in graph['nodes']}
checked('21 unique graph nodes', len(nodes)==len(graph['nodes'])==21)
checked('27 unique dependency edges', len(graph['edges'])==27 and len({e['id'] for e in graph['edges']})==27)
checked('8 nondependency relations', len(graph['relations'])==8)
adj = {node: set() for node in nodes}
for edge in graph['edges']:
    checked('known endpoints '+edge['id'], edge['from'] in nodes and edge['to'] in nodes)
    adj[edge['from']].add(edge['to'])
def reachable(start):
    found=set(); pending=list(adj[start])
    while pending:
        node=pending.pop()
        if node in found: continue
        if node==start: raise AssertionError('Unexpected active dependency cycle')
        found.add(node);pending.extend(adj[node])
    return found
net_direct = {'chart:net-total','finding:west-net','part:net-shape:measure:net-measure','part:net-shape:scale:net-scale'}
net_transitive = {'chart:net-shape','part:net-shape:unit:orders:label:0','part:net-shape:unit:orders:mark:orders-points','prose:west-summary'}
checked('net exact direct consumers', adj['calc:net']==net_direct)
checked('net exact transitive-only consumers', reachable('calc:net')-net_direct==net_transitive)
checked('unused has zero consumers', not reachable('calc:unused'))
checked('chart binding is not a value edge', 'finding:west-net' not in reachable('chart:net-total'))
checked('metric uses eligible population', 'chart:net-total' in adj['population:net-total:eligible'] and 'chart:net-total' not in adj['population:net-total:selected'])
for node, expected in graph['queries'].items():
    all_consumers=reachable(node)
    checked('stored query '+node, expected == {
        'directConsumers': sorted(adj[node]),
        'transitiveOnlyConsumers': sorted(all_consumers-adj[node]),
        'displayedOutputs': sorted(x for x in all_consumers if nodes[x].get('displayedOutput'))})

utf16 = source.encode('utf-16-le')
range_count=0
def check_ranges(value):
    global range_count
    if isinstance(value,list):
        for child in value: check_ranges(child)
        return
    if not isinstance(value,dict): return
    if all(k in value for k in ['start','end','line','column','length','text']):
        a,b=value['start'],value['end']
        checked('range text '+str(range_count), utf16[a*2:b*2].decode('utf-16-le')==value['text'])
        prefix=utf16[:a*2].decode('utf-16-le')
        col=len(prefix.split('\n')[-1].encode('utf-16-le'))//2+1
        checked('range coordinate '+str(range_count), (prefix.count('\n')+1,col,b-a)==(value['line'],value['column'],value['length']))
        range_count+=1
    for child in value.values():check_ranges(child)
check_ranges(graph)
finding_edge=next(e for e in graph['edges'] if e['to']=='finding:west-net' and e['from']=='calc:net')
checked('finding measure range selects field, not name/binding', source.encode('utf-16-le')[:finding_edge['occurrences'][0]['start']*2].decode('utf-16-le').endswith('sum '))

checked('24 unique NAV cases', [c['id'] for c in nav['cases']]==[f'NAV-{i:02}' for i in range(1,25)])
checked('20 unique compiler cases', [c['id'] for c in cases['cases']]==[f'NDN-EC{i:02}' for i in range(1,21)])
checked('24 concrete compiler sources', sum(len(c.get('variants',[c])) for c in cases['cases'])==24)
for case in cases['cases']:
    if 'edit' not in case: continue
    checked('unique exact fixture edit '+case['id'], source.count(case['edit']['before'])==1)
recs=(ROOT/'recommendations.md').read_text()
checked('20 stable recommendations', re.findall(r'^### (NDN-\d+) ',recs,re.M)==[f'NDN-{i:02}' for i in range(1,21)])

images={}
for name,size in [('responsive-mockups',(1440,1770)),('definition-flow',(1280,940))]:
    ET.parse(ROOT/(name+'.svg'))
    data=(ROOT/(name+'.png')).read_bytes()
    checked('PNG signature '+name,data[:8]==b'\x89PNG\r\n\x1a\n')
    width,height=struct.unpack('>II',data[16:24])
    checked('image dimensions '+name,(width,height)==size)
    images[name]={'width':width,'height':height,'svgWellFormed':True}
for file in ROOT.glob('*.md'):
    for link in re.findall(r'\]\(([^)]+)\)',file.read_text()):
        if ':' in link or link.startswith('#'):continue
        target=link.split('#')[0]
        if target=='verification-results.json':continue
        checked('local link '+file.name+' -> '+target,(ROOT/target).exists())

print(json.dumps({'classification':'Executed fixture-oracle checks; no proposed feature implementation or browser behavior executed.',
  'passed':True,'assertions':len(checks),'checks':checks,'sourceRangesChecked':range_count,
  'exactGraph':{'nodes':21,'edges':27,'relations':8},'images':images,
  'notRun':['full compiler/calculation execution','React/browser navigation','UI accessibility conformance','performance/usability benchmarks']},indent=2))
