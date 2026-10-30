/**
 * Research-only arithmetic verification, not an explorEDA implementation/test suite.
 * Requires Node 24 and a local source tree containing the supplied baseline files.
 * Run: node verify-fixtures.mjs /absolute/path/to/explorEDA
 * Loads the baseline value readers/converters from temporary copies; only the
 * fieldSettings module's import path is rewritten so Node can resolve it.
 * Hand-authored expected IDs live in expected-results.json, not in this program.
 */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sourceRoot = process.argv[2];
if (!sourceRoot) {
  console.error('Usage: node verify-fixtures.mjs /absolute/path/to/explorEDA');
  process.exit(2);
}
const fixture = JSON.parse(await readFile(join(here, 'fixture-data.json'), 'utf8'));
const expected = JSON.parse(await readFile(join(here, 'expected-results.json'), 'utf8'));
const scratch = await mkdtemp(join(tmpdir(), 'joint-missingness-baseline-'));
let checked = 0;
function check(label, actual, wanted) {
  assert.deepEqual(actual, wanted, label);
  checked += 1;
  console.log(`PASS ${String(checked).padStart(2, '0')} ${label}`);
}
try {
  const lib = resolve(sourceRoot, 'packages/explorEDA/src/lib');
  const parsing = await readFile(join(lib, 'valueParsing.ts'), 'utf8');
  const settings = await readFile(join(lib, 'fieldSettings.ts'), 'utf8');
  assert.equal(settings.split('"@/lib/valueParsing"').length - 1, 1);
  await writeFile(join(scratch, 'valueParsing.ts'), parsing);
  await writeFile(join(scratch, 'fieldSettings.ts'), settings.replace('"@/lib/valueParsing"', '"./valueParsing.ts"'));
  const { isMissingValue, finiteNumber } = await import(pathToFileURL(join(scratch, 'valueParsing.ts')).href);
  const { applyFieldSettings, convertFieldValue, buildConversionPreview } = await import(pathToFileURL(join(scratch, 'fieldSettings.ts')).href);
  const key = (row, fields) => fields.map(field => isMissingValue(row[field]) ? '1' : '0').join('');
  const ids = rows => rows.map(row => row.id);
  const patterns = (rows, fields) => {
    const result = {};
    for (const row of rows) (result[key(row, fields)] ??= []).push(row.id);
    return result;
  };
  const missingIds = (rows, fields) => Object.fromEntries(fields.map(field => [field, ids(rows.filter(row => isMissingValue(row[field])))]));
  const present = (rows, fields) => rows.filter(row => fields.every(field => !isMissingValue(row[field])));
  const finite = (rows, fields) => rows.filter(row => fields.every(field => finiteNumber(row[field]) !== undefined));
  const exact = (rows, fields, selectedMasks) => rows.filter(row => selectedMasks.includes(key(row, fields)));
  const counts = (rows, field) => Object.fromEntries([...new Set(rows.map(row => row[field]))].map(group => [group, rows.filter(row => row[field] === group).length]));
  const a = fixture.sixField;
  const e = expected.sixField;
  const effective = applyFieldSettings(a.rows, a.fieldSettings, a.inferredTypes);
  console.log(`Baseline: ${fixture.baseline}`);
  console.log('Scope: baseline pure parsing/conversion helpers and independent fixture arithmetic only.');
  check('six-field population', effective.length, e.populationCount);
  check('unequal groups', counts(effective, 'group'), e.groupCounts);
  check('all exact effective patterns', patterns(effective, a.fields), e.effectivePatterns);
  check('all exact raw patterns', patterns(a.rows, a.fields), e.rawPatterns);
  check('effective marginal memberships', missingIds(effective, a.fields), e.effectiveMissingIds);
  check('exact xy OR exact note', ids(exact(effective, a.fields, ['110000', '000100'])), e.orExactXYAndNote);
  check('exact x OR exact y excludes both-missing and complete', ids(exact(effective, a.fields, ['100000', '010000'])), e.orExactXAndY);
  check('inclusive xy differs from exact xy', ids(effective.filter(row => isMissingValue(row.x) && isMissingValue(row.y))), e.inclusiveXY);
  check('presence in x y w', ids(present(effective, ['x', 'y', 'w'])), e.presentXYW);
  check('finite numbers in x y w', ids(finite(effective, ['x', 'y', 'w'])), e.finiteXYW);
  check('finite complement', ids(effective.filter(row => !e.finiteXYW.includes(row.id))), e.finiteXYWExcluded);
  for (const field of ['x', 'note']) {
    const preview = buildConversionPreview(field, a.rows, a.fieldSettings[field], a.inferredTypes[field]);
    const keys = ['totalCount', 'validCount', 'missingCount', 'failedCount'];
    check(`${field} raw conversion preview`, Object.fromEntries(keys.map(k => [k, preview[k]])), e[`${field}ConversionPreview`]);
  }
  const fixed = applyFieldSettings(a.rows.map(row => row.id === 'r08' ? { ...row, x: 0 } : row), a.fieldSettings, a.inferredTypes);
  check('edit r08: exact x membership changes', ids(exact(fixed, a.fields, ['100000'])), e.afterFixR08ExactX);
  check('edit r08: complete membership changes', ids(exact(fixed, a.fields, ['000000'])), e.afterFixR08Complete);
  const union = exact(effective, a.fields, ['110000', '000100']);
  check('group A selected membership', ids(union.filter(row => row.group === 'A')), e.groupAUnion);
  check('group B selected membership', ids(union.filter(row => row.group === 'B')), e.groupBUnion);
  check('local A guard with active predicate', ids(exact(effective.filter(row => row.group === 'A'), a.fields, ['110000', '000100'])), e.localOnlyAAndActiveUnion);
  check('row reorder preserves semantic IDs', ids(exact([...effective].reverse(), a.fields, ['110000', '000100'])).sort(), [...e.orExactXYAndNote].sort());
  check('active-empty selection matches none', ids(exact(effective, a.fields, [])), []);
  check('zero-match selected signature remains empty', ids(exact(effective, a.fields, ['111111'])), []);
  check('empty population has no observed patterns', patterns([], a.fields), {});
  const appended = [...effective, {id:'r13',group:'A',x:null,y:130,z:13,note:'ok',flag:false,w:15}];
  check('new matching row joins saved semantic predicate', ids(exact(appended, a.fields, ['100000'])), e.afterAppendR13ExactX);
  check('categorical blank remains literal', effective.find(row => row.id === 'r07').note, '  ');
  check('authored null token becomes missing', effective.find(row => row.id === 'r10').note, undefined);
  check('absent property stays absent', Object.hasOwn(effective.find(row => row.id === 'r11'), 'w'), false);
  check('unconverted nonfinite text stays present', [isMissingValue(effective.at(-1).w), finiteNumber(effective.at(-1).w)], [false, undefined]);
  const native = [{}, {x:undefined}, {x:null}, {x:''}, {x:'  '}, {x:0}, {x:false}, {x:NaN}, {x:Infinity}, {x:-Infinity}];
  check('native absence/undefined/null/blank/zero/false/nonfinite', native.map(row => isMissingValue(row.x)), [true,true,true,true,true,false,false,false,false,false]);
  check('zero and false have different numeric eligibility', [finiteNumber(0), finiteNumber(false)], [0, undefined]);
  check('explicit null tokens may override zero/false', [convertFieldValue(0,'numeric',{nullTokens:['0']}).value, convertFieldValue(false,'boolean',{nullTokens:['false']}).value], [undefined,undefined]);
  check('numeric conversion failure has error and missing result', convertFieldValue('bad','numeric'), {value:undefined,error:'Not a finite number'});
  check('numeric nonfinite conversion failure', convertFieldValue(Infinity,'numeric'), {value:undefined,error:'Not a finite number'});
  check('boolean false conversion succeeds', convertFieldValue(false,'boolean'), {value:false});
  const b = fixture.equalMarginals;
  const eb = expected.equalMarginals;
  check('second-case population', b.rows.length, eb.populationCount);
  check('second-case exact patterns', patterns(b.rows, b.fields), eb.patterns);
  for (const group of ['spread','cluster']) {
    const rows = b.rows.filter(row => row.group === group);
    check(`${group} marginal membership`, missingIds(rows,b.fields), eb[`${group}MissingIds`]);
    check(`${group} complete membership`, ids(present(rows,b.fields)), eb[`${group}Complete`]);
    check(`${group} x y present membership`, ids(present(rows,['x','y'])), eb[`${group}PresentXY`]);
  }
  console.log(`Completed: ${checked} checks passed.`);
  console.log('Not executed: chart renderer, Crossfilter integration, notebook Keep, JSON/DSL round trips, folder reopen, browser acceptance, performance.');
} finally {
  await rm(scratch, { recursive: true, force: true });
}
