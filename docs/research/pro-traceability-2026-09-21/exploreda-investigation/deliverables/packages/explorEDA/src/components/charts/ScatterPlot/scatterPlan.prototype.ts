/**
 * EXPERIMENTAL; no production import, public export, or saved-format change.
 * Scope: immutable resolved IDs -> deterministic scatter mark plan.
 * Not a substitute for D3/BaseChart compatibility tests in a real checkout.
 */
export type ProbeDatum = string | number | boolean | null | undefined;
export type ProbeId = number;
export interface ProbeLiveEntry { key: ProbeId; value: number }
export interface ProbeScopes {
  readonly all: readonly ProbeId[];
  readonly othersPass: readonly ProbeId[];
  readonly allPass: readonly ProbeId[];
  /** undefined means unrestricted; [] means explicitly empty. */
  readonly facet: readonly ProbeId[] | undefined;
}
export interface ProbeRevision {
  readonly dataset: string;
  readonly values: number;
  readonly filters: number;
}
export interface ProbeSnapshot {
  readonly revision: ProbeRevision;
  readonly scopes: ProbeScopes;
  readonly columns: Readonly<Record<string, Readonly<Record<number, ProbeDatum>>>>;
}
export interface ProbeSnapshotInput {
  revision: ProbeRevision;
  allIds: readonly ProbeId[];
  /** Actual chart group entries; the caller obtains them from Crossfilter. */
  otherFilterEntries: readonly ProbeLiveEntry[];
  /** Actual allFiltered IDs, not a locally re-evaluated predicate. */
  allPassIds: readonly ProbeId[];
  facetIds?: readonly ProbeId[];
  columns: Readonly<Record<string, Readonly<Record<number, ProbeDatum>>>>;
}

const freezeIds = (ids: readonly number[]) => Object.freeze([...ids]);
function checkIds(ids: readonly number[], known?: ReadonlySet<number>) {
  const seen = new Set<number>();
  for (const id of ids) {
    if (!Number.isSafeInteger(id) || id < 0 || seen.has(id) || (known && !known.has(id))) {
      throw new Error(`Invalid, duplicate, or foreign row ID: ${id}`);
    }
    seen.add(id);
  }
}

/** Copy immediately at the coordination boundary; never retain group.all() aliases. */
export function captureScatterProbe(input: ProbeSnapshotInput): ProbeSnapshot {
  checkIds(input.allIds);
  const known = new Set(input.allIds);
  checkIds(input.otherFilterEntries.map((entry) => entry.key), known);
  checkIds(input.allPassIds, known);
  if (input.facetIds !== undefined) checkIds(input.facetIds, known);
  if (input.otherFilterEntries.some((entry) => !Number.isFinite(entry.value) || entry.value < 0)) {
    throw new Error("Group counts must be finite and non-negative");
  }
  const othersPass = input.otherFilterEntries.filter((entry) => entry.value > 0).map((entry) => entry.key);
  const others = new Set(othersPass);
  if (input.allPassIds.some((id) => !others.has(id))) {
    throw new Error("All-filter survivors must be a subset of own-filter-exempt survivors");
  }
  const columns: Record<string, Readonly<Record<number, ProbeDatum>>> = {};
  for (const field of Object.keys(input.columns).sort()) {
    const column: Record<number, ProbeDatum> = {};
    for (const id of input.allIds) column[id] = input.columns[field]?.[id];
    columns[field] = Object.freeze(column);
  }
  return Object.freeze({
    revision: Object.freeze({ ...input.revision }),
    scopes: Object.freeze({
      all: freezeIds(input.allIds),
      othersPass: freezeIds(othersPass),
      allPass: freezeIds(input.allPassIds),
      facet: input.facetIds === undefined ? undefined : freezeIds(input.facetIds),
    }),
    columns: Object.freeze(columns),
  });
}

export interface ProbeSettings {
  readonly chartId: string;
  readonly xField: string;
  readonly yField: string;
  readonly width: number;
  readonly height: number;
  readonly margin: Readonly<{ left: number; right: number; top: number; bottom: number }>;
  readonly xKind: "linear" | "symlog";
  readonly yKind: "linear" | "symlog";
  readonly radius: number;
  readonly opacity: number;
  readonly fill: string;
  /** Color resolution is supplied data, never a mutable scale callback. */
  readonly colors?: Readonly<Record<number, string>>;
  readonly colorReference?: string;
}
export interface ProbeScale {
  readonly id: string;
  readonly field: string;
  readonly kind: "linear" | "symlog";
  readonly domain: readonly [number, number];
  readonly range: readonly [number, number];
  readonly population: "all";
  readonly policy: "full-column-10-percent-padding";
}
export interface ProbePoint {
  readonly id: string;
  readonly rowId: number;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly fill: string;
  readonly opacity: number;
  readonly ownFilterPass: boolean;
  readonly lineage: {
    readonly row: number;
    readonly fields: readonly [string, string];
    readonly controlRefs: readonly string[];
  };
}
export interface ProbeExclusion {
  readonly rowId: number;
  readonly stage: "other-filters" | "facet" | "coordinates";
  readonly reason: string;
}
export interface ScatterProbePlan {
  readonly version: "scatter-probe/1";
  readonly revision: ProbeRevision;
  readonly chartId: string;
  readonly width: number;
  readonly height: number;
  readonly clip: Readonly<{ x: number; y: number; width: number; height: number }>;
  readonly scopes: ProbeScopes;
  readonly scales: readonly [ProbeScale, ProbeScale];
  readonly marks: readonly ProbePoint[];
  readonly exclusions: readonly ProbeExclusion[];
  readonly diagnostics: readonly string[];
}

/** Matches the current 2D scatter coordinate coercion, not the stricter 3D policy. */
function coordinate(value: ProbeDatum): number {
  return value == null || value === "" ? Number.NaN : Number(value);
}
const semanticId = (...parts: unknown[]) => JSON.stringify(parts);
function makeScale(snapshot: ProbeSnapshot, settings: ProbeSettings, axis: "x" | "y"): ProbeScale {
  const field = axis === "x" ? settings.xField : settings.yField;
  const kind = axis === "x" ? settings.xKind : settings.yKind;
  const values = snapshot.scopes.all.map((id) => coordinate(snapshot.columns[field]?.[id])).filter(Number.isFinite);
  let low = Infinity, high = -Infinity;
  for (const value of values) { low = Math.min(low, value); high = Math.max(high, value); }
  // Empty-domain fallback is explicit probe policy, NOT an assertion of production parity.
  if (values.length === 0) { low = 0; high = 1; }
  const padding = (high - low) * 0.1;
  const domain: [number, number] = [kind === "symlog" ? low : low - padding, high + padding];
  const range: [number, number] = axis === "x"
    ? [settings.margin.left, settings.width - settings.margin.right]
    : [settings.height - settings.margin.bottom, settings.margin.top];
  return Object.freeze({
    id: semanticId(settings.chartId, "scale", axis), field, kind,
    domain: Object.freeze(domain), range: Object.freeze(range),
    population: "all", policy: "full-column-10-percent-padding",
  });
}
function mapScale(scale: ProbeScale, value: number) {
  const transform = (x: number) => scale.kind === "symlog" ? Math.sign(x) * Math.log1p(Math.abs(x)) : x;
  const [d0, d1] = scale.domain.map(transform);
  if (d0 === undefined || d1 === undefined) throw new Error("Invalid scale domain");
  const t = d0 === d1 ? 0.5 : (transform(value) - d0) / (d1 - d0);
  return scale.range[0] * (1 - t) + scale.range[1] * t;
}

export function planScatterProbe(snapshot: ProbeSnapshot, settings: ProbeSettings): ScatterProbePlan {
  const { width, height, margin, radius, opacity } = settings;
  if (![width, height, radius, opacity, ...Object.values(margin)].every(Number.isFinite)
      || width <= margin.left + margin.right || height <= margin.top + margin.bottom
      || Object.values(margin).some((value) => value < 0) || radius <= 0 || opacity < 0 || opacity > 1) {
    throw new Error("Invalid explicit viewport or point style");
  }
  if (!Object.hasOwn(snapshot.columns, settings.xField) || !Object.hasOwn(snapshot.columns, settings.yField)) {
    throw new Error("Required prepared columns were not captured");
  }
  const sx = makeScale(snapshot, settings, "x"), sy = makeScale(snapshot, settings, "y");
  const others = new Set(snapshot.scopes.othersPass), selected = new Set(snapshot.scopes.allPass);
  const facet = snapshot.scopes.facet === undefined ? undefined : new Set(snapshot.scopes.facet);
  const exclusions: ProbeExclusion[] = [];
  const eligible = new Set<number>();
  // Membership partition follows source order; draw order preserves current group-entry order.
  for (const rowId of snapshot.scopes.all) {
    if (!others.has(rowId)) {
      exclusions.push({ rowId, stage: "other-filters", reason: "Excluded by at least one other chart; specific predicate not captured by this probe" });
      continue;
    }
    if (facet && !facet.has(rowId)) {
      exclusions.push({ rowId, stage: "facet", reason: "Not a member of this explicit facet" });
      continue;
    }
    const x = coordinate(snapshot.columns[settings.xField]?.[rowId]);
    const y = coordinate(snapshot.columns[settings.yField]?.[rowId]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      exclusions.push({ rowId, stage: "coordinates", reason: `Non-finite coordinate: ${!Number.isFinite(x) ? settings.xField : settings.yField}` });
      continue;
    }
    eligible.add(rowId);
  }
  const marks: ProbePoint[] = [];
  for (const rowId of snapshot.scopes.othersPass) {
    if (!eligible.has(rowId)) continue;
    const x = mapScale(sx, coordinate(snapshot.columns[settings.xField]?.[rowId]));
    const y = mapScale(sy, coordinate(snapshot.columns[settings.yField]?.[rowId]));
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("Scale mapping overflow; no partial plan emitted");
    const ownFilterPass = selected.has(rowId);
    marks.push(Object.freeze({
      id: semanticId(snapshot.revision.dataset, settings.chartId, "point", rowId), rowId, x, y, radius,
      fill: ownFilterPass ? settings.colors?.[rowId] ?? settings.fill : "rgb(156 163 175)",
      opacity: ownFilterPass ? opacity : 0.15, ownFilterPass,
      lineage: Object.freeze({
        row: rowId,
        fields: Object.freeze([settings.xField, settings.yField] as const),
        controlRefs: Object.freeze([sx.id, sy.id, "scope:allPass", "parameter:point-style", settings.colorReference ?? "parameter:fill"]),
      }),
    }));
  }
  const diagnostics = [
    "Probe only: margins are supplied, axes/text shell and interaction controller are not migrated",
    "Own-filter-exempt IDs and all-filter IDs must be captured atomically from the same revision",
  ];
  if (snapshot.scopes.facet?.length === 0) diagnostics.push("Explicit empty facet: no marks (legacy useGetLiveData treats [] as unrestricted)");
  if ([settings.xField, settings.yField].some((field) => !snapshot.scopes.all.some((id) => Number.isFinite(coordinate(snapshot.columns[field]?.[id]))))) {
    diagnostics.push("An empty coordinate population uses the probe-only [0,1] fallback before padding");
  }
  return Object.freeze({
    version: "scatter-probe/1", revision: snapshot.revision, chartId: settings.chartId, width, height,
    clip: Object.freeze({ x: margin.left, y: margin.top, width: width - margin.left - margin.right, height: height - margin.top - margin.bottom }),
    scopes: snapshot.scopes, scales: Object.freeze([sx, sy] as const), marks: Object.freeze(marks),
    exclusions: Object.freeze(exclusions.map((row) => Object.freeze(row))), diagnostics: Object.freeze(diagnostics),
  });
}

/** Lazy inspection; scale populations reference a shared row set, not one copy per point. */
export function traceScatterProbe(plan: ScatterProbePlan, markId: string) {
  const mark = plan.marks.find((item) => item.id === markId);
  if (!mark) throw new Error(`Unknown mark: ${markId}`);
  return {
    value: { dataset: plan.revision.dataset, rowId: mark.rowId, fields: mark.lineage.fields },
    controls: plan.scales.map((scale) => ({ id: scale.id, field: scale.field, domain: scale.domain, rowSetRef: scale.population })),
    ownFilterPass: mark.ownFilterPass,
    limitation: "Field preparation references are not expanded into CalculationManager or conversion traces by this probe",
  };
}
