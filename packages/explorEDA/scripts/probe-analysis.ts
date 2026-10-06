import { writeFileSync } from "node:fs";
import {
  type AnalysisProject,
  type AnalysisSourceRow,
  type SourceDefinition,
  type RelationshipDefinition,
  type AnalysisStep,
  type AnalysisEvaluation,
  evaluateAnalysisQuery,
  stringifyAnalysisProject,
  stringifyAnalysisState,
} from "../dist/analysis.js";
let seed = 42;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2 ** 32;
};
const tables: Record<string, AnalysisSourceRow[]> = {};
const sources = Array.from(
  { length: 10 },
  (_, i): SourceDefinition => ({
    id: `s${i}`,
    name: `Table ${i}`,
    glyph: String(i),
    entityKey: "id",
    fields: [
      { id: "id", name: "ID", type: "number" },
      { id: "amount", name: "Amount", type: "number" },
    ],
  })
);
for (const source of sources)
  tables[source.id] = Array.from({ length: 10000 }, (_, id) => ({
    id,
    amount: Math.round(random() * 1000),
  }));
const relationships = sources.slice(1).map(
  (source): RelationshipDefinition => ({
    id: `r${source.id}`,
    name: `Match ${source.id}`,
    from: { sourceId: "s0", fieldId: "id" },
    to: { sourceId: source.id, fieldId: "id" },
    cardinality: "one-to-one",
  })
);
const steps: AnalysisStep[] = [
  { id: "start", kind: "source", sourceId: "s0" },
  ...sources.slice(1).map(
    (source, i): AnalysisStep => ({
      id: `step${i + 1}`,
      kind: "lookup",
      inputStepId: i === 0 ? "start" : `step${i}`,
      relationshipId: `r${source.id}`,
      as: source.id,
      inputFieldId: "s0.id",
    })
  ),
];
const project: AnalysisProject = {
  id: "scale",
  version: 1,
  sources,
  relationships,
  queries: [
    {
      id: "scale-query",
      name: "Scale query",
      glyph: "Q",
      frameLabel: "Base rows",
      steps,
      outputStepId: "step9",
    },
  ],
};
const runs: number[] = [];
let result: AnalysisEvaluation | undefined;
for (let i = 0; i < 3; i++) {
  const start = performance.now();
  result = evaluateAnalysisQuery(project, tables, "scale-query");
  runs.push(Math.round(performance.now() - start));
}
if (!result) throw new Error("No evaluation result");
let start = performance.now();
const encoded = stringifyAnalysisProject({
  format: "exploreda-project",
  version: 1,
  project,
  tables,
  views: [{ id: "scale-view", name: "Scale", queryId: "scale-query" }],
});
const serializationMs = Math.round(performance.now() - start);
const lookup = steps[1];
if (lookup?.kind !== "lookup") throw new Error("Missing lookup step");
const expansionProject = structuredClone(project);
expansionProject.queries[0].steps = [steps[0], { ...lookup, kind: "expand" }];
expansionProject.queries[0].outputStepId = "step1";
const variantTables = {
  ...tables,
  s1: tables.s1.flatMap((row) => [
    row,
    { ...row, amount: Number(row.amount) + 1 },
  ]),
};
start = performance.now();
const expanded = evaluateAnalysisQuery(
  expansionProject,
  variantTables,
  "scale-query"
);
const expansionMs = Math.round(performance.now() - start);
start = performance.now();
const ambiguous = evaluateAnalysisQuery(project, variantTables, "scale-query");
const ambiguityMs = Math.round(performance.now() - start);
const report = {
  seed: 42,
  inputTables: 10,
  inputRowsPerTable: 10000,
  totalInputRows: 100000,
  coldMs: runs[0],
  warmMs: runs.slice(1),
  peakResultRows: Math.max(...result.stages.map((s) => s.outputCount)),
  outputOriginLinks: result.rows.reduce(
    (n, row) => n + row.sourceRows.length,
    0
  ),
  originJsonBytes: JSON.stringify(result.rows.map((r) => r.sourceRows)).length,
  persistedBytes: Buffer.byteLength(encoded),
  persistedCompactBytes: Buffer.byteLength(
    stringifyAnalysisState(JSON.parse(encoded))
  ),
  serializationMs,
  expansion: {
    input: 10000,
    target: variantTables.s1.length,
    output: expanded.rows.length,
    durationMs: expansionMs,
  },
  ambiguity: {
    output: ambiguous.rows.length,
    conflicts: ambiguous.diagnostics.filter(
      (d) => d.code === "ambiguous-lookup"
    ).length,
    durationMs: ambiguityMs,
  },
};
console.log(JSON.stringify(report, null, 2));

const fixturePath = process.argv[2];
if (fixturePath) writeFileSync(fixturePath, encoded);
