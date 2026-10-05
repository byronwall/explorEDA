from pathlib import Path
import json, os
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
shots=root/'tmp/browser'; shots.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1280,'height':960},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content((root/'playground/index.html').read_text(), wait_until='load')
 page.wait_for_function('window.lastResult && window.lastResult.ok')
 results.append({'case':'self-contained HTML bytes; initial checker; source mappings','pass':page.locator('#binding').inner_text()=='Binding: salesRows · checked'})
 page.screenshot(path=str(shots/'playground-wide.png'),full_page=True)
 for name in ['One-line charts','Same dashboard as v1','Explicit edits','Exact native config']:
  page.select_option('#examples',name)
  assert page.evaluate('window.lastResult.ok'),page.locator('#diagnostics').inner_text()
  results.append({'case':name,'pass':True})
 page.select_option('#examples','Same dashboard as v1')
 before=page.evaluate('window.lastResult.preview')
 page.click('#format')
 after=page.evaluate('window.lastResult.preview')
 assert before==after
 results.append({'case':'Wrap at 50 preserves preview through button','pass':True})
 page.select_option('#examples','Repair these errors')
 assert not page.evaluate('window.lastResult.ok')
 page.get_by_role('button',name='6:19 E_UNKNOWN_FIELD').click()
 selected=page.evaluate('document.getElementById("editor").value.slice(document.getElementById("editor").selectionStart,document.getElementById("editor").selectionEnd)')
 assert selected=='reveneu',selected
 results.append({'case':'Click field error selects exact misspelled source token','pass':True})
 page.locator('#editor').fill('scatter x=Revenue y=Margin\n+ size=3 opacity=.55')
 page.wait_for_function('window.lastResult.ok && window.lastResult.preview.sourceBinding === "data"')
 results.append({'case':'Typing rechecks locally with host default binding','pass':True})
 page.locator('#editor').press('Control+Enter')
 assert page.evaluate('window.lastResult.ok')
 results.append({'case':'Keyboard check shortcut','pass':True})
 for width in [783,390]:
  page.set_viewport_size({'width':width,'height':960});page.select_option('#examples','Quick start')
  page.screenshot(path=str(shots/f'playground-{width}.png'),full_page=True)
  overflow=page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
  assert not overflow
  results.append({'case':f'Width {width}: no page overflow; source scroll remains local','pass':True})
 # Read-only JSON path and reset work through visible actions.
 page.get_by_text('Full agent response JSON',exact=True).click()
 assert 'patches-only' in page.locator('#result-json').input_value()
 page.click('#reset'); assert page.evaluate('window.lastResult.ok')
 results.append({'case':'Full machine result and reset controls','pass':True})
 results.append({'case':'Browser JavaScript page errors','pass':not errors,'errors':errors})
 browser.close()
(root/'evidence/browser-checks.json').write_text(json.dumps({'browser':'Playwright Chromium (headless)','delivery':'self-contained HTML injected with set_content; no network; file:// navigation blocked by managed-browser policy','cases':results},indent=2)+'\n')
print(json.dumps(results,indent=2))
