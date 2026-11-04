# booking-v3 date hint conflicts with day-first tenant input — 33 reports from #4471

## Problem

For a day-first tenant using booking-v3, the form prints MM/DD/YYYY but reads the entry in the tenant’s date order. The hint tells people to enter the opposite order from what the form expects. This is a separate path from the shared parser: fixing the parser alone does not make this hint correct. Examples: R-41230 (Copper Studio, form) and R-41241 (Alder Physio, form). The export describes the form behavior; it does not include a live form to reproduce it.

## Report count and scope

**33 distinct reports** assigned to **hint** from merged support ticket #4471, across 3 tenants, received 2026-04-17 through 2026-09-22.

The complete export has 427 rows and 412 unique report IDs; 15 repeated overlap rows count once. The 2 assigned groups reconcile to 412 reports. Counts are snapshot assignments, not proof of the cause of every body.

Recompute with `npm ci --ignore-scripts && npm run audit`. The audit uses the unchanged `uniqueById`, `groupByCause`, tenant directory, locale order and channel/form rule from `src/lib/kb/causes.ts`. Intake tags disagree with the classifier for 38 reports overall; do not use tags or matching subjects to assign causes.

Intake tags within this group: parser: 15; hint: 18.

## Expected behavior and verification

Make the displayed hint and accepted input format agree for each tenant locale. Verify booking-v3 forms for day-first locales as well as a month-first locale, and check that booking-v2 and app/email paths are unaffected.

Reproduce the failure before changing production code; compare the entered date, stored value and rendered invite after the fix. Recheck this group’s reports and keep the other failure path in a separate ticket.

## Evidence

- `src/lib/data/reports-4471.json`: report bodies and IDs.
- `src/lib/data/tenants/`: tenant locales and form versions.
- `src/lib/kb/causes.ts`: executable assignment rule and described mechanisms.
- `evidence/report-audit.json`: all IDs, reconciled counts and desk exceptions.
- `src/routes/kb/incidents/4471-review/+page.svx`: signed review.
- `dist/kb/incidents/4471-review/index.html`: compiled rendered page, with assets in `dist/assets/`.

## Included report IDs

R-41230, R-41241, R-41251, R-41259, R-41262, R-41275, R-41294, R-41305, R-41308, R-41366, R-41372, R-41384, R-41387, R-41396, R-41400, R-41406, R-41415, R-41416, R-41418, R-41428, R-41439, R-41441, R-41449, R-41453, R-41456, R-41460, R-41472, R-41485, R-41493, R-41539, R-41572, R-41582, R-41584
