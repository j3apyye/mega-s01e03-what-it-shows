"""Check a served build using an existing course Chromium; never close that browser."""
import argparse
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base-url', default='http://127.0.0.1:8763')
parser.add_argument('--cdp', default='http://127.0.0.1:9222')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
routes_root = root / 'src/routes'
results = []

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(args.cdp)
    context = browser.contexts[0]
    page = context.new_page()
    page.set_viewport_size({'width': 1280, 'height': 1000})
    page.set_default_timeout(10000)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text)
            if m.type in ('warning', 'error') and 'hydration' in m.text else None)
    page.on('response', lambda r: errors.append(f'HTTP {r.status}: {r.url}')
            if r.status >= 400 else None)
    try:
        for source in sorted((routes_root / 'kb').rglob('+page.svx')):
            route = '/' + str(source.parent.relative_to(routes_root)) + '/'
            before = len(errors)
            response = page.goto(args.base_url + route, wait_until='networkidle')
            result = {'route': route, 'status': response.status,
                      'title': page.title(), 'stamp': page.locator('.stamp').all_text_contents()}
            signature = re.search(r"^signature: '([^']+)'$", source.read_text(), re.M)
            if signature:
                expected = subprocess.check_output([
                    'node', '--input-type=module', '-e',
                    "import {deskRef} from './src/lib/kb/desk-ref.ts'; console.log(deskRef(process.argv[1]));",
                    signature[1]], cwd=root, text=True).strip()
                assert result['stamp'] == [f'desk ref {expected}'], result
            if route.endswith('/4471-review/'):
                rows = page.locator('table').first.locator('tbody tr')
                result['cause_counts'] = {
                    row.locator('td').nth(0).inner_text(): int(row.locator('td').nth(1).inner_text())
                    for row in rows.all()}
                assert result['cause_counts'] == {'parser': 379, 'hint': 33}, result
                result['exceptions'] = page.locator('table').nth(1).locator('tbody tr').count()
                assert result['exceptions'] == 5, result
                assert page.locator('svg rect').count() > 0
                page.screenshot(path=str(root / 'evidence/review-page.png'), full_page=True)
            if route.endswith('/triage/dedupe/'):
                fieldsets = page.locator('fieldset')
                verdict = page.locator('.verdict')
                assert verdict.inner_text() == 'different modeled causes — keep apart'
                fieldsets.nth(1).locator('select').nth(0).select_option('alder.physio')
                result['same_tenant_form_verdict'] = verdict.inner_text()
                assert result['same_tenant_form_verdict'] == 'same modeled cause — inspect evidence before merging'
                fieldsets.nth(1).locator('select').nth(1).select_option('app')
                result['same_tenant_different_channel_verdict'] = verdict.inner_text()
                assert result['same_tenant_different_channel_verdict'] == 'different modeled causes — keep apart'
            # Follow the compiled page's own links and assets, not just its SSR text.
            result['links_checked'] = 0
            for href in set(page.locator('a[href]').evaluate_all('(as) => as.map(a => a.href)')):
                if urlparse(href).netloc == urlparse(args.base_url).netloc:
                    assert context.request.get(href).ok, href
                    result['links_checked'] += 1
            result['errors'] = errors[before:]
            assert result['status'] == 200 and not result['errors'], result
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), route
            results.append(result)
    finally:
        page.close()

(root / 'evidence/browser-check.json').write_text(json.dumps(results, indent=2) + '\n')
print(f'Passed: {len(results)} compiled pages, signatures, cause counts, chart, links and triage interaction.')
