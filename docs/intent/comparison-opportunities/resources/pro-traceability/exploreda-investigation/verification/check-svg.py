import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent
async def main():
    errors=[]; requests=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=await browser.new_page(viewport={'width':440,'height':340})
        page.on('pageerror',lambda error: errors.append(str(error)))
        page.on('request',lambda request: requests.append(request.url))
        await page.route('**/*', lambda route: route.abort())
        await page.set_content('<!doctype html><html><body style="margin:20px;background:white">'+(ROOT/'probe.svg').read_text()+'</body></html>')
        model=json.loads((ROOT/'probe-plan.json').read_text())
        actual=await page.locator('circle').evaluate_all('(els)=>els.map(e=>({id:e.dataset.markId,x:+e.getAttribute("cx"),y:+e.getAttribute("cy"),opacity:+e.getAttribute("opacity")}))')
        assert len(actual)==len(model['marks'])==2
        for actual_mark, mark in zip(actual,model['marks']):
            assert actual_mark['id']==mark['id']
            assert actual_mark['x']==mark['x'] and actual_mark['y']==mark['y']
            assert actual_mark['opacity']==mark['opacity']
        assert not errors and not requests
        await page.screenshot(path=str(ROOT/'probe-render.png'))
        result={'browserVersion':browser.version,'loaded':'set_content; network blocked; not file://','circles':len(actual),'identityAndGeometryChecks':'pass','requests':requests,'javascriptErrors':errors,'scope':'minimal SVG adapter only; not repository browser validation'}
        (ROOT/'svg-validation.json').write_text(json.dumps(result,indent=2)+'\n')
        print(json.dumps(result,indent=2))
        await browser.close()
asyncio.run(main())
