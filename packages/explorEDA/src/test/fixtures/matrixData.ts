import type { datum } from "@/types/ChartTypes";
import type { MatrixSnapshot } from "@/components/charts/ScatterMatrix/matrixPlan";

/** A small seeded generator, so benchmarks see the same rows every run. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Rows with correlated numeric fields `n0…`, category fields `c0…` with three
 * to eight values, and about 1% missing values in every field.
 */
export function matrixRows(
  rows: number,
  numeric: number,
  categorical: number,
  seed = 7
): MatrixSnapshot {
  const next = random(seed);
  const normal = () =>
    Math.sqrt(-2 * Math.log(next() || 1e-9)) * Math.cos(2 * Math.PI * next());
  const columns: Record<string, Record<number, datum>> = {};
  const types: MatrixSnapshot["types"] = {};
  for (let f = 0; f < numeric; f++) {
    columns[`n${f}`] = {};
    types[`n${f}`] = "numeric";
  }
  for (let f = 0; f < categorical; f++) {
    columns[`c${f}`] = {};
    types[`c${f}`] = "categorical";
  }
  const ids: number[] = [];
  for (let id = 0; id < rows; id++) {
    ids.push(id);
    const base = normal();
    for (let f = 0; f < numeric; f++) {
      columns[`n${f}`]![id] =
        next() < 0.01 ? null : base * (1 - f / 12) + normal() * 0.6 + f * 3;
    }
    for (let f = 0; f < categorical; f++) {
      const count = 3 + f * 2;
      columns[`c${f}`]![id] =
        next() < 0.01
          ? null
          : `group ${Math.min(count - 1, Math.floor((base + 2.5) * (count / 5) + next()))}`;
    }
  }
  return { allIds: ids, liveIds: ids, columns, types };
}

/** Field names for a matrix of `count` fields, about a third of them categories. */
export function matrixFields(count: number, mixed: boolean) {
  const categorical = mixed ? Math.floor(count / 3) : 0;
  return [
    ...Array.from({ length: count - categorical }, (_, f) => `n${f}`),
    ...Array.from({ length: categorical }, (_, f) => `c${f}`),
  ];
}
