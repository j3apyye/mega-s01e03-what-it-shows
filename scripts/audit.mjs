import { createServer } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { auditRecord } = await server.ssrLoadModule('/src/lib/kb/audit.ts');
  const audit = auditRecord();
  let engineering;
  try {
    engineering = JSON.parse(await readFile('src/lib/data/engineering-update.json', 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (audit.groups.some((group) => !['parser', 'hint'].includes(group.cause))) {
    throw new Error('Unplaced reports or new causes need investigation before generating tickets.');
  }
  await mkdir('evidence', { recursive: true });
  await writeFile('evidence/report-audit.json', JSON.stringify(audit, null, 2) + '\n');
  await mkdir('issues', { recursive: true });
  for (const group of audit.groups) {
    const parser = group.cause === 'parser';
    const title = parser
      ? `Shared date parser reads day-first input month first — ${group.count} reports from #4471`
      : `booking-v3 date hint conflicts with day-first tenant input — ${group.count} reports from #4471`;
    const behavior = parser
      ? 'The shared-parser behavior described in the export reads dates month first for day-first tenants. For example, 07/04/2026 intended as 7 April can become 4 July. R-41200 and R-41201 (Harbour Dental, app) report this swap. The export contains a routing model, not the production parser; the mechanism is described in its comments and must be reproduced against the real product before claiming a verified production fix.'
      : 'For a day-first tenant using booking-v3, the form prints MM/DD/YYYY but reads the entry in the tenant’s date order. The hint tells people to enter the opposite order from what the form expects. This is a separate path from the shared parser: fixing the parser alone does not make this hint correct. Examples: R-41230 (Copper Studio, form) and R-41241 (Alder Physio, form). The export describes the form behavior; it does not include a live form to reproduce it.';
    const expected = parser
      ? 'Honor an explicit input format or the tenant’s date order. Preserve the intended calendar date through booking, stored event and invite. Use unambiguous dates for storage and transport. Verify both ambiguous dates such as 07/04 and dates with a day above 12.'
      : 'Make the displayed hint and accepted input format agree for each tenant locale. Verify booking-v3 forms for day-first locales as well as a month-first locale, and check that booking-v2 and app/email paths are unaffected.';
    const caveat = parser
      ? `\n## Unresolved timing symptoms within this count\n\nThe supplied desk notes list ${audit.exceptions.length} IDs that the classifier still files as parser: ${audit.exceptions.map((r) => r.id).join(', ')}. They are included in the ${group.count}, not additional reports. Their bodies do not establish a shared third cause. One describes an invite arriving before booking; another compares weekdays in Lisbon and Toronto. Obtain entered dates, stored event instants, timezone settings, invite payloads and reproduction steps before claiming their cause. Keep these IDs visible until investigated.\n\n${audit.exceptions.map((r) => `- **${r.id}:** ${r.body}`).join('\n')}\n`
      : '';
    const body = `## Problem\n\n${behavior}\n\n## Report count and scope\n\n**${group.count} distinct reports** assigned to **${group.cause}** from merged support ticket #4471, across ${group.tenants} tenants, received ${group.firstSeen} through ${group.lastSeen}.\n\nThe complete export has ${audit.rawRows} rows and ${audit.uniqueReports} unique report IDs; ${audit.overlapRows} repeated overlap rows count once. The ${audit.groups.length} assigned groups reconcile to ${audit.mergedReports} reports. Counts are snapshot assignments, not proof of the cause of every body.\n\nRecompute with \`npm ci --ignore-scripts && npm run audit\`. The audit uses the unchanged \`uniqueById\`, \`groupByCause\`, tenant directory, locale order and channel/form rule from \`src/lib/kb/causes.ts\`. Intake tags disagree with the classifier for ${audit.intakeDisagreements} reports overall; do not use tags or matching subjects to assign causes.\n\nIntake tags within this group: ${Object.entries(group.taggedAs).map(([tag, n]) => `${tag}: ${n}`).join('; ')}.\n\n## Expected behavior and verification\n\n${expected}\n\nReproduce the failure before changing production code; compare the entered date, stored value and rendered invite after the fix. Recheck this group’s reports and keep the other failure path in a separate ticket.\n${caveat}\n## Evidence\n\n- \`src/lib/data/reports-4471.json\`: report bodies and IDs.\n- \`src/lib/data/tenants/\`: tenant locales and form versions.\n- \`src/lib/kb/causes.ts\`: executable assignment rule and described mechanisms.\n- \`evidence/report-audit.json\`: all IDs, reconciled counts and desk exceptions.\n- \`src/routes/kb/incidents/4471-review/+page.svx\`: signed review.\n- \`dist/kb/incidents/4471-review/index.html\`: compiled rendered page, with assets in \`dist/assets/\`.\n\n## Included report IDs\n\n${group.reportIds.join(', ')}\n`;
    const outcome = engineering?.[group.cause];
    const finalBody = body + (outcome ? `\n## Engineering outcome reported by the course\n\nThe [course engineering update](${engineering.source}) reports source #${engineering.ticket} closed ${engineering.closedAsShown}. **${outcome.status}: ${outcome.detail}.** Close this investigation as **${outcome.closeReason}** according to that report. This records the desk’s outcome; the export does not independently verify the production fix. Historical counts and timing exceptions remain visible above. A new report after the fix or retirement needs fresh investigation, not an automatic merge into this closed issue.\n` : '');
    await writeFile(`issues/${group.cause}.md`, `# ${title}\n\n${finalBody}`);
    await writeFile(`issues/${group.cause}.json`, JSON.stringify({ title, body: finalBody }, null, 2) + '\n');
  }
  console.log(JSON.stringify({ rows: audit.rawRows, unique: audit.uniqueReports, overlap: audit.overlapRows, groups: audit.groups.map((g) => ({ cause: g.cause, count: g.count })), exceptionsIncluded: audit.exceptions.length, intakeDisagreements: audit.intakeDisagreements }, null, 2));
} finally {
  await server.close();
}
