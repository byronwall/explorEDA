#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {check,format} from '../dist/flat.js';
import {functions} from '../dist/expressions.js';
import {applyEdits} from '../dist/edits.js';
const args=process.argv.slice(2);const command=args.shift();
const sha256=text=>createHash('sha256').update(text,'utf8').digest('hex');
const option=flag=>{const i=args.indexOf(flag);return i<0?undefined:args[i+1];};
const help='Usage:\n  node checker/cli.mjs check FILE [--catalog FILE] [--json] [--strict]\n  node checker/cli.mjs explain FILE --chart ID [--catalog FILE]\n  node checker/cli.mjs format FILE [--width 50] [--write]\n  node checker/cli.mjs apply FILE PATCH.json [--write]\n  node checker/cli.mjs schema';
try {
  if(command==='schema') {
    console.log(JSON.stringify({language:'eda 3 flat',targetRef:'226ffae632239150b54b55e9b346386e5e1e66d4',charts:['scatter','hist','bar','row','table','metric'],fieldTypes:['num','cat','date','bool'],calculationFunctions:functions,filterForms:['where.FIELD=MIN..MAX','where.FIELD=A,B','where.FIELD=null','where.FIELD.contains=TEXT','where=none','edit ID where.FIELD=*'],output:'partial native settings; not a full SavedDataStructure'},null,2));
  } else {
    const file=args.shift();if(!file||!['check','explain','format','apply'].includes(command??''))throw new Error(help);
    const text=readFileSync(file,'utf8');
    if(command==='apply') {
      const path=args.shift();if(!path)throw new Error(help);
      const request=JSON.parse(readFileSync(path,'utf8'));
      if(request.documentSHA256!==sha256(text))throw new Error('Stale documentSHA256. Recheck the current file before applying repairs.');
      if(!Array.isArray(request.edits))throw new Error('PATCH.json requires an edits array.');
      const next=applyEdits(text,request.edits);
      if(args.includes('--write')){writeFileSync(file,next);console.error(`[outline] Applied ${request.edits.length} guarded edit(s) to ${file}; recheck before use.`);}else process.stdout.write(next);
    } else if(command==='format') {
      const result=format(text,Number(option('--width')??50));
      if(!result.ok){console.error(JSON.stringify(result.diagnostics,null,2));process.exitCode=1;}
      else if(args.includes('--write')){writeFileSync(file,result.text);console.error(`[outline] Formatted ${file}; calculation bodies remain intact.`);}else process.stdout.write(result.text);
    } else {
      const path=option('--catalog');const catalog=path?JSON.parse(readFileSync(path,'utf8')):undefined;
      const result=check(text,catalog);const response={documentSHA256:sha256(text),...result};
      if(command==='explain') {
        const id=option('--chart');const index=result.preview.chartPatches.findIndex(c=>c.id===id);
        if(index<0)throw new Error('Unknown chart ID for explain.');
        console.log(JSON.stringify({documentSHA256:sha256(text),ok:result.ok,productionReady:false,chart:result.preview.chartPatches[index],origins:result.origins[index],filterOrigins:result.filterOrigins.filter(o=>o.chart===index),calculations:result.preview.calculations??[],calculationOrigins:result.calculationOrigins,diagnostics:result.diagnostics},null,2));
      }else if(args.includes('--json'))console.log(JSON.stringify(response,null,2));
      else {
        console.log(`[outline] ${result.ok?'Supported-subset checks pass':'Errors found'}; bindings ${result.validation.bindings}; native runtime not run.`);
        console.log(`[outline] ${(result.preview.calculations??[]).length} calculations; ${result.preview.chartPatches.length} charts; SHA256 ${response.documentSHA256}`);
        for(const d of result.diagnostics)console.log(`${d.range.start.line+1}:${d.range.start.character+1} ${d.code} ${d.message}${d.suggestions?.length?' Suggestions: '+d.suggestions.join(', '):''}`);
      }
      process.exitCode=!result.ok?1:args.includes('--strict')&&result.diagnostics.some(d=>d.severity==='warning'&&!d.code.startsWith('I_'))?2:0;
    }
  }
}catch(error){console.error(`[outline] ${error instanceof Error?error.message:String(error)}`);process.exitCode=2;}
