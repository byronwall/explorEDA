/** Transactional, source-range repairs. Hash validation belongs to the caller before this function. */
import type { Range } from './outline-v1.js';
export interface TextEdit { range: Range; expectedText: string; newText: string }
export function applyEdits(text: string, edits: TextEdit[]): string {
  if (edits.length>500)throw new Error('At most 500 text edits are accepted.');
  const starts=[0]; const ends:number[]=[];
  for(let i=0;i<text.length;i++) {
    if(text[i]!=='\n' && text[i]!=='\r')continue;
    ends.push(i);if(text[i]==='\r' && text[i+1]==='\n')i++;
    starts.push(i+1);
  }
  ends.push(text.length);
  const offset=(position:{line:number;character:number})=>{
    const {line,character}=position;
    if(!Number.isInteger(line)||!Number.isInteger(character)||line<0||character<0||line>=starts.length||starts[line]!+character>ends[line]!)throw new Error('Text edit position is outside the document.');
    return starts[line]!+character;
  };
  const pending=edits.map(edit=>{
    if(typeof edit.expectedText!=='string'||typeof edit.newText!=='string')throw new Error('Edit text must be strings.');
    const start=offset(edit.range.start),end=offset(edit.range.end);
    if(start>end)throw new Error('Reversed text edit range.');
    if(text.slice(start,end)!==edit.expectedText)throw new Error('Stale text edit: expectedText does not match.');
    return {start,end,text:edit.newText};
  }).sort((a,b)=>a.start-b.start || a.end-b.end);
  for(let i=1;i<pending.length;i++)if(pending[i]!.start<pending[i-1]!.end || pending[i]!.start===pending[i-1]!.start)throw new Error('Overlapping or same-position text edits are ambiguous.');
  let result=text;
  for(const e of pending.reverse())result=result.slice(0,e.start)+e.text+result.slice(e.end);
  return result;
}
