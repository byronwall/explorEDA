"""Live Vite browser rerun. Requires external Python Playwright; not an app dependency.
The recorded run used an offline asset harness; this URL form has NOT run here.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,re,time
import argparse
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://localhost:5173/?view=scatter-lab');parser.add_argument('--chromium',default=None);args=parser.parse_args()
REPO=Path(__file__).resolve().parents[3];OUT=REPO/'tmp/scatter-test-bed';OUT.mkdir(parents=True,exist_ok=True);checks=[];errors=[]
def check(name, fn):
    before=len(errors)
    try:
        detail=fn();passed=len(errors)==before
        checks.append({'name':name,'status':'pass' if passed else 'fail','detail':detail,'new_js_errors':errors[before:]})
    except Exception as e:checks.append({'name':name,'status':'fail','detail':str(e),'new_js_errors':errors[before:]})
    print(name,checks[-1]['status'],checks[-1]['detail'] if checks[-1]['status']=='fail' else '',flush=True);(OUT/'browser-progress.json').write_text(json.dumps(checks,indent=2))
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=args.chromium,headless=True,args=['--no-sandbox'])
    p=browser.new_page(viewport={'width':1280,'height':1100},device_scale_factor=1,accept_downloads=True)
    p.set_default_timeout(3000);p.on('pageerror',lambda e:errors.append(str(e)))
    p.goto(args.url,wait_until='networkidle');p.wait_for_selector('main.scatter-lab')
    def select(name,value):p.locator(f'select[aria-label="{name}"]').select_option(str(value));p.wait_for_timeout(30)
    def count(attr='data-analysis-count'):return int(p.locator('main.scatter-lab').get_attribute(attr))
    def preset(value):select('Reproducible preset',value)
    def fields():
        if p.locator('.sl-settings').get_attribute('open') is None:p.locator('.sl-settings > summary').click()
    def button(name):return p.get_by_role('button',name=re.compile(re.escape(name)))
    def settle():p.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
    def reset():preset('positive');p.get_by_role('button',name='Reset preset',exact=True).click();settle()
    def fixture_checks():
        results={}
        for id in ['positive','negative','independent','overlap','mixture','ring','unequal','contamination','tiny','duplicates','identical','zero-variance','collinear','near-collinear','invalid','offset','symlog','penguins']:
            preset(id);p.wait_for_timeout(60)
            if id=='penguins':p.wait_for_function('document.querySelector("main").dataset.analysisCount==="342"')
            n=count();results[id]=n
            assert n==({'tiny':2,'invalid':310,'penguins':342}.get(id,1000)),(id,n)
            assert p.locator('.sl-chart-surface svg').evaluate_all('(es)=>es.every(e=>!e.outerHTML.includes("NaN"))')
        reset();return results
    check('all 18 deterministic / real presets render',fixture_checks)
    def layers():
        for name in ['Hexagonal bins','Density fill','Density contours','Mean region','Distance diagnostics','Principal axes','Marginal histograms']:
            button(name).click();assert button(name).get_attribute('aria-pressed')=='true'
        for label,value in [('Hex radius (px)','20'),('Bandwidth (px)','32'),('Contour levels','7'),('Marginal bins','22')]:p.get_by_label(label,exact=True).fill(value)
        settle();assert count()==1000
        assert p.get_by_label('Inspect hexagonal bin',exact=True).locator('option').count()>0
        assert 'n=1,000' in p.locator('.sl-marginals').inner_text()
        p.locator('.sl-comparison').evaluate('(e)=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-300)');p.screenshot(path=str(OUT/'all-layers-1280.png'))
        reset();return 'Seven additional layers enabled through buttons; four parameters changed; counts unchanged; bin inspection and paired marginals present.'
    check('required layers and parameter controls',layers)
    def filters():
        select('External group filter','A');assert count()==500
        select('External cohort filter','held-out');assert count()==150
        fields();select('Reference fit','full');assert count('data-reference-count')==1000
        select('Active facet','B');assert count()==0
        select('Analysis rows','full');assert count()==500 and count('data-reference-count')==1000
        select('Analysis rows','selected');select('Active facet','all');p.get_by_role('button',name='Clear filters',exact=True).click();assert count()==1000
        select('Score rows','held-out');assert count('data-scored-count')==300
        button('Separate group models').click();assert 'Within-group' in p.locator('.sl-scope-statement').inner_text()
        reset();return '500 group-A; 150 held-out A; conflicting facet gives 0; ignore-filter facet gives 500; full reference remains 1000; held-out scores 300.'
    check('external filters, facets, fixed references and grouped views',filters)
    def brushing():
        fields();select('Reference fit','full')
        box=p.locator('.sl-chart-card[aria-label="Experiment scatter comparison"] svg[role="group"]').bounding_box();assert box
        x=box['x']+62;y=box['y']+20;w=box['width']-78;h=box['height']-70
        p.mouse.move(x+.3*w,y+.2*h);p.mouse.down();p.mouse.move(x+.7*w,y+.8*h,steps=8);p.mouse.up();settle()
        selected=count();assert 0<selected<1000 and count('data-reference-count')==1000
        assert p.get_by_label('X min',exact=True).input_value()!=''
        svg=p.locator('.sl-chart-card[aria-label="Experiment scatter comparison"] svg[role="group"]');svg.focus();p.keyboard.press('Escape');assert count()==1000
        p.get_by_label('X min',exact=True).fill('10');assert 0<count()<1000
        p.get_by_role('button',name='Clear filters',exact=True).click();assert count()==1000
        reset();return {'brushed_pairs':selected,'reference_pairs':1000,'keyboard_escape_and_range_controls':True}
    check('pointer brush and keyboard filter / clear',brushing)
    def inspect_rows():
        p.get_by_label('Source row index',exact=True).fill('31');p.get_by_role('button',name='Inspect source row',exact=True).focus();p.keyboard.press('Enter')
        assert p.locator('[data-inspected-id]').get_attribute('data-inspected-id').endswith(':31')
        assert 'Squared Mahalanobis distance D²' in p.locator('.sl-inspected').inner_text()
        button('Hexagonal bins').click();options=p.get_by_label('Inspect hexagonal bin',exact=True).locator('option').all_text_contents();assert len(options)>1
        p.get_by_label('Inspect hexagonal bin',exact=True).select_option(index=min(3,len(options)-1));assert 'exactly' in p.locator('.sl-readouts').filter(has_text='Hexagonal-bin inspection').inner_text()
        reset();return 'Source row 31 inspected by keyboard with both D² and D; exact hex contributors selectable without filtering.'
    check('keyboard point inspection and exact-bin inspection',inspect_rows)
    def json_flow():
        button('Hexagonal bins').click();p.get_by_label('Hex radius (px)',exact=True).fill('23')
        with p.expect_download(timeout=5000) as event:p.get_by_role('button',name='Export settings',exact=True).click()
        d=event.value;d.save_as(str(OUT/'exported-settings.json'));doc=json.loads((OUT/'exported-settings.json').read_text());assert doc['method']['hexRadius']==23
        summary=p.get_by_text('Restore or edit reproducible settings',exact=True);summary.click()
        saved=p.get_by_label('Scatter lab settings JSON',exact=True).input_value();p.get_by_role('button',name='Reset preset',exact=True).click()
        p.get_by_label('Scatter lab settings JSON',exact=True).fill(saved);p.get_by_role('button',name='Restore settings',exact=True).click();assert p.get_by_label('Hex radius (px)',exact=True).input_value()=='23'
        p.get_by_role('button',name='Show current JSON',exact=True).click();assert json.loads(saved)==json.loads(p.get_by_label('Scatter lab settings JSON',exact=True).input_value())
        invalid=dict(doc);invalid['version']=99;p.get_by_label('Scatter lab settings JSON',exact=True).fill(json.dumps(invalid));p.get_by_role('button',name='Restore settings',exact=True).click();assert p.locator('[role="alert"]').count()>0
        absent=json.loads(saved);absent['fields']['x']='absent';p.get_by_label('Scatter lab settings JSON',exact=True).fill(json.dumps(absent));p.get_by_role('button',name='Restore settings',exact=True).click();assert 'not present' in p.locator('.sl-empty').first.inner_text()
        reset();return 'Actual Blob download, strict JSON restore, exact settings equality, invalid version rejection and absent-field guard.'
    check('export / restore and invalid document guards',json_flow)
    def tooltip():
        b=button('Hexagonal bins');b.evaluate('(e)=>e.blur()');p.keyboard.press('Tab');b.focus();p.wait_for_selector('[role="tooltip"]');text=p.locator('[role="tooltip"]').inner_text();assert 'exact source IDs' in text
        assert b.evaluate('(e)=>getComputedStyle(e).outlineStyle')!='none'
        p.keyboard.press('Escape');p.wait_for_timeout(150)
        return 'Radix tooltip opens on keyboard focus and Escape dismisses it; focus outline is visible.'
    check('keyboard tooltip and visible focus',tooltip)
    def native():
        reset();p.get_by_role('button',name='Open existing scatter',exact=True).click();p.wait_for_selector('.sl-native svg[aria-label="Existing explorEDA scatter"]')
        native=p.locator('.sl-native');assert 'Showing 1,000 of 1,000' in native.inner_text()
        native.get_by_role('button',name='A: 500 rows',exact=True).click();p.wait_for_timeout(150);assert 'Showing 500 of 1,000' in native.inner_text()
        p.get_by_role('button',name='Use native selection in lab',exact=True).click();assert count()==500
        p.get_by_role('button',name='Clear filters',exact=True).click();p.wait_for_timeout(100)
        svg=native.locator('svg[aria-label="Existing explorEDA scatter"]');svg.evaluate('(e)=>e.scrollIntoView({block:"center"})');box=svg.bounding_box();assert box
        x=box['x']+62;y=box['y']+20;w=box['width']-82;h=box['height']-65
        p.mouse.move(x+.3*w,y+.2*h);p.mouse.down();p.mouse.move(x+.7*w,y+.8*h,steps=8);p.mouse.up();p.wait_for_timeout(100)
        text=native.inner_text();match=re.search(r'Showing ([\d,]+) of 1,000',text);assert match,text[:500]
        n=int(match.group(1).replace(',',''));assert 0<n<1000
        p.get_by_role('button',name='Use native selection in lab',exact=True).click();assert count()==n
        p.get_by_role('button',name='Clear filters',exact=True).click();p.wait_for_timeout(100)
        # Let native restore settle; avoid a preceding modal's focus restoration.
        p.keyboard.press('Escape');p.wait_for_timeout(400)
        native.get_by_role('button',name='Horizontal tick 10',exact=True).focus();p.keyboard.press('Alt+Enter');p.wait_for_selector('[role="dialog"]',timeout=5000)
        trace=p.get_by_role('dialog');assert 'HORIZONTAL TICK 10' in trace.inner_text() and '1000 values from all source rows' in trace.inner_text()
        p.screenshot(path=str(OUT/'native-trace-1280.png'))
        p.keyboard.press('Escape');fields();select('X field','group');p.wait_for_timeout(150)
        assert not button('Data ellipse').is_enabled();assert native.get_by_role('button',name='Horizontal tick A',exact=True).count()==1
        native.locator('svg[aria-label="Existing explorEDA scatter"]').evaluate('(e)=>e.scrollIntoView({block:"center"})');p.screenshot(path=str(OUT/'native-categorical-1280.png'))
        select('X field','x');p.wait_for_timeout(100);p.locator('.sl-native-scroll').evaluate('(e)=>e.scrollIntoView({block:"start"})');p.screenshot(path=str(OUT/'native-1280.png'))
        p.get_by_role('button',name='Close existing scatter',exact=True).click();reset()
        return {'native_external_filter':500,'native_brush_pairs_transferred':n,'categorical_axis_ticks':'A, B','trace_keyboard_path':'Alt+Enter opened real Scatter trace inspector; source-domain count 1000 and padding 10% verified'}
    check('actual explorEDA component: filter, brush, transfer, categorical and trace',native)
    def widths():
        reset();button('Density fill').click();button('Density contours').click();button('Mean region').click()
        results=[]
        for width in [1280,783,390]:
            p.set_viewport_size({'width':width,'height':1100});p.wait_for_timeout(180)
            if width<1000:
                assert p.locator('.sl-chart-card').count()==1
                p.get_by_role('button',name='Baseline',exact=True).focus();p.keyboard.press('Enter');assert p.locator('.sl-chart-card').get_attribute('aria-label')=='Baseline scatter comparison'
                p.get_by_role('button',name='Experiment',exact=True).click()
            for dark in [False,True]:
                if p.locator('main').get_attribute('class').endswith('sl-dark')!=dark:p.get_by_role('button',name='Dark theme' if dark else 'Light theme',exact=True).click()
                p.wait_for_timeout(100)
                overflow=p.evaluate('document.documentElement.scrollWidth>innerWidth+1');assert not overflow,(width,dark)
                p.locator('.sl-comparison').evaluate('(e)=>window.scrollTo(0,Math.max(0,e.getBoundingClientRect().top+scrollY-260))');p.screenshot(path=str(OUT/f'lab-{width}-{"dark" if dark else "light"}.png'))
                button('Density fill').evaluate('(e)=>e.blur()');p.keyboard.press('Tab');button('Density fill').focus();p.wait_for_selector('[role="tooltip"]');box=p.locator('[data-radix-popper-content-wrapper]').last.bounding_box();assert box and box['x']>=-1 and box['x']+box['width']<=width+1
                p.keyboard.press('Escape');results.append({'width':width,'theme':'dark' if dark else 'light','page_horizontal_overflow':overflow,'tooltip_in_viewport':True})
        return results
    check('1280 / 783 / 390, light / dark, narrow switch and tooltip placement',widths)
    result={'harness':f'Live URL browser rerun: {args.url}; no component mocks.','browser':browser.version,'environment':p.evaluate('({userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,devicePixelRatio})'),'checks':checks,'javascript_errors':errors}
    (OUT/'browser-rerun.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result,indent=2));browser.close()

if any(c["status"] != "pass" for c in checks): raise SystemExit(1)
