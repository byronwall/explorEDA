import type { Field, Fixture, FixtureId, FixtureParameters, Row } from "./types";

export const presets: { id: FixtureId; label: string; note: string }[] = [
  { id: "positive", label: "Positive correlation", note: "Synthetic bivariate normal: mean (10,20), SD (2,6), correlation 0.85 by default." },
  { id: "negative", label: "Negative correlation", note: "Synthetic bivariate normal with negative correlation and unequal variances." },
  { id: "independent", label: "Independent Gaussian", note: "Independent normal coordinates with SD 2 and 6. Pearson correlation fluctuates around zero." },
  { id: "overlap", label: "Two overlapping groups", note: "Two normal groups with displaced means. Compare pooled and within-group fits." },
  { id: "mixture", label: "Multimodal mixture", note: "Three modes. A pooled data ellipse is a fitted contour, not the shape of this population." },
  { id: "ring", label: "Ring relationship", note: "A strong nonlinear relationship can have near-zero Pearson correlation." },
  { id: "unequal", label: "Unequal groups / pooled reversal", note: "90% group A, 10% group B. Opposing within-group and pooled relationships; counts remain explicit." },
  { id: "contamination", label: "Contamination and held-out rows", note: "Clean training cohort; shifted and contaminated held-out cohort. A training reference ignores selection changes." },
  { id: "tiny", label: "Tiny sample", note: "Two observations. Sample covariance is singular and a bivariate mean confidence region is undefined." },
  { id: "duplicates", label: "Duplicate measurements", note: "Repeated measurements retain distinct source IDs; they are not deduplicated." },
  { id: "identical", label: "Identical measurements", note: "All measurements are identical: zero-variance and distance layers are unavailable." },
  { id: "zero-variance", label: "One constant coordinate", note: "X has zero variance. Pearson correlation and a 2D inverse covariance are undefined." },
  { id: "collinear", label: "Exactly collinear", note: "Y=3X+2. A line is not a full-rank bivariate covariance model." },
  { id: "near-collinear", label: "Nearly collinear", note: "Y=3X+2 plus 1e−7 noise. The scale-aware conditioning gate rejects ordinary ellipse inference." },
  { id: "invalid", label: "Missing and nonfinite values", note: "Blank strings, booleans, null, undefined, NaN and infinities are excluded; finite numeric strings are retained." },
  { id: "offset", label: "Large offsets / unequal units", note: "Offsets near 1e12 and −1e9, with SD 2 and 6000. Centering before summation limits cancellation." },
  { id: "symlog", label: "Negative values / symlog", note: "Signed values over several magnitudes. Data-space boundaries are sampled before the display transform." },
  { id: "penguins", label: "Palmer Penguins · real", note: "Real scientific measurements. No Gaussian population truth is asserted. Source: palmerpenguins, CC0." },
];

/** Mulberry32, deterministic unsigned 32-bit state. No Math.random(). */
export function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function normalGenerator(seed: number): () => number {
  const uniform = random(seed);
  let spare: number | undefined;
  return () => {
    if (spare !== undefined) { const value = spare; spare = undefined; return value; }
    const radius = Math.sqrt(-2 * Math.log(Math.max(Number.MIN_VALUE, 1 - uniform()))), angle = 2 * Math.PI * uniform();
    spare = radius * Math.sin(angle); return radius * Math.cos(angle);
  };
}
const syntheticFields: Field[] = [
  { name: "x", kind: "numeric", unit: "mm" }, { name: "y", kind: "numeric", unit: "g" },
  { name: "group", kind: "category", unit: "category" }, { name: "cohort", kind: "category", unit: "category" },
];
export function makeFixture(parameters: FixtureParameters): Fixture {
  const { id, seed, correlation, contamination } = parameters;
  if (id === "penguins") throw new Error("The real dataset must be loaded from the attributed repository CSV.");
  const preset = presets.find(p => p.id === id);
  if (!preset) throw new Error(`Unknown fixture: ${id}`);
  const n = id === "tiny" ? 2 : parameters.n;
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw new RangeError("Synthetic size must be between 1 and 100,000.");
  const gaussian = normalGenerator(seed), uniform = random(seed ^ 0x51ed270b), rows: Row[] = [];
  const rho = id === "independent" ? 0 : id === "negative" ? -Math.abs(correlation) : correlation;
  for (let i = 0; i < n; ++i) {
    const u = gaussian(), v = gaussian();
    let group = i % 2 === 0 ? "A" : "B";
    let x = 10 + 2 * u, y = 20 + 6 * (rho * u + Math.sqrt(1 - rho * rho) * v);
    const cohort = i < Math.floor(n * .7) ? "training" : "held-out";
    if (id === "overlap") { x += group === "A" ? -1 : 1; y += group === "A" ? -3 : 3; }
    if (id === "mixture") { group = ["A", "B", "C"][i % 3]!; x = (i % 3) * 6 + u; y = (i % 3 === 1 ? 8 : 0) + v; }
    if (id === "ring") { const t = 2 * Math.PI * uniform(), radius = 5 + .25 * u; x = radius * Math.cos(t); y = radius * Math.sin(t); }
    if (id === "unequal") { group = i % 10 === 0 ? "B" : "A"; const shift = group === "A" ? 0 : 8; x = shift + u; y = shift - u + .35 * v; }
    if (id === "contamination" && cohort === "held-out") { x += 2; y += 4; if (uniform() < contamination) { x += 15; y -= 35; } }
    if (id === "duplicates") { x = i % 4; y = [0, 3, 1, 5][i % 4]!; }
    if (id === "identical") { x = 7; y = 7; }
    if (id === "zero-variance") x = 7;
    if (id === "collinear" || id === "near-collinear") { x = u; y = 3 * x + 2 + (id === "near-collinear" ? 1e-7 * v : 0); }
    if (id === "offset") { x += 1e12; y = -1e9 + 1000 * y; }
    if (id === "symlog") { x = Math.sign(u) * Math.expm1(Math.abs(u) * 3); y = Math.sign(v + u) * Math.expm1(Math.abs(v + u) * 2); }
    const row: Row = { sourceId: `synthetic:${seed}:${i}`, x, y, group, cohort };
    if (id === "invalid") {
      const bad = [null, undefined, "", "   ", true, false, NaN, Infinity, -Infinity, "NaN", "Infinity"];
      if (i % 16 < 11) row[i % 2 === 0 ? "x" : "y"] = bad[i % 16];
      else if (i % 16 === 11) { row.x = String(x); row.y = String(y); }
    }
    rows.push(row);
  }
  return { id, label: preset.label, note: preset.note, rows, fields: syntheticFields, groupField: "group", synthetic: true };
}

/** The retained CSV has no quoted delimiters. Parsing is intentionally confined
 * to that known file, not offered as a general-purpose upload parser. */
export function parsePenguins(csv: string): Fixture {
  const lines = csv.trim().split(/\r?\n/), headers = lines.shift()!.split(",");
  const expected = ["species", "island", "bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g", "sex", "year"];
  if (headers.join(",") !== expected.join(",")) throw new Error("Unexpected Palmer Penguins CSV columns.");
  const numeric = new Set(expected.filter(h => /_(mm|g)$/.test(h) || h === "year"));
  const rows = lines.map((line, index): Row => {
    const values = line.split(",");
    if (values.length !== headers.length) throw new Error(`Unexpected CSV structure on row ${index + 2}.`);
    const row: Row = { sourceId: `penguins:${index}`, cohort: index % 5 ? "training" : "held-out" };
    headers.forEach((h, i) => { const value = values[i]!; row[h] = value === "NA" || !value.trim() ? null : numeric.has(h) ? Number(value) : value; });
    return row;
  });
  return { id: "penguins", label: "Palmer Penguins · real", synthetic: false, groupField: "species", rows,
    note: "Measurements from 344 penguins; palmerpenguins, CC0. Species is a grouping variable, not a Gaussian-model guarantee.",
    fields: [...headers.map((name): Field => ({ name, kind: numeric.has(name) ? "numeric" : "category", unit: name.endsWith("_mm") ? "mm" : name.endsWith("_g") ? "g" : name === "year" ? "year" : "category" })), { name: "cohort", kind: "category", unit: "category" }] };
}
