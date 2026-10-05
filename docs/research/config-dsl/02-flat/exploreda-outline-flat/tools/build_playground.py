from pathlib import Path
import json,re
root=Path(__file__).resolve().parent.parent
legacy=(root/'dist/outline-v1.js').read_text().replace('export function ', 'function ')
flat=(root/'dist/flat.js').read_text()
flat=re.sub(r'^import .*?;\n','',flat,flags=re.M).replace('export function ', 'function ')
fixtures={name:(root/f'examples/{file}').read_text() for name,file in {
 'Quick start':'quickstart.flat.eda','One-line charts':'one-line.flat.eda','Same dashboard as v1':'dashboard.flat.eda','Explicit edits':'edits.flat.eda','Exact native config':'exact.flat.eda','Repair these errors':'invalid.flat.eda'}.items()}
js= 'const legacy=(()=>{\n'+legacy+'\nreturn {check};})();\nconst checkV1=legacy.check;\n'+flat+'\n'
js+='const fixtures='+json.dumps(fixtures)+';\nconst catalog='+ (root/'examples/catalog.json').read_text()+';\n'
js+='''
const $=id=>document.getElementById(id);
const editor=$('editor'); let timer; let activeFixture='Quick start';
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
 $('patches').textContent=JSON.stringify(result.preview,null,2);
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
window.outlineFlat={check,format,parse};load('Quick start');
'''
html='''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Outline Flat · explorEDA DSL review</title>
<style>
:root{color-scheme:light;--bg:#f5f7fa;--surface:#fff;--ink:#162334;--muted:#5a697b;--line:#d7dfe8;--accent:#2358ae;--tint:#edf3fc;--ok:#21654e;--error:#a03535}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,sans-serif}main{max-width:1460px;margin:auto;padding:30px 32px 60px}header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}h1{font-size:32px;line-height:1.2;letter-spacing:-.8px;margin:5px 0 10px}h2{font-size:16px;margin:0}p{margin:8px 0 14px}.eyebrow{color:var(--accent);font-size:12px;letter-spacing:1.4px;font-weight:700;text-transform:uppercase}.lede{max-width:760px;color:var(--muted);font-size:16px}.badge{padding:5px 11px;border:1px solid var(--line);border-radius:20px;font-size:12px;white-space:nowrap;background:var(--surface)}.rules{display:flex;gap:8px;flex-wrap:wrap;margin:9px 0 24px}.rules span{background:var(--tint);padding:7px 11px;border-radius:6px;font-size:13px}.rules code{font-weight:650}.toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 12px}button,select{font:inherit;border:1px solid var(--line);border-radius:6px;background:var(--surface);padding:7px 11px;color:var(--ink)}button{cursor:pointer}button:hover{background:var(--tint)}button:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #99b9ed;outline-offset:2px}button.primary{background:var(--accent);color:#fff;border-color:var(--accent)}label.small{font-size:12px;color:var(--muted)}select{max-width:100%}.workspace{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:18px;align-items:start}.panel{background:var(--surface);border:1px solid var(--line);border-radius:10px;overflow:hidden;min-width:0}.panel-header{padding:14px 17px;display:flex;align-items:center;justify-content:space-between;gap:8px;border-bottom:1px solid var(--line)}.subtle{color:var(--muted);font-size:12px}.panel-content{padding:16px 18px}textarea{font:14px/1.8 ui-monospace,SFMono-Regular,Consolas,monospace;width:100%;resize:vertical;display:block;color:var(--ink);background:var(--surface);border:none;border-radius:0;padding:18px 19px;min-height:440px;tab-size:2;white-space:pre;overflow:auto}.editor-meta{padding:10px 18px;border-top:1px solid var(--line);color:var(--muted);font-size:12px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}#status{font-weight:650;font-size:13px;color:var(--ok)}#status[data-state=error]{color:var(--error)}.empty{font-size:13px;color:var(--muted);margin:0}.diagnostic{padding:10px 0;border-bottom:1px solid var(--line)}.diagnostic:last-child{border-bottom:none}.diagnostic p{margin:5px 0;font-size:13px}.diagnostic small{color:var(--muted)}.jump{font:12px ui-monospace,monospace;color:var(--accent);padding:3px 7px;background:var(--tint)}details{border-top:1px solid var(--line)}summary{cursor:pointer;font-weight:650;padding:13px 18px;font-size:13px}pre{font:12px/1.6 ui-monospace,monospace;white-space:pre;margin:0;padding:0 18px 18px;max-height:480px;overflow:auto}#result-json{min-height:230px;font-size:12px}footer{font-size:12px;color:var(--muted);margin-top:16px}#live-message{min-height:24px;color:var(--muted);font-size:13px;margin-top:10px}.contract{margin-top:16px;padding:14px 16px;border:1px solid var(--line);border-radius:8px;font-size:13px;color:var(--muted);background:var(--surface)}.contract p{margin:4px 0}.contract strong{color:var(--ink)}
@media(max-width:880px){.workspace{grid-template-columns:1fr}main{padding:22px 18px 42px}header{display:block}.badge{display:inline-block;margin-bottom:12px}textarea{font-size:13px;min-height:370px}}@media(max-width:440px){main{padding:16px 12px 32px}h1{font-size:27px}.toolbar{gap:6px}button,select{font-size:13px}.rules{gap:6px}.rules span{font-size:12px}.panel-header{padding:12px}.panel-content{padding:13px}textarea{padding:12px}}
</style></head><body><main>
<header><div><div class="eyebrow">explorEDA / language review 02</div><h1>Outline, without the indentation.</h1><p class="lede">One chart per line. Settings stay together as key-value pairs. Wrap only when it helps you read.</p></div><span class="badge">Local review prototype</span></header>
<div class="rules"><span><code>x=revenue</code> named role</span><span><code>revenue:num=Revenue</code> field contract</span><span><code>+ opacity=.55</code> optional wrap</span><span><code>margin.left=64</code> exact native path</span></div>
<div class="toolbar"><label class="small" for="examples">Example</label><select id="examples"></select><button id="reset">Reset example</button><button id="check" class="primary">Check</button><button id="format">Wrap</button><label class="small" for="width">at</label><select id="width"><option>40</option><option selected>50</option><option>64</option><option>80</option></select><button id="copy">Copy DSL</button></div>
<div class="workspace"><section class="panel"><div class="panel-header"><h2>Source text</h2><span class="subtle">Ctrl / Cmd + Enter to check</span></div><textarea id="editor" aria-label="Outline Flat source text" spellcheck="false" wrap="off"></textarea><div class="editor-meta"><span id="counts"></span><span id="binding"></span></div></section>
<section class="panel"><div class="panel-header"><h2>Checker feedback</h2><span id="status" role="status"></span></div><div class="panel-content" id="diagnostics"></div><details open><summary>Normalized native-name patches</summary><pre id="patches"></pre></details><details><summary>Full agent response JSON</summary><textarea id="result-json" aria-label="Full checker response JSON" readonly spellcheck="false"></textarea></details></section></div>
<div id="live-message" role="status" aria-live="polite"></div>
<div class="contract"><p><strong>What this proves:</strong> parsing, field binding against the included fixture catalog, supported-subset checks, source locations, explicit edits, and semantics-preserving wrapping.</p><p><strong>What this does not prove:</strong> complete native-schema validation, real chart rendering, defaults, color-scale generation, or repository integration. No source data is loaded or transmitted.</p></div>
<footer>Based on the prior review’s pinned repository contract at 226ffae6. New syntax proposal; not a shipped explorEDA language. Source code and tests accompany this file.</footer>
</main><script type="module">JS_CONTENT</script></body></html>'''
html=html.replace('JS_CONTENT',js.replace('</script','<\\/script'))
(root/'playground/index.html').write_text(html)
print('Standalone playground:',len(html),'bytes')
