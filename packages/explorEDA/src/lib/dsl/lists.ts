/**
 * Settings that hold lists of records, written as one child line each:
 *
 *   table @orders {
 *     column Revenue width=140
 *     column "Net revenue"
 *   }
 *   pivot rows="Order month" {
 *     value sum("Net sales") label="Net sales"
 *   }
 *   line x=Order y="Net sales" {
 *     series "Net sales" lineColor=#3479a8
 *   }
 *
 * A child names its record by its main field; settings equal to the
 * record's default are left out.
 */
import { DEFAULT_SERIES_SETTINGS } from "@/components/charts/LineChart/definition";
import type { DslDeclaration, DslPair } from "./parse";
import { encodeValue } from "./composition";

type Record_ = Record<string, unknown>;

interface ListChild {
  /** The child line's word. */
  word: string;
  /** The saved setting the children fill. */
  key: string;
  /** Records keyed by name (an object) rather than listed (an array). */
  keyed?: boolean;
  /** The record field written as the child's plain value. */
  main: string;
  /** Written as `agg(field)`: the aggregation field joins the main one. */
  call?: string;
  defaults: (record: Record_) => Record_;
}

const LIST_CHILDREN: Record<string, ListChild[]> = {
  "data-table": [
    {
      word: "column",
      key: "columns",
      main: "field",
      defaults: (record) => ({ id: record.field }),
    },
  ],
  pivot: [
    {
      word: "value",
      key: "valueFields",
      main: "field",
      call: "aggregation",
      defaults: () => ({}),
    },
  ],
  "parallel-coordinates": [
    {
      word: "axis",
      key: "axes",
      main: "field",
      defaults: () => ({ inverted: false }),
    },
  ],
  line: [
    {
      word: "series",
      key: "seriesSettings",
      keyed: true,
      main: "",
      defaults: () => ({ ...DEFAULT_SERIES_SETTINGS }),
    },
  ],
};

/** The child words a chart type takes. */
export function listChildWords(type: string): string[] {
  return (LIST_CHILDREN[type] ?? []).map((child) => child.word);
}

/** The saved settings a chart type writes as child lines. */
export function listChildKeys(type: string): string[] {
  return (LIST_CHILDREN[type] ?? []).map((child) => child.key);
}

function same(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function lineFor(child: ListChild, name: string, record: Record_): string {
  const defaults = child.defaults(record);
  const head = child.call
    ? `${child.word} ${record[child.call]}(${encodeValue(name)})`
    : `${child.word} ${encodeValue(name)}`;
  const tokens = Object.entries(record)
    .filter(
      ([key, value]) =>
        key !== child.main &&
        key !== child.call &&
        value !== undefined &&
        !(key in defaults && same(value, defaults[key]))
    )
    .map(([key, value]) => `${key}=${encodeValue(value)}`);
  return [head, ...tokens].join(" ");
}

/**
 * Child lines for a chart's lists, or undefined for a list that matches
 * what the chart's head builds, so it needs no lines.
 */
export function liftListChildren(
  type: string,
  chart: Record_,
  base: Record_
): { lines: string[]; keys: string[] } {
  const lines: string[] = [];
  const keys: string[] = [];
  for (const child of LIST_CHILDREN[type] ?? []) {
    const value = chart[child.key];
    if (same(value, base[child.key])) {
      keys.push(child.key);
      continue;
    }
    if (child.keyed) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        keys.push(child.key);
        for (const [name, record] of Object.entries(value as Record_)) {
          lines.push(lineFor(child, name, record as Record_));
        }
      }
      continue;
    }
    if (
      Array.isArray(value) &&
      value.length &&
      value.every(
        (record) =>
          record &&
          typeof record === "object" &&
          typeof (record as Record_)[child.main] === "string"
      )
    ) {
      keys.push(child.key);
      for (const record of value as Record_[]) {
        lines.push(lineFor(child, record[child.main] as string, record));
      }
    }
  }
  return { lines, keys };
}

function decode(pair: DslPair): unknown {
  const item = pair.value.items[0]!;
  if (pair.value.items.length > 1) {
    return pair.value.items.map((each) => each.text);
  }
  if (item.quoted) return item.text;
  if (item.text === "true" || item.text === "false") {
    return item.text === "true";
  }
  if (item.text.trim() !== "" && Number.isFinite(Number(item.text))) {
    return Number(item.text);
  }
  return item.text;
}

/**
 * Reads one child line into the chart's list, the first line replacing
 * what the head built. Returns false for a line that isn't a list child.
 */
export function lowerListChild(
  chart: Record_,
  declaration: DslDeclaration,
  started: Set<string>,
  resolveField: (name: string) => string | undefined
): boolean {
  const child = (LIST_CHILDREN[chart.type as string] ?? []).find(
    (item) => item.word === declaration.keyword
  );
  if (!child) return false;
  const raw = declaration.positional[0]?.value;
  if (!raw) return true;
  let name = raw.items[0]!.text;
  const record: Record_ = {};
  if (child.call) {
    const match = /^(\w+)\((.*)\)$/.exec(raw.raw);
    if (match) {
      record[child.call] = match[1];
      name = match[2]!.startsWith('"')
        ? (JSON.parse(match[2]!) as string)
        : match[2]!;
    }
  }
  if (!child.keyed) {
    name = resolveField(name) ?? name;
    record[child.main] = name;
  }
  for (const pair of declaration.pairs) {
    record[pair.key] = decode(pair);
  }
  const full = { ...child.defaults(record), ...record };
  if (!started.has(child.key)) {
    started.add(child.key);
    chart[child.key] = child.keyed ? {} : [];
  }
  if (child.keyed) {
    (chart[child.key] as Record_)[name] = full;
  } else {
    (chart[child.key] as Record_[]).push(full);
  }
  return true;
}
