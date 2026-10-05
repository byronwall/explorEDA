// Run from the repository root after pnpm install. No production Python runtime.
// Uses the already-declared root TypeScript package, not a new dependency.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,"../../..");
const source=path.join(repo,"apps/demo/src/scatter-lab");
const output=path.join(repo,"tmp/scatter-test-bed/numerical-build");
fs.mkdirSync(output,{recursive:true});
const modules=["types","statistics","geometry","fixtures","settings","related","plan","numerical-checks","coverageSimulation"];
for(const name of modules){
  const file=path.join(source,name+".ts");
  const result=ts.transpileModule(fs.readFileSync(file,"utf8"),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});
  const code=result.outputText.replace(/(from\s+["'])(\.[^"']+)(["'])/g,(_,a,b,c)=>a+b+".mjs"+c);
  fs.writeFileSync(path.join(output,name+".mjs"),code);
}
const {numericalChecks}=await import(pathToFileURL(path.join(output,"numerical-checks.mjs")).href);
const {coverageSimulation}=await import(pathToFileURL(path.join(output,"coverageSimulation.mjs")).href);
const checks=numericalChecks();
const simulations=[5,30,200].map(n=>coverageSimulation(3000,n,2601003+n,100));
const result={node:process.version,typescript:ts.version,checks,simulations};
fs.writeFileSync(path.join(repo,"tmp/scatter-test-bed/numerical-rerun.json"),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(checks.some(check=>!check.passed))process.exitCode=1;
