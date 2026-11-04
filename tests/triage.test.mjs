import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { causeOf, sameCause, uniqueById, groupByCause, readAs } from '../src/lib/kb/causes.ts';

const root = new URL('../src/lib/data/', import.meta.url);
const raw = JSON.parse(readFileSync(new URL('reports-4471.json', root)));
const tenants = readdirSync(new URL('tenants/', root)).map((f) => JSON.parse(readFileSync(new URL(`tenants/${f}`, root))));
const tenantOf = (r) => tenants.find((t) => t.handle === r.tenant);

test('real export reconciles without duplicate IDs or unassigned merged reports', () => {
  const rs = uniqueById(raw).filter((r) => r.mergedInto === 4471);
  const groups = groupByCause(rs, tenantOf);
  assert.equal(raw.length, 427);
  assert.equal(rs.length, 412);
  assert.deepEqual(groups.map((g) => [g.cause, g.reports.length]), [['parser', 379], ['hint', 33]]);
  assert.equal(new Set(groups.flatMap((g) => g.reports.map((r) => r.id))).size, 412);
  assert.equal(groups.reduce((n, g) => n + g.reports.length, 0), rs.length);
  assert.deepEqual(uniqueById([...raw, ...raw]), uniqueById(raw));
});

test('same subject can span causes; different subjects can share a cause', () => {
  const a = { tenant: 'alder.physio', channel: 'form', subject: 'Booking on the wrong date' };
  const b = { ...a, channel: 'app' };
  assert.equal(sameCause(a, tenantOf(a), b, tenantOf(b)), false);
  const c = { tenant: 'kettle.books', channel: 'app', subject: 'Wrong day on invite' };
  const d = { ...c, channel: 'email', subject: 'Client turned up on wrong day' };
  assert.equal(sameCause(c, tenantOf(c), d, tenantOf(d)), true);
});

test('unknown and month-first tenants cannot establish a modeled duplicate', () => {
  const r = { channel: 'form' };
  assert.equal(causeOf(r, undefined), null);
  const us = { handle: 'example', name: 'Example', locale: 'en-US', form: 'booking-v3' };
  assert.equal(causeOf(r, us), null);
  assert.equal(sameCause(r, undefined, r, undefined), false);
});

test('desk exceptions remain visible within counts; note labels are not new causes', () => {
  const notes = JSON.parse(readFileSync(new URL('desk-notes.json', root)));
  const groups = groupByCause(uniqueById(raw), tenantOf);
  assert.equal(readAs(groups.find((g) => g.cause === 'parser'), notes.oneDayMove), 5);
  assert.equal(readAs(groups.find((g) => g.cause === 'hint'), notes.oneDayMove), 0);
  const timing = raw.find((r) => r.id === 'R-41236');
  assert.match(timing.body, /before I made the booking/);
  assert.equal(causeOf(timing, tenantOf(timing)), 'parser');
});
