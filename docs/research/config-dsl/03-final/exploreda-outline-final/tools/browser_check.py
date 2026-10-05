from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
shots=root/'tmp/browser';shots.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1280,'height':960},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content((root/'playground/index.html').read_text(),wait_until='load')
    page.wait_for_function('window.lastResult && window.lastResult.ok')
    assert page.locator('#summary-stats').inner_text()=='2 calculations → 5 charts · 2 chart-owned filters'
    results.append({'case':'self-contained HTML bytes and default dependency/filter summaries','pass':True})
    page.screenshot(path=str(shots/'wide.png'),full_page=True)
    for name in ['Calculations','Filter recipes','Targeted edits','Exact settings','No source mapping']:
        page.select_option('#examples',name);assert page.evaluate('window.lastResult.ok'),page.locator('#diagnostics').inner_text()
        results.append({'case':name,'pass':True})
    page.select_option('#examples','Order book');before=page.evaluate('window.lastResult.preview');page.click('#format');assert page.evaluate('window.lastResult.preview')==before
    results.append({'case':'Wrap button preserves calculations, source bindings, chart patches and filters','pass':True})
    page.select_option('#examples','Repair exercise');assert not page.evaluate('window.lastResult.ok')
    page.get_by_role('button',name='6:21 E_CALC_FIELD').click()
    selected=page.evaluate('editor.value.slice(editor.selectionStart,editor.selectionEnd)');assert selected=='cots',selected
    results.append({'case':'diagnostic selects exact formula field typo','pass':True})
    page.locator('#editor').fill('calc profit=Revenue-Cost\nscatter @s x=Revenue y=profit where.profit=0..')
    page.wait_for_function('window.lastResult.ok && window.lastResult.preview.chartPatches.length===1')
    assert page.evaluate('window.lastResult.preview.chartPatches[0].filters[0].field')=='profit'
    results.append({'case':'live edit compiles a calculated field and its chart filter','pass':True})
    page.locator('#editor').press('Control+Enter');assert page.evaluate('window.lastResult.ok')
    results.append({'case':'keyboard check shortcut','pass':True})
    page.get_by_text('Full agent response JSON',exact=True).click();assert '"productionReady": false' in page.locator('#result-json').input_value()
    results.append({'case':'machine response has explicit validation limits','pass':True})
    page.select_option('#examples','Order book');page.click('#reset');assert page.evaluate('window.lastResult.preview.calculations.length')==2
    results.append({'case':'reset restores the example and compiled calculations','pass':True})
    for width in [783,390]:
        page.set_viewport_size({'width':width,'height':960});assert not page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
        page.screenshot(path=str(shots/f'width-{width}.png'),full_page=True)
        results.append({'case':f'{width}px: no horizontal page overflow','pass':True})
    assert not errors,errors
    results.append({'case':'no browser JavaScript errors','pass':True})
    version=browser.version;browser.close()
(root/'evidence/browser-checks.json').write_text(json.dumps({'browser':'Chromium '+version,'navigation':'set_content with identical HTML bytes; file:// navigation blocked by administrator policy; no native runtime or file-open certification','cases':results},indent=2)+'\n')
print(json.dumps(results,indent=2))
