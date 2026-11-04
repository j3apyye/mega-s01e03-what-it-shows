# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## S01E03 review

The signed investigation is
[`src/routes/kb/incidents/4471-review/+page.svx`](src/routes/kb/incidents/4471-review/+page.svx).
Its compiled page is
[`dist/kb/incidents/4471-review/index.html`](dist/kb/incidents/4471-review/index.html),
and a browser screenshot is [`evidence/review-page.png`](evidence/review-page.png).
The HTML has the actual component output even without JavaScript; the adjacent
`dist/assets/` files supply styles and interactive examples when served.

The review separates the parser and form-hint assignments, reconciles overlapping
report IDs and retains the desk's unresolved timing reports within their assigned count.
This is an investigation of the exported data and executable knowledge-base model,
not verification of a live product defect or fix. The raw data, cause classifier,
tenant directory and accepted decision 0001 are unchanged. Decision 0002 and the
revised triage guidance are proposals; this repository does not establish adoption
by the live desk.

### Reproduce

Use Node.js 24 and npm. Install the locked dependencies, compute the audit and issue
drafts, test the counting/triage boundaries, and compile all pages:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run audit
npm test
npm run build
python3 -m http.server 8763 --bind 127.0.0.1 --directory dist
```

Then open `http://127.0.0.1:8763/kb/incidents/4471-review/`. The local server exposes
only the compiled course files on loopback. Stop your server when finished.
The HTML is generated from MDsveX and the supplied Svelte components with Vite,
not copied from the Markdown by hand. Relevant upstream references:
[MDsveX](https://github.com/pngwn/MDsveX) and
[Svelte server rendering](https://svelte.dev/docs/svelte/svelte-server).

Generated evidence and draft tickets:

- [`evidence/report-audit.json`](evidence/report-audit.json): counts and complete report-ID assignments.
- [`issues/parser.md`](issues/parser.md) and [`issues/hint.md`](issues/hint.md): reviewable issue bodies.
- `issues/*.json`: the same titles and bodies for an exact GitHub submission.
- [`evidence/browser-check.json`](evidence/browser-check.json): HTTP rendering, signature and interactive-explorer checks on the compiled pages.

The browser check covers this local build in Chromium; it is not a live support-desk
or production-product check. The review's signature is `j3apyye / Codex`; its desk
reference is derived by the supplied `RenderStamp` component, not typed into the page.

To repeat that check, serve `dist` as above and run `scripts/verify-browser.py`
with Python's Playwright package installed and an existing Chromium on local CDP
port 9222. In the course container the existing environment provides both:

```sh
/home/course/.local/share/mega-browser/venv/bin/python scripts/verify-browser.py
```

This script opens and closes its own tab; it leaves the shared browser running.

Before publishing anything, obtain the human's approval for the named public repo,
commits, pushes and issue creation. Keep credentials and sign-in material out of it.
After filing the issues, record their public URLs here and keep their counts tied to
the export snapshot. A newer export requires rerunning the audit and inspecting the
rendered page again; do not treat a change in report volume alone as a product fix.

## Filed GitHub issues

- [parser: Shared date parser reads day-first input month first — 379 reports from #4471](https://github.com/j3apyye/mega-s01e03-what-it-shows/issues/1)
- [hint: booking-v3 date hint conflicts with day-first tenant input — 33 reports from #4471](https://github.com/j3apyye/mega-s01e03-what-it-shows/issues/2)
