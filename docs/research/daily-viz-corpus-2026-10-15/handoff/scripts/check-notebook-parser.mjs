/** Execute the real baseline fence parser only. This is NOT DSL compilation.
 * node --experimental-strip-types evidence/scripts/check-notebook-parser.mjs --source-root /path/to/checkout
 * The authorized extracted source packet also suffices: this one parser has no imports.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const at=process.argv.indexOf('--source-root');
if(at<0 || !process.argv[at+1]) throw new Error('Supply --source-root with the authorized source or a checked-out baseline.');
const source=join(resolve(process.argv[at+1]),'packages/explorEDA/src/lib/notebook/parseNotebook.ts');
const hash=createHash('sha256').update(readFileSync(source)).digest('hex');
const expected='4fdee9cd2462d9cb5ec7f7dacdc3e5d49bfe92bcfab0e67e51790e1ec34a6eea';
if(hash!==expected) throw new Error('Notebook parser differs from the authorized baseline. Record the difference before testing.');
const {parseNotebook}=await import(pathToFileURL(source).href);
const entries=JSON.parse(readFileSync(join(root,'catalog.json'),'utf8')).filter(x=>x.kind==='notebook');
const results=entries.map(e=>{
 const parsed=parseNotebook(readFileSync(join(root,e.entry_path),'utf8'));
 const closed=parsed.blocks.every(b=>Number.isInteger(b.closeLine));
 const charts=parsed.blocks.flatMap(b=>b.text.split('\n')).filter(s=>/^(scatter|hist|bar|row|boxplot|calendar|ecdf|heatmap|line|metric|table|parallel)\s+@/.test(s)).length;
 if(!closed || parsed.blocks.length!==6 || charts!==5) throw new Error(`Unexpected notebook structure: ${e.id}`);
 return {id:e.id,blocks:parsed.blocks.length,charts,closed,line_count:parsed.lines.length};
});
const result={check:'actual-authorized-notebook-fence-parser',status:'passed',node:process.version,source_sha256:hash,notebooks:results.length,blocks:results.reduce((n,r)=>n+r.blocks,0),chart_declarations:results.reduce((n,r)=>n+r.charts,0),dsl_compiled:false,limitations:'Parses notebook fences and prose. Does not compile dashboard text, validate settings, render charts, or exercise interactions.',results};
writeFileSync(join(root,'evidence/validation/notebook-parser.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,notebooks:result.notebooks,blocks:result.blocks,dsl_compiled:false}));
