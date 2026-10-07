#!/usr/bin/env python3
"""Capture read-only navigation evidence in an authorized browser environment.

Requires Playwright plus an installed Chromium, or an existing CDP endpoint.
This is NOT an application regression suite and never marks behavior as passed.
Do not disable managed browser policies. Failed/blocked navigation is recorded.
Example:
 python capture_review_targets.py --base-url http://localhost:5173 --coverage --output ./captures
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import shutil
from urllib.parse import urlsplit, urlunsplit

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--base-url', required=True)
    ap.add_argument('--output', type=Path, required=True)
    ap.add_argument('--cdp', help='Existing authorized Chromium CDP endpoint')
    ap.add_argument('--chromium', help='Chromium executable path when not using CDP')
    ap.add_argument('--coverage', action='store_true', help='Only use for a development review target')
    args = ap.parse_args()
    u = urlsplit(args.base_url)
    if u.scheme not in {'http','https'} or not u.netloc:
        ap.error('--base-url must be an explicit http(s) application origin/path')
    args.output.mkdir(parents=True, exist_ok=True)
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        ap.error('Playwright is required; use the repository/CI-approved browser environment')
    targets = [('landing',''),('shop','example=shop-operations'),('lorenz','example=lorenz-3d')]
    if args.coverage:
        targets.append(('coverage','view=coverage'))
    results = []
    with sync_playwright() as p:
        if args.cdp:
            browser = p.chromium.connect_over_cdp(args.cdp)
        else:
            executable = args.chromium or shutil.which('chromium') or shutil.which('chromium-browser')
            opts = {'headless': True}
            if executable:
                opts['executable_path'] = executable
            browser = p.chromium.launch(**opts)
        context = browser.new_context(viewport={'width':1280,'height':900})
        for name, query in targets:
            page = context.new_page()
            logs = []
            page.on('console', lambda message: logs.append({'kind':'console','type':message.type,'text':message.text}))
            page.on('pageerror', lambda error: logs.append({'kind':'pageerror','text':str(error)}))
            target = urlunsplit((u.scheme,u.netloc,u.path or '/',query,''))
            record = {'target':target,'utc':datetime.now(timezone.utc).isoformat(),'browser':browser.version,
                      'viewport':{'width':1280,'height':900},'application_behavior_result':'not-tested'}
            try:
                response = page.goto(target,wait_until='domcontentloaded',timeout=30000)
                page.wait_for_timeout(1000)
                record.update(navigation='loaded',http_status=response.status if response else None)
            except Exception as error:
                record.update(navigation='failed-or-blocked',error=str(error))
                page.wait_for_timeout(700)
            try:
                record['title'] = page.title()
                record['body_text'] = page.locator('body').inner_text(timeout=3000)
                page.screenshot(path=str(args.output/f'{name}.png'),full_page=False)
                record['screenshot'] = f'{name}.png'
            except Exception as error:
                record['capture_error'] = str(error)
            record['console'] = logs
            results.append(record)
            page.close()
        context.close()
        if not args.cdp:
            browser.close()
    (args.output/'navigation.json').write_text(json.dumps(results,indent=2)+'\n')
    print(f'Captured {len(results)} navigation attempts. Application scenarios remain untested.')
    return 1 if any(r['navigation']!='loaded' for r in results) else 0

if __name__ == '__main__':
    raise SystemExit(main())
