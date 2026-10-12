import { buildFieldProfiles } from "@/lib/fieldProfiles";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type { FieldSettings } from "@/lib/fieldSettings";
import type { GridSettings, SavedChartSettings } from "@/types/SavedDataTypes";
import { compileDocument } from "./compile";
import { normalizeChart } from "./normalize";
import { diffPaths, encodeScalar, formatPath, parsePath } from "./paths";
import { splitPair } from "./parse";
import { wordForPath } from "./schema";
import { layoutLines } from "./layout";
import { FIELD_SETTING_WORDS, GRID_SETTING_WORDS } from "./settingKeys";

export interface DslExportOptions {
  /** The rows the dashboard shows; text is checked against their fields. */
  rows: Array<Record<string, datum>>;
}

export interface DslExportResult {
  text: string;
  /** Parts of the dashboard the text does not carry yet. Empty when whole. */
  omitted: string[];
}

const TYPE_WORDS = {
  numeric: "num",
  categorical: "cat",
  datetime: "date",
  boolean: "bool",
} as const;

const IDENTIFIER = /^[A-Za-z_][\w]*$/;
const GENERATED_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** A declaration stays on one line up to this width. */
const LINE_WIDTH = 88;
/** Settings lines in a body wrap at this width. */
const BODY_WIDTH = 80;

/**
 * Writes a declaration: one line when it fits, otherwise a head line that
 * opens a body, the remaining settings in lines of a comfortable width, and
 * a closing brace. A token without `=`, such as `@name`, stays on the head.
 */
export function block(head: string, tokens: string[]): string[] {
  const single = [head, ...tokens].join(" ");
  if (single.length <= LINE_WIDTH) {
    return [single];
  }
  let line = head;
  let index = 0;
  while (
    index < tokens.length &&
    (!tokens[index]!.includes("=") ||
      line.length + tokens[index]!.length + 3 <= LINE_WIDTH)
  ) {
    line += ` ${tokens[index]}`;
    index++;
  }
  const body: string[] = [];
  for (const token of tokens.slice(index)) {
    const last = body.at(-1);
    if (last !== undefined && last.length + token.length + 1 <= BODY_WIDTH) {
      body[body.length - 1] = `${last} ${token}`;
    } else {
      body.push(token);
    }
  }
  return body.length
    ? [`${line} {`, ...body.map((item) => `  ${item}`), "}"]
    : [line];
}

/**
 * `where.` text for a chart's filters, or the bare `field=` pairs of a
 * `filter` line, or undefined when one needs records.
 */
function filterPairs(
  prefix: "where" | "select" | undefined,
  filters: Filter[],
  types: Record<string, string>
): string[] | undefined {
  const fields = filters.map((filter) => filter.field);
  if (new Set(fields).size !== fields.length) {
    return undefined;
  }
  const pairs: string[] = [];
  for (const filter of filters) {
    const field = (prefix ? `${prefix}.` : "") + formatPath([filter.field]);
    switch (filter.type) {
      case "value":
        if (
          !filter.values.length ||
          filter.values.some((value) => value === undefined || value === "")
        ) {
          return undefined;
        }
        pairs.push(
          `${field}=${filter.values.map((value) => encodeScalar(value as string | number | boolean | null)).join(",")}`
        );
        break;
      case "range":
      case "date-range": {
        const dated = types[filter.field] === "datetime";
        if ((filter.type === "date-range") !== dated) {
          return undefined;
        }
        if (filter.min === undefined && filter.max === undefined) {
          return undefined;
        }
        pairs.push(`${field}=${filter.min ?? ""}..${filter.max ?? ""}`);
        break;
      }
      case "text":
        pairs.push(
          `${field}.${filter.operator}=${JSON.stringify(filter.value)}`
        );
        break;
    }
  }
  return pairs;
}

function headFor(chart: SavedChartSettings): string {
  const name = (field: string | undefined) => encodeScalar(field ?? "");
  switch (chart.type) {
    case "scatter":
      return `scatter x=${name(chart.xField)} y=${name(chart.yField)}`;
    case "bar":
      return `${chart.forceString ? "bar" : "hist"} ${name(chart.field)}`;
    case "row":
      return `row ${name(chart.field)}`;
    case "metric-card":
      return chart.aggregation === "count" || !chart.measureField
        ? "metric count"
        : `metric ${chart.aggregation === "sum" ? "sum" : "avg"}=${name(chart.measureField)}`;
    case "data-table":
      return chart.columns.length
        ? `table ${chart.columns.map((column) => name(column.field)).join(",")}`
        : "table";
    case "summary":
      return "summary";
    default:
      return `chart ${chart.type}${chart.field ? ` field=${name(chart.field)}` : ""}`;
  }
}

/** The field a chart's head names, which it goes by without an @name. */
function implicitField(chart: SavedChartSettings): string | undefined {
  if (
    ["scatter", "metric-card", "data-table", "summary"].includes(chart.type)
  ) {
    return undefined;
  }
  return chart.field || undefined;
}

/**
 * The name each chart goes by in text, and whether the text must write it.
 * A chart keeps a readable saved ID. Otherwise it goes by its field when no
 * other chart shares it, or by its type and a number.
 */
function chartHandles(charts: SavedChartSettings[]) {
  const fields = charts.map(implicitField);
  const counts = new Map<string, number>();
  for (const field of fields) {
    if (field !== undefined) {
      counts.set(field, (counts.get(field) ?? 0) + 1);
    }
  }
  const readable = charts.map(
    (chart) => !GENERATED_ID.test(chart.id) && /^[\w-]+$/.test(chart.id)
  );
  const taken = new Set(
    charts.flatMap((chart, index) => (readable[index] ? [chart.id] : []))
  );
  const unique = (field: string | undefined) =>
    field !== undefined && counts.get(field) === 1;
  const names: string[] = [];
  const written: boolean[] = [];
  charts.forEach((chart, index) => {
    const field = fields[index];
    if (readable[index]) {
      names.push(chart.id);
      // Compile names an unnamed chart by its field when it can.
      written.push(!(unique(field) && field === chart.id));
      return;
    }
    if (unique(field) && !taken.has(field!)) {
      names.push(field!);
      taken.add(field!);
      written.push(false);
      return;
    }
    let count = 1;
    while (taken.has(`${chart.type}-${count}`)) {
      count++;
    }
    const name = `${chart.type}-${count}`;
    taken.add(name);
    names.push(name);
    written.push(true);
  });
  return { names, written };
}

/** Writes a `path=value` pair with the setting's word when it has one. */
function toWord(type: string, pair: string): string {
  const [key, value] = splitPair(pair) ?? [pair, ""];
  const path = parsePath(key);
  const word =
    path && !path.marker && wordForPath(type, path.segments.join("."));
  return word ? `${word}=${value}` : pair;
}

/** Text for one dashboard, split into what views share and what each owns. */
export interface DslExportParts {
  /** The `dashboard name=` line. */
  name: string;
  /** Field settings, calculations, color scales, and grouped summaries. */
  shared: string[][];
  /** The grid, the Rows view, and the charts. */
  view: string[][];
  omitted: string[];
}

/**
 * Writes the current dashboard as text that rebuilds it. Each chart is its
 * short form plus a path for every setting that differs from what the short
 * form builds, so the text stays brief and the rebuild stays exact.
 */
export function exportDocument(
  settings: SavedDataStructure,
  options: DslExportOptions
): DslExportResult {
  const parts = exportParts(settings, options);
  const blocks = [
    [parts.name, ...(parts.view[0] ?? [])],
    ...parts.shared,
    ...parts.view.slice(1),
  ].filter((block) => block.length);
  return {
    text: `${blocks.map((block) => block.join("\n")).join("\n\n")}\n`,
    omitted: parts.omitted,
  };
}

export function exportParts(
  settings: SavedDataStructure,
  options: DslExportOptions
): DslExportParts {
  const omitted: string[] = [];
  const profiles = buildFieldProfiles(options.rows);
  const types = Object.fromEntries(
    profiles.map((profile) => [profile.name, profile.dataType])
  );
  const calcNames = new Set(
    settings.calculations.map((calc) => calc.resultColumnName)
  );

  const workspace: string[] = [
    `dashboard ${JSON.stringify(settings.metadata.name)}`,
  ];
  const grid = Object.entries(GRID_SETTING_WORDS).flatMap(
    ([key, { word, fallback }]) => {
      const value = settings.gridSettings[key as keyof GridSettings];
      return value === undefined || value === fallback
        ? []
        : [`${word}=${value}`];
    }
  );
  if (grid.length) {
    workspace.push(`grid ${grid.join(" ")}`);
  }
  if (settings.theme) {
    workspace.push(`theme ${settings.theme.id}`);
  }

  const fieldLines = (names: string[]) =>
    names.flatMap((field) => {
      const value = settings.fieldSettings?.[field];
      if (!value || !Object.keys(value).length) {
        return [];
      }
      const pairs = Object.entries(value).flatMap(([key, item]) => {
        if (item === undefined) {
          return [];
        }
        const word = FIELD_SETTING_WORDS[key as keyof FieldSettings];
        if (!word) {
          omitted.push(`field ${field}: ${key} has no text form`);
          return [];
        }
        if (key === "type") {
          return calcNames.has(field)
            ? []
            : [`${word}=${TYPE_WORDS[item as keyof typeof TYPE_WORDS]}`];
        }
        if (Array.isArray(item)) {
          return [
            `${word}=${item.map((token) => JSON.stringify(token)).join(",")}`,
          ];
        }
        return [
          `${word}=${typeof item === "string" ? JSON.stringify(item) : item}`,
        ];
      });
      return block(`field ${encodeScalar(field)}`, pairs);
    });
  const sourceSettings = Object.keys(settings.fieldSettings ?? {}).filter(
    (field) => !calcNames.has(field)
  );
  const calcLines = settings.calculations.flatMap((calc) => [
    `calc ${IDENTIFIER.test(calc.resultColumnName) ? calc.resultColumnName : JSON.stringify(calc.resultColumnName)}=${calc.expression.replace(/\s*\n\s*/g, " ")}`,
  ]);

  // Build a skeleton from each chart's short form, then add what differs.
  // Charts are compared in full, so a partial saved axis reads as default.
  const charts = settings.charts.map((chart) => normalizeChart(chart));
  const { names, written } = chartHandles(charts);
  // Charts that overlap can't be drawn as layout lines; each gets at=.
  const layoutText = layoutLines(
    charts.map((chart, index) => ({
      name: names[index]!,
      layout: chart.layout,
    })),
    settings.gridSettings.columnCount
  );
  const heads = charts.map((chart, index) => {
    const pairs = [`@${names[index]}`];
    if (!layoutText) {
      const { x, y, w, h } = chart.layout;
      pairs.push(`at=${x},${y},${w},${h}`);
    }
    // color= also builds a scale; a chart saved without one says so.
    if (chart.colorField) {
      pairs.push(
        `${chart.colorScaleId ? "color" : "colorField"}=${encodeScalar(chart.colorField)}`
      );
    }
    const local = chart.localFilters?.length
      ? filterPairs("where", chart.localFilters, types)
      : [];
    const linked = chart.filters.length
      ? filterPairs("select", chart.filters, types)
      : [];
    // The name reads right after the chart word: scatter @size x=… y=….
    const [word, ...rest] = headFor(chart).split(" ");
    const lead = word === "chart" ? 2 : 1;
    const parts = [word!, ...rest];
    const extras = [...pairs.slice(1), ...(local ?? []), ...(linked ?? [])];
    const withName = (name: string[]) =>
      [...parts.slice(0, lead), ...name, ...parts.slice(lead)].join(" ");
    return {
      head: withName(written[index] ? [pairs[0]!] : []),
      pairs: extras,
      // The skeleton names each chart by position, whatever the text calls it.
      skeleton: [withName([`@__c${index}`]), ...extras].join(" "),
    };
  });
  // Shared definitions keep their IDs, so charts can point at them.
  const known = new Set([
    ...profiles.map((profile) => profile.name),
    ...calcNames,
  ]);
  const scaleHeads = settings.colorScales.map(
    (scale) =>
      `scale @${scale.id}${scale.sourceField && known.has(scale.sourceField) ? ` field=${encodeScalar(scale.sourceField)}` : ""}`
  );
  const groupHeads = (settings.aggregates ?? []).map(
    (spec) => `group @${spec.id}`
  );
  const skeleton = [
    ...workspace,
    ...fieldLines(sourceSettings),
    ...calcLines,
    ...fieldLines([...calcNames]),
    ...scaleHeads,
    ...groupHeads,
    "rows",
    ...heads.map(({ skeleton }) => skeleton),
  ].join("\n");
  const base = compileDocument(
    skeleton,
    { rows: options.rows, geometryAssets: settings.geometryAssets },
    { keepIncomplete: true }
  );
  const record = (value: unknown) => value as Record<string, unknown>;
  const diffRecord = (built: unknown, next: unknown, skip: string[]) =>
    [...new Set([...Object.keys(record(built)), ...Object.keys(record(next))])]
      .filter((key) => !skip.includes(key))
      .flatMap((key) =>
        diffPaths(record(built)[key], record(next)[key], [key])
      );
  const scaleLines = settings.colorScales.flatMap((scale, index) => {
    const built = base.settings.colorScales.find(
      (item) => item.id === scale.id
    );
    return block(scaleHeads[index]!, diffRecord(built ?? {}, scale, ["id"]));
  });
  const groupLines = (settings.aggregates ?? []).flatMap((spec, index) => {
    const built = base.settings.aggregates?.find((item) => item.id === spec.id);
    return block(groupHeads[index]!, diffRecord(built ?? {}, spec, ["id"]));
  });
  const rowsPairs = settings.rowsSettings
    ? diffRecord(base.settings.rowsSettings, settings.rowsSettings, [])
    : [];
  const rowsLines = settings.rowsSettings ? block("rows", rowsPairs) : [];
  // One `filter` line per workspace filter, so each reads on its own.
  const filterLines = (settings.workspaceFilters ?? []).flatMap((filter) => {
    const pairs = filterPairs(undefined, [filter], types);
    if (!pairs) {
      omitted.push(
        `filter ${filter.field}: its values have no text form, such as a blank value`
      );
      return [];
    }
    return pairs.map((pair) => `filter ${pair}`);
  });
  const baseCharts = new Map(
    base.settings.charts.map((chart) => [chart.id, chart])
  );

  const chartLines = charts.flatMap((chart, index) => {
    const built = baseCharts.get(`__c${index}`);
    const { head, pairs } = heads[index]!;
    if (!built) {
      omitted.push(`${head}: the chart could not be rebuilt from its fields`);
      return [];
    }
    const skip = new Set(["id", "type", "layout"]);
    const extra: string[] = [];
    for (const key of new Set([...Object.keys(built), ...Object.keys(chart)])) {
      if (skip.has(key)) {
        continue;
      }
      extra.push(
        ...diffPaths(
          (built as unknown as Record<string, unknown>)[key],
          (chart as unknown as Record<string, unknown>)[key],
          [key]
        )
      );
    }
    return block(head, [
      ...pairs,
      ...extra.map((pair) => toWord(chart.type, pair)),
    ]);
  });

  return {
    name: workspace[0]!,
    shared: [
      fieldLines(sourceSettings),
      [...calcLines, ...fieldLines([...calcNames])],
      [...scaleLines, ...groupLines],
    ].filter((block) => block.length),
    // The grid line rides with the name in a single-view export.
    view: [
      workspace.slice(1),
      [
        ...rowsLines,
        ...filterLines,
        ...chartLines,
        ...(layoutText?.length
          ? ["layout {", ...layoutText.map((line) => `  ${line}`), "}"]
          : []),
      ],
    ],
    omitted,
  };
}
