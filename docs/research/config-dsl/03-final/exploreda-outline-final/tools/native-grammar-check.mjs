// Optional external oracle. Pass a real module exposing grammar() or the deployed g export.
// The reference grammar was extracted from the user's baseline deployment artifact, not invented.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { parseExpression, printExpression } from '../dist/expressions.js';
const path=process.argv[2];
if(!path)throw new Error('Usage: node tools/native-grammar-check.mjs PATH_TO_OHM_ES_MODULE');
const ohm=await import(pathToFileURL(path));
const text=readFileSync(new URL('../reference/native-calculation.ohm',import.meta.url),'utf8');
const grammar=(ohm.grammar??ohm.g)(text);
const inputs=['Revenue-Cost','Revenue==0 ? null : profit/Revenue','if Revenue==0 then null else profit/Revenue',
 'Revenue>100 || Channel=="Web"','sum(Revenue,Cost)','formatDate(["Order Date"],"%Y-%m")','2^3^2','-2^2','-(2^2)','1e-100 + .5','1e100'];
let seed=12648430;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;}
function generated(depth=0){if(depth===3||rand()<.25)return String(Math.floor(rand()*20));const a=generated(depth+1),b=generated(depth+1);return `(${a}${['+','-','*','/','^'][Math.floor(rand()*5)]}${b})`;}
for(let i=0;i<250;i++)inputs.push(generated());
const cases=inputs.map(input=>{const emitted=printExpression(parseExpression(input),n=>n);const m=grammar.match(emitted);return {input,emitted,pass:m.succeeded(),...(m.failed()?{message:m.message}:{})};});
const result={scope:'Syntax recognition only; no native value evaluation or chart runtime',grammarSourceRef:'94bfe0b325b9a19100def647e5555766a1f7eb9f deployed artifact',grammarSHA256:createHash('sha256').update(text).digest('hex'),oracleModuleSHA256:createHash('sha256').update(readFileSync(path)).digest('hex'),cases};
writeFileSync(new URL('../evidence/native-grammar.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(`[native grammar] ${cases.filter(c=>c.pass).length}/${cases.length} emitted expressions recognized.`);
process.exitCode=cases.every(c=>c.pass)?0:1;
