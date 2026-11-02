// Analysis companion only. Executes existing source modules; implements no navigation feature.
// Node 24: node replay-source-checks.mjs /path/to/pinned-checkout [supplemental-source-root]
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const supplied = process.argv.slice(2);
if (!supplied.length) {
  console.error('Usage: node replay-source-checks.mjs /path/to/explorEDA [supplemental-root]');
  process.exit(2);
}
const roots = supplied.map(path => resolve(path, 'packages/explorEDA/src'));
const candidate = path => ['.ts', '.tsx', '/index.ts'].map(ext => path + ext).find(existsSync);
const sourcePath = path => {
  const found = roots.map(root => resolve(root, path)).find(existsSync);
  if (!found) throw new Error(`Missing pinned source: ${path}`);
  return found;
};
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const found = roots.map(root => candidate(resolve(root, specifier.slice(2)))).find(Boolean);
    if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
  }
  if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
    const path = resolve(dirname(fileURLToPath(context.parentURL)), specifier);
    let found = candidate(path);
    for (const root of roots) {
      if (found) break;
      const rel = relative(root, path);
      if (rel.startsWith('..')) continue;
      found = roots.map(other => candidate(resolve(other, rel))).find(Boolean);
    }
    if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}});
const load = path => import(pathToFileURL(sourcePath(path)).href);
const { parseNotebook } = await load('lib/notebook/parseNotebook.ts');
const { notebookSheets } = await load('lib/notebook/sheets.ts');
const { parseDocument } = await load('lib/dsl/parse.ts');
const { lowerComposition } = await load('lib/dsl/composition.ts');
const { isCompositionDefinition } = await load('components/charts/Composition/validateComposition.ts');
const base = readFileSync(resolve(here, 'six-block.eda.md'), 'utf8');
const cases = JSON.parse(readFileSync(resolve(here, 'edge-cases.json'), 'utf8'));
const notebook = parseNotebook(base);
assert.equal(notebook.blocks.length, 6);
assert.deepEqual(notebookSheets(notebook).sheets.map(sheet => sheet.id), ['results', 'definitions']);
assert(notebook.blocks.every(block => !Object.hasOwn(block, 'id')));
const mainParse = notebook.blocks.flatMap(block => parseDocument(block.text).problems);
assert.deepEqual(mainParse, []);
console.error('[source-check] Six-block source and sheet parsing passed.');

const checked = [];
for (const testCase of cases.cases) {
  for (const variant of testCase.variants ?? [testCase]) {
    let source = variant.sourceText;
    if (variant.edit) {
      assert.equal(base.split(variant.edit.before).length, 2, `${testCase.id}: unique edit`);
      source = base.replace(variant.edit.before, variant.edit.after);
    }
    assert.equal(typeof source, 'string', testCase.id);
    const blocks = parseNotebook(source).blocks;
    const parsed = blocks.map(block => parseDocument(block.text));
    const problems = parsed.flatMap(item => item.problems).map(item => item.message);
    assert.deepEqual(problems, testCase.id === 'NDN-EC14'
      ? ['metric on line 2 has no closing }.'] : [], testCase.id);
    const compositions = [];
    for (const declaration of parsed.flatMap(item => item.declarations).filter(item => item.keyword === 'composition')) {
      const errors = [];
      const composition = lowerComposition(declaration, {}, errors);
      assert(isCompositionDefinition(composition), testCase.id);
      assert.deepEqual(errors.map(error => error.message), testCase.id === 'NDN-EC16'
        ? ['missing is not a scale in this composition, so point "Bad" was left out.'] : []);
      if (testCase.id === 'NDN-EC16') assert.deepEqual(composition.elements[0].marks.map(mark => mark.id), ['good']);
      if (variant.id === 'no-alias-normalization') assert.equal(composition.scales[0].field, 'revenue');
      if (variant.id === 'same-spelling-distinct-scope') {
        assert.equal(composition.scales[0].id, 'net');
        assert.equal(composition.scales[0].field, 'net');
        assert.equal(composition.elements[0].marks[0].xScaleId, 'net');
      }
      compositions.push({ id: declaration.name, structurallyValid: true, problems: errors.map(error => error.message) });
    }
    checked.push({ id: testCase.id, variant: variant === testCase ? null : variant.id,
      blocks: blocks.length, parseProblems: problems, compositions });
  }
}
console.error(`[source-check] ${checked.length} concrete edge-case sources passed their parse/lowering assertions.`);

const labelVariant = parseNotebook(base.replace('label value=net-measure', 'label @net-label value=net-measure'));
const compositionDeclaration = labelVariant.blocks.flatMap(block => parseDocument(block.text).declarations)
  .find(declaration => declaration.keyword === 'composition');
const labelErrors = [];
const labelComposition = lowerComposition(compositionDeclaration, {}, labelErrors);
assert.deepEqual(labelErrors, []);
assert.equal(compositionDeclaration.children.find(item => item.keyword === 'unit').children.find(item => item.keyword === 'label').name, 'net-label');
assert.equal(labelComposition.elements[0].label.id, undefined);

// Exact source-slice checks load only these function bodies. No engine stubs.
const compiler = readFileSync(sourcePath('lib/dsl/compile.ts'), 'utf8');
const rewriteSlice = compiler.slice(compiler.indexOf('export function rewriteFormula('), compiler.indexOf('\nfunction overlaps('));
assert(rewriteSlice.startsWith('export function rewriteFormula('));
const rewrite = new Function(stripTypeScriptTypes(rewriteSlice.replace('export function', 'function')) + ';return rewriteFormula;')();
const bare = rewrite('revenue * 2', name => name === 'revenue' ? 'Revenue' : undefined);
const bracket = rewrite('["revenue"] * 2', name => name === 'revenue' ? 'Revenue' : undefined);
assert.equal(bare.text, 'Revenue * 2');
assert.equal(bracket.text, '["revenue"] * 2');
const engine = readFileSync(sourcePath('lib/calculations/engine/Calculator.ts'), 'utf8');
const validationSlice = engine.slice(engine.indexOf('export function validateExpression('), engine.indexOf('\nexport class Calculator'));
assert(validationSlice.startsWith('export function validateExpression('));
const validate = new Function(stripTypeScriptTypes(validationSlice.replace('export function', 'function')) + ';return validateExpression;')();
assert.throws(() => validate({type: 'literal', dependencies: ['revenue'], value: 'revenue'},
  ['Revenue', 'Cost', 'Region', '__ID', 'x']), { message: 'Unknown field: revenue' });
console.error('[source-check] Isolated rewrite/validation and discarded-label-id assertions passed.');

console.log(JSON.stringify({
  baseline: 'd3920a285f3755a8324998775deb131747e959f5', node: process.version,
  classification: 'Executed original parser/lowerer modules and isolated source-function bodies. Not full compiler or application execution.',
  main: { blocks: 6, sheets: ['results', 'definitions'], parseProblems: mainParse,
    fenceIdsAcceptedButNotRetainedByBaseline: true, nestedLabelIdDiscardedByBaseline: true },
  concreteSources: checked.length,
  compositionInstances: checked.reduce((sum, entry) => sum + entry.compositions.length, 0),
  cases: checked,
  isolatedFunctions: { aliasBare: bare.text, aliasBracketed: bracket.text, unknownField: 'Unknown field: revenue',
    validationInput: 'Hand-supplied literal Expression with parser-supported dependency shape; parseExpression was not run.' },
  notRun: ['compileDocument', 'compileNotebook', 'parseExpression', 'calculation/finding evaluation',
    'React/browser navigation', 'pnpm check', 'performance/usability measurements']
}, null, 2));
