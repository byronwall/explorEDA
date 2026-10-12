/**
 * Composition in dashboard text: a designed graphic written as named parts.
 *
 *   composition @jobs height=704 {
 *     scale numeric Year ticks=ends nice=false
 *     measure max("Group order") name="Group order"
 *     title "The Changing Nature of Middle-Class Jobs" at=32,26 fontSize=26
 *     unit "Occupation groups" at=56,176 size=120x180 {
 *       repeat Group arrangement=grid columns=5 gap=46 orderBy="Group order"
 *       path Occupations x=Year y="Jobs per 1000" orderField=Year
 *     }
 *     legend "Gender key" at=620,130 unit="Occupation groups" mark=Occupations
 *     note "Registered\nnurses" at=-62,-46 on="Occupation groups"[Professionals]
 *   }
 *
 * Each part is a child line named for its kind. Parts refer to each other by
 * name (or by @id when names repeat), never by generated ID. A setting equal
 * to its kind's default is left out, and an @id is written only when it
 * differs from the one compile would give the part. Both directions read the
 * same tables below, so text and saved settings convert exactly.
 */
import {
  INK,
  MUTED_INK,
  PAPER,
  STACK_COLORS,
  type CompositionDefinition,
} from "@/components/charts/Composition/compositionTypes";
import { isCompositionDefinition } from "@/components/charts/Composition/validateComposition";
import type { DslDeclaration, DslPair, DslSpan, DslValue } from "./parse";
import { encodeScalar } from "./paths";
import { block } from "./print";

type Record_ = Record<string, unknown>;

export interface CompositionProblem {
  message: string;
  span: DslSpan;
  suggestion?: string;
}

/** A namespace parts refer into, such as the units or one unit's marks. */
type Space = "unit" | "scale" | "calc" | "mark" | "inset";

interface Ref {
  /** The text word, such as `x` for `xScaleId`. */
  word: string;
  space: Space;
}

interface Spec {
  keyword: string;
  /** What compile names a part without @id: `${prefix}-${n}`. */
  prefix: string;
  /** Fields that identify the kind; never written. */
  constants: Record_;
  /** Defaults by flat path. A setting equal to its default is left out. */
  defaults: (part: Record_, context: Context) => Record_;
  /** A flat path written as the part's plain value, such as its text. */
  positional?: string;
  refs?: Record<string, Ref>;
  /** Paths that hold lists of plain values. */
  lists?: string[];
  /** Paths that hold text even when the text looks like a number. */
  texts?: string[];
  /** Two paths written as one word: `at=32,26` or `size=120x180`. */
  pairs?: Array<{ word: string; paths: [string, string]; separator: string }>;
  /** Nested objects written as child lines, such as a unit's `repeat`. */
  objects?: Record<string, ObjectSpec>;
  /** Lists of parts written as child lines, such as a unit's marks. */
  children?: Record<string, ChildList>;
}

interface ObjectSpec {
  keyword: string;
  positional?: string;
  refs?: Record<string, Ref>;
  texts?: string[];
}

interface ChildList {
  specs: Spec[];
}

interface Context {
  artboardWidth: number;
}

const TEXT_PATHS = ["name", "text", "label"];

const ELEMENT_XY = {
  word: "at",
  paths: ["x", "y"] as [string, string],
  separator: ",",
};

function textSpec(
  keyword: string,
  role: string,
  name: string,
  fontSize: number,
  fontWeight: number,
  color: string
): Spec {
  return {
    keyword,
    prefix: role,
    constants: { kind: "text", role },
    positional: "text",
    pairs: [ELEMENT_XY],
    defaults: (_part, context) => ({
      name,
      x: 32,
      width: context.artboardWidth - 64,
      fontSize,
      fontWeight,
      color,
    }),
  };
}

const XY_REFS: Record<string, Ref> = {
  xScaleId: { word: "x", space: "scale" },
  yScaleId: { word: "y", space: "scale" },
  valueScaleId: { word: "valueScale", space: "scale" },
  frameId: { word: "frame", space: "inset" },
};

function markSpec(
  type: string,
  defaults: (part: Record_) => Record_,
  refs: Record<string, Ref> = {},
  extra: Partial<Spec> = {}
): Spec {
  return {
    keyword: type,
    prefix: "mark",
    constants: { type },
    positional: "name",
    defaults,
    refs,
    lists: ["colors"],
    texts: ["focus.values", "labelValues"],
    ...extra,
  };
}

const counted = (part: Record_) => (part.measureField ? "sum" : "count");

const MARK_SPECS: Spec[] = [
  markSpec("path", () => ({ stroke: INK, strokeWidth: 1.5 }), XY_REFS),
  markSpec("point", () => ({ fill: INK, radius: 3.5, labelEvery: 0 }), XY_REFS),
  markSpec("band", () => ({ fill: INK, opacity: 0.25 }), XY_REFS),
  markSpec(
    "span",
    () => ({ fill: INK, openEnd: true, labelMinWidth: 40, inset: 1 }),
    XY_REFS
  ),
  markSpec(
    "strip",
    () => ({
      shape: "rect",
      aggregation: "count",
      encoding: "color",
      fill: INK,
      inset: 1,
    }),
    {
      positionScaleId: { word: "position", space: "scale" },
      valueScaleId: { word: "valueScale", space: "scale" },
    }
  ),
  markSpec("summary", () => ({ fill: INK, opacity: 0.3 }), {
    yScaleId: { word: "y", space: "scale" },
    valueScaleId: { word: "valueScale", space: "scale" },
  }),
  markSpec(
    "stack",
    (part) => ({
      aggregation: counted(part),
      normalize: true,
      order: "total",
      colors: STACK_COLORS,
      labelMinHeight: 14,
      inset: 1,
    }),
    { xScaleId: { word: "x", space: "scale" } }
  ),
  markSpec(
    "waffle",
    () => ({
      each: 1,
      normalize: false,
      columns: 10,
      gap: 2,
      from: "top",
      order: "total",
      colors: STACK_COLORS,
    }),
    { xScaleId: { word: "x", space: "scale" } }
  ),
  markSpec(
    "bar",
    (part) => ({
      aggregation: counted(part),
      order: "label",
      colors: STACK_COLORS,
      inset: 1,
      labelMinWidth: 24,
    }),
    {},
    { texts: ["mirror"] }
  ),
  markSpec(
    "horizon",
    () => ({
      baseline: "first",
      relative: true,
      bands: 3,
      domain: "shared",
      positive: "#08519c",
      negative: "#a50f15",
    }),
    { xScaleId: { word: "x", space: "scale" } }
  ),
  markSpec("density", () => ({ fill: INK, height: "shared", opacity: 0.8 }), {
    xScaleId: { word: "x", space: "scale" },
    colorScaleId: { word: "colorScale", space: "scale" },
  }),
];

const INSET_SPEC: Spec = {
  keyword: "inset",
  prefix: "inset",
  constants: {},
  positional: "name",
  pairs: [
    ELEMENT_XY,
    { word: "size", paths: ["width", "height"], separator: "x" },
  ],
  defaults: () => ({ axis: false, background: PAPER }),
  objects: {
    window: { keyword: "window", positional: "field", texts: ["min", "max"] },
  },
};

const ITEM_SPEC: Spec = {
  keyword: "item",
  prefix: "",
  constants: {},
  positional: "label",
  defaults: () => ({}),
  refs: { markId: { word: "mark", space: "mark" } },
};

const UNIT_SPEC: Spec = {
  keyword: "unit",
  prefix: "unit",
  constants: { kind: "unit" },
  positional: "name",
  pairs: [
    ELEMENT_XY,
    { word: "size", paths: ["frame.width", "frame.height"], separator: "x" },
  ],
  defaults: () => ({
    "label.show": true,
    "label.width": 0,
    "label.fontSize": 12,
    axis: true,
    "repeat.arrangement": "rows",
    "repeat.columns": 1,
    "repeat.gap": 6,
    "repeat.order": "label",
    "repeat.limit": 24,
  }),
  objects: {
    repeat: {
      keyword: "repeat",
      positional: "field",
      refs: {
        orderCalcId: { word: "orderBy", space: "calc" },
        weightCalcId: { word: "weight", space: "calc" },
      },
      texts: ["skip"],
    },
    label: {
      keyword: "label",
      refs: { valueCalcId: { word: "value", space: "calc" } },
      texts: [
        "valueSigns.positive.prefix",
        "valueSigns.positive.suffix",
        "valueSigns.negative.prefix",
        "valueSigns.negative.suffix",
        "valueColumn.header",
      ],
    },
    window: { keyword: "window", positional: "field", texts: ["min", "max"] },
  },
  children: {
    marks: { specs: MARK_SPECS },
    insets: { specs: [INSET_SPEC] },
  },
};

const ELEMENT_SPECS: Spec[] = [
  textSpec("title", "title", "Title", 24, 700, INK),
  textSpec("subtitle", "subtitle", "Subtitle", 13, 400, MUTED_INK),
  textSpec("footnote", "note", "Note", 10, 400, MUTED_INK),
  UNIT_SPEC,
  {
    keyword: "legend",
    prefix: "legend",
    constants: { kind: "legend" },
    positional: "name",
    pairs: [ELEMENT_XY],
    defaults: () => ({ direction: "row", fontSize: 11, color: INK }),
    refs: {
      unitId: { word: "unit", space: "unit" },
      markId: { word: "mark", space: "mark" },
      scaleId: { word: "scale", space: "scale" },
    },
    children: { items: { specs: [ITEM_SPEC] } },
  },
  {
    keyword: "rule",
    prefix: "guide",
    constants: { kind: "guide" },
    positional: "label",
    pairs: [ELEMENT_XY],
    defaults: (part) => ({
      name: part.label,
      color: INK,
      "value.kind": "constant",
    }),
    refs: {
      unitId: { word: "unit", space: "unit" },
      "value.calcId": { word: "calc", space: "calc" },
    },
    texts: ["value.value", "repeats"],
  },
  {
    keyword: "note",
    prefix: "note",
    constants: { kind: "annotation" },
    positional: "text",
    pairs: [ELEMENT_XY],
    defaults: (part) => ({
      name: part.text,
      fontSize: 11,
      color: INK,
      leader: true,
      "anchor.kind": "page",
    }),
  },
];

const SCALE_SPECS: Spec[] = [
  {
    keyword: "numeric",
    prefix: "n",
    constants: { kind: "numeric" },
    positional: "field",
    defaults: (part) => ({
      name: part.field,
      domain: "shared",
      zero: false,
      nice: true,
    }),
  },
  {
    keyword: "position",
    prefix: "x",
    constants: { kind: "position" },
    positional: "field",
    defaults: (part) => ({ name: part.field, domain: "shared" }),
  },
  {
    keyword: "value",
    prefix: "value",
    constants: { kind: "value" },
    positional: "name",
    defaults: () => ({
      domain: "shared",
      transform: "linear",
      colors: ["#e8eef6", "#1f4e8c"],
    }),
    lists: ["colors", "stops"],
  },
];

const MEASURE_SPEC: Spec = {
  keyword: "measure",
  prefix: "calc",
  constants: {},
  defaults: (part) => ({
    name: part.field ?? part.aggregation,
    population: "repeat",
    filters: "follow",
  }),
};

/**
 * The saved settings each kind of part takes, and those it can't do
 * without. A path ending in `.*` allows anything under it. Compile reports
 * any other setting, and leaves out a part that lacks a required one.
 */
const XY_MARK = ["name", "frameId", "xScaleId", "yScaleId"];
const SETTINGS: Record<string, { allowed: string[]; required?: string[] }> = {
  title: {
    allowed: [
      "name",
      "text",
      "x",
      "y",
      "width",
      "fontSize",
      "fontWeight",
      "color",
    ],
    required: ["text", "x", "y"],
  },
  subtitle: {
    allowed: [
      "name",
      "text",
      "x",
      "y",
      "width",
      "fontSize",
      "fontWeight",
      "color",
    ],
    required: ["text", "x", "y"],
  },
  footnote: {
    allowed: [
      "name",
      "text",
      "x",
      "y",
      "width",
      "fontSize",
      "fontWeight",
      "color",
    ],
    required: ["text", "x", "y"],
  },
  unit: {
    allowed: [
      "name",
      "x",
      "y",
      "frame.width",
      "frame.height",
      "axis",
      "axisTitles.x",
      "axisTitles.y",
    ],
    required: ["x", "y", "frame.width", "frame.height"],
  },
  legend: {
    allowed: [
      "name",
      "x",
      "y",
      "unitId",
      "markId",
      "scaleId",
      "direction",
      "fontSize",
      "color",
      "width",
    ],
    required: ["x", "y", "unitId", "markId"],
  },
  rule: {
    allowed: [
      "name",
      "x",
      "y",
      "unitId",
      "value.kind",
      "value.value",
      "value.calcId",
      "label",
      "color",
      "axis",
      "shade",
      "repeats",
    ],
    required: ["x", "y", "unitId"],
  },
  note: {
    allowed: [
      "name",
      "text",
      "x",
      "y",
      "fontSize",
      "color",
      "leader",
      "on",
      "point",
      "mark",
      "pick",
      "pickAt",
    ],
    required: ["text", "x", "y"],
  },
  inset: {
    allowed: [
      "name",
      "x",
      "y",
      "width",
      "height",
      "axis",
      "background",
      "outline",
    ],
    required: ["x", "y", "width", "height"],
  },
  item: { allowed: ["label", "markId", "part"], required: ["markId"] },
  path: {
    allowed: [
      ...XY_MARK,
      "orderField",
      "stroke",
      "strokeWidth",
      "seriesField",
      "focus.kind",
      "focus.values",
      "mutedStroke",
      "population",
      "labels",
      "labelValue",
      "colorField",
      "colors",
      "valueField",
      "valueScaleId",
      "curve",
      "rank",
    ],
    required: ["xScaleId", "orderField"],
  },
  point: {
    allowed: [
      ...XY_MARK,
      "orderField",
      "radius",
      "fill",
      "labelField",
      "labelEvery",
      "labelValues",
      "sizeField",
      "minRadius",
      "show",
      "seriesField",
      "focus.kind",
      "focus.values",
      "mutedFill",
      "population",
      "colorField",
      "colors",
      "valueField",
      "valueScaleId",
      "rank",
      "spread",
    ],
    required: ["xScaleId"],
  },
  band: {
    allowed: [
      ...XY_MARK,
      "orderField",
      "lowerField",
      "upperField",
      "fill",
      "opacity",
    ],
    required: [
      "xScaleId",
      "yScaleId",
      "orderField",
      "lowerField",
      "upperField",
    ],
  },
  span: {
    allowed: [
      ...XY_MARK,
      "startField",
      "endField",
      "openEnd",
      "fill",
      "colorField",
      "colors",
      "labelField",
      "labelMinWidth",
      "inset",
    ],
    required: ["xScaleId", "startField", "endField"],
  },
  strip: {
    allowed: [
      "name",
      "shape",
      "positionScaleId",
      "valueScaleId",
      "aggregation",
      "measureField",
      "encoding",
      "fill",
      "inset",
      "missing",
      "valueLabels",
      "missingLabel",
    ],
    required: ["positionScaleId", "valueScaleId"],
  },
  summary: {
    allowed: [
      "name",
      "groupField",
      "measureField",
      "yScaleId",
      "valueScaleId",
      "fill",
      "opacity",
      "parts.band",
      "parts.line",
      "parts.points",
    ],
    required: ["groupField", "measureField", "yScaleId"],
  },
  stack: {
    allowed: [
      "name",
      "categoryField",
      "aggregation",
      "measureField",
      "normalize",
      "order",
      "colors",
      "labelMinHeight",
      "labelContent",
      "direction",
      "connect",
      "texture",
      "inset",
      "xScaleId",
      "baseline",
      "curve",
    ],
    required: ["categoryField"],
  },
  bar: {
    allowed: [
      "name",
      "aggregation",
      "measureField",
      "categoryField",
      "mirror",
      "order",
      "colors",
      "max",
      "inset",
      "labelMinWidth",
    ],
  },
  waffle: {
    allowed: [
      "name",
      "categoryField",
      "each",
      "normalize",
      "columns",
      "gap",
      "from",
      "order",
      "colors",
      "xScaleId",
    ],
    required: ["categoryField"],
  },
  horizon: {
    allowed: [
      "name",
      "xScaleId",
      "field",
      "orderField",
      "baseline",
      "relative",
      "bands",
      "domain",
      "positive",
      "negative",
    ],
    required: ["xScaleId", "field", "orderField"],
  },
  density: {
    allowed: [
      "name",
      "xScaleId",
      "bandwidth",
      "height",
      "fill",
      "opacity",
      "stroke",
      "colorScaleId",
    ],
    required: ["xScaleId"],
  },
  numeric: {
    allowed: [
      "name",
      "field",
      "domain",
      "zero",
      "nice",
      "min",
      "max",
      "transform",
      "ticks",
    ],
    required: ["field"],
  },
  position: {
    allowed: ["name", "field", "interval", "domain"],
    required: ["field"],
  },
  value: {
    allowed: [
      "name",
      "domain",
      "transform",
      "colors",
      "stops",
      "center",
      "max",
    ],
  },
  measure: { allowed: ["name", "orderField", "population", "filters"] },
  repeat: {
    allowed: [
      "field",
      "arrangement",
      "columns",
      "tileField",
      "gap",
      "order",
      "orderCalcId",
      "direction",
      "limit",
      "skip",
      "weightCalcId",
    ],
  },
  label: {
    allowed: [
      "show",
      "width",
      "fontSize",
      "valueCalcId",
      "every",
      "valueSigns.positive.prefix",
      "valueSigns.positive.suffix",
      "valueSigns.positive.color",
      "valueSigns.negative.prefix",
      "valueSigns.negative.suffix",
      "valueSigns.negative.color",
      "valueColumn.width",
      "valueColumn.header",
      "valueColumn.fill",
    ],
  },
  window: { allowed: ["field", "min", "max"] },
  override: { allowed: ["dx", "dy", "accent", "opacity", "emphasize"] },
};

/**
 * The values a setting takes, where that is narrower than any text: a set
 * of words or numbers, "number", or "boolean". Keyed by part, then path.
 */
type ValueRule = "number" | "boolean" | readonly (string | number)[];
const NUMBERS = [
  "x",
  "y",
  "width",
  "height",
  "fontSize",
  "radius",
  "strokeWidth",
  "opacity",
  "inset",
  "labelMinWidth",
  "labelMinHeight",
  "labelEvery",
  "minRadius",
  "columns",
  "gap",
  "limit",
  "each",
  "bands",
  "bandwidth",
  "max",
  "min",
  "every",
  "dx",
  "dy",
  "frame.width",
  "frame.height",
];
const BOOLEANS = [
  "axis",
  "leader",
  "labelValue",
  "openEnd",
  "normalize",
  "connect",
  "relative",
  "valueLabels",
  "outline",
  "emphasize",
  "zero",
  "nice",
  "show",
];
const SCALE_DOMAIN = ["shared", "instance"] as const;
const VALUES: Record<string, Record<string, ValueRule>> = {
  title: { fontWeight: [400, 600, 700] },
  subtitle: { fontWeight: [400, 600, 700] },
  footnote: { fontWeight: [400, 600, 700] },
  legend: { direction: ["row", "column"] },
  rule: {
    axis: ["x", "y"],
    shade: ["none", "after", "before"],
    "value.kind": ["constant", "calc"],
  },
  note: { pick: ["max", "min", "first", "last", "at"] },
  item: { part: ["main", "muted", "band", "median", "missing"] },
  path: {
    labels: ["none", "start", "end", "both"],
    curve: ["linear", "smooth"],
    rank: ["desc", "asc"],
    population: ["repeat", "composition"],
    "focus.kind": ["repeat", "values"],
  },
  point: {
    show: ["all", "first", "last", "min", "max"],
    spread: ["swarm"],
    rank: ["desc", "asc"],
    population: ["repeat", "composition"],
    "focus.kind": ["repeat", "values"],
  },
  strip: {
    shape: ["rect", "circle"],
    aggregation: ["count", "sum", "average"],
    encoding: ["color", "size", "height"],
  },
  stack: {
    aggregation: ["count", "sum"],
    order: ["label", "total", "first"],
    labelContent: ["both", "share"],
    direction: ["up", "across"],
    texture: ["hand"],
    baseline: ["zero", "center", "wiggle"],
    curve: ["linear", "smooth"],
  },
  bar: { aggregation: ["count", "sum", "average"], order: ["label", "total"] },
  waffle: { from: ["top", "bottom"], order: ["label", "total"] },
  horizon: { baseline: ["zero", "first", "mean"], domain: SCALE_DOMAIN },
  density: { height: SCALE_DOMAIN },
  numeric: {
    domain: SCALE_DOMAIN,
    ticks: ["auto", "ends", "none"],
    transform: ["linear", "log"],
  },
  position: {
    domain: SCALE_DOMAIN,
    interval: ["day", "week", "month", "year"],
  },
  value: { domain: SCALE_DOMAIN, transform: ["linear", "sqrt", "log"] },
  measure: {
    population: ["repeat", "composition"],
    filters: ["follow", "ignore"],
  },
  repeat: {
    arrangement: ["rows", "columns", "grid", "tiles"],
    order: ["count", "label", "value"],
    direction: ["asc", "desc"],
  },
};

function valueRule(keyword: string, path: string): ValueRule | undefined {
  const own = VALUES[keyword]?.[path];
  if (own) return own;
  // A window's bounds are text: dates or labels.
  if (keyword === "window") return undefined;
  if (NUMBERS.includes(path) || path === "valueColumn.width") {
    return "number";
  }
  if (BOOLEANS.includes(path)) return "boolean";
  return undefined;
}

/** Why a value doesn't fit its setting, or undefined when it does. */
function valueProblem(
  keyword: string,
  path: string,
  value: unknown
): string | undefined {
  const rule = valueRule(keyword, path);
  if (!rule || value === UNSET) return undefined;
  if (rule === "number") {
    return typeof value === "number" ? undefined : "a number";
  }
  if (rule === "boolean") {
    return typeof value === "boolean" ? undefined : "true or false";
  }
  return rule.includes(value as string | number)
    ? undefined
    : `one of ${rule.join(", ")}`;
}

/** A setting's allowed values for the reference, such as `=row|column`. */
function valueHint(keyword: string, path: string): string {
  const rule = valueRule(keyword, path);
  return Array.isArray(rule)
    ? rule.join("|")
    : rule === "boolean"
      ? "true|false"
      : "";
}

/** Short words for a part's nested settings: `rule value=2025`. */
const ALIASES: Record<string, Record<string, string>> = {
  rule: { value: "value.value" },
};

function allows(keyword: string, path: string): boolean {
  const entry = SETTINGS[keyword];
  return (
    !entry ||
    entry.allowed.some((item) =>
      item.endsWith(".*") ? path.startsWith(item.slice(0, -1)) : item === path
    )
  );
}

/** The closest of `words` to a misspelled one, if one is close. */
function closestWord(word: string, words: string[]): string | undefined {
  const lower = word.toLowerCase();
  return words.find(
    (item) =>
      item.toLowerCase().includes(lower) || lower.includes(item.toLowerCase())
  );
}

/** A saved path as the text writes it: its word, or the path itself. */
function wordFor(
  spec: Pick<Spec, "pairs" | "refs"> & { keyword?: string },
  path: string
): string {
  const compound = spec.pairs?.find((item) => item.paths.includes(path));
  const alias = Object.entries(ALIASES[spec.keyword ?? ""] ?? {}).find(
    ([, target]) => target === path
  )?.[0];
  return compound?.word ?? spec.refs?.[path]?.word ?? alias ?? path;
}

/** The settings a kind of part takes, as the text writes them. */
export function partSettings(keyword: string): string[] {
  const spec =
    [
      ...ELEMENT_SPECS,
      ...MARK_SPECS,
      INSET_SPEC,
      ITEM_SPEC,
      ...SCALE_SPECS,
    ].find((item) => item.keyword === keyword) ??
    (keyword === "measure" ? MEASURE_SPEC : undefined);
  const object = UNIT_SPEC.objects?.[keyword];
  const words = (SETTINGS[keyword]?.allowed ?? []).map((path) =>
    wordFor(spec ?? { refs: object?.refs, keyword }, path)
  );
  return [...new Set(words)];
}

/** Every kind of part and the settings it takes, required ones first. */
export function compositionReference(): string[] {
  const groups: Array<[string, string[]]> = [
    ["Text", ["title", "subtitle", "footnote"]],
    ["Parts", ["unit", "legend", "rule", "note", "inset", "item"]],
    ["Inside a unit", ["repeat", "label", "window"]],
    ["Marks", MARK_SPECS.map((spec) => spec.keyword)],
    ["Scales (scale <kind>)", SCALE_SPECS.map((spec) => spec.keyword)],
    ["Other", ["measure", "override"]],
  ];
  const lines: string[] = [];
  for (const [title, keywords] of groups) {
    lines.push(`${title}:`);
    for (const keyword of keywords) {
      const spec = [
        ...ELEMENT_SPECS,
        ...MARK_SPECS,
        INSET_SPEC,
        ITEM_SPEC,
        ...SCALE_SPECS,
      ].find((item) => item.keyword === keyword);
      // The plain value, such as a title's text, is written without a key.
      const required = (SETTINGS[keyword]?.required ?? [])
        .filter((path) => path !== spec?.positional)
        .map((path) => wordFor(spec ?? { keyword }, path));
      const words = partSettings(keyword).filter(
        (word) => !required.includes(word) && word !== spec?.positional
      );
      const plain = spec?.positional ? ` "${spec.positional}"` : "";
      const pathOf = (word: string) =>
        (SETTINGS[keyword]?.allowed ?? []).find(
          (path) => wordFor(spec ?? { keyword }, path) === word
        ) ?? word;
      lines.push(
        `  ${keyword}${plain}  ${[...new Set(required)]
          .map((word) => `${word}= (required)`)
          .concat(
            words.map((word) => `${word}=${valueHint(keyword, pathOf(word))}`)
          )
          .join(" ")}`
      );
    }
  }
  return lines;
}

/** Settings a part needs, as text, that it doesn't have. */
function missingSettings(keyword: string, spec: Spec, part: Record_): string[] {
  const flat = flatten(part);
  return [
    ...new Set(
      (SETTINGS[keyword]?.required ?? [])
        .filter((path) => flat[path] === undefined || flat[path] === "")
        .map((path) => wordFor(spec, path))
    ),
  ];
}

// ---------------------------------------------------------------------------
// Values

function isRecord(value: unknown): value is Record_ {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** Flat `path → value` for an object; lists stay whole. */
function flatten(value: Record_, prefix = ""): Record_ {
  const out: Record_ = {};
  for (const [key, item] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isRecord(item)) {
      Object.assign(out, flatten(item, path));
    } else if (item !== undefined) {
      out[path] = item;
    }
  }
  return out;
}

function setFlat(target: Record_, path: string, value: unknown) {
  const segments = path.split(".");
  let node = target;
  for (const segment of segments.slice(0, -1)) {
    node[segment] = isRecord(node[segment]) ? node[segment] : {};
    node = node[segment] as Record_;
  }
  node[segments.at(-1)!] = value;
}

function same(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** A value as text: plain when it reads back the same, quoted otherwise. */
export function encodeValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => encodeItem(item)).join(",");
  }
  return encodeItem(value);
}

function encodeItem(value: unknown): string {
  if (value === null || typeof value !== "string") {
    return String(value);
  }
  // A color such as #1f2328 reads plainly after `=`.
  return /^#[0-9a-fA-F]{3,8}$/.test(value)
    ? value
    : encodeScalar(value as string);
}

function decodeItem(
  item: DslValue["items"][number],
  asText: boolean,
  current: unknown
): unknown {
  if (item.quoted || asText || typeof current === "string") {
    return item.text;
  }
  if (item.text === "null") {
    return null;
  }
  if (item.text === "true" || item.text === "false") {
    return item.text === "true";
  }
  if (item.text.trim() !== "" && Number.isFinite(Number(item.text))) {
    return Number(item.text);
  }
  return item.text;
}

function decodeValue(
  value: DslValue,
  { list, text, current }: { list: boolean; text: boolean; current: unknown }
): unknown {
  if (list) {
    return value.raw === ""
      ? []
      : value.items.map((item) => decodeItem(item, false, undefined));
  }
  if (value.items.length > 1) {
    return value.raw;
  }
  return decodeItem(value.items[0]!, text, current);
}

/** A plain value that a line starts with: always quoted unless a name. */
function encodePositional(value: unknown): string {
  return typeof value === "string" &&
    /^[A-Za-z_][\w.-]*$/.test(value) &&
    !/^(true|false|null|unset)$/.test(value)
    ? value
    : JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// Names and IDs

interface Named {
  id: string;
  name?: string;
  field?: string;
}

/** What an item goes by: a scale by its field, anything else by its name. */
function labelOf(item: Named, space: Space): string | undefined {
  return space === "scale" ? item.field || item.name : item.name;
}

/** How text refers to an item: its label when unambiguous, else its ID. */
function handleFor(items: Named[], id: string, space: Space): string {
  const item = items.find((candidate) => candidate.id === id);
  const label = item && labelOf(item, space);
  if (
    item &&
    label &&
    items.filter((other) => labelOf(other, space) === label).length === 1 &&
    !items.some((other) => other !== item && other.id === label)
  ) {
    return label;
  }
  return id;
}

/** Finds an item by ID, then by label, then by name. */
function resolveRef(
  items: Named[],
  text: string,
  space: Space
): Named | undefined {
  const unique = (matches: Named[]) =>
    matches.length === 1 ? matches[0] : undefined;
  return (
    items.find((item) => item.id === text) ??
    unique(items.filter((item) => labelOf(item, space) === text)) ??
    unique(items.filter((item) => item.name === text))
  );
}

/** The IDs compile gives unnamed parts: each prefix counts from 1 in order. */
function naturalIds(prefixes: string[]): string[] {
  const counts = new Map<string, number>();
  return prefixes.map((prefix) => {
    const next = (counts.get(prefix) ?? 0) + 1;
    counts.set(prefix, next);
    return `${prefix}-${next}`;
  });
}

/** Which IDs text must write: those that differ from the natural one. */
function writtenIds(ids: string[], prefixes: string[]): boolean[] {
  const natural = naturalIds(prefixes);
  const written = ids.map((id, index) => id !== natural[index]);
  let changed = true;
  while (changed) {
    changed = false;
    const explicit = new Set(ids.filter((_, index) => written[index]));
    natural.forEach((id, index) => {
      if (!written[index] && explicit.has(id)) {
        written[index] = true;
        changed = true;
      }
    });
  }
  return written;
}

// ---------------------------------------------------------------------------
// Export: composition → lines

interface LiftScope {
  units: Named[];
  scales: Named[];
  calcs: Named[];
  /** The current unit's marks and insets. */
  marks: Named[];
  insets: Named[];
  context: Context;
}

function specFor(specs: Spec[], part: Record_): Spec | undefined {
  return specs.find((spec) =>
    Object.entries(spec.constants).every(([key, value]) => part[key] === value)
  );
}

function refText(scope: LiftScope, space: Space, id: unknown): string {
  const items =
    space === "unit"
      ? scope.units
      : space === "scale"
        ? scope.scales
        : space === "calc"
          ? scope.calcs
          : space === "mark"
            ? scope.marks
            : scope.insets;
  return encodeValue(handleFor(items, String(id), space));
}

/** One part's head tokens, without its children. */
function liftTokens(
  spec: Spec,
  part: Record_,
  scope: LiftScope,
  skip: Set<string>
): string[] {
  const flat = flatten(part);
  const defaults = spec.defaults(part, scope.context);
  const tokens: string[] = [];
  if (spec.positional && flat[spec.positional] !== undefined) {
    tokens.push(encodePositional(flat[spec.positional]));
  }
  const used = new Set<string>([
    ...Object.keys(spec.constants),
    "id",
    ...(spec.positional ? [spec.positional] : []),
    ...skip,
  ]);
  for (const pair of spec.pairs ?? []) {
    const [a, b] = pair.paths;
    used.add(a);
    used.add(b);
    if (
      flat[a] === undefined ||
      flat[b] === undefined ||
      (same(flat[a], defaults[a]) && same(flat[b], defaults[b]))
    ) {
      continue;
    }
    tokens.push(`${pair.word}=${flat[a]}${pair.separator}${flat[b]}`);
  }
  for (const [path, value] of Object.entries(flat)) {
    if (
      used.has(path) ||
      [...used].some((key) => path.startsWith(`${key}.`)) ||
      // A note's anchor is written as on=, point=, mark=, and pick=.
      (spec.keyword === "note" && path.startsWith("anchor."))
    ) {
      continue;
    }
    if (path in defaults && same(value, defaults[path])) {
      continue;
    }
    const ref = spec.refs?.[path];
    tokens.push(
      ref
        ? `${ref.word}=${refText(scope, ref.space, value)}`
        : `${wordFor(spec, path)}=${encodeValue(value)}`
    );
  }
  // A default the part leaves out has no text form; say so explicitly.
  for (const [path, value] of Object.entries(defaults)) {
    if (
      value !== undefined &&
      flat[path] === undefined &&
      !used.has(path) &&
      !(
        spec.objects &&
        Object.keys(spec.objects).some((key) => path.startsWith(`${key}.`))
      )
    ) {
      tokens.push(`${path}=unset`);
    }
  }
  return tokens;
}

function liftObject(
  spec: ObjectSpec,
  value: Record_,
  defaults: Record_,
  prefix: string,
  scope: LiftScope
): string[] {
  const flat = flatten(value);
  const tokens: string[] = [];
  let hasPositional = false;
  if (spec.positional && flat[spec.positional] !== undefined) {
    tokens.push(encodePositional(flat[spec.positional]));
    hasPositional = true;
  }
  for (const [path, item] of Object.entries(flat)) {
    if (hasPositional && path === spec.positional) {
      continue;
    }
    const full = `${prefix}.${path}`;
    if (full in defaults && same(item, defaults[full])) {
      continue;
    }
    const ref = spec.refs?.[path];
    tokens.push(
      ref
        ? `${ref.word}=${refText(scope, ref.space, item)}`
        : `${path}=${encodeValue(item)}`
    );
  }
  for (const [full, item] of Object.entries(defaults)) {
    if (
      full.startsWith(`${prefix}.`) &&
      flat[full.slice(prefix.length + 1)] === undefined &&
      item !== undefined
    ) {
      tokens.push(`${full.slice(prefix.length + 1)}=unset`);
    }
  }
  return tokens.length ? block(spec.keyword, tokens) : [];
}

function liftPart(
  spec: Spec,
  part: Record_,
  id: string | undefined,
  scope: LiftScope,
  extra: string[] = []
): string[] {
  const objectKeys = Object.keys(spec.objects ?? {});
  const childKeys = Object.keys(spec.children ?? {});
  const inner: LiftScope =
    spec === UNIT_SPEC
      ? {
          ...scope,
          marks: (part.marks as Named[]) ?? [],
          insets: (part.insets as Named[]) ?? [],
        }
      : scope;
  const tokens = liftTokens(
    spec,
    part,
    inner,
    new Set([...objectKeys, ...childKeys])
  );
  const defaults = spec.defaults(part, scope.context);
  const children: string[] = [];
  for (const key of objectKeys) {
    if (isRecord(part[key])) {
      children.push(
        ...liftObject(
          spec.objects![key]!,
          part[key] as Record_,
          defaults,
          key,
          inner
        )
      );
    }
  }
  for (const key of childKeys) {
    const list = part[key];
    if (!Array.isArray(list)) {
      continue;
    }
    if (!list.length) {
      children.push(`${key}=`);
      continue;
    }
    children.push(
      ...liftList(spec.children![key]!.specs, list as Record_[], inner)
    );
  }
  const head = id ? `${spec.keyword} @${id}` : spec.keyword;
  return block(head, [...tokens, ...extra], children);
}

function liftList(specs: Spec[], parts: Record_[], scope: LiftScope): string[] {
  const chosen = parts.map((part) => specFor(specs, part));
  const ids = parts.map((part) => String(part.id ?? ""));
  const prefixes = chosen.map((spec) => spec?.prefix ?? "");
  const written = writtenIds(ids, prefixes);
  return parts.flatMap((part, index) => {
    const spec = chosen[index];
    if (!spec) {
      return [`# a part this text can't write: ${JSON.stringify(part)}`];
    }
    // Legend items carry no ID.
    const id = spec.prefix && written[index] ? ids[index] : undefined;
    const scoped =
      spec.keyword === "legend" || spec.keyword === "note"
        ? withUnitMarks(scope, part)
        : scope;
    const extra = spec.keyword === "note" ? anchorWords(part, scoped) : [];
    return liftPart(spec, part, id, scoped, extra);
  });
}

/** Legends and notes name marks of the unit they point at. */
function withUnitMarks(scope: LiftScope, part: Record_): LiftScope {
  const unitId =
    (part.unitId as string | undefined) ??
    ((part.anchor as Record_ | undefined)?.unitId as string | undefined);
  const unit = scope.units.find((item) => item.id === unitId) as
    | (Named & { marks?: Named[] })
    | undefined;
  return { ...scope, marks: unit?.marks ?? [] };
}

/** A note's anchor as on=, point=, mark=, pick=, and pickAt=. */
function anchorWords(part: Record_, scope: LiftScope): string[] {
  const anchor = part.anchor as Record_;
  const words: string[] = [];
  if (anchor.kind !== "page") {
    words.push(
      `on=${refText(scope, "unit", anchor.unitId)}[${encodeValue(anchor.instanceKey)}]`
    );
  }
  if (anchor.kind === "frame") {
    words.push(`point=${anchor.fx},${anchor.fy}`);
  }
  if (anchor.kind === "data") {
    words.push(`mark=${refText(scope, "mark", anchor.markId)}`);
    words.push(`pick=${anchor.pick}`);
    if (anchor.at !== undefined) {
      words.push(`pickAt=${encodeValue(anchor.at)}`);
    }
  }
  return words;
}

/**
 * The composition's head settings and body lines. The head carries the
 * artboard; the body carries scales, measures, the parts in drawing order,
 * and per-repeat overrides.
 */
export function liftComposition(definition: CompositionDefinition): {
  head: string[];
  body: string[];
} {
  const artboard = definition.artboard;
  const head: string[] = [];
  if (artboard.width !== 960) head.push(`width=${artboard.width}`);
  if (artboard.height !== 600) head.push(`height=${artboard.height}`);
  if (artboard.background !== PAPER) {
    head.push(`background=${encodeValue(artboard.background)}`);
  }
  const units = definition.elements.filter(
    (element) => element.kind === "unit"
  ) as unknown as Named[];
  const scope: LiftScope = {
    units,
    scales: definition.scales as unknown as Named[],
    calcs: definition.calculations as unknown as Named[],
    marks: [],
    insets: [],
    context: { artboardWidth: artboard.width },
  };
  const scaleLines = (() => {
    const parts = definition.scales as unknown as Record_[];
    const written = writtenIds(
      parts.map((part) => String(part.id)),
      parts.map((part) => specFor(SCALE_SPECS, part)?.prefix ?? "")
    );
    return parts.flatMap((part, index) => {
      const spec = specFor(SCALE_SPECS, part)!;
      const tokens = liftTokens(spec, part, scope, new Set());
      const id = written[index] ? ` @${part.id}` : "";
      return block(`scale ${spec.keyword}${id}`, tokens);
    });
  })();
  const measureLines = (() => {
    const parts = definition.calculations as unknown as Record_[];
    const written = writtenIds(
      parts.map((part) => String(part.id)),
      parts.map(() => "calc")
    );
    return parts.flatMap((part, index) => {
      const call = `${part.aggregation}(${part.field === undefined ? "" : encodePositional(part.field)})`;
      const tokens = liftTokens(
        MEASURE_SPEC,
        part,
        scope,
        new Set(["aggregation", "field"])
      );
      const id = written[index] ? ` @${part.id}` : "";
      return block(`measure${id} ${call}`, tokens);
    });
  })();
  const overrideLines = definition.overrides.map((override) => {
    const tokens = Object.entries(override)
      .filter(([key]) => key !== "unitId" && key !== "instanceKey")
      .map(([key, value]) => `${key}=${encodeValue(value)}`);
    return [
      `override ${refText(scope, "unit", override.unitId)}[${encodeValue(override.instanceKey)}]`,
      ...tokens,
    ].join(" ");
  });
  return {
    head,
    body: [
      ...scaleLines,
      ...measureLines,
      ...liftList(
        ELEMENT_SPECS,
        definition.elements as unknown as Record_[],
        scope
      ),
      ...overrideLines,
    ],
  };
}

// ---------------------------------------------------------------------------
// Compile: lines → composition

interface LowerContext {
  problems: CompositionProblem[];
  context: Context;
}

interface Pending {
  target: Record_;
  path: string;
  space: Space;
  text: string;
  span: DslSpan;
  /** The part to leave out when the link can't be found. */
  owner: Record_;
}

/** Reads `unit[key]`: a reference and a repeat key, each maybe quoted. */
function splitKeyed(raw: string): { ref: string; key: string } | undefined {
  const match =
    /^("(?:[^"\\]|\\.)*"|[^[\]"]+)\[("(?:[^"\\]|\\.)*"|[^\]]*)\]$/.exec(raw);
  if (!match) return undefined;
  const read = (text: string) =>
    text.startsWith('"') ? (JSON.parse(text) as string) : text;
  return { ref: read(match[1]!), key: read(match[2]!) };
}

function lowerPart(
  spec: Spec,
  declaration: DslDeclaration,
  lower: LowerContext,
  pending: Pending[]
): Record_ {
  const part: Record_ = { ...structuredClone(spec.constants) };
  partSpans.set(part, { span: declaration.span, spec });
  if (declaration.name) {
    part.id = declaration.name;
  }
  const positional = [...declaration.positional];
  if (spec.positional && positional[0]) {
    setFlat(part, spec.positional, positional.shift()!.value.items[0]!.text);
  }
  for (const extra of positional) {
    lower.problems.push({
      message: `${extra.value.raw} has no setting name in ${spec.keyword}, so it was ignored.`,
      span: extra.span,
      suggestion: "Write settings as key=value.",
    });
  }
  const objectKeys = Object.keys(spec.objects ?? {});
  for (const pair of declaration.pairs) {
    lowerPair(spec, part, pair, lower, pending);
  }
  // Defaults for what the text leaves out; `unset` removed a default.
  const defaults = spec.defaults(part, lower.context);
  const flat = flatten(part);
  for (const [path, value] of Object.entries(defaults)) {
    if (flat[path] === undefined && value !== undefined) {
      setFlat(part, path, structuredClone(value));
    }
  }
  removeUnset(part);
  for (const child of declaration.children) {
    if (objectKeys.includes(child.keyword)) {
      const object = (part[child.keyword] as Record_) ?? {};
      owners.set(object, part);
      lowerObject(spec.objects![child.keyword]!, child, object, lower, pending);
      completeLabel(child.keyword, object);
      part[child.keyword] = object;
      removeUnset(part);
      continue;
    }
    const listKey = Object.entries(spec.children ?? {}).find(([, list]) =>
      list.specs.some((item) => item.keyword === child.keyword)
    )?.[0];
    if (!listKey) {
      lower.problems.push({
        message: `${child.keyword} can't go inside ${spec.keyword}, so it was ignored.`,
        span: child.span,
        suggestion: `Inside ${spec.keyword}: ${[...objectKeys, ...Object.values(spec.children ?? {}).flatMap((list) => list.specs.map((item) => item.keyword))].join(", ") || "settings only"}.`,
      });
      continue;
    }
    const childSpec = spec.children![listKey]!.specs.find(
      (item) => item.keyword === child.keyword
    )!;
    const list = (part[listKey] as Record_[]) ?? [];
    list.push(lowerPart(childSpec, child, lower, pending));
    part[listKey] = list;
  }
  for (const key of Object.keys(spec.children ?? {})) {
    if (part[key] === undefined && spec === UNIT_SPEC && key === "marks") {
      part[key] = [];
    }
  }
  return part;
}

/**
 * A label's value signs and value column are whole records; fill what the
 * text leaves out, so one setting such as a prefix is enough.
 */
function completeLabel(keyword: string, object: Record_) {
  if (keyword !== "label") return;
  const signs = object.valueSigns as Record_ | undefined;
  if (signs) {
    for (const side of ["positive", "negative"]) {
      signs[side] = {
        prefix: "",
        suffix: "",
        color: INK,
        ...((signs[side] as Record_ | undefined) ?? {}),
      };
    }
  }
  const column = object.valueColumn as Record_ | undefined;
  if (column && column.width === undefined) {
    column.width = 64;
  }
}

function removeUnset(part: Record_) {
  for (const [key, value] of Object.entries(part)) {
    if (value === UNSET) {
      delete part[key];
    } else if (isRecord(value)) {
      removeUnset(value);
    }
  }
}

const UNSET = Symbol("unset");

/** The part a nested object belongs to, such as a unit's repeat. */
const owners = new WeakMap<Record_, Record_>();

/** Where each part was written, to point a missing setting at its line. */
const partSpans = new WeakMap<Record_, { span: DslSpan; spec: Spec }>();

function lowerPair(
  spec: Pick<Spec, "pairs" | "refs" | "lists" | "texts" | "keyword"> & {
    defaults?: Spec["defaults"];
  },
  part: Record_,
  pair: DslPair,
  lower: LowerContext,
  pending: Pending[]
) {
  const aliased = ALIASES[spec.keyword]?.[pair.key];
  if (aliased) {
    pair = { ...pair, key: aliased };
  }
  const compound = spec.pairs?.find((item) => item.word === pair.key);
  const refPath = Object.entries(spec.refs ?? {}).find(
    ([, ref]) => ref.word === pair.key
  )?.[0];
  const path = compound?.paths[0] ?? refPath ?? pair.key;
  if (!allows(spec.keyword, path)) {
    const words = partSettings(spec.keyword);
    // Marks color by fill or stroke, by category, or by a value scale.
    const colors =
      pair.key === "color" &&
      SETTINGS[spec.keyword]?.allowed.includes("valueScaleId")
        ? `Use ${spec.keyword === "path" ? "stroke" : "fill"}= for one color, colorField= with colors= by category, or valueField= with valueScale= by a measure.`
        : undefined;
    const near = closestWord(pair.key, words);
    lower.problems.push({
      message: `${pair.key} is not a ${spec.keyword} setting, so it was ignored.`,
      span: pair.span,
      suggestion:
        colors ??
        (near
          ? `Did you mean ${near}?`
          : `${spec.keyword} takes: ${words.join(", ")}.`),
    });
    return;
  }
  if (compound) {
    const pieces = pair.value.raw.split(compound.separator);
    const numbers = pieces.map(Number);
    if (
      pieces.length !== 2 ||
      numbers.some((number) => !Number.isFinite(number))
    ) {
      lower.problems.push({
        message: `${pair.key}= needs two numbers, as in ${pair.key}=10${compound.separator}20.`,
        span: pair.span,
      });
      return;
    }
    setFlat(part, compound.paths[0], numbers[0]);
    setFlat(part, compound.paths[1], numbers[1]);
    return;
  }
  const refEntry = Object.entries(spec.refs ?? {}).find(
    ([, ref]) => ref.word === pair.key
  );
  if (refEntry) {
    const [path, ref] = refEntry;
    pending.push({
      target: part,
      path,
      space: ref.space,
      text: pair.value.items[0]!.text,
      span: pair.span,
      owner: owners.get(part) ?? part,
    });
    return;
  }
  if (!pair.value.items[0]!.quoted && pair.value.raw === "unset") {
    setFlat(part, pair.key, UNSET);
    return;
  }
  const current = flatten(part)[pair.key];
  const value = decodeValue(pair.value, {
    list: (spec.lists ?? []).includes(pair.key),
    text:
      TEXT_PATHS.includes(pair.key) || (spec.texts ?? []).includes(pair.key),
    current,
  });
  const wrong = valueProblem(spec.keyword, pair.key, value);
  if (wrong) {
    lower.problems.push({
      message: `${pair.key}=${pair.value.raw} doesn't fit ${spec.keyword}, so it was ignored.`,
      span: pair.span,
      suggestion: `${pair.key} takes ${wrong}.`,
    });
    return;
  }
  setFlat(part, pair.key, value);
}

function lowerObject(
  spec: ObjectSpec,
  declaration: DslDeclaration,
  object: Record_,
  lower: LowerContext,
  pending: Pending[]
) {
  const positional = [...declaration.positional];
  if (spec.positional && positional[0]) {
    object[spec.positional] = positional.shift()!.value.items[0]!.text;
  }
  for (const extra of positional) {
    lower.problems.push({
      message: `${extra.value.raw} has no setting name in ${spec.keyword}, so it was ignored.`,
      span: extra.span,
    });
  }
  for (const pair of declaration.pairs) {
    lowerPair(
      { keyword: spec.keyword, refs: spec.refs, texts: spec.texts },
      object,
      pair,
      lower,
      pending
    );
  }
}

function namedList(list: unknown): Named[] {
  return Array.isArray(list) ? (list as Named[]) : [];
}

/** Gives unnamed parts their natural IDs and reports repeated ones. */
function assignIds(
  parts: Record_[],
  prefixes: string[],
  spans: DslSpan[],
  lower: LowerContext
) {
  const natural = naturalIds(prefixes);
  parts.forEach((part, index) => {
    if (part.id === undefined && prefixes[index]) {
      part.id = natural[index];
    }
  });
  const seen = new Set<string>();
  parts.forEach((part, index) => {
    if (!prefixes[index]) return;
    const id = String(part.id);
    if (seen.has(id)) {
      lower.problems.push({
        message: `@${id} names two parts of this composition.`,
        span: spans[index]!,
        suggestion: "Give each part its own @name.",
      });
    }
    seen.add(id);
  });
}

/**
 * Builds a composition from its declaration: the head's artboard settings
 * and the body's parts. Problems come back with their lines; a part that
 * can't be read is left out and the rest still build.
 */
export function lowerComposition(
  declaration: DslDeclaration,
  head: { width?: number; height?: number; background?: string },
  problems: CompositionProblem[]
): CompositionDefinition {
  const context: Context = { artboardWidth: head.width ?? 960 };
  const lower: LowerContext = { problems, context };
  const pending: Pending[] = [];
  const definition = {
    artboard: {
      width: head.width ?? 960,
      height: head.height ?? 600,
      background: head.background ?? PAPER,
    },
    elements: [] as Record_[],
    scales: [] as Record_[],
    calculations: [] as Record_[],
    overrides: [] as Record_[],
  };
  const spans = {
    elements: [] as DslSpan[],
    scales: [] as DslSpan[],
    calcs: [] as DslSpan[],
  };
  const overrideLines: DslDeclaration[] = [];
  for (const child of declaration.children) {
    if (child.keyword === "scale") {
      const kind = child.positional.shift()?.value.items[0]?.text ?? "";
      const spec = SCALE_SPECS.find((item) => item.keyword === kind);
      if (!spec) {
        problems.push({
          message: `${kind || "A scale"} is not a scale kind, so this scale was skipped.`,
          span: child.span,
          suggestion:
            'Write scale numeric <field>, scale position <field>, or scale value "Name".',
        });
        continue;
      }
      definition.scales.push(lowerPart(spec, child, lower, pending));
      spans.scales.push(child.span);
      continue;
    }
    if (child.keyword === "measure") {
      const call = child.positional.shift();
      const match = call && /^(\w+)\((.*)\)$/.exec(call.value.raw);
      if (!match) {
        problems.push({
          message:
            "A measure starts with its aggregation, so this one was skipped.",
          span: child.span,
          suggestion:
            'Write it as measure max("Group order") or measure count().',
        });
        continue;
      }
      const part = lowerPart(MEASURE_SPEC, child, lower, pending);
      part.aggregation = match[1];
      if (match[2]) {
        part.field = match[2].startsWith('"')
          ? (JSON.parse(match[2]) as string)
          : match[2];
      }
      // Defaults that read the aggregation and field.
      const defaults = MEASURE_SPEC.defaults(part, context);
      if (child.pairs.every((pair) => pair.key !== "name")) {
        part.name = defaults.name;
      }
      definition.calculations.push(part);
      spans.calcs.push(child.span);
      continue;
    }
    if (child.keyword === "override") {
      overrideLines.push(child);
      continue;
    }
    const spec = ELEMENT_SPECS.find((item) => item.keyword === child.keyword);
    if (!spec) {
      problems.push({
        message: `${child.keyword} is not a part of a composition, so it was skipped.`,
        span: child.span,
        suggestion: `Use one of: scale, measure, ${ELEMENT_SPECS.map((item) => item.keyword).join(", ")}, override.`,
      });
      continue;
    }
    const part = lowerPart(spec, child, lower, pending);
    if (spec.keyword === "note") {
      lowerAnchor(part, child, lower, pending);
    }
    definition.elements.push(part);
    spans.elements.push(child.span);
  }
  assignIds(
    definition.scales,
    definition.scales.map((part) => specFor(SCALE_SPECS, part)?.prefix ?? "n"),
    spans.scales,
    lower
  );
  assignIds(
    definition.calculations,
    definition.calculations.map(() => "calc"),
    spans.calcs,
    lower
  );
  assignIds(
    definition.elements,
    definition.elements.map(
      (part) => specFor(ELEMENT_SPECS, part)?.prefix ?? ""
    ),
    spans.elements,
    lower
  );
  for (const unit of definition.elements.filter(
    (part) => part.kind === "unit"
  )) {
    for (const key of ["marks", "insets"] as const) {
      const list = (unit[key] as Record_[] | undefined) ?? [];
      assignIds(
        list,
        list.map(() => (key === "marks" ? "mark" : "inset")),
        list.map(() => ({ line: 0, column: 0, length: 0 })),
        lower
      );
    }
  }
  const units = definition.elements.filter((part) => part.kind === "unit");
  // Marks resolve within the unit that holds them, or that a part points at.
  const markScope = (target: Record_): Record_ | undefined => {
    for (const unit of units) {
      const marks = (unit.marks as Record_[]) ?? [];
      const insets = (unit.insets as Record_[]) ?? [];
      if (marks.includes(target) || insets.includes(target)) return unit;
    }
    return undefined;
  };
  // Units and other spaces first, so legends find their unit's marks.
  const order: Space[] = ["unit", "scale", "calc", "inset", "mark"];
  const broken = new Set<Record_>();
  for (const space of order) {
    for (const item of pending.filter((entry) => entry.space === space)) {
      let items: Named[] = [];
      if (space === "unit") items = units as unknown as Named[];
      if (space === "scale") items = definition.scales as unknown as Named[];
      if (space === "calc")
        items = definition.calculations as unknown as Named[];
      if (space === "inset" || space === "mark") {
        const holder =
          markScope(item.target) ??
          units.find(
            (unit) =>
              unit.id ===
              ((item.target.unitId as string | undefined) ??
                ((item.target.anchor as Record_ | undefined)?.unitId as
                  | string
                  | undefined))
          ) ??
          // A legend item's mark is in its legend's unit.
          units.find((unit) =>
            definition.elements.some(
              (element) =>
                Array.isArray(element.items) &&
                (element.items as Record_[]).includes(item.target) &&
                element.unitId === unit.id
            )
          );
        items = namedList(holder?.[space === "mark" ? "marks" : "insets"]);
      }
      const found = resolveRef(items, item.text, space);
      if (!found) {
        const known = items.map(
          (entry) => entry.name || entry.field || entry.id
        );
        const owner = item.owner;
        problems.push({
          message: `${item.text} is not a ${space} in this composition, so ${partLabel(owner)} was left out.`,
          span: item.span,
          suggestion: known.length ? `Known: ${known.join(", ")}.` : undefined,
        });
        broken.add(owner);
        continue;
      }
      setFlat(item.target, item.path, found.id);
    }
  }
  // A part without a setting it needs can't be drawn; say which, and drop it.
  const checkPart = (part: Record_) => {
    const where = partSpans.get(part);
    if (!where || broken.has(part)) return;
    const missing = missingSettings(where.spec.keyword, where.spec, part);
    if (missing.length) {
      problems.push({
        message: `${partLabel(part)} needs ${missing.map((word) => `${word}=`).join(", ")}, so it was left out.`,
        span: where.span,
        suggestion: `${where.spec.keyword} takes: ${partSettings(where.spec.keyword).join(", ")}.`,
      });
      broken.add(part);
    }
  };
  for (const element of definition.elements) {
    checkPart(element);
    for (const key of ["marks", "insets", "items"]) {
      for (const child of (element[key] as Record_[] | undefined) ?? []) {
        checkPart(child);
      }
    }
  }
  // A part whose link is missing would break the whole graphic; drop it.
  if (broken.size) {
    definition.elements = definition.elements.filter(
      (part) => !broken.has(part)
    );
    for (const element of definition.elements) {
      for (const key of ["marks", "insets", "items"]) {
        if (Array.isArray(element[key])) {
          element[key] = (element[key] as Record_[]).filter(
            (part) => !broken.has(part)
          );
        }
      }
    }
  }
  for (const line of overrideLines) {
    const target = line.positional[0];
    const keyed = target && splitKeyed(target.value.raw);
    const unit =
      keyed && resolveRef(units as unknown as Named[], keyed.ref, "unit");
    if (!keyed || !unit) {
      problems.push({
        message:
          "An override names a unit and a repeat, as in override States[Texas].",
        span: line.span,
      });
      continue;
    }
    const override: Record_ = {
      unitId: unit.id,
      instanceKey: keyed.key,
      dx: 0,
      dy: 0,
    };
    for (const pair of line.pairs) {
      lowerPair(
        { keyword: "override", texts: ["accent"] },
        override,
        pair,
        lower,
        pending
      );
    }
    definition.overrides.push(override);
  }
  return keepDrawableParts(
    definition as unknown as CompositionDefinition,
    problems
  );
}

/**
 * Leaves out each part the graphic can't draw, down to a single mark, so one
 * bad part costs only itself, and says which part and where.
 */
function keepDrawableParts(
  definition: CompositionDefinition,
  problems: CompositionProblem[]
): CompositionDefinition {
  // A plain check, not a type guard, so a failing definition keeps its type.
  const valid = (value: unknown): boolean => isCompositionDefinition(value);
  if (valid(definition)) return definition;
  const base = { ...definition, elements: [] };
  if (!valid(base)) return definition;
  const report = (part: Record_) => {
    const where = partSpans.get(part);
    if (!where) return;
    problems.push({
      message: `${partLabel(part)} has a setting the graphic can't draw, so it was left out.`,
      span: where.span,
      suggestion: `Check its values with exploreda-dsl reference composition.`,
    });
  };
  const fits = (elements: unknown[]) => valid({ ...base, elements });
  const elements = definition.elements.flatMap((element) => {
    if (fits([element])) return [element];
    const record = element as unknown as Record_;
    if (record.kind === "unit") {
      const marks = (record.marks as Record_[]) ?? [];
      const bare = { ...record, marks: [] };
      if (fits([bare])) {
        const kept = marks.filter((mark) => {
          const ok = fits([{ ...record, marks: [mark] }]);
          if (!ok) report(mark);
          return ok;
        });
        return [{ ...record, marks: kept } as unknown as typeof element];
      }
    }
    report(record);
    return [];
  });
  return { ...definition, elements };
}

/** How a diagnostic names a part: its kind and name. */
function partLabel(part: Record_): string {
  const kind = (part.type ?? part.kind ?? "part") as string;
  const name = (part.name ?? part.label ?? part.text) as string | undefined;
  return name ? `${kind} ${JSON.stringify(name)}` : `that ${kind}`;
}

/** Reads a note's on=, point=, mark=, pick=, and pickAt= into its anchor. */
function lowerAnchor(
  part: Record_,
  declaration: DslDeclaration,
  lower: LowerContext,
  pending: Pending[]
) {
  const get = (key: string) =>
    declaration.pairs.find((pair) => pair.key === key);
  const on = get("on");
  const point = get("point");
  const mark = get("mark");
  const pick = get("pick");
  const pickAt = get("pickAt");
  for (const key of ["on", "point", "mark", "pick", "pickAt"]) {
    delete part[key];
  }
  if (!on) {
    part.anchor = { kind: "page" };
    return;
  }
  const keyed = splitKeyed(on.value.raw);
  if (!keyed) {
    lower.problems.push({
      message: "on= names a unit and a repeat, as in on=States[Texas].",
      span: on.span,
    });
    part.anchor = { kind: "page" };
    return;
  }
  const anchor: Record_ = {
    kind: mark ? "data" : "frame",
    unitId: "",
    instanceKey: keyed.key,
  };
  pending.push({
    target: anchor,
    path: "unitId",
    space: "unit",
    text: keyed.ref,
    span: on.span,
    owner: part,
  });
  if (mark) {
    pending.push({
      target: anchor,
      path: "markId",
      space: "mark",
      text: mark.value.items[0]!.text,
      span: mark.span,
      owner: part,
    });
    anchor.pick = pick?.value.items[0]?.text ?? "max";
    if (pickAt) anchor.at = pickAt.value.items[0]!.text;
  } else {
    const [fx, fy] = (point?.value.raw ?? "0.5,0.5").split(",").map(Number);
    anchor.fx = fx;
    anchor.fy = fy;
  }
  part.anchor = anchor;
}
