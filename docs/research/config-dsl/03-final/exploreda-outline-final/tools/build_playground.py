from pathlib import Path
import json,re
root=Path(__file__).resolve().parent.parent
def module(name):
    s=(root/f'dist/{name}.js').read_text()
    s=re.sub(r'^import .*?;\n','',s,flags=re.M)
    return re.sub(r'\bexport (?=(?:function|class|const|let)\b)','',s)
fixtures={name:(root/f'examples/{file}').read_text() for name,file in {
 'Order book':'order-book.final.eda','Calculations':'calculations.final.eda','Filter recipes':'filters.final.eda',
 'Targeted edits':'edits.final.eda','Exact settings':'exact.final.eda','Repair exercise':'invalid.final.eda','No source mapping':'no-source.final.eda'}.items()}
js='const legacy=(()=>{'+module('outline-v1')+';return {check};})();\n'
js+='const expressions=(()=>{'+module('expressions')+';return {ExpressionError,parseExpression,printExpression,inferExpression,walkExpression};})();\n'
js+='const filters=(()=>{'+module('filters')+';return {lowerFilter,checkNativeFilter,FilterError};})();\n'
js+='const calculations=(()=>{const {ExpressionError,parseExpression,printExpression,inferExpression,walkExpression}=expressions;'+module('calculations')+';return {compileCalculations};})();\n'
js+='const flat=(()=>{const checkV1=legacy.check;const {compileCalculations}=calculations;const {lowerFilter,checkNativeFilter,FilterError}=filters;'+module('flat')+';return {check,format,parse};})();\nconst {check,format,parse}=flat;\n'
js+='const fixtures='+json.dumps(fixtures)+';\nconst catalog='+(root/'examples/final-catalog.json').read_text()+';\n'
js+='''
const $=id=>document.getElementById(id);
const editor=$('editor'); let timer; let activeFixture='Order book';
for(const label of Object.keys(fixtures)){const option=document.createElement('option');option.textContent=label;option.value=label;$('examples').append(option);}
function status(message){$('live-message').textContent=message;}
function offset(position){const rows=editor.value.split('\\n');return rows.slice(0,position.line).reduce((a,s)=>a+s.length+1,0)+position.character;}
function focusRange(r){editor.focus();editor.setSelectionRange(offset(r.start),offset(r.end));}
function run(){
 clearTimeout(timer);const result=check(editor.value,catalog);window.lastResult=result;
 const errors=result.diagnostics.filter(d=>d.severity==='error');
 $('status').textContent=errors.length?`${errors.length} ${errors.length===1?'error':'errors'} to resolve`:'Subset checks passed';
 $('status').dataset.state=errors.length?'error':'pass';
 $('diagnostics').replaceChildren();
 if(!result.diagnostics.length){const p=document.createElement('p');p.className='empty';p.textContent='No errors in this supported subset. The preview below contains settings patches, not a runnable saved workspace.';$('diagnostics').append(p);}
 for(const d of result.diagnostics){
  const item=document.createElement('div');item.className='diagnostic';
  const jump=document.createElement('button');jump.className='jump';jump.textContent=`${d.range.start.line+1}:${d.range.start.character+1}  ${d.code}`;jump.addEventListener('click',()=>focusRange(d.range));
  const p=document.createElement('p');p.textContent=d.message;item.append(jump,p);
  if(d.suggestions?.length){const hint=document.createElement('small');hint.textContent='Consider: '+d.suggestions.join(', ')+'. No change was applied.';item.append(hint);}
  $('diagnostics').append(item);
 }
 $('patches').textContent=JSON.stringify(result.preview.chartPatches,null,2);
 $('calculation-preview').replaceChildren();
 const calcs=result.preview.calculations??[];
 for(const calc of calcs){
  const row=document.createElement('div');row.className='calculation-row';
  const name=document.createElement('b');name.textContent=calc.resultColumnName;
  const expression=document.createElement('code');expression.textContent=calc.expression;
  const note=document.createElement('small');note.textContent='Row-wise · dependencies: '+(result.calculationOrigins.find(o=>o.name===calc.resultColumnName)?.dependencies.join(', ')||'constant');
  row.append(name,expression,note);$('calculation-preview').append(row);
 }
 if(!calcs.length)$('calculation-preview').textContent='No calculation definitions in this example.';
 const count=result.preview.chartPatches.reduce((n,c)=>n+(c.filters?.length??0),0);
 $('summary-stats').textContent=`${calcs.length} calculations → ${result.preview.chartPatches.length} charts · ${count} chart-owned filters`;

 const statements=parse(editor.value).statements;
 const nonblank=editor.value.split('\\n').filter(x=>x.trim()).length;
 const max=Math.max(0,...editor.value.split('\\n').map(x=>x.length));
 $('counts').textContent=`${result.preview.chartPatches.length} charts · ${nonblank} nonblank lines · ${max} chars longest`;
 $('binding').textContent=`Binding: ${result.preview.sourceBinding} · ${result.validation.bindings}`;
 $('result-json').value=JSON.stringify(result,null,2);
 return result;
}
function load(name){activeFixture=name;editor.value=fixtures[name];run();status('Example loaded. All checks run locally.');}
$('examples').addEventListener('change',e=>load(e.target.value));
$('reset').addEventListener('click',()=>load(activeFixture));
$('check').addEventListener('click',()=>{run();status('Checked locally. Native runtime has not been run.');});
$('format').addEventListener('click',()=>{const result=format(editor.value,Number($('width').value));if(!result.ok){status(result.diagnostics[0].message);return;}editor.value=result.text;run();status('Wrapped at assignment boundaries. Comments and quoted values remain intact.');});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(editor.value);status('DSL copied.');}catch{editor.focus();editor.select();status('Clipboard was unavailable. Text is selected; use your normal copy command.');}});
editor.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,150);});
editor.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();run();}});
window.outlineFlat={check,format,parse};load('Order book');
'''
html='''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Outline Flat · explorEDA DSL review</title>
<style>
:root{color-scheme:light;--bg:#f5f7fa;--surface:#fff;--ink:#162334;--muted:#5a697b;--line:#d7dfe8;--accent:#2358ae;--tint:#edf3fc;--ok:#21654e;--error:#a03535}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,sans-serif}main{max-width:1460px;margin:auto;padding:30px 32px 60px}header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}h1{font-size:32px;line-height:1.2;letter-spacing:-.8px;margin:5px 0 10px}h2{font-size:16px;margin:0}p{margin:8px 0 14px}.eyebrow{color:var(--accent);font-size:12px;letter-spacing:1.4px;font-weight:700;text-transform:uppercase}.lede{max-width:760px;color:var(--muted);font-size:16px}.badge{padding:5px 11px;border:1px solid var(--line);border-radius:20px;font-size:12px;white-space:nowrap;background:var(--surface)}.rules{display:flex;gap:8px;flex-wrap:wrap;margin:9px 0 24px}.rules span{background:var(--tint);padding:7px 11px;border-radius:6px;font-size:13px}.rules code{font-weight:650}.toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 12px}button,select{font:inherit;border:1px solid var(--line);border-radius:6px;background:var(--surface);padding:7px 11px;color:var(--ink)}button{cursor:pointer}button:hover{background:var(--tint)}button:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #99b9ed;outline-offset:2px}button.primary{background:var(--accent);color:#fff;border-color:var(--accent)}label.small{font-size:12px;color:var(--muted)}select{max-width:100%}.workspace{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:18px;align-items:start}.panel{background:var(--surface);border:1px solid var(--line);border-radius:10px;overflow:hidden;min-width:0}.panel-header{padding:14px 17px;display:flex;align-items:center;justify-content:space-between;gap:8px;border-bottom:1px solid var(--line)}.subtle{color:var(--muted);font-size:12px}.panel-content{padding:16px 18px}textarea{font:14px/1.8 ui-monospace,SFMono-Regular,Consolas,monospace;width:100%;resize:vertical;display:block;color:var(--ink);background:var(--surface);border:none;border-radius:0;padding:18px 19px;min-height:440px;tab-size:2;white-space:pre;overflow:auto}.editor-meta{padding:10px 18px;border-top:1px solid var(--line);color:var(--muted);font-size:12px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}#status{font-weight:650;font-size:13px;color:var(--ok)}#status[data-state=error]{color:var(--error)}.empty{font-size:13px;color:var(--muted);margin:0}.diagnostic{padding:10px 0;border-bottom:1px solid var(--line)}.diagnostic:last-child{border-bottom:none}.diagnostic p{margin:5px 0;font-size:13px}.diagnostic small{color:var(--muted)}.jump{font:12px ui-monospace,monospace;color:var(--accent);padding:3px 7px;background:var(--tint)}details{border-top:1px solid var(--line)}summary{cursor:pointer;font-weight:650;padding:13px 18px;font-size:13px}pre{font:12px/1.6 ui-monospace,monospace;white-space:pre;margin:0;padding:0 18px 18px;max-height:480px;overflow:auto}#result-json{min-height:230px;font-size:12px}footer{font-size:12px;color:var(--muted);margin-top:16px}#live-message{min-height:24px;color:var(--muted);font-size:13px;margin-top:10px}.contract{margin-top:16px;padding:14px 16px;border:1px solid var(--line);border-radius:8px;font-size:13px;color:var(--muted);background:var(--surface)}.contract p{margin:4px 0}.contract strong{color:var(--ink)}
@media(max-width:880px){.workspace{grid-template-columns:1fr}main{padding:22px 18px 42px}header{display:block}.badge{display:inline-block;margin-bottom:12px}textarea{font-size:13px;min-height:370px}}@media(max-width:440px){main{padding:16px 12px 32px}h1{font-size:27px}.toolbar{gap:6px}button,select{font-size:13px}.rules{gap:6px}.rules span{font-size:12px}.panel-header{padding:12px}.panel-content{padding:13px}textarea{padding:12px}}
.calculation-row{display:grid;gap:5px;margin:0 18px 13px;padding:12px;background:var(--tint);border-radius:6px;min-width:0}.calculation-row code{font:12px/1.65 ui-monospace,monospace;overflow-wrap:anywhere}.calculation-row small{color:var(--muted);font-size:12px}#summary-stats{font-size:13px;font-weight:650;margin-bottom:14px}#calculation-preview{font-size:13px;padding:0 0 10px}#editor{min-height:600px}</style></head><body><main>
<header><div><div class="eyebrow">explorEDA / language review 03</div><h1>Charts. Calculations. Filters.</h1><p class="lede">One flat file. Define fields once, reuse calculated results, and keep each filter beside the chart that owns it.</p></div><span class="badge">Local review prototype</span></header>
<div class="rules"><span><code>calc profit=revenue-cost</code> row formula</span><span><code>revenue:num=Revenue</code> field contract</span><span><code>+ opacity=.55</code> optional wrap</span><span><code>where.profit=0..</code> chart filter</span></div>
<div class="toolbar"><label class="small" for="examples">Example</label><select id="examples"></select><button id="reset">Reset example</button><button id="check" class="primary">Check</button><button id="format">Wrap</button><label class="small" for="width">at</label><select id="width"><option>40</option><option selected>50</option><option>64</option><option>80</option></select><button id="copy">Copy DSL</button></div>
<div class="workspace"><section class="panel"><div class="panel-header"><h2>Source text</h2><span class="subtle">Ctrl / Cmd + Enter to check</span></div><textarea id="editor" aria-label="Outline Flat source text" spellcheck="false" wrap="off"></textarea><div class="editor-meta"><span id="counts"></span><span id="binding"></span></div></section>
<section class="panel"><div class="panel-header"><h2>Checker feedback</h2><span id="status" role="status"></span></div><div class="panel-content"><div id="summary-stats"></div><div id="diagnostics"></div></div><details open><summary>Calculations and dependencies</summary><div id="calculation-preview"></div></details><details open><summary>Charts and their filter owners</summary><pre id="patches"></pre></details><details><summary>Full agent response JSON</summary><textarea id="result-json" aria-label="Full checker response JSON" readonly spellcheck="false"></textarea></details></section></div>
<div id="live-message" role="status" aria-live="polite"></div>
<div class="contract"><p><strong>What this proves:</strong> field binding, formula dependencies and syntax, filter lowering, renderer-effect checks, source locations, targeted edits, and wrapping.</p><p><strong>What this does not prove:</strong> actual formula values, complete native-schema validation, chart rendering, defaults, color-scale generation, or repository integration. The catalog is metadata, not data rows. Nothing is transmitted.</p></div>
<footer>Pinned native contracts: 226ffae6. Final syntax recommendation; executable review checker, not a shipped explorEDA integration. Source code and tests accompany this file.</footer>
</main><script type="module">JS_CONTENT</script></body></html>'''
html=html.replace('JS_CONTENT',js.replace('</script','<\\/script'))
(root/'playground/index.html').write_text(html)
print('Standalone playground:',len(html),'bytes')
