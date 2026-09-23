// Standalone fallback validation. This is NOT pnpm/Vitest or the repository test suite.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { captureScatterProbe: capture, planScatterProbe: plan, traceScatterProbe: trace } = require('./compiled/scatterPlan.prototype.js');
const { drawScatterProbe: draw, scatterProbeSvg: svg } = require('./compiled/scatterPlan.prototypeAdapters.js');
const settings = { chartId: 'probe', xField: 'x', yField: 'y', width: 400, height: 300, margin: { left: 40, right: 20, top: 20, bottom: 40 }, xKind: 'linear', yKind: 'linear', radius: 3, opacity: .7, fill: '#3479a8' };
const revision = { dataset: 'fixture-1', values: 1, filters: 1 };
const input = () => ({ revision, allIds: [0,1,2,3], otherFilterEntries: [{key:0,value:1},{key:1,value:1},{key:2,value:0},{key:3,value:1}], allPassIds: [1,3], columns: { x: {0:1,1:2,2:100,3:3}, y:{0:5,1:6,2:9,3:undefined} } });
const cases = [];
function check(name, fn) { fn(); cases.push(name); console.log('PASS', name); }
check('repeatability of plan and serialized SVG', () => {
  const a=plan(capture(input()), settings), b=plan(capture(input()), settings);
  assert.equal(JSON.stringify(a),JSON.stringify(b)); assert.equal(svg(a),svg(b));
});
check('self-filter dims; other filters remove; coordinate omissions accounted', () => {
  const p=plan(capture(input()), settings);
  assert.deepEqual(p.marks.map(m=>[m.rowId,m.opacity]), [[0,.15],[1,.7]]);
  assert.deepEqual(p.exclusions.map(e=>[e.rowId,e.stage]), [[2,'other-filters'],[3,'coordinates']]);
  assert.equal(p.scopes.all.length, p.marks.length+p.exclusions.length);
});
check('shared domain keeps a filtered-out extreme; values have one source', () => {
  const p=plan(capture(input()), settings);
  assert.deepEqual(p.scales[0].domain,[-8.9,109.9]);
  assert.equal(trace(p,p.marks[0].id).value.rowId,0);
  assert.equal(trace(p,p.marks[0].id).controls[0].rowSetRef,'all');
  assert.throws(()=>trace(p,'unknown'));
});
check('snapshots are isolated from subsequent alias mutations', () => {
  const i=input(), s=capture(i), initial=JSON.stringify(s);
  i.allIds.push(99); i.otherFilterEntries[0].value=0; i.columns.x[0]=999;
  assert.equal(JSON.stringify(s),initial); assert(Object.isFrozen(s.scopes.all)); assert(Object.isFrozen(s.columns.x));
});
check('facets use explicit membership; empty is not unrestricted', () => {
  const i=input(); i.facetIds=[1]; assert.deepEqual(plan(capture(i),settings).marks.map(m=>m.rowId),[1]);
  i.facetIds=[]; const p=plan(capture(i),settings); assert.equal(p.marks.length,0); assert.equal(p.exclusions.length,4);
  assert(p.diagnostics.some(d=>d.includes('legacy')));
});
check('stable mark identity survives parameter/filter revisions', () => {
  const a=plan(capture(input()),settings);const i=input();i.allPassIds=[0,1,3];i.revision={...revision,filters:2};
  const b=plan(capture(i),{...settings,width:500});
  assert.deepEqual(a.marks.map(m=>m.id),b.marks.map(m=>m.id)); assert.notEqual(a.marks[0].x,b.marks[0].x);
  const c=plan(capture({...input(),revision:{...revision,dataset:'another'}}),settings);
  assert.notEqual(c.marks[0].id,a.marks[0].id);
});
check('drawing uses the plan only; adapter identity matches the marks', () => {
  const p=plan(capture(input()),settings), ids=[];
  draw(p,{begin(w,h,clip){assert.equal(w,400);assert.equal(h,300);assert.equal(clip.width,340)},point(id){ids.push(id)},end(){}});
  assert.deepEqual(ids,p.marks.map(m=>m.id));
  assert.equal((svg(p).match(/<circle /g)||[]).length,2);
  assert(!svg(plan(capture(input()), {...settings,fill:'"><script>BAD</script>'})).includes('<script>'));
  fs.writeFileSync(path.join(__dirname,'probe.svg'),svg(p));
});
check('bad identities, inconsistent scopes and viewport reject atomically', () => {
  assert.throws(()=>capture({...input(),allIds:[0,0]}));
  assert.throws(()=>capture({...input(),allPassIds:[2]}));
  assert.throws(()=>capture({...input(),facetIds:[77]}));
  assert.throws(()=>plan(capture(input()),{...settings,width:30}));
  assert.throws(()=>plan(capture(input()),{...settings,xField:'absent'}));
});
check('equal-valued domains produce finite center points', () => {
  const i=input();i.columns={x:{0:2,1:2,2:2,3:2},y:{0:4,1:4,2:4,3:4}};
  const p=plan(capture(i),settings);assert(p.marks.every(m=>m.x===210&&m.y===140));
});
check('linear and symlog paths finite; current 2D coercion remains explicit', () => {
  const i=input(); i.columns={x:{0:true,1:' ',2:-100,3:''}, y:{0:2,1:3,2:4,3:null}};
  const p=plan(capture(i),{...settings,xKind:'symlog'});
  assert.equal(p.marks.length,2);assert(p.marks.every(m=>Number.isFinite(m.x)&&Number.isFinite(m.y)));
  assert.equal(p.scales[0].domain[0],-100);
});
check('draw order follows the captured group order, not a new sort', () => {
  const i=input();i.otherFilterEntries.reverse();
  assert.deepEqual(plan(capture(i),settings).marks.map(m=>m.rowId),[1,0]);
});
check('input values do not leak into the serialized mark plan', () => {
  const p=plan(capture(input()),settings);
  assert(!Object.hasOwn(p,'columns')); assert(!Object.hasOwn(p.marks[0],'rawRow'));
  assert(p.marks.every(m=>m.lineage.controlRefs.length===5));
});

// Adapted only from the pinned generator's shop_operations branch. No CSV/parser/CalculationManager equivalence is claimed.
function shopRows(count){
 let state=0x5eeded>>>0;
 const random=()=>{state=(state+0x6d2b79f5)|0;let value=Math.imul(state^(state>>>15),1|state);value^=value+Math.imul(value^(value>>>7),61|value);return((value^(value>>>14))>>>0)/4294967296;};
 const products=[{price:32,cost:.52},{price:18,cost:.47},{price:24,cost:.44},{price:74,cost:.58},{price:46,cost:.55},{price:28,cost:.63}];
 return Array.from({length:count},(_,index)=>{
   const date=new Date(Date.UTC(2024,0,1+index%366)),p=products[index%6],returned=index%37===0||random()<.025;
   const seasonal=[.75,.8,.9,1,1.1,1.15,1.25,1.2,1.05,.95,.85,.8][date.getUTCMonth()];
   const units=index===111||index===333?180+index-111:Math.max(1,Math.round((1+Math.floor(random()**2*28))*seasonal));
   const unitPrice=p.price*(.94+random()*.12),discount=index%79===0?null:[0,.05,.1,.2][index%4];
   const revenue=units*unitPrice*(1-(discount??0)),cost=revenue*p.cost;
   const deliveryDays=index%61===0?null:1+Math.floor(random()*(returned?9:6));
   const fulfilled=returned||random()>.08; void deliveryDays;void fulfilled; // Preserve the source generator's draw sequence.
   const gross=units*Number(unitPrice.toFixed(2)),discountRate=Math.min(.25,Math.max(0,discount??0));
   const net=gross-gross*discountRate,contribution=net-Number(cost.toFixed(2));
   return {id:index,x:net,y:contribution,region:index%4};
 });
}
const rows=shopRows(10000), columns={x:{},y:{}},allIds=rows.map(r=>r.id);
for(const r of rows){columns.x[r.id]=r.x;columns.y[r.id]=r.y;}
const benchInput={revision:{dataset:'shop-generator-adaptation',values:1,filters:1},allIds,columns,
 otherFilterEntries:rows.map(r=>({key:r.id,value:r.region<2?1:0})),allPassIds:rows.filter(r=>r.region<2&&r.x>=100).map(r=>r.id)};
const times={capture:[],plan:[],svg:[]};let result;
for(let i=0;i<35;i++){
 const t0=performance.now(),s=capture(benchInput),t1=performance.now(),p=plan(s,{...settings,width:800,height:500}),t2=performance.now();
 const rendered=svg(p),t3=performance.now(); if(i>=5){times.capture.push(t1-t0);times.plan.push(t2-t1);times.svg.push(t3-t2)}
 result={p,rendered};
}
const stats=xs=>{const ordered=[...xs].sort((a,b)=>a-b);return{medianMs:ordered[Math.floor(ordered.length/2)],p95Ms:ordered[Math.ceil(ordered.length*.95)-1]};};
const rowSetMemberships=result.p.scopes.all.length+result.p.scopes.othersPass.length+result.p.scopes.allPass.length;
const measured={environment:{node:process.version,platform:process.platform,arch:process.arch},scope:'isolated planner on 10,000 rows adapted from pinned shop generator; two prepared calculations evaluated directly; NOT the demo or CalculationManager',warmups:5,iterations:30,rows:rows.length,marks:result.p.marks.length,excluded:result.p.exclusions.length,
 timings:Object.fromEntries(Object.entries(times).map(([k,v])=>[k,stats(v)])),
 memory:{measure:'UTF-8 serialized bytes, not heap allocation',planBytes:Buffer.byteLength(JSON.stringify(result.p)),scopesBytes:Buffer.byteLength(JSON.stringify(result.p.scopes)),lineageBytes:Buffer.byteLength(JSON.stringify(result.p.marks.map(m=>m.lineage))),rowSetMemberships,pointSourceReferences:result.p.marks.length,scalePopulationReferences:2,scalePopulationCopiesPerMark:0},
 limitations:['No React, live Crossfilter, D3, actual CSV parse or all fourteen calculations executed','Capture clones requested two columns; sharing immutable prepared columns remains future work','No measured heap peak or React frame-time claims']};
fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify({casesPassed:cases.length,cases,benchmark:measured},null,2)+'\n');
console.log(JSON.stringify(measured,null,2));
