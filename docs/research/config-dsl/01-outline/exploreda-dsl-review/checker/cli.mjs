#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { check } from './checker.ts';
const args = process.argv.slice(2);
if (!args[0] || args.includes('--help')) {
  console.error('Usage: node --experimental-strip-types checker/cli.mjs FILE [--catalog FILE] [--json]');
  process.exit(args.includes('--help') ? 0 : 2);
}
try {
  const catalogAt = args.indexOf('--catalog');
  if (catalogAt >= 0 && !args[catalogAt + 1]) throw new Error('--catalog needs a file');
  const catalog = catalogAt >= 0 ? JSON.parse(readFileSync(args[catalogAt + 1], 'utf8')) : undefined;
  if (catalog && (typeof catalog !== 'object' || Array.isArray(catalog) || Object.values(catalog).some(s => !s || typeof s.fields !== 'object' || Array.isArray(s.fields)))) throw new Error('Catalog must map source bindings to { fields: { name: type } }.');
  const result = check(readFileSync(args[0], 'utf8'), catalog);
  if (args.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else {
    for (const d of result.diagnostics) console.log(`${args[0]}:${d.range.start.line + 1}:${d.range.start.character + 1} ${d.severity} ${d.code}: ${d.message}${d.suggestions?.length ? ` Suggestions: ${d.suggestions.join(', ')}` : ''}`);
    console.log(`[eda-review] ${result.ok ? 'Subset checks pass' : 'Checks failed'}; ${result.preview.chartPatches.length} chart patches; bindings ${result.validation.bindings}. Full native schema and runtime were not checked.`);
  }
  process.exitCode = result.ok ? 0 : 1;
} catch (error) {
  console.error(`[eda-review] input/tool failure: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
}
