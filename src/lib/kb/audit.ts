import reports from '#lib/data/reports-4471.json';
import notes from '#lib/data/desk-notes.json';
import { causeOf, groupByCause, uniqueById, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

export const exported = reports as Report[];
export const unique = uniqueById(exported);
export const merged = unique.filter((r) => r.mergedInto === 4471);
export const groups = groupByCause(merged, tenantOf);
export const exceptions = merged.filter((r) => notes.oneDayMove.includes(r.id));
export const intakeDisagreements = merged.filter((r) => r.meta.intakeTag !== causeOf(r, tenantOf(r)));
export const receivedDays = merged.map((r) => r.receivedAt.slice(0, 10)).sort();
export const mergeDays = Object.entries(Object.groupBy(merged.filter((r) => r.mergedAt), (r) => r.mergedAt!.slice(0, 10)))
  .map(([day, rows]) => ({ day, count: rows!.length }))
  .sort((a, b) => b.count - a.count);
export const assignedCause = (r: Report) => causeOf(r, tenantOf(r));

export function auditRecord() {
  return {
    rawRows: exported.length,
    uniqueReports: unique.length,
    overlapRows: exported.length - unique.length,
    ticket: 4471,
    mergedReports: merged.length,
    intakeDisagreements: intakeDisagreements.length,
    receivedFrom: receivedDays[0],
    receivedTo: receivedDays.at(-1),
    largestMergeDay: mergeDays[0],
    groups: groups.map(({ reports, ...group }) => ({ ...group, count: reports.length, reportIds: reports.map((r) => r.id) })),
    exceptions: exceptions.map((r) => ({ id: r.id, assignedCause: assignedCause(r), tenant: r.tenant, channel: r.channel, body: r.body })),
  };
}
