#!/usr/bin/env node
/**
 * Independent Design reference oracle for exact-fixtures.json.
 *
 * Run: node verify-fixtures.mjs
 * Requires Node.js 18+; uses only built-in modules. Verified with Node.js 24.
 * This is not explorEDA implementation code and does not import or test the
 * supplied baseline. Production integration must reuse the repository's value
 * parsing entry points and add the explicit lexical/precision guards specified
 * by this design. No repository files are written by this runner.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const input = JSON.parse(await readFile(new URL('./exact-fixtures.json', import.meta.url), 'utf8'));
const DAY_MS = 86_400_000;

function calendarMilliseconds(value) {
  if (typeof value !== 'string') return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCFullYear(year);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return date.getTime();
}

function atom(value, mode) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return { reason: 'missing' };
  }
  if (mode === 'scalar') {
    if (typeof value === 'string') return { tag: 's', tokenValue: value, value };
    if (typeof value === 'boolean') return { tag: 'b', tokenValue: value, value };
    if (typeof value !== 'number') return { reason: 'unsupported-type' };
    if (!Number.isFinite(value)) return { reason: 'non-finite' };
    const normalized = Object.is(value, -0) ? 0 : value;
    return { tag: 'n', tokenValue: normalized, value: normalized };
  }
  if (mode === 'date-only') {
    if (calendarMilliseconds(value) === undefined) return { reason: 'invalid-date' };
    return { tag: 'd', tokenValue: value, value };
  }
  if (mode !== 'instant-ms') throw new Error(`Unknown key mode: ${mode}`);
  if (typeof value !== 'string') return { reason: 'invalid-instant' };
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return { reason: 'invalid-instant' };
  const [, dateText, hourText, minuteText, secondText, fraction, offsetText] = match;
  if (fraction && fraction.length > 3) return { reason: 'unsupported-precision' };
  const base = calendarMilliseconds(dateText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (base === undefined || hour > 23 || minute > 59 || second > 59) return { reason: 'invalid-instant' };
  let offset = 0;
  if (offsetText !== 'Z') {
    const offsetHour = Number(offsetText.slice(1, 3));
    const offsetMinute = Number(offsetText.slice(4, 6));
    if (offsetHour > 23 || offsetMinute > 59) return { reason: 'invalid-instant' };
    offset = (offsetHour * 60 + offsetMinute) * 60_000 * (offsetText.startsWith('-') ? -1 : 1);
  }
  const milliseconds = base + ((hour * 60 + minute) * 60 + second) * 1000 + Number((fraction ?? '').padEnd(3, '0')) - offset;
  return { tag: 't', tokenValue: milliseconds, value: new Date(milliseconds).toISOString() };
}

function canonicalKey(key, modes) {
  if (!Array.isArray(key) || key.length !== modes.length) return { invalid: { component: -1, reason: 'key-arity' } };
  const atoms = [];
  for (let component = 0; component < modes.length; component++) {
    const parsed = atom(key[component], modes[component]);
    if (parsed.reason) return { invalid: { component, reason: parsed.reason } };
    atoms.push(parsed);
  }
  return {
    token: JSON.stringify(atoms.map(({ tag, tokenValue }) => [tag, tokenValue])),
    key: atoms.map(({ value }) => value),
  };
}

function requiredKey(key, modes) {
  const parsed = canonicalKey(key, modes);
  if (parsed.invalid) throw new Error(`Invalid configuration key: ${JSON.stringify(parsed.invalid)}`);
  return parsed;
}

function generateCandidates(spec, modes) {
  if (spec.kind !== 'daily-date-candidates') throw new Error('unsupported-generator');
  if (modes.at(-1) !== 'date-only') throw new Error('schedule-date-key-required');
  const start = calendarMilliseconds(spec.start);
  const end = calendarMilliseconds(spec.endExclusive);
  if (start === undefined || end === undefined || end < start) throw new Error('invalid-schedule-bounds');
  if (!Number.isSafeInteger(spec.maxCandidates) || spec.maxCandidates < 1) throw new Error('invalid-candidate-limit');
  const candidateCount = ((end - start) / DAY_MS) * spec.roster.length;
  // Refuse the entire result before allocating candidate rows, never truncate.
  if (!Number.isSafeInteger(candidateCount) || candidateCount > spec.maxCandidates) throw new Error('candidate-limit-exceeded');
  const weekdays = new Set(spec.weekdays);
  if (weekdays.size !== spec.weekdays.length || [...weekdays].some((day) => !Number.isInteger(day) || day < 1 || day > 7)) {
    throw new Error('invalid-weekdays');
  }
  const rosterKeys = new Set();
  const rosterIds = new Set();
  for (const item of spec.roster) {
    const token = requiredKey(item.key, modes.slice(0, -1)).token;
    if (rosterKeys.has(token) || rosterIds.has(item.id)) throw new Error('duplicate-roster-entry');
    rosterKeys.add(token);
    rosterIds.add(item.id);
  }
  const rows = [];
  const excluded = new Map();
  for (const item of spec.roster) {
    for (let ms = start; ms < end; ms += DAY_MS) {
      const date = new Date(ms);
      const day = date.toISOString().slice(0, 10);
      const key = [...item.key, day];
      const token = requiredKey(key, modes).token;
      rows.push({ id: `schedule:${item.id}:${day}`, key });
      if (!weekdays.has(date.getUTCDay() || 7)) excluded.set(token, { key, reason: 'Not a scheduled weekday' });
    }
  }
  const skipKeys = new Set();
  for (const skip of spec.skips) {
    const token = requiredKey(skip.key, modes).token;
    if (skipKeys.has(token)) throw new Error('duplicate-skip-key');
    if (typeof skip.reason !== 'string' || !skip.reason.trim()) throw new Error('skip-reason-required');
    skipKeys.add(token);
    // A specific authored reason wins over the generic weekday reason.
    // Retain valid stale skips: reconciliation reports them as unused when
    // a changed horizon/roster no longer declares the corresponding key.
    excluded.set(token, { key: skip.key, reason: skip.reason });
  }
  return { rows, exclusions: [...excluded.values()] };
}

function fraction(numerator, denominator) {
  return { numerator, denominator, available: denominator !== 0 };
}

function reconcile(fixture) {
  const missingSides = ['expected', 'actual'].filter((side) => fixture[`${side}Source`].state !== 'loaded');
  if (missingSides.length) {
    return { status: 'unavailable', missingSides, groups: [], invalidExpected: [], invalidActual: [], unusedExclusions: [], counts: null, metrics: null };
  }
  const { min, max } = fixture.observationPolicy;
  if (!Number.isSafeInteger(min) || min < 1 || (max !== null && (!Number.isSafeInteger(max) || max < min))) {
    throw new Error('invalid-observation-policy');
  }
  const generated = fixture.expectedSource.generator ? generateCandidates(fixture.expectedSource.generator, fixture.keyModes) : undefined;
  const expectedRows = generated?.rows ?? fixture.expectedSource.rows;
  const actualRows = fixture.actualSource.rows;
  const exclusions = [...(generated?.exclusions ?? []), ...fixture.exclusions];
  const byKey = new Map();
  const invalidExpected = [];
  const invalidActual = [];
  for (const [side, rows, invalidRows] of [['expected', expectedRows, invalidExpected], ['actual', actualRows, invalidActual]]) {
    const occurrenceIds = new Set();
    for (const row of rows) {
      if (occurrenceIds.has(row.id)) throw new Error(`duplicate-${side}-occurrence-id`);
      occurrenceIds.add(row.id);
      const parsed = canonicalKey(row.key, fixture.keyModes);
      if (parsed.invalid) {
        invalidRows.push({ rowId: row.id, ...parsed.invalid });
        continue;
      }
      let group = byKey.get(parsed.token);
      if (!group) {
        group = { key: parsed.key, expectedRows: [], actualRows: [], exclusionReason: null };
        byKey.set(parsed.token, group);
      }
      group[`${side}Rows`].push(row.id);
    }
  }
  const excludedTokens = new Set();
  const unusedExclusions = [];
  for (const exclusion of exclusions) {
    const parsed = requiredKey(exclusion.key, fixture.keyModes);
    const token = parsed.token;
    if (excludedTokens.has(token)) throw new Error('duplicate-exclusion-key');
    if (typeof exclusion.reason !== 'string' || !exclusion.reason.trim()) throw new Error('exclusion-reason-required');
    excludedTokens.add(token);
    const group = byKey.get(token);
    if (!group?.expectedRows.length) {
      unusedExclusions.push({ key: parsed.key, reason: exclusion.reason });
      continue;
    }
    group.exclusionReason = exclusion.reason;
  }
  const groups = [...byKey.values()].map((group) => {
    const e = group.expectedRows.length;
    const a = group.actualRows.length;
    const presence = group.exclusionReason !== null ? 'excluded' : e === 0 ? 'unexpected' : a === 0 ? 'absent' : 'matched';
    const required = presence === 'matched' || presence === 'absent';
    const cardinality = !required ? null : a < min ? 'short' : max !== null && a > max ? 'over' : 'within';
    return { key: group.key, expectedRows: group.expectedRows, actualRows: group.actualRows, presence,
      duplicateExpectedKey: e > 1, repeatedActualKey: a > 1, cardinality, exclusionReason: group.exclusionReason };
  });
  const sum = (selector, rows = groups) => rows.reduce((total, group) => total + selector(group), 0);
  const count = (predicate) => groups.filter(predicate).length;
  const required = groups.filter((group) => group.presence === 'matched' || group.presence === 'absent');
  const counts = {
    expectedRows: expectedRows.length,
    actualRows: actualRows.length,
    validExpectedRows: sum((g) => g.expectedRows.length),
    invalidExpectedRows: invalidExpected.length,
    validActualRows: sum((g) => g.actualRows.length),
    invalidActualRows: invalidActual.length,
    expectedKeys: count((g) => g.expectedRows.length > 0),
    requiredKeys: required.length,
    excludedKeys: count((g) => g.presence === 'excluded'),
    matchedKeys: count((g) => g.presence === 'matched'),
    absentKeys: count((g) => g.presence === 'absent'),
    unexpectedKeys: count((g) => g.presence === 'unexpected'),
    keyGroups: groups.length,
    duplicateExpectedKeys: count((g) => g.duplicateExpectedKey),
    repeatedActualKeys: count((g) => g.repeatedActualKey),
    duplicateExpectedRows: sum((g) => g.duplicateExpectedKey ? g.expectedRows.length : 0),
    repeatedActualRows: sum((g) => g.repeatedActualKey ? g.actualRows.length : 0),
    extraExpectedOccurrences: sum((g) => Math.max(0, g.expectedRows.length - 1)),
    extraActualOccurrences: sum((g) => Math.max(0, g.actualRows.length - 1)),
    requiredActualRows: sum((g) => g.actualRows.length, required),
    excludedActualRows: sum((g) => g.presence === 'excluded' ? g.actualRows.length : 0),
    unexpectedActualRows: sum((g) => g.presence === 'unexpected' ? g.actualRows.length : 0),
    excludedObservedKeys: count((g) => g.presence === 'excluded' && g.actualRows.length > 0),
    shortKeys: count((g) => g.cardinality === 'short'),
    withinKeys: count((g) => g.cardinality === 'within'),
    overKeys: count((g) => g.cardinality === 'over'),
    minimumCompleteKeys: required.filter((g) => g.actualRows.length >= min).length,
    minimumUnits: min * required.length,
    attainedUnits: sum((g) => Math.min(g.actualRows.length, min), required),
    shortfallUnits: sum((g) => Math.max(0, min - g.actualRows.length), required),
    beyondMinimumUnits: sum((g) => Math.max(0, g.actualRows.length - min), required),
    surplusUnits: max === null ? 0 : sum((g) => Math.max(0, g.actualRows.length - max), required),
  };
  return { status: 'ready', groups, invalidExpected, invalidActual, unusedExclusions, counts, metrics: {
    presenceCoverage: fraction(counts.matchedKeys, counts.requiredKeys),
    minimumAttainment: fraction(counts.attainedUnits, counts.minimumUnits),
    minimumComplete: fraction(counts.minimumCompleteKeys, counts.requiredKeys),
    withinBounds: fraction(counts.withinKeys, counts.requiredKeys),
  } };
}

function normalized(result, ignoreExpectedProvenance = false) {
  const copy = structuredClone(result);
  copy.groups.sort((a, b) => JSON.stringify(a.key).localeCompare(JSON.stringify(b.key)));
  for (const group of copy.groups) {
    group.expectedRows.sort();
    group.actualRows.sort();
    if (ignoreExpectedProvenance) group.expectedRows = group.expectedRows.map(() => '<expected declaration>');
  }
  copy.invalidExpected.sort((a, b) => a.rowId.localeCompare(b.rowId));
  copy.invalidActual.sort((a, b) => a.rowId.localeCompare(b.rowId));
  copy.unusedExclusions.sort((a, b) => JSON.stringify(a.key).localeCompare(JSON.stringify(b.key)));
  return copy;
}

function assertCountIdentities(result) {
  if (result.status !== 'ready') return;
  const c = result.counts;
  assert.equal(c.expectedRows, c.validExpectedRows + c.invalidExpectedRows);
  assert.equal(c.actualRows, c.validActualRows + c.invalidActualRows);
  assert.equal(c.expectedKeys, c.requiredKeys + c.excludedKeys);
  assert.equal(c.requiredKeys, c.matchedKeys + c.absentKeys);
  assert.equal(c.keyGroups, c.requiredKeys + c.excludedKeys + c.unexpectedKeys);
  assert.equal(c.validExpectedRows, c.expectedKeys + c.extraExpectedOccurrences);
  assert.equal(c.validActualRows, c.requiredActualRows + c.excludedActualRows + c.unexpectedActualRows);
  assert.equal(c.validActualRows, c.matchedKeys + c.excludedObservedKeys + c.unexpectedKeys + c.extraActualOccurrences);
  assert.equal(c.requiredKeys, c.shortKeys + c.withinKeys + c.overKeys);
  assert.equal(c.minimumCompleteKeys, c.withinKeys + c.overKeys);
  assert.ok(c.absentKeys <= c.shortKeys);
  assert.equal(c.minimumUnits, c.attainedUnits + c.shortfallUnits);
  assert.equal(c.requiredActualRows, c.attainedUnits + c.beyondMinimumUnits);
  assert.ok(c.duplicateExpectedKeys <= c.expectedKeys);
  assert.ok(c.repeatedActualKeys <= c.matchedKeys + c.excludedObservedKeys + c.unexpectedKeys);
}

const actualResults = new Map();
for (const fixture of input.fixtures) {
  const actual = reconcile(fixture);
  assert.deepStrictEqual(normalized(actual), normalized(fixture.expectedResult), fixture.id);
  assertCountIdentities(actual);
  actualResults.set(fixture.id, actual);
  if (fixture.population) {
    assert.equal(fixture.population.originalActualRowCount,
      fixture.actualSource.rows.length + fixture.population.outOfScopeActualRows.length,
      `${fixture.id}: original/scoped actual row accounting`);
  }
  console.log(`[fixture] PASS ${fixture.id}: ${actual.status === 'ready' ? `${actual.counts.matchedKeys} matched, ${actual.counts.absentKeys} absent, ${actual.counts.unexpectedKeys} unexpected` : 'unavailable, no absence claims'}`);
}

const hydrateKinds = {
  'negative-zero': -0, undefined, nan: NaN,
  'positive-infinity': Infinity, 'negative-infinity': -Infinity,
};
for (const vector of input.codecVectors) {
  const key = structuredClone(vector.input);
  for (const patch of vector.hydrate ?? []) {
    assert.ok(Object.hasOwn(hydrateKinds, patch.kind), `${vector.id}: unsupported hydration`);
    key[patch.component] = hydrateKinds[patch.kind];
  }
  const actual = canonicalKey(key, vector.modes);
  if (vector.expectedInvalid) assert.deepStrictEqual(actual.invalid, vector.expectedInvalid, vector.id);
  else assert.equal(actual.token, vector.expectedToken, vector.id);
}
console.log(`[fixture] PASS ${input.codecVectors.length} typed-key and date-precision vectors`);

for (const check of input.crossChecks) {
  if (check.kind === 'schedule-equivalence') {
    assert.deepStrictEqual(normalized(actualResults.get(check.left), true), normalized(actualResults.get(check.right), true));
    console.log('[fixture] PASS explicit table / generated schedule membership equivalence');
    continue;
  }
  if (check.kind === 'refresh') {
    const before = actualResults.get(check.before).groups.find((group) => JSON.stringify(group.key) === JSON.stringify(check.key));
    const after = actualResults.get(check.after).groups.find((group) => JSON.stringify(group.key) === JSON.stringify(check.key));
    assert.equal(before.presence, check.beforePresence);
    assert.equal(after.presence, check.afterPresence);
    const modes = input.fixtures.find((fixture) => fixture.id === check.before).keyModes;
    assert.equal(requiredKey(before.key, modes).token, requiredKey(after.key, modes).token);
    console.log('[fixture] PASS absent-to-matched refresh keeps the same canonical key');
    continue;
  }
  if (check.kind === 'bounded-generation') {
    const fixture = structuredClone(input.fixtures.find((item) => item.id === check.fixture));
    fixture.expectedSource.generator.maxCandidates = check.maxCandidates;
    assert.throws(() => reconcile(fixture), new RegExp(check.expectedError));
    console.log('[fixture] PASS generation cap rejects the entire result before allocation');
    continue;
  }
  if (check.kind === 'display-filter-isolation') {
    console.log('[fixture] NOTE display-filter isolation is specified, but requires future project/UI integration tests');
    continue;
  }
  if (check.kind === 'measure-value-invariance') {
    for (const variant of check.variants) {
      const fixture = structuredClone(input.fixtures.find((item) => item.id === check.fixture));
      const row = fixture.actualSource.rows.find((item) => item.id === check.rowId);
      if (variant.present) row.value = variant.value;
      else delete row.value;
      assert.deepStrictEqual(normalized(reconcile(fixture)), normalized(actualResults.get(check.fixture)));
    }
    console.log('[fixture] PASS invalid and missing measurements do not change record presence');
    continue;
  }
  if (check.kind === 'stale-schedule-skip') {
    const fixture = structuredClone(input.fixtures.find((item) => item.id === check.fixture));
    fixture.expectedSource.generator.skips.push(check.skip);
    const expected = structuredClone(actualResults.get(check.fixture));
    expected.unusedExclusions = check.expectedUnused;
    assert.deepStrictEqual(normalized(reconcile(fixture)), normalized(expected));
    console.log('[fixture] PASS a stale schedule skip remains an unused warning');
    continue;
  }
  if (check.kind === 'unused-exclusion-validation') {
    const fixture = structuredClone(input.fixtures.find((item) => item.id === check.fixture));
    fixture.exclusions.push(structuredClone(fixture.exclusions[0]));
    assert.throws(() => reconcile(fixture), new RegExp(check.duplicateExpectedError));
    fixture.exclusions.pop();
    fixture.exclusions[0].reason = '   ';
    assert.throws(() => reconcile(fixture), new RegExp(check.blankReasonExpectedError));
    console.log('[fixture] PASS unused exclusions still require unique keys and nonblank reasons');
    continue;
  }
  throw new Error(`Unknown cross-check: ${check.kind}`);
}

// Input order is not a semantic identity. The exact fixture comparison above
// checks manually authored memberships; this additional check tests that a
// source refresh which only reorders rows does not alter the key ledger.
for (const fixture of input.fixtures) {
  if (fixture.expectedSource.state !== 'loaded' || fixture.actualSource.state !== 'loaded') continue;
  const reordered = structuredClone(fixture);
  reordered.expectedSource.rows?.reverse();
  reordered.actualSource.rows.reverse();
  assert.deepStrictEqual(normalized(reconcile(reordered)), normalized(actualResults.get(fixture.id)), `${fixture.id}: reorder`);
}
console.log(`[fixture] PASS all ${input.fixtures.length} reconciliation cases; exact counts, overlap-safe identities, schedule equivalence, refresh keys, and key vectors verified`);
console.log('[fixture] LIMIT: no baseline unit tests, React interaction tests, DSL round trips, persistence tests, or production performance benchmarks were executed by this oracle');
