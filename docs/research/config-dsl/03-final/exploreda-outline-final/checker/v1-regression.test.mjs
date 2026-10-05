import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { check } from '../dist/outline-v1.js';
const file = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const catalog = JSON.parse(file('examples/catalog.json'));
const mapping = file('examples/dashboard.outline.eda').split('\n\n')[0];
const run = (body, cat = catalog) => check(`${mapping}\n\n${body}`, cat);
const codes = r => r.diagnostics.map(d => d.code);
const native = r => JSON.parse(JSON.stringify(r.preview));
const scatter = more => `scatter x revenue y margin\n  id s\n${more}`;

for (const d of ['outline', 'phrase', 'slots']) {
  test(`${d}: complete four-chart dashboard passes subset checks`, () => {
    const r = check(file(`examples/dashboard.${d}.eda`), catalog);
    assert.equal(r.ok, true, JSON.stringify(r.diagnostics));
    assert.equal(r.preview.chartPatches.length, 4);
    assert.equal(r.diagnostics.length, 0);
    assert.equal(r.validation.runtime, 'not-run');
    assert.equal(r.validation.fullNativeSchema, 'not-implemented');
  });
}
test('all three dialects normalize to identical native-name patches', () => {
  const base = native(check(file('examples/dashboard.outline.eda'), catalog));
  for (const d of ['phrase', 'slots']) assert.deepEqual(native(check(file(`examples/dashboard.${d}.eda`), catalog)), base);
});
for (const f of ['raw-config.outline', 'no-sources.outline', 'metric.outline', 'inline.outline', 'inline.slots']) {
  test(`${f}: shipped runnable example passes`, () => {
    const r = check(file(`examples/${f}.eda`), catalog);
    assert.equal(r.ok, true, JSON.stringify(r.diagnostics));
  });
}
test('source aliases compile to raw keys, not labels', () => {
  const r = run(scatter(''));
  assert.equal(r.preview.chartPatches[0].xField, 'Revenue');
  assert.equal(r.preview.fieldSettings.Revenue.label, 'Revenue ($)');
  assert.equal(r.preview.fieldSettings.Revenue.type, undefined);
});
test('unknown field provides suggestions without correcting input', () => {
  const r = run('scatter x reveneu y margin\n  id s');
  const d = r.diagnostics.find(d => d.code === 'E_UNKNOWN_FIELD');
  assert.ok(d?.suggestions.includes('revenue'));
  assert.equal(r.ok, false);
  assert.equal(r.preview.chartPatches[0].xField, 'reveneu');
  assert.equal(d.range.end.character - d.range.start.character, 7);
});
test('bad chart does not hide errors in the following chart', () => {
  const r = check(file('examples/invalid.outline.eda'), catalog);
  assert.equal(r.ok, false);
  for (const code of ['E_UNKNOWN_FIELD', 'E_OPACITY', 'E_UNSUPPORTED_SCALE', 'E_UNKNOWN_CONFIG', 'E_EXPECT_NUMERIC', 'E_BINS']) assert.ok(codes(r).includes(code), code);
  assert.equal(r.preview.chartPatches.length, 2);
});
test('duplicate IDs are errors with the original location', () => {
  const r = run(`${scatter('')}\n${scatter('')}`);
  assert.ok(codes(r).includes('E_ID_DUPLICATE'));
  assert.ok(r.diagnostics.find(d => d.code === 'E_ID_DUPLICATE').relatedInformation.length);
});
test('duplicate shorthand settings are not silently last-write-wins', () => {
  assert.ok(codes(run(scatter('  opacity .4\n  opacity .6'))).includes('E_DUPLICATE'));
});
test('explicit raw overrides get a diagnostic and take precedence', () => {
  const r = run(scatter('  opacity .4\n  config pointOpacity .6'));
  assert.equal(r.ok, true);
  assert.ok(codes(r).includes('W_OVERRIDE'));
  assert.equal(r.preview.chartPatches[0].pointOpacity, .6);
});
test('raw override precedence does not depend on its textual position', () => {
  const r = run(scatter('  config pointOpacity .6\n  opacity .4'));
  assert.equal(r.preview.chartPatches[0].pointOpacity, .6);
});
test('raw typed property paths and nested equivalents match', () => {
  const a = run(scatter('  config xAxis.grid true'));
  const b = run(scatter('  config\n    xAxis\n      grid true'));
  const c = run(scatter('  config /xAxis/grid true'));
  assert.deepEqual(native(a), native(b)); assert.deepEqual(native(b), native(c));
});
test('unknown nested raw settings are rejected', () => {
  assert.ok(codes(run(scatter('  config\n    xAxis\n      scaleTyp symlog'))).includes('E_UNKNOWN_CONFIG'));
});
test('arbitrary unknown raw properties are not an escape from checking', () => {
  assert.ok(codes(run(scatter('  config inventedOption true'))).includes('E_UNKNOWN_CONFIG'));
});
test('empty arrays remain empty arrays, not omission', () => {
  const r = check(file('examples/raw-config.outline.eda'), catalog);
  assert.deepEqual(r.preview.chartPatches[0].facet.visibleFacetIds, []);
});
test('object arrays preserve order and custom column IDs', () => {
  const r = check(file('examples/raw-config.outline.eda'), catalog);
  assert.deepEqual(r.preview.chartPatches[1].columns.map(c => c.id), ['order-key', 'revenue-key']);
  assert.equal(r.preview.chartPatches[1].columns[0].field, 'Order ID');
});
test('quoted primitive-looking text stays text', () => {
  const r = check(file('examples/raw-config.outline.eda'), catalog);
  assert.equal(r.preview.chartPatches[1].globalSearch, 'true');
});
test('inline JSON array is accepted in raw config', () => {
  const r = run(scatter('  config filters [{"type":"value","field":"Category","values":["Home"]}]'));
  assert.equal(r.ok, true, JSON.stringify(r.diagnostics));
  assert.deepEqual(r.preview.chartPatches[0].filters[0].values, ['Home']);
});
test('hex color literals are not comments', () => {
  const r = run(scatter('  config colorScaleId #3479a8 # a comment'));
  assert.equal(r.preview.chartPatches[0].colorScaleId, '#3479a8');
});
test('an unfinished quote is diagnosed locally', () => {
  assert.ok(codes(run(scatter('  title "unfinished'))).includes('E_QUOTE'));
});
test('tabs are diagnosed, not silently normalized', () => {
  assert.ok(codes(run('scatter x revenue y margin\n\tid s')).includes('E_TABS'));
});
test('unindented options do not attach to the previous chart', () => {
  assert.ok(codes(run(scatter('opacity .5'))).includes('E_ROOT'));
});
test('keyword field names work in quoted explicit positions', () => {
  const c = { data: { fields: { color: 'numeric', x: 'numeric' } } };
  const r = check('eda 1 outline\nscatter x "color" y "x"\n  id s', c);
  assert.equal(r.ok, true, JSON.stringify(r.diagnostics));
});
test('single quoted field names are accepted', () => {
  const r = check("eda 1 outline\nscatter x 'Revenue' y 'Margin'\n  id s", catalog);
  assert.equal(r.ok, true);
});
test('optional colons/equal signs work without becoming mandatory', () => {
  const r = run(scatter('  opacity: .55\n  points = 3'));
  assert.equal(r.ok, true, JSON.stringify(r.diagnostics));
  assert.equal(r.preview.chartPatches[0].pointOpacity, .55);
});
test('documented alias is accepted with canonical spelling guidance', () => {
  const r = run(scatter('  colour category'));
  assert.equal(r.ok, true); assert.ok(codes(r).includes('W_ALIAS'));
});
test('categorical scatter axes are valid, unlike numeric histogram input', () => {
  const r = run('scatter x category y margin\n  id s');
  assert.equal(r.ok, true);
});
test('symlog on categorical axes is not silently accepted', () => {
  assert.ok(codes(run('scatter x category y margin\n  id s\n  x scale symlog')).includes('E_SCALE_FIELD'));
});
test('stored scatter bounds are preserved but reported as ineffective', () => {
  const r = run(scatter('  config xAxis.min 0'));
  assert.equal(r.ok, true); assert.ok(codes(r).includes('W_IGNORED_SETTING'));
});
test('raw references do not expand aliases', () => {
  assert.ok(codes(run(scatter('  config xField revenue'))).includes('E_RAW_FIELD'));
});
test('one workspace cannot silently mix sources', () => {
  assert.ok(codes(run(scatter('  source warehouse'))).includes('E_MIXED_SOURCE'));
});
test('missing catalog gives deferred status, never full binding success', () => {
  const r = check(`${mapping}\n\n${scatter('')}`);
  assert.equal(r.ok, true); assert.equal(r.validation.bindings, 'deferred');
});
test('source type expectations do not coerce host field types', () => {
  const c = structuredClone(catalog); c.salesRows.fields.Revenue = 'categorical';
  assert.ok(codes(run(scatter(''), c)).includes('E_FIELD_TYPE'));
});
test('optional source fields can be missing while unused', () => {
  const r = check('eda 1 outline\nsources\n  data\n    fields\n      unused Missing\n        optional true\nscatter x Revenue y Margin\n  id s', catalog);
  assert.equal(r.ok, true, JSON.stringify(r.diagnostics));
});
test('using a missing optional field still errors', () => {
  const r = check('eda 1 outline\nsources\n  data\n    fields\n      unused Missing\n        optional true\nscatter x unused y Margin\n  id s', catalog);
  assert.ok(codes(r).includes('E_UNKNOWN_FIELD'));
});
test('field alias cannot shadow a different raw field', () => {
  const r = check('eda 1 outline\nsources\n  data\n    fields\n      Revenue Margin\nscatter x Revenue y Margin\n  id s', catalog);
  assert.ok(codes(r).includes('E_ALIAS_SHADOW'));
});
test('range bounds are checked and open ends survive', () => {
  assert.ok(codes(run(scatter('  filter revenue between 5 1'))).includes('E_RANGE'));
  const r = run(scatter('  filter revenue between * 100'));
  assert.equal(r.ok, true); assert.equal(r.preview.chartPatches[0].filters[0].min, undefined);
});
test('null and literal null remain distinct filter values', () => {
  const r = run(scatter('  filter category in null "null"'));
  assert.deepEqual(r.preview.chartPatches[0].filters[0].values, [null, 'null']);
});
test('nonfinite raw numbers are rejected', () => {
  assert.ok(codes(run(scatter('  config pointOpacity 1e999'))).includes('E_NUMBER'));
});
test('prototype-pollution paths and objects are rejected', () => {
  for (const body of ['  config __proto__.polluted true', '  config\n    constructor\n      prototype\n        polluted true', '  config filters [{"__proto__":{"polluted":true}}]']) assert.ok(codes(run(scatter(body))).includes('E_UNSAFE_KEY'));
  assert.equal({}.polluted, undefined);
});
test('unsupported full-design declarations fail explicitly', () => {
  assert.ok(codes(run('defaults\n  scatter\n    opacity .5')).includes('E_REVIEW_LIMIT'));
});
test('type discrimination survives raw config', () => {
  assert.ok(codes(run(scatter('  config type row'))).includes('E_TYPE_CONFLICT'));
});
test('wrong-chart options are rejected', () => {
  assert.ok(codes(run('row field category\n  id r\n  opacity .5')).includes('E_SETTING_FOR_CHART'));
});
test('layout dimensions must be positive integers', () => {
  assert.ok(codes(run(scatter('  at 0 0 0 4'))).includes('E_LAYOUT'));
});
test('same input produces identical diagnostics and previews', () => {
  const text = file('examples/invalid.outline.eda');
  assert.deepEqual(check(text, catalog), check(text, catalog));
});
test('JSON strings preserve embedded comments, delimiters, and spaces', () => {
  const r = run(scatter('  config filters [{"type":"value","field":"Category","values":["Home # not a comment; still text"]}]'));
  assert.equal(r.ok, true, JSON.stringify(r.diagnostics));
  assert.equal(r.preview.chartPatches[0].filters[0].values[0], 'Home # not a comment; still text');
});
test('native DataTable interface does not gain invented aggregateId support', () => {
  assert.ok(codes(run('table fields revenue\n  id t\n  config aggregateId invented')).includes('E_UNKNOWN_CONFIG'));
});
