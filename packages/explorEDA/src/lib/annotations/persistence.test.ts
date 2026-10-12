import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileDocument } from "@/lib/dsl/compile";
import { exportDocument } from "@/lib/dsl/export";
import {
  parseSavedData,
  stringifySavedData,
  validateSavedData,
} from "@/utils/saveDataUtils";
import type { ChartAnnotation } from "./types";

beforeAll(() => registerAllCharts());

const rows = [
  { id: "17", run: 1, x: 1, y: 10, lo: 8, hi: 12, group: "A" },
  { id: "E-18", run: 2, x: 2, y: 30, lo: 25, hi: 33, group: "B" },
  { id: "E-19", run: 3, x: 3, y: 20, lo: 15, hi: 24, group: "B" },
];

// Every kind and attachment, including a numeric-looking text key, which
// must not come back as a number.
const annotations: ChartAnnotation[] = [
  {
    id: "c1",
    type: "callout",
    name: "Note, with a comma",
    text: "Line one\nLine two",
    attach: { kind: "record", keyFields: ["id"], key: ["17"] },
    offset: { dx: -12, dy: 30 },
    leader: false,
    arrow: true,
  },
  {
    id: "c2",
    type: "callout",
    text: "Top",
    attach: { kind: "query", pick: "max", population: "filtered" },
    offset: { dx: 0, dy: -20 },
  },
  {
    id: "c3",
    type: "callout",
    text: "Fixed",
    attach: { kind: "coordinate", x: 2.5, y: 15 },
    offset: { dx: 5, dy: 5 },
    facet: JSON.stringify(['["string","B"]', null]),
  },
  {
    id: "r1",
    type: "reference-line",
    axis: "y",
    value: 0,
    calculated: { statistic: "median", population: "all" },
  },
  {
    id: "b1",
    type: "band",
    axis: "x",
    from: 1.5,
    to: 2.5,
    label: "Window",
    display: "bracket",
    hidden: true,
  },
  {
    id: "g1",
    type: "region",
    shape: "ellipse",
    x0: 1,
    x1: 2,
    y0: 5,
    y1: 35,
    color: "#c2410c",
  },
  {
    id: "s1",
    type: "record-set",
    keyFields: ["run"],
    keys: [[1], [3]],
    label: "Runs",
  },
  {
    id: "i1",
    type: "interval",
    lowerField: "lo",
    upperField: "hi",
    meaning: "Supplied range",
  },
];

function workspace() {
  const settings = compileDocument("scatter x=x y=y", { rows }).settings;
  settings.charts[0] = { ...settings.charts[0]!, annotations };
  return settings;
}

it("round-trips every annotation through dashboard text", () => {
  const { text, omitted } = exportDocument(workspace(), { rows });
  expect(omitted).toEqual([]);
  const rebuilt = compileDocument(text, { rows });
  expect(rebuilt.diagnostics).toEqual([]);
  expect(rebuilt.settings.charts[0]!.annotations).toEqual(annotations);
});

it("round-trips every annotation through saved data and validation", () => {
  const settings = workspace();
  const restored = parseSavedData(stringifySavedData(settings));
  expect(validateSavedData(restored)).toBe(true);
  expect(restored.charts[0]!.annotations).toEqual(annotations);
  // A host that echoes the save back sees the same structure.
  expect(stringifySavedData(restored)).toBe(stringifySavedData(settings));
});

it("rejects a save whose annotation is malformed", () => {
  const settings = workspace();
  const broken = JSON.parse(stringifySavedData(settings));
  broken.charts[0].annotations[0].offset = { dx: "far" };
  expect(validateSavedData(broken)).toBe(false);
});
