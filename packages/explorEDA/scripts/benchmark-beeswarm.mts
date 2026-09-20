import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { scaleLinear } from "d3-scale";

const sourcePath =
  "packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts";
const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const currentSource = fs.readFileSync(
  new URL(
    "../src/components/charts/BoxPlot/boxPlotCalculations.ts",
    import.meta.url
  ),
  "utf8"
);
const oldSource = execFileSync("git", ["show", `f04e790:${sourcePath}`], {
  cwd: repoRoot,
  encoding: "utf8",
});

async function loadCalculations(source) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}

const rows = fs
  .readFileSync(
    new URL("../../../apps/demo/public/correlated_medium.csv", import.meta.url),
    "utf8"
  )
  .trim()
  .split("\n")
  .slice(1)
  .map((line) => line.split(",").map(Number));
const groups = new Map();
for (const row of rows) {
  const value = row[7];
  const group = row[10];
  if (!Number.isFinite(value) || !Number.isFinite(group)) continue;
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push(value);
}
const values = rows.map((row) => row[7]);
const min = Math.min(...values);
const max = Math.max(...values);
const range = max - min;
const yScale = scaleLinear()
  .domain([min - range * 0.1, max + range * 0.1])
  .range([356, 0]);

function benchmark(calculate, maxPoints) {
  const run = () => {
    let count = 0;
    for (const data of groups.values()) {
      count += calculate(data, 50, maxPoints, 0, yScale).length;
    }
    return count;
  };
  for (let i = 0; i < 3; i++) run();
  const times = [];
  let count = 0;
  for (let i = 0; i < 9; i++) {
    const start = process.hrtime.bigint();
    count = run();
    times.push(Number(process.hrtime.bigint() - start) / 1e6);
  }
  const sorted = [...times].sort((a, b) => a - b);
  return { count, median: sorted[4], p95: sorted[8] };
}

const [oldCalculations, currentCalculations] = await Promise.all([
  loadCalculations(oldSource),
  loadCalculations(currentSource),
]);
console.log(
  JSON.stringify({
    baselineCommit: "f04e790",
    before: benchmark(oldCalculations.calculateBeeSwarmPositions, 1000),
    after: benchmark(currentCalculations.calculateBeeSwarmPositions),
  })
);
