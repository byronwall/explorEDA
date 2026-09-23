type RowId = number; // Current IdType: zero-based index within a dataset epoch.
type RowSetId = string;
type TraceId = string;
type MarkId = string;
type FieldId = string;
type Scalar = string | number | boolean | null | undefined;

type Revision = Readonly<{
  datasetEpoch: string;
  values: number;       // Rows, conversion settings, or calculation graph/value changes.
  filters: number;      // Effective global/per-chart predicate changes.
  settings: number;     // This chart's specification changes.
  colors: number;       // Resolved color mappings and relevant theme values.
}>;

type OrderedRowSet = Readonly<{
  id: RowSetId;
  ids: readonly RowId[]; // Owned snapshot; readonly is not a runtime alias guarantee.
  basis: "all-prepared" | "other-filters" | "all-filters" | "facet" | "group" | "sample";
  parent?: RowSetId;
}>;

type PreparedColumn = Readonly<{
  field: FieldId;
  valuesById: Readonly<Record<RowId, Scalar>>;
  lineage: TraceId; // Source field, conversion recipe, or existing calculation definition.
}>;

type ChartInputs<S> = Readonly<{
  revision: Revision;
  settings: S; // Existing semantic settings normalized to plain data; Three vectors become tuples.
  columns: Readonly<Record<FieldId, PreparedColumn>>;
  rowSets: Readonly<Record<RowSetId, OrderedRowSet>>;
  populations: {
    all: RowSetId;
    othersPass: RowSetId;
    allPass: RowSetId;
    facet?: RowSetId; // Absent=unrestricted; present empty set=empty.
  };
  environment: {
    width: number; height: number;
    locale: string; timeZone: string;
    themeRevision: string;
    textMetricsRevision?: string;
    textWidths?: Readonly<Record<string, number>>;
    seed?: number;
  };
}>;

type ScalePlan = Readonly<{
  id: string;
  field?: FieldId;
  kind: "linear" | "symlog" | "band" | "ordinal-color" | "sequential-color";
  domain: readonly Scalar[];
  range: readonly (number | string)[];
  population?: RowSetId;
  fixedInput?: TraceId;
  parameters: Readonly<Record<string, number | string | boolean>>;
  lineage: TraceId;
}>;

type ValueRef = { kind: "row"; rowId: RowId } | { kind: "derived"; traceId: TraceId };
type MarkBase = Readonly<{
  id: MarkId;
  valueRef?: ValueRef;
  bindingRef: string; // Shared field/scale/style bindings per layer.
  a11yLabel: string;
  interactionRef?: string;
}>;

type Mark2D = MarkBase & (
  | { kind: "point"; x: number; y: number; radius: number }
  | { kind: "rect"; x: number; y: number; width: number; height: number }
  | { kind: "path"; commands: readonly PathCommand[]; vertexSources?: readonly ValueRef[] }
  | { kind: "text"; text: string; x: number; y: number; anchor: "start" | "middle" | "end"; rotation: number; fontRef: string }
);
type PathCommand =
  | readonly ["M" | "L", number, number]
  | readonly ["C", number, number, number, number, number, number]
  | readonly ["Z"];

type ChannelBindings = Readonly<{
  channels: readonly {
    channel: "x" | "y" | "z" | "color" | "size" | "opacity" | "text" | "stroke" | "width" | "height";
    field?: FieldId; scaleId?: string; fixed?: Scalar; traceRef?: TraceId;
  }[];
}>;

type PlanBase = Readonly<{
  chartId: string;
  revision: Revision;
  width: number; height: number;
  scales: readonly ScalePlan[];
  trace: TraceStore;
  bindings: Readonly<Record<string, ChannelBindings>>;
  diagnostics: readonly Diagnostic[];
}>;

type RenderPlan = PlanBase & (
  | { kind: "cartesian"; marks: readonly Mark2D[]; clip: readonly [number, number, number, number] }
  | { kind: "table"; orderedRowSet: RowSetId; columns: readonly FieldId[]; cells: readonly PlannedCell[]; window: readonly [number, number] }
  | { kind: "world3d"; points: readonly PlannedPoint3D[]; camera: CameraDescription; pointStyleRef: string }
  | { kind: "fixed-content"; content: string; contentFormat: "existing-editor-html"; valueRef: TraceId }
);

type PlannedCell = { id: MarkId; row: RowId | string; field: FieldId; text: string; valueRef: ValueRef; status: string };
type PlannedPoint3D = { id: MarkId; rowId: RowId; x: number; y: number; z: number; size: number; color: string; valueRef: ValueRef };
type CameraDescription = { position: readonly [number,number,number]; target: readonly [number,number,number]; fov: number; near: number; far: number };
type Diagnostic = { id: string; code: string; message: string; stage: string; rowSet?: RowSetId; field?: FieldId };

type TraceStore = Readonly<{
  records: Readonly<Record<TraceId, TraceRecord>>;
  rowSets: Readonly<Record<RowSetId, OrderedRowSet>>;
  exclusions: Readonly<Record<string, readonly { rowId: RowId; reason: string }[]>>;
}>;
type TraceRecord =
  | { kind: "field"; field: FieldId; stage: "raw" | "prepared" | "calculated"; recipe?: string; inputs: readonly TraceId[] }
  | { kind: "aggregate"; resultKey: string; contributorSet: RowSetId; includedSet: RowSetId; exclusionsRef: string; inputs: readonly TraceId[] }
  | { kind: "scale"; population?: RowSetId; inputs: readonly TraceId[] }
  | { kind: "reduction"; retainedSet: RowSetId; bucketSet: RowSetId; method: string; seed?: number; inputs: readonly TraceId[] }
  | { kind: "fixed"; parameter: string; value: Scalar };

type InteractionIntent =
  | { type: "inspect"; chartId: string; markId: MarkId; revision: Revision }
  | { type: "brush"; chartId: string; field: FieldId; min?: number; max?: number }
  | { type: "toggle-category"; chartId: string; field: FieldId; value: Scalar }
  | { type: "camera"; chartId: string; camera: CameraDescription };

const example = {
  source: {
    epoch: "orders-load-1",
    rows: [
      { __ID: 0, region: "North", revenue: 10 },
      { __ID: 1, region: "North", revenue: "5" },
      { __ID: 2, region: "South", revenue: 7 },
      { __ID: 3, region: "South", revenue: null },
      { __ID: 4, region: null, revenue: 3 },
    ],
  },
  scopes: {
    all: [0, 1, 2, 3, 4],
    othersPass: [0, 1, 3, 4],
    allPass: [0, 1, 3, 4],
    facet: undefined,
  },
  filterAudit: [{ row: 2, stage: "other-chart-filter", predicate: "selection-1" }],
  aggregate: {
    spec: { id: "revenue-by-region", groupField: "region", measureField: "revenue", aggregation: "sum" },
    inputScope: "allPass",
    rows: [
      { key: '["string","North"]', value: 15, members: [0, 1], included: [0, 1], exclusions: [] },
      { key: '["string","South"]', value: undefined, members: [3], included: [], exclusions: [{ row: 3, reason: "Missing value" }] },
      { key: '["missing"]', value: 3, members: [4], included: [4], exclusions: [] },
    ],
  },
  layout: { width: 430, height: 300, margin: { left: 70, right: 30, top: 20, bottom: 60 } },
  scales: {
    x: { kind: "band", domain: ['["string","North"]', '["string","South"]', '["missing"]'], range: [0, 330], padding: 0.3 },
    y: { kind: "linear", domain: [0, 16.5], range: [220, 0], policy: "current valid aggregate values + 10% padding + zero baseline" },
  },
  marks: [
    { id: "bar:revenue-by-region:North", valueRef: "aggregate:North", geometry: { x: 100, y: 40, width: 70, height: 200 }, controlRefs: ["scale:x", "scale:y", "layout", "bar-style"] },
    { id: "bar:revenue-by-region:missing", valueRef: "aggregate:missing", geometry: { x: 300, y: 200, width: 70, height: 40 }, controlRefs: ["scale:x", "scale:y", "layout", "bar-style"] },
  ],
  markAudit: [{ aggregate: "South", disposition: "no-bar", reason: "No finite numeric result" }],
};
