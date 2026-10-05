#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { check, format } from '../dist/flat.js';
const args = process.argv.slice(2);
const command = args.shift();
const file = args.shift();
const valueAfter = flag => { const i=args.indexOf(flag); return i<0?undefined:args[i+1]; };
if (!['check','format'].includes(command) || !file) {
  console.error('Usage: node checker/cli.mjs check FILE [--catalog FILE] [--json]\n       node checker/cli.mjs format FILE [--width 50] [--write]');
  process.exitCode=2;
} else {
  try {
    const text=readFileSync(file,'utf8');
    if(command==='format'){
      const result=format(text, Number(valueAfter('--width')??50));
      if(!result.ok){ console.error(JSON.stringify(result.diagnostics,null,2));process.exitCode=1; }
      else if(args.includes('--write')){writeFileSync(file,result.text);console.error(`[outline-flat] Formatted ${file}.`);}
      else process.stdout.write(result.text);
    } else {
      const catalogPath=valueAfter('--catalog');
      const catalog=catalogPath?JSON.parse(readFileSync(catalogPath,'utf8')):undefined;
      // A host-supplied catalog is trusted metadata, never sampled or fetched here.
      const result=check(text,catalog);
      if(args.includes('--json')) console.log(JSON.stringify(result,null,2));
      else {
        console.log(`[outline-flat] ${result.ok?'Subset checks passed':'Errors found'}; bindings ${result.validation.bindings}; native output is patches only.`);
        for(const d of result.diagnostics) console.log(`${d.range.start.line+1}:${d.range.start.character+1} ${d.code} ${d.message}${d.suggestions?.length?' Suggestions: '+d.suggestions.join(', '):''}`);
      }
      process.exitCode=result.ok?0:1;
    }
  } catch(error){console.error(`[outline-flat] ${error instanceof Error?error.message:String(error)}`);process.exitCode=2;}
}
