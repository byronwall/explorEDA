import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { check, parse, format } from '../dist/flat.js';
import { check as v1 } from '../dist/outline-v1.js';
const file = p => readFileSync(new URL('../examples/'+p, import.meta.url),'utf8');
const cat = JSON.parse(file('catalog.json'));
const clean = x => JSON.parse(JSON.stringify(x));
const run = text => check(text,cat);
const base = 'scatter @s x=Revenue y=Margin';
const has = (r,code) => r.diagnostics.some(d=>d.code===code);
const good = text => { const r=run(text); assert.equal(r.ok,true,JSON.stringify(r.diagnostics)); return r; };
const bad = (text,code) => { const r=run(text); assert.equal(r.ok,false); assert.ok(has(r,code),JSON.stringify(r.diagnostics)); return r; };
for (const name of ['dashboard','quickstart','one-line','edits','exact']) test(name+': example passes subset checker',()=>good(file(name+'.flat.eda')));
test('v1 and v2 four-chart fixtures preserve JSON-visible semantic content',()=>assert.deepEqual(clean(good(file('dashboard.flat.eda')).preview),clean(v1(file('dashboard.outline.eda'),cat).preview)));
for(const indent of ['', ' ', '    ', '\t', '\t  ']) test('indentation is cosmetic: '+JSON.stringify(indent),()=>{
  const text=base+'\n+ opacity=.55 size=3';
  assert.deepEqual(clean(good(text).preview),clean(good(text.split('\n').map(x=>indent+x).join('\n')).preview));
});
for(const space of ['=',' = ','= ',' =']) test('optional whitespace around assignment: '+JSON.stringify(space),()=>good(`scatter x${space}Revenue y${space}Margin opacity${space}.55`));
for(const type of ['num','numeric']) test('numeric type annotation '+type,()=>good(`source orders=salesRows\nrev:${type}=Revenue\nscatter x=rev y=Margin`));
for(const [key,type] of [['group','cat'],['stamp','date'],['live','bool']]) test('type annotation '+type,()=>{
  const c={data:{fields:{[key]:{cat:'categorical',date:'datetime',bool:'boolean'}[type]}}};
  assert.equal(check(`source data\n${key}:${type}\nrow field=${key}`,c).ok,true);
});
test('same-name source binding and raw field can be omitted',()=>good('source data\nRevenue:num\nMargin:num\nscatter x=Revenue y=Margin'));
test('only source selected automatically',()=>assert.equal(good('source orders=salesRows\nscatter x=Revenue y=Margin').preview.sourceBinding,'salesRows'));
test('multiple sources require selection',()=>bad('source orders=salesRows\nsource data\n'+base,'E_SOURCE'));
test('multiple sources with explicit use bind one workspace',()=>good('source orders=salesRows\nsource data\nuse orders\n'+base));
test('source cannot change midway through charts',()=>bad('source data\n'+base+'\nuse data','E_SOURCE_ORDER'));
test('missing host catalog does not pass bindings',()=>assert.equal(check(base).validation.bindings,'deferred'));
test('expected type never silently converts',()=>bad('source data\nRevenue:cat\n'+base,'E_FIELD_TYPE'));
test('explicit conversion emits type metadata',()=>assert.equal(good('source data\nRevenue coerce=num\n'+base).preview.fieldSettings.Revenue.type,'numeric'));
test('old expect word is rejected with inline-type suggestion',()=>bad('source data\nRevenue expect=numeric\n'+base,'E_FIELD_TYPE'));
test('alias shadowing remains an error',()=>bad('source data\nMargin=Revenue\n'+base,'E_ALIAS_SHADOW'));
test('unknown field diagnostic highlights original value',()=>{
  const r=bad('scatter x=Reveneu y=Margin','E_UNKNOWN_FIELD'); const d=r.diagnostics.find(x=>x.code==='E_UNKNOWN_FIELD');
  assert.deepEqual(d.range,{start:{line:0,character:10},end:{line:0,character:17}}); assert.ok(d.suggestions.includes('Revenue'));
});
test('same explicit native property cannot have two values',()=>bad(base+' size=3 pointSize=8','E_CONFLICT'));
test('exact config does not silently override shorthand',()=>bad(base+' size=3 config={"pointSize":8}','E_CONFLICT'));
test('object leaf collision cannot silently override path',()=>bad(base+' margin.left=60 margin={"left":72}','E_CONFLICT'));
test('object properties merge when disjoint',()=>good(base+' margin.left=60 margin={"right":24}'));
test('at merges only disjoint properties',()=>bad(base+' at=0,0,6,5 layout.w=7','E_CONFLICT'));
test('identical duplicate warns rather than alters',()=>assert.ok(has(good(base+' size=3 pointSize=3'),'W_DUPLICATE')));
test('edit is an explicit override with provenance',()=>{
  const r=good(base+' size=3\nedit s size=8');assert.equal(r.preview.chartPatches[0].pointSize,8);assert.ok(has(r,'I_EDIT'));assert.equal(r.origins[0].properties['/pointSize'].start.line,1);
});
test('forward edit target resolves',()=>assert.equal(good('edit s size=8\n'+base+' size=3').preview.chartPatches[0].pointSize,8));
test('edits cannot rename identity',()=>bad(base+'\nedit s id=new','E_EDIT_IDENTITY'));
test('anonymous chart preview IDs cannot be edit targets',()=>bad('scatter x=Revenue y=Margin\nedit scatter-1 size=3','E_EDIT_TARGET'));
test('competing edits conflict instead of last-write-wins',()=>bad(base+'\nedit s size=3\nedit s size=4','E_CONFLICT'));
test('explicit IDs may be unusual when quoted',()=>good('scatter id="margin view" x=Revenue y=Margin\nedit "margin view" size=4'));
test('duplicate IDs fail',()=>bad(base+'\n'+base,'E_ID_DUPLICATE'));
test('stray continuation is not ignored',()=>bad('+ opacity=.5','E_CONTINUATION'));
test('unprefixed settings never silently update preceding chart',()=>bad(base+'\n  opacity=.5','E_CONTINUATION'));
test('comment and blank line do not detach plus',()=>good(base+'\n# explanation\n\n+ size=3'));
test('new declaration terminates previous continuation',()=>{
  const r=good(base+'\nhist Revenue\n+ bins=17');assert.equal(r.preview.chartPatches[1].binCount,17);assert.equal(r.preview.chartPatches[0].binCount,undefined);
});
for(const [long,short] of [['hist field=Revenue bins=24','hist Revenue bins=24'],['row field=Category','row Category'],['table fields=Revenue,Margin','table Revenue,Margin']]) test('obvious single input: '+short,()=>assert.deepEqual(clean(good(long).preview),clean(good(short).preview)));
test('scatter rejects positional X/Y',()=>bad('scatter Revenue Margin','E_PAIR'));
test('compact and JSON lists are equivalent',()=>assert.deepEqual(clean(good('table Revenue,Margin').preview),clean(good('table fields=["Revenue","Margin"]').preview)));
test('comma in quoted field is one field',()=>{
 const catalog={data:{fields:{'Last, First':'categorical'}}};assert.equal(check('table fields="Last, First"',catalog).preview.chartPatches[0].columns[0].field,'Last, First');
});
test('compact tuple and JSON tuple are equivalent',()=>assert.deepEqual(clean(good(base+' at=0,0,6,5').preview),clean(good(base+' at=[0,0,6,5]').preview)));
for(const tuple of ['0,0,6','0,,6,5','[0,null,6,5]','-1,0,6,5','0,0,0,5']) test('bad layout tuple '+tuple,()=>bad(base+' at='+tuple,'E_LAYOUT'));
test('arrays are explicit complete values',()=>good('table columns=[{"id":"r","field":"Revenue","width":180}]'));
test('array index edits are rejected rather than improvised',()=>bad('table Revenue\n+ columns[0].width=180','E_PATH'));
test('bare title cannot swallow the following settings',()=>bad(base+' title=Revenue and margin opacity=.5','E_PAIR'));
test('quoted title protects option-shaped words',()=>assert.equal(good(base+' title="size=99 # not a comment" size=3').preview.chartPatches[0].title,'size=99 # not a comment'));
test('primitive-looking text is preserved by quotes',()=>assert.equal(good(base+' title="true"').preview.chartPatches[0].title,'true'));
test('empty string remains distinct from omission',()=>assert.equal(good(base+' title=""').preview.chartPatches[0].title,''));
test('typed text does not accept bare boolean',()=>bad(base+' title=true','E_CONFIG_TYPE'));
test('single quotes and hex-color tokens lex without becoming comments',()=>assert.equal(good(base+" title='#3479a8'").preview.chartPatches[0].title,'#3479a8'));
test('inline comment stops token parsing',()=>good(base+' # x=NotAField'));
test('decimal and exponent settings are finite',()=>good(base+' size=3e0 opacity=.55'));
for(const value of ['Infinity','NaN','1e400']) test('reject nonfinite '+value,()=>{const r=run(base+' size='+value);assert.equal(r.ok,false)});
test('JSON duplicate keys are rejected',()=>bad(base+' config={"pointSize":3,"pointSize":8}','E_VALUE'));
test('escaped duplicate keys are rejected',()=>bad(base+' config={"pointSize":3,"point\\u0053ize":8}','E_VALUE'));
test('same JSON key in separate sibling objects is allowed',()=>good(base+' config={"xAxis":{"grid":true},"yAxis":{"grid":false}}'));
test('prototype-polluting path rejected',()=>bad(base+' __proto__.polluted=true','E_PATH'));
test('prototype-polluting JSON rejected',()=>bad(base+' config={"__proto__":{"polluted":true}}','E_UNSAFE_VALUE'));
test('unknown native setting remains an error with suggestion',()=>{
 const r=bad(base+' pointSzie=3','E_UNKNOWN_CONFIG'); assert.ok(r.diagnostics.find(d=>d.code==='E_UNKNOWN_CONFIG').suggestions.includes('pointSize'));
});
test('unsupported effective scatter scale fails',()=>bad(base+' x.scale=log','E_UNSUPPORTED_SCALE'));
test('known ineffective scatter domains remain flagged',()=>assert.ok(has(good(base+' xAxis.min=0'),'W_IGNORED_SETTING')));
test('invalid chart families are not falsely accepted',()=>bad('line x=Revenue series=Margin','E_DECLARATION'));
test('raw field properties do not silently resolve authoring aliases',()=>bad('source orders=salesRows\nrev:num=Revenue\nscatter xField=rev yField=Margin','E_RAW_FIELD'));
test('unclosed quote recovers at next declaration without attaching + backward',()=>{
 const r=bad(base+'\nscatter title="oops\n+ size=9\nhist Revenue bins=12','E_QUOTE'); assert.ok(has(r,'E_CONTINUATION')); assert.equal(r.preview.chartPatches[0].pointSize,undefined); assert.equal(r.preview.chartPatches[1].binCount,12);
});
test('mismatched JSON brackets recover',()=>bad(base+' config={]\nhist Revenue','E_BRACKET'));
test('missing assignment value before next pair is not a swallowed field',()=>bad('scatter x= y=Margin','E_VALUE'));
test('input limit is enforced',()=>bad('x'.repeat(200001),'E_LIMIT'));
test('deep JSON rejected without stack overflow',()=>bad(base+' config='+('['.repeat(40)+'0'+']'.repeat(40)),'E_LIMIT'));
for(const width of [40,50,64,80]) test('formatter at '+width+' is idempotent and preserves preview',()=>{
 const original=file('dashboard.flat.eda');const f=format(original,width);assert.equal(f.ok,true);assert.equal(format(f.text,width).text,f.text);assert.deepEqual(clean(good(original).preview),clean(good(f.text).preview));
});
test('formatter never splits a quoted atom',()=>assert.ok(format(base+' title="Revenue and margin per order"',32).text.includes('title="Revenue and margin per order"')));
test('formatter preserves comment-containing statements',()=>{
 const text=base+' # chart\n+ size=3\n';assert.equal(format(text,40).text,text);
});
test('formatter refuses malformed input',()=>assert.equal(format(base+' title="broken').ok,false));
test('format width is bounded',()=>assert.equal(format(base,10).ok,false));
test('CRLF and LF bind identically',()=>assert.deepEqual(clean(good(file('quickstart.flat.eda')).preview),clean(good(file('quickstart.flat.eda').replace(/\n/g,'\r\n')).preview)));
test('all declared native output is clearly patches-only and runtime unverified',()=>{const r=good(base);assert.equal(r.validation.nativeOutput,'patches-only');assert.equal(r.validation.runtime,'not-run')});

test('unresolved shorthand has one field error, not a raw-lowering echo',()=>{const r=bad('scatter x=Reveneu y=Margin','E_UNKNOWN_FIELD');assert.equal(has(r,'E_RAW_FIELD'),false)});
test('suppressing a lowering echo keeps independent exact-native field errors',()=>{const r=bad('scatter x=Reveneu yField=Missing','E_UNKNOWN_FIELD');assert.ok(has(r,'E_RAW_FIELD'))});
