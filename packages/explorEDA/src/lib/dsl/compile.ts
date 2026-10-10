import { chartRegistry, getChartDefinition } from "@/charts/registry";
import { defaultColorScaleForField } from "@/lib/colorScaleMath";
import { categoryLabel } from "@/lib/categories";
import { CalculationManager } from "@/lib/calculations/CalculationState";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";
import { buildFieldProfiles } from "@/lib/fieldProfiles";
import {
  applyFieldSettings,
  getFieldSettingsError,
  type FieldFormat,
  type FieldSettings,
  type FieldSettingsMap,
} from "@/lib/fieldSettings";
import { initializeData } from "@/providers/lib/dataLayerState";
import type { AggregateSpec } from "@/lib/aggregates";
import type { GeometryAsset } from "@/lib/geometryAssets";
import {
  WORKSPACE_THEMES,
  isWorkspaceThemeId,
  type WorkspaceTheme,
} from "@/lib/themes";
import type { SavedRowsSettings } from "@/types/SavedDataTypes";
import type {
  ChartLayout,
  ChartSettings,
  ChartType,
  datum,
} from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import type {
  SavedCalculation,
  SavedDataStructure,
} from "@/types/SavedDataStructure";
import type {
  GridSettings,
  SerializedColorScale,
} from "@/types/SavedDataTypes";
import { validateSavedData } from "@/utils/saveDataUtils";
import { parsePath, setPath } from "./paths";
import {
  CHART_SETTING_KEYS,
  FIELD_SETTING_WORDS,
  GRID_SETTING_WORDS,
} from "./settingKeys";
import {
  parseDocument,
  type DslDeclaration,
  type DslPair,
  type DslSpan,
  type DslValue,
} from "./parse";

export type DslSeverity = "error" | "warning";

/** What a problem cost the dashboard, so partial output never reads as whole. */
export type DslEffect =
  | "chart-skipped"
  | "calculation-skipped"
  | "setting-ignored"
  | "setting-default"
  | "rows-missing"
  | "no-rows"
  | "contract";

export interface DslDiagnostic {
  severity: DslSeverity;
  effect: DslEffect;
  message: string;
  line: number;
  column: number;
  length: number;
  /** The declaration the problem belongs to, as it reads in the text. */
  subject?: string;
  suggestion?: string;
}

export interface DslChartResult {
  line: number;
  subject: string;
  type: string;
  /** The saved chart's ID when the chart was built. */
  id?: string;
}

export interface DslCompileResult {
  /** The complete dashboard: every usable declaration, app defaults elsewhere. */
  settings: SavedDataStructure;
  diagnostics: DslDiagnostic[];
  charts: DslChartResult[];
  skippedCharts: DslChartResult[];
  /** True when every declaration took full effect. */
  complete: boolean;
}

export interface DslCompileOptions {
  /** The source rows the dashboard will show. They stay with the host. */
  rows: Array<Record<string, datum>>;
  /** Name the host gives its rows, checked against a `source` line. */
  sourceName?: string;
  /** Dashboard name when the text has no `dashboard name=` line. */
  name?: string;
  /** Map shapes the host supplies; region maps refer to them by ID. */
  geometryAssets?: GeometryAsset[];
  /** Clock for metadata, for repeatable output. */
  now?: () => Date;
}

/**
 * Each row's sequence number. A new scatter plots against it, and selecting
 * points filters on it, so text accepts it like a field.
 */
const ROW_ID_FIELD = "__ID";

const DEFAULT_GRID: GridSettings = {
  columnCount: 12,
  rowHeight: 100,
  containerPadding: 10,
  showBackgroundMarkers: true,
};

const EMPTY_SETTINGS: SavedDataStructure = {
  charts: [],
  calculations: [],
  gridSettings: DEFAULT_GRID,
  metadata: { name: "", version: 1, createdAt: "", modifiedAt: "" },
  colorScales: [],
};

const TYPE_NAMES: Record<string, DataType> = {
  num: "numeric",
  number: "numeric",
  numeric: "numeric",
  cat: "categorical",
  category: "categorical",
  text: "categorical",
  categorical: "categorical",
  date: "datetime",
  datetime: "datetime",
  bool: "boolean",
  boolean: "boolean",
};

const TYPE_WORDS: Record<DataType, string> = {
  numeric: "number",
  categorical: "category",
  datetime: "date",
  boolean: "boolean",
};

/** Words that start a chart, and the native chart type each builds. */
export const DSL_CHART_KEYWORDS: Record<string, string> = {
  scatter: "scatter",
  hist: "bar",
  histogram: "bar",
  bar: "bar",
  row: "row",
  metric: "metric-card",
  table: "data-table",
  summary: "summary",
};

export const DSL_OTHER_KEYWORDS = [
  "scale",
  "group",
  "rows",
  "eda",
  "dashboard",
  "grid",
  "theme",
  "source",
  "calc",
  "field",
  "chart",
  "view",
];

/** Declarations that hold for every view, wherever they appear. */
const SHARED_KEYWORDS = new Set([
  "alias",
  "calc",
  "field",
  "scale",
  "group",
  "eda",
  "source",
  "dashboard",
]);

/** The `view` lines in parsed text, which split it into views. */
export function viewHeaders(declarations: DslDeclaration[]) {
  return declarations.filter((item) => item.keyword === "view");
}

/** A view's name: `view "Overview"` or `view name=Overview`. */
export function viewName(header: DslDeclaration, index: number): string {
  const value =
    header.positional[0]?.value ??
    header.pairs.find((pair) => pair.key === "name")?.value;
  return (value && single(value)) || `View ${index + 1}`;
}

/** Keys a field line takes; `as=` for the type is read on its own. */
const FIELD_SETTING_KEYS = Object.entries(FIELD_SETTING_WORDS)
  .filter(([key]) => key !== "type")
  .map(([, word]) => word);

/** Grid words such as `padding`, and the grid setting each writes. */
const GRID_WORDS = Object.fromEntries(
  Object.entries(GRID_SETTING_WORDS).map(([key, { word }]) => [word, key])
) as Record<string, keyof GridSettings>;
const GRID_WORD_LIST = Object.keys(GRID_WORDS)
  .map((word, index, all) =>
    index === all.length - 1 ? `or ${word}=` : `${word}=`
  )
  .join(", ");

const DATE_PRESETS = ["iso", "month-day-year", "day-month-year"];

/** Last path segments whose values name fields, so aliases apply. */
const FIELD_SEGMENT = /^(field|\w*Field|fields|rowFields|valueFields|stages)$/;

const FORMATS: FieldFormat[] = [
  "auto",
  "number",
  "currency",
  "percent",
  "date",
  "datetime",
];

const DEFAULT_SIZES: Record<string, { w: number; h: number }> = {
  "metric-card": { w: 3, h: 2 },
  "data-table": { w: 12, h: 5 },
  summary: { w: 12, h: 5 },
};

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]!;
      row[j] = Math.min(
        row[j]! + 1,
        row[j - 1]! + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      previous = current;
    }
  }
  return row[b.length]!;
}

/** The closest known name, if one is close enough to be a likely typo. */
export function closestName(
  name: string,
  candidates: Iterable<string>
): string | undefined {
  const lower = name.toLowerCase();
  let best: string | undefined;
  let bestScore = Infinity;
  for (const candidate of candidates) {
    const other = candidate.toLowerCase();
    const score =
      other === lower
        ? 0
        : other.includes(lower) || lower.includes(other)
          ? 1
          : editDistance(lower, other);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best !== undefined &&
    bestScore <= Math.max(2, Math.floor(name.length / 3))
    ? best
    : undefined;
}

const IDENTIFIER = /^[A-Za-z_][\w]*$/;

function fieldReference(field: string) {
  return IDENTIFIER.test(field) &&
    !["if", "then", "else", "true", "false", "null"].includes(field)
    ? field
    : `[${JSON.stringify(field)}]`;
}

function spanOf(span: DslSpan) {
  return { line: span.line, column: span.column, length: span.length };
}

function single(value: DslValue): string {
  return value.items.length === 1 ? value.items[0]!.text : value.raw;
}

function numberValue(value: DslValue): number | undefined {
  const text = single(value).trim();
  if (!text || value.items.length !== 1) {
    return undefined;
  }
  const number = Number(text);
  return Number.isFinite(number) ? number : undefined;
}

function booleanValue(value: DslValue): boolean | undefined {
  const text = single(value).toLowerCase();
  if (["true", "yes", "on"].includes(text)) {
    return true;
  }
  if (["false", "no", "off"].includes(text)) {
    return false;
  }
  return undefined;
}

/**
 * Builds a complete dashboard from text. Each declaration succeeds or fails
 * on its own, so one broken chart never hides the others, and every skipped
 * or changed effect comes back as a diagnostic with its location.
 */
export function compileDocument(
  text: string,
  options: DslCompileOptions,
  /** Export builds bare charts first, before their paths make them valid. */
  internal: {
    keepIncomplete?: boolean;
    /** Which `view` section to build; compileViews builds each in turn. */
    view?: number;
  } = {}
): DslCompileResult {
  const parsed = parseDocument(text);
  const { problems } = parsed;
  // Text with `view` lines holds several views. Shared definitions apply to
  // all of them; everything else belongs to the view section it sits in.
  const headers = viewHeaders(parsed.declarations);
  const viewIndex = internal.view ?? 0;
  const header = headers[viewIndex];
  let section = -1;
  const declarations = headers.length
    ? parsed.declarations.filter((item) => {
        if (item.keyword === "view") {
          section = headers.indexOf(item);
          return false;
        }
        return (
          section === -1 ||
          section === viewIndex ||
          SHARED_KEYWORDS.has(item.keyword)
        );
      })
    : parsed.declarations;
  const diagnostics: DslDiagnostic[] = problems.map((problem) => ({
    severity: "error",
    effect: "setting-ignored",
    message: problem.message,
    suggestion: problem.suggestion,
    ...spanOf(problem.span),
  }));
  const report = (
    severity: DslSeverity,
    effect: DslEffect,
    span: DslSpan,
    message: string,
    extra: { subject?: string; suggestion?: string } = {}
  ) =>
    diagnostics.push({ severity, effect, message, ...spanOf(span), ...extra });

  if (header) {
    for (const pair of header.pairs) {
      if (pair.key !== "name") {
        report(
          "warning",
          "setting-ignored",
          pair.span,
          `${pair.key} is not a view setting, so it was ignored.`,
          { suggestion: 'Name the view, as in view "Overview".' }
        );
      }
    }
    if (internal.view === undefined) {
      for (const other of headers.slice(1)) {
        report(
          "warning",
          "chart-skipped",
          other.span,
          `This builds one view, so ${viewName(other, headers.indexOf(other))} was skipped.`,
          { suggestion: "Read every view with compileViews." }
        );
      }
    }
  }

  const rows = options.rows;
  const inferred = Object.fromEntries(
    buildFieldProfiles(rows).map((profile) => [profile.name, profile.dataType])
  );
  const sourceFields = Object.keys(inferred);
  const sourceSet = new Set(sourceFields);

  // Field contracts: aliases, expected types, conversions, and display settings.
  const aliases = new Map<string, string>();
  const brokenAliases = new Map<string, DslDeclaration>();
  const fieldSettings: FieldSettingsMap = {};
  const settingsFor = (field: string) => (fieldSettings[field] ??= {});
  let metadataName = options.name ?? "Dashboard";
  const gridSettings = { ...DEFAULT_GRID };
  let theme: WorkspaceTheme | undefined;
  const calcDeclarations: DslDeclaration[] = [];
  const fieldDeclarations: DslDeclaration[] = [];
  const sharedDeclarations: DslDeclaration[] = [];
  const chartDeclarations: DslDeclaration[] = [];

  const applyFieldPairs = (
    field: string,
    pairs: DslPair[],
    subject: string,
    allowed: readonly string[] = FIELD_SETTING_KEYS
  ) => {
    for (const pair of pairs) {
      if (!allowed.includes(pair.key)) {
        report(
          "warning",
          "setting-ignored",
          pair.span,
          `${pair.key} is not a field setting, so it was ignored.`,
          {
            subject,
            suggestion: (() => {
              const near = closestName(pair.key, allowed);
              return near
                ? `Did you mean ${near}?`
                : `Use one of: ${allowed.join(", ")}.`;
            })(),
          }
        );
        continue;
      }
      const value = single(pair.value);
      const next: FieldSettings = { ...settingsFor(field) };
      if (pair.key === "precision") {
        next.precision = numberValue(pair.value);
      } else if (pair.key === "nullTokens[]") {
        next.nullTokens =
          pair.value.raw === ""
            ? []
            : pair.value.items.map((item) => item.text);
      } else if (pair.key === "datePreset") {
        if (!DATE_PRESETS.includes(value)) {
          report(
            "warning",
            "setting-default",
            pair.span,
            `${value} is not a date order, so ${subject} keeps the default.`,
            {
              subject,
              suggestion: `Use one of: ${DATE_PRESETS.join(", ")}.`,
            }
          );
          continue;
        }
        next.datePreset = value as FieldSettings["datePreset"];
      } else if (pair.key === "format") {
        next.format = value as FieldFormat;
        if (!FORMATS.includes(value as FieldFormat)) {
          report(
            "warning",
            "setting-default",
            pair.span,
            `${value} is not a display format, so ${subject} keeps the default format.`,
            {
              subject,
              suggestion: `Use one of: ${FORMATS.join(", ")}.`,
            }
          );
          continue;
        }
      } else {
        next[pair.key as "label"] = value;
      }
      const error = getFieldSettingsError(next);
      if (error) {
        report(
          "warning",
          "setting-default",
          pair.span,
          `${error} ${subject} keeps the default ${pair.key}.`,
          { subject }
        );
        continue;
      }
      fieldSettings[field] = next;
    }
  };

  for (const declaration of declarations) {
    const { keyword, span } = declaration;
    if (declaration.alias) {
      const { name, type, field } = declaration.alias;
      const subject = name;
      const native = single(field);
      if (DSL_CHART_KEYWORDS[name] || DSL_OTHER_KEYWORDS.includes(name)) {
        report(
          "error",
          "contract",
          span,
          `${name} is a keyword, so it can't name a field.`,
          {
            subject,
            suggestion: `Choose another alias, such as ${name}Field.`,
          }
        );
        continue;
      }
      if (!sourceSet.has(native)) {
        brokenAliases.set(name, declaration);
        const near = closestName(native, sourceFields);
        report(
          "error",
          "contract",
          span,
          `${native} is not a field in the source rows, so ${name} is unavailable.`,
          {
            subject,
            suggestion: near
              ? `Did you mean ${near}?`
              : `Fields: ${sourceFields.join(", ")}.`,
          }
        );
        continue;
      }
      if (aliases.has(name)) {
        report(
          "warning",
          "contract",
          span,
          `${name} is already an alias for ${aliases.get(name)}. This line replaces it.`,
          { subject }
        );
      }
      aliases.set(name, native);
      const asPair = declaration.pairs.find((pair) => pair.key === "as");
      const conversion = asPair && TYPE_NAMES[single(asPair.value)];
      if (asPair && !conversion) {
        report(
          "warning",
          "setting-ignored",
          asPair.span,
          `${single(asPair.value)} is not a field type, so ${native} keeps its type.`,
          {
            subject,
            suggestion: "Use num, cat, date, or bool.",
          }
        );
      } else if (conversion) {
        settingsFor(native).type = conversion;
      }
      if (type) {
        const expected = TYPE_NAMES[type];
        const actual = conversion ?? inferred[native];
        if (!expected) {
          report(
            "warning",
            "contract",
            span,
            `:${type} is not a field type, so the type of ${native} was not checked.`,
            {
              subject,
              suggestion: "Use :num, :cat, :date, or :bool.",
            }
          );
        } else if (actual !== expected) {
          report(
            "warning",
            "contract",
            span,
            `${native} reads as a ${TYPE_WORDS[actual!]}, not a ${TYPE_WORDS[expected]}.`,
            {
              subject,
              suggestion: `To convert it, add as=${type}. To accept it, write ${name}:${Object.keys(TYPE_NAMES).find((key) => TYPE_NAMES[key] === actual)}=${native}.`,
            }
          );
        }
      }
      applyFieldPairs(
        native,
        declaration.pairs.filter((pair) => pair.key !== "as"),
        name
      );
      continue;
    }
    switch (keyword) {
      case "eda":
        break;
      case "source": {
        const pair = declaration.pairs[0];
        const expected = pair ? single(pair.value) : undefined;
        if (expected && options.sourceName && expected !== options.sourceName) {
          report(
            "warning",
            "contract",
            pair!.span,
            `This document expects rows named ${expected}, but it is reading ${options.sourceName}.`,
            {
              suggestion: `Check that ${options.sourceName} holds the rows this dashboard describes.`,
            }
          );
        }
        break;
      }
      case "dashboard":
        for (const pair of declaration.pairs) {
          if (pair.key === "name") {
            metadataName = single(pair.value);
          } else {
            report(
              "warning",
              "setting-ignored",
              pair.span,
              `${pair.key} is not a dashboard setting, so it was ignored.`,
              {
                suggestion: "Use name=.",
              }
            );
          }
        }
        break;
      case "grid":
        for (const pair of declaration.pairs) {
          const number = numberValue(pair.value);
          const key = Object.hasOwn(GRID_WORDS, pair.key)
            ? GRID_WORDS[pair.key]
            : undefined;
          if (key && typeof DEFAULT_GRID[key] === "boolean") {
            const flag = booleanValue(pair.value);
            if (flag === undefined) {
              report(
                "warning",
                "setting-default",
                pair.span,
                `${pair.key} must be true or false, so the grid keeps its default.`
              );
            } else {
              (gridSettings as Record<string, unknown>)[key] = flag;
            }
          } else if (!key) {
            report(
              "warning",
              "setting-ignored",
              pair.span,
              `${pair.key} is not a grid setting, so it was ignored.`,
              {
                suggestion: `Use ${GRID_WORD_LIST}.`,
              }
            );
          } else if (
            number === undefined ||
            number < 0 ||
            (number === 0 && pair.key !== "padding")
          ) {
            report(
              "warning",
              "setting-default",
              pair.span,
              `${pair.key} needs a ${pair.key === "padding" ? "number of 0 or more" : "positive number"}, so the grid keeps its default.`
            );
          } else {
            (gridSettings as Record<string, unknown>)[key] = number;
          }
        }
        break;
      case "theme":
        for (const pair of declaration.pairs) {
          const id = single(pair.value);
          if (pair.key !== "name") {
            report(
              "warning",
              "setting-ignored",
              pair.span,
              `${pair.key} is not a theme setting, so it was ignored.`,
              { suggestion: "Use name=." }
            );
          } else if (!isWorkspaceThemeId(id)) {
            const near = closestName(
              id,
              WORKSPACE_THEMES.map((item) => item.id)
            );
            report(
              "warning",
              "setting-default",
              pair.span,
              `${id} is not a theme, so the dashboard keeps Compact.`,
              {
                suggestion: near
                  ? `Did you mean ${near}?`
                  : `Use ${WORKSPACE_THEMES.map((item) => item.id).join(", ")}.`,
              }
            );
          } else {
            theme = id === "compact" ? undefined : { id };
          }
        }
        break;
      case "calc":
        calcDeclarations.push(declaration);
        break;
      case "field":
        fieldDeclarations.push(declaration);
        break;
      case "scale":
      case "group":
      case "rows":
        sharedDeclarations.push(declaration);
        break;
      default:
        if (DSL_CHART_KEYWORDS[keyword] || keyword === "chart") {
          chartDeclarations.push(declaration);
        } else {
          const near = closestName(keyword, [
            ...Object.keys(DSL_CHART_KEYWORDS),
            ...DSL_OTHER_KEYWORDS,
          ]);
          report(
            "error",
            "setting-ignored",
            span,
            `${keyword} does not start a declaration, so this line was skipped.`,
            {
              suggestion: near
                ? `Did you mean ${near}?`
                : `Start a chart with ${Object.keys(DSL_CHART_KEYWORDS).join(", ")}, or name a field with alias=Field.`,
            }
          );
        }
    }
  }

  // Calculations: rewrite aliases into native names, then check every formula
  // with the native parser before any row is evaluated.
  const calcNames = new Set(calcDeclarations.map((item) => item.name!));
  const knownNames = () => [...aliases.keys(), ...sourceFields, ...calcNames];
  const parsedCalcs = new Map<
    string,
    { declaration: DslDeclaration; expression: string; dependencies: string[] }
  >();
  const skippedCalcs = new Set<string>();
  const subjectOf = (declaration: DslDeclaration) =>
    declaration.keyword === "calc"
      ? `calc ${declaration.name}`
      : `${declaration.keyword}${declaration.name ? ` @${declaration.name}` : ""} (line ${declaration.span.line})`;

  for (const declaration of calcDeclarations) {
    const name = declaration.name!;
    const subject = subjectOf(declaration);
    const { text: formula, span } = declaration.expression!;
    if (sourceSet.has(name) || aliases.has(name)) {
      skippedCalcs.add(name);
      report(
        "error",
        "calculation-skipped",
        declaration.span,
        `${name} already names a source field, so this calculation was skipped.`,
        {
          subject,
          suggestion: `Rename it, such as ${name}Calc.`,
        }
      );
      continue;
    }
    if (parsedCalcs.has(name)) {
      skippedCalcs.add(name);
      report(
        "error",
        "calculation-skipped",
        declaration.span,
        `${name} is calculated twice. Only the first one is used.`,
        { subject }
      );
      continue;
    }
    const rewritten = rewriteFormula(formula, (identifier) => {
      if (calcNames.has(identifier)) {
        return identifier;
      }
      const native =
        aliases.get(identifier) ??
        (sourceSet.has(identifier) ? identifier : undefined);
      return native === undefined ? undefined : fieldReference(native);
    });
    if (rewritten.unknown.length) {
      skippedCalcs.add(name);
      for (const unknown of rewritten.unknown) {
        const near = closestName(unknown, knownNames());
        report(
          "error",
          "calculation-skipped",
          span,
          brokenAliases.has(unknown)
            ? `${subject} uses ${unknown}, whose source field is missing, so it was skipped.`
            : `${subject} uses ${unknown}, which is not a field, alias, or calculation, so it was skipped.`,
          {
            subject,
            suggestion: near
              ? `Did you mean ${near}?`
              : "Name a source field, an alias, or another calculation.",
          }
        );
      }
      continue;
    }
    try {
      const expression = parseExpression(rewritten.text);
      parsedCalcs.set(name, {
        declaration,
        expression: rewritten.text,
        dependencies: expression.dependencies,
      });
    } catch (error) {
      skippedCalcs.add(name);
      report(
        "error",
        "calculation-skipped",
        span,
        `${subject} has a formula the calculation engine can't read, so it was skipped.`,
        {
          subject,
          suggestion: String(error instanceof Error ? error.message : error)
            .replace(/^Parse error: /, "")
            .split("\n")[0],
        }
      );
    }
  }

  // Cycles and calculations that depend on a skipped one.
  const state = new Map<string, "visiting" | "done">();
  const visit = (name: string, path: string[]): boolean => {
    if (skippedCalcs.has(name)) {
      return false;
    }
    const calc = parsedCalcs.get(name);
    if (!calc) {
      return true;
    }
    if (state.get(name) === "done") {
      return true;
    }
    if (state.get(name) === "visiting") {
      const cycle = [...path.slice(path.indexOf(name)), name];
      for (const member of new Set(cycle)) {
        if (skippedCalcs.has(member)) {
          continue;
        }
        skippedCalcs.add(member);
        const item = parsedCalcs.get(member)!;
        report(
          "error",
          "calculation-skipped",
          item.declaration.span,
          `calc ${member} is part of a loop (${cycle.join(" → ")}), so it was skipped.`,
          {
            subject: `calc ${member}`,
            suggestion:
              "Make one of these calculations use source fields instead.",
          }
        );
      }
      return false;
    }
    state.set(name, "visiting");
    let ok = true;
    for (const dependency of calc.dependencies) {
      if (calcNames.has(dependency) && !visit(dependency, [...path, name])) {
        ok = false;
        if (!skippedCalcs.has(name)) {
          skippedCalcs.add(name);
          report(
            "error",
            "calculation-skipped",
            calc.declaration.span,
            `calc ${name} uses calc ${dependency}, which was skipped, so it was skipped too.`,
            {
              subject: `calc ${name}`,
              suggestion: `Fix calc ${dependency} first.`,
            }
          );
        }
      }
    }
    state.set(name, "done");
    return ok && !skippedCalcs.has(name);
  };
  calcDeclarations.forEach((declaration) => visit(declaration.name!, []));

  const calculations: SavedCalculation[] = calcDeclarations
    .filter(
      (declaration) =>
        parsedCalcs.has(declaration.name!) &&
        !skippedCalcs.has(declaration.name!)
    )
    .map((declaration) => ({
      resultColumnName: declaration.name!,
      expression: parsedCalcs.get(declaration.name!)!.expression,
    }));
  for (const declaration of calcDeclarations) {
    if (!skippedCalcs.has(declaration.name!)) {
      applyFieldPairs(
        declaration.name!,
        declaration.pairs,
        `calc ${declaration.name}`
      );
    }
  }

  // `field Name key=value` sets display settings on a field or calculation
  // by its exact name, without an alias.
  for (const declaration of fieldDeclarations) {
    const target = declaration.positional[0];
    const name = target && single(target.value);
    const subject = `field ${name ?? ""}`.trim();
    if (!name) {
      report(
        "error",
        "setting-ignored",
        declaration.span,
        "A field line needs the field's name.",
        {
          suggestion: 'Write it as field "Order Date" label="Ordered".',
        }
      );
      continue;
    }
    const isCalc = calcNames.has(name) && !skippedCalcs.has(name);
    if (!sourceSet.has(name) && !isCalc) {
      const near = closestName(name, [...sourceFields, ...calcNames]);
      report(
        "error",
        "setting-ignored",
        target.span,
        `${name} is not a field or calculation, so its settings were ignored.`,
        {
          subject,
          suggestion: near ? `Did you mean ${near}?` : undefined,
        }
      );
      continue;
    }
    const asPair = declaration.pairs.find((pair) => pair.key === "as");
    if (asPair) {
      const conversion = TYPE_NAMES[single(asPair.value)];
      if (conversion && !isCalc) {
        settingsFor(name).type = conversion;
      } else {
        report(
          "warning",
          "setting-ignored",
          asPair.span,
          isCalc
            ? "A calculation's type comes from its formula, so as= was ignored."
            : `${single(asPair.value)} is not a field type, so ${name} keeps its type.`,
          {
            subject,
            suggestion: isCalc ? undefined : "Use num, cat, date, or bool.",
          }
        );
      }
    }
    applyFieldPairs(
      name,
      declaration.pairs.filter((pair) => pair.key !== "as"),
      subject
    );
  }

  // Evaluate with the native engine on the converted rows, like the app does.
  const runtimeRows = applyFieldSettings(rows, fieldSettings, inferred);
  const { dataWithIds } = initializeData(runtimeRows);
  const manager = new CalculationManager(dataWithIds);
  const columns = new Map<string, Record<number, datum>>();
  try {
    manager.setCalculations(
      calculations.map(({ resultColumnName, expression }) => ({
        resultColumnName,
        expression: parseExpression(expression),
      }))
    );
    for (const calc of calculations) {
      const values = manager.executeCalculation(
        manager
          .getCalculations()
          .find((item) => item.resultColumnName === calc.resultColumnName)!
      );
      columns.set(calc.resultColumnName, Object.fromEntries(values));
      const errors = manager.getErrors(calc.resultColumnName);
      if (errors.size) {
        const declaration = parsedCalcs.get(calc.resultColumnName)!.declaration;
        const examples = [...errors.entries()]
          .slice(0, 3)
          .map(([id, message]) => `row ${id + 1}: ${message}`)
          .join("; ");
        report(
          "warning",
          "rows-missing",
          declaration.expression!.span,
          `calc ${calc.resultColumnName} failed on ${errors.size.toLocaleString()} of ${rows.length.toLocaleString()} rows. Those rows show it as missing.`,
          {
            subject: `calc ${calc.resultColumnName}`,
            suggestion: `${examples}${errors.size > 3 ? "; …" : ""}`,
          }
        );
      }
    }
  } catch (error) {
    // The checks above mirror the engine's; this only guards a mismatch.
    report(
      "error",
      "calculation-skipped",
      { line: 1, column: 1, length: 0 },
      `The calculations could not run: ${error instanceof Error ? error.message : String(error)}`
    );
    calculations.length = 0;
  }

  const columnFor = (field: string): Record<number, datum> => {
    const cached = columns.get(field);
    if (cached) {
      return cached;
    }
    const column = Object.fromEntries(
      dataWithIds.map((row) => [row.__ID, row[field]])
    );
    columns.set(field, column);
    return column;
  };
  const fieldType = (field: string): DataType | undefined =>
    fieldSettings[field]?.type ??
    inferred[field] ??
    (field === ROW_ID_FIELD ? "numeric" : undefined) ??
    (calcNames.has(field)
      ? Object.values(columnFor(field)).some(
          (value) => typeof value === "number"
        )
        ? "numeric"
        : "categorical"
      : undefined);
  if (Object.keys(fieldSettings).length) {
    for (const [field, value] of Object.entries(fieldSettings)) {
      if (!Object.keys(value).length) {
        delete fieldSettings[field];
      }
    }
  }

  // Charts.
  const colorScales: SerializedColorScale[] = [];
  const generatedScales = new Set<string>();
  const charts: ChartSettings[] = [];
  const built: DslChartResult[] = [];
  const skipped: DslChartResult[] = [];
  const explicitLayouts = new Set<string>();
  const usedIds = new Set<string>();

  // Shared definitions: color scales, grouped summaries, and the Rows view.
  // Each starts from the app's own default and takes the same flat paths.
  const aggregates: AggregateSpec[] = [];
  const geometryAssets = options.geometryAssets ?? [];
  let rowsSettings: SavedRowsSettings | undefined;
  for (const declaration of sharedDeclarations) {
    const { keyword, name } = declaration;
    const subject = `${keyword}${name ? ` @${name}` : ""} (line ${declaration.span.line})`;
    const pairs = [...declaration.pairs];
    const take = (key: string) => {
      const index = pairs.findIndex((pair) => pair.key === key);
      return index < 0 ? undefined : pairs.splice(index, 1)[0];
    };
    if (keyword !== "rows" && !name) {
      report(
        "error",
        "setting-ignored",
        declaration.span,
        `A ${keyword} needs an @name so charts can refer to it, so this line was skipped.`,
        {
          subject,
          suggestion: `Write it as ${keyword} @${keyword === "scale" ? "channelColors field=Channel" : "byRegion groupField=Region aggregation=sum measureField=Revenue"}.`,
        }
      );
      continue;
    }
    if (keyword === "scale") {
      const fieldPair = take("field");
      const field =
        fieldPair &&
        resolveField(
          single(fieldPair.value),
          fieldPair.span,
          subject,
          `${subject} starts empty`
        );
      let scale: unknown = field
        ? { ...defaultScale(field), id: name, name: field }
        : { id: name, name, type: "categorical", palette: [], mapping: [] };
      scale = applyRecordPaths(scale, pairs, subject);
      if (
        !validateSavedData({
          ...EMPTY_SETTINGS,
          colorScales: [scale as SerializedColorScale],
        })
      ) {
        report(
          "error",
          "setting-ignored",
          declaration.span,
          `${subject} is not a complete color scale, so it was skipped.`,
          {
            subject,
            suggestion:
              "Start it from a field with field=, or set type=, palette[]=, and mapping or min= and max=.",
          }
        );
        continue;
      }
      colorScales.push(scale as SerializedColorScale);
    } else if (keyword === "group") {
      const spec = applyRecordPaths(
        { id: name, name, groupField: "", aggregation: "count" },
        pairs,
        subject
      ) as AggregateSpec;
      const valid =
        spec.groupField &&
        ["count", "sum", "average"].includes(spec.aggregation) &&
        (spec.aggregation === "count" || spec.measureField);
      if (!valid) {
        report(
          "error",
          "setting-ignored",
          declaration.span,
          `${subject} needs groupField=, and measureField= unless it counts, so it was skipped.`,
          {
            subject,
            suggestion:
              "Write it as group @byRegion groupField=Region aggregation=sum measureField=Revenue.",
          }
        );
        continue;
      }
      aggregates.push(spec);
    } else {
      const filters: Filter[] = [];
      for (const pair of [...pairs]) {
        if (!pair.key.startsWith("where.")) {
          continue;
        }
        pairs.splice(pairs.indexOf(pair), 1);
        const filter = buildFilter(
          pair.key.slice(6),
          pair.value,
          pair.span,
          subject
        );
        if (filter) {
          filters.push(filter);
        }
      }
      const fields = [
        ...sourceFields,
        ...calculations.map((calc) => calc.resultColumnName),
      ];
      const next = applyRecordPaths(
        {
          columns: fields.map((field) => ({ id: field, field })),
          sortDirection: "asc",
          filters,
          globalSearch: "",
        },
        pairs,
        subject
      ) as SavedRowsSettings;
      if (!validateSavedData({ ...EMPTY_SETTINGS, rowsSettings: next })) {
        report(
          "error",
          "setting-ignored",
          declaration.span,
          `${subject} has a setting the Rows view can't use, so the Rows view keeps its defaults.`,
          { subject }
        );
        continue;
      }
      rowsSettings = next;
    }
  }

  for (const declaration of chartDeclarations) {
    const subject = subjectOf(declaration);
    const type =
      declaration.keyword === "chart"
        ? declaration.positional[0]
          ? single(declaration.positional.shift()!.value)
          : ""
        : DSL_CHART_KEYWORDS[declaration.keyword]!;
    const summary = { line: declaration.span.line, subject, type };
    const chart = buildChart(declaration, type, subject);
    if (chart) {
      charts.push(chart);
      built.push({ ...summary, id: chart.id });
    } else {
      skipped.push(summary);
    }
  }

  /**
   * Finds the native field for a name. When it is missing, reports what the
   * chart lost: by default the whole chart, or `lost` for one setting.
   */
  function resolveField(
    name: string,
    span: DslSpan,
    subject: string,
    lost?: string
  ): string | undefined {
    const native =
      aliases.get(name) ??
      (sourceSet.has(name) ||
      name === ROW_ID_FIELD ||
      (calcNames.has(name) && !skippedCalcs.has(name))
        ? name
        : undefined);
    if (native !== undefined) {
      return native;
    }
    const severity = lost ? "warning" : "error";
    const effect = lost ? "setting-ignored" : "chart-skipped";
    const consequence = lost ?? `${subject} was skipped`;
    if (skippedCalcs.has(name)) {
      report(
        severity,
        effect,
        span,
        `calc ${name} was skipped, so ${consequence}.`,
        {
          subject,
          suggestion: `Fix calc ${name} first.`,
        }
      );
    } else if (brokenAliases.has(name)) {
      report(
        severity,
        effect,
        span,
        `The source field for ${name} is missing, so ${consequence}.`,
        {
          subject,
          suggestion: `Fix the ${name} alias on line ${brokenAliases.get(name)!.span.line}.`,
        }
      );
    } else {
      const near = closestName(name, knownNames());
      report(
        severity,
        effect,
        span,
        `${name} is not a field, alias, or calculation, so ${consequence}.`,
        {
          subject,
          suggestion: near
            ? `Did you mean ${near}?`
            : `Fields: ${knownNames().join(", ")}.`,
        }
      );
    }
    return undefined;
  }

  /** Checks one chart with the shared definitions it may refer to. */
  function chartFits(chart: ChartSettings) {
    return validateSavedData({
      ...EMPTY_SETTINGS,
      colorScales,
      aggregates,
      geometryAssets,
      charts: [chart as SavedDataStructure["charts"][number]],
    });
  }

  /** Swaps alias names for native field names in a field-valued path. */
  function resolveValueFields(
    key: string,
    pair: DslPair,
    subject: string
  ): DslValue | undefined {
    const path = parsePath(key);
    if (!path || !FIELD_SEGMENT.test(path.segments.at(-1)!)) {
      return pair.value;
    }
    const items = [];
    for (const item of pair.value.items) {
      if (
        item.text === "" ||
        (!item.quoted && (item.text === "null" || item.text === "unset"))
      ) {
        items.push(item);
        continue;
      }
      const native = resolveField(
        item.text,
        pair.span,
        subject,
        `${key} keeps its default`
      );
      if (!native) {
        return undefined;
      }
      items.push({ text: native, quoted: true });
    }
    return { raw: pair.value.raw, items };
  }

  /** Applies flat paths to a shared definition, reporting ones it can't read. */
  function applyRecordPaths(
    record: unknown,
    pairs: DslPair[],
    subject: string
  ) {
    let next = record;
    for (const pair of pairs) {
      const path = parsePath(pair.key);
      if (!path || path.segments[0] === "id") {
        report(
          "warning",
          "setting-ignored",
          pair.span,
          `${pair.key} is not a setting path for ${subject}, so it was ignored.`,
          { subject }
        );
        continue;
      }
      const value = resolveValueFields(pair.key, pair, subject);
      if (value) {
        next = setPath(next, path, value);
      }
    }
    return next;
  }

  function defaultScale(field: string): SerializedColorScale {
    const values = Object.values(columnFor(field));
    const numerical =
      fieldType(field) === "numeric" &&
      values.some(
        (value) => typeof value === "number" && Number.isFinite(value)
      );
    const scale = defaultColorScaleForField(
      field,
      numerical ? values.filter((value) => value != null) : values,
      numerical
    );
    return scale.type === "categorical"
      ? ({
          ...scale,
          id: "",
          mapping: Array.from(scale.mapping.entries()),
        } as SerializedColorScale)
      : ({ ...scale, id: "" } as SerializedColorScale);
  }

  function colorScaleFor(field: string): string {
    const existing = colorScales.find((scale) => scale.sourceField === field);
    if (existing) {
      return existing.id;
    }
    const id = `color-${field.replace(/[^\w-]+/g, "-").toLowerCase()}`;
    colorScales.push({ ...defaultScale(field), id });
    generatedScales.add(id);
    return id;
  }

  /** A filter for one `where.field…=` or `select.field…=` pair. */
  function buildFilter(
    path: string,
    value: DslValue,
    span: DslSpan,
    subject: string
  ): Filter | undefined {
    const operators = ["contains", "equals", "startsWith", "endsWith"] as const;
    // Quote a field name with dots or spaces: where."Order Date"=2024-01-01..
    const segments = parsePath(path)?.segments ?? [path];
    const operator =
      segments.length === 2
        ? operators.find((item) => segments[1] === item)
        : undefined;
    const name = operator || segments.length === 1 ? segments[0]! : path;
    const field = resolveField(name, span, subject);
    if (!field) {
      return undefined;
    }
    if (operator) {
      return { type: "text", field, operator, value: single(value) };
    }
    const item = value.items[0]!;
    const range =
      value.items.length === 1 && !item.quoted && item.text.includes("..")
        ? item.text.split("..")
        : undefined;
    if (range && range.length === 2) {
      const [low, high] = range.map((part) => part.trim());
      if (fieldType(field) === "datetime") {
        return {
          type: "date-range",
          field,
          ...(low ? { min: low } : {}),
          ...(high ? { max: high } : {}),
        };
      }
      const min = low ? Number(low) : undefined;
      const max = high ? Number(high) : undefined;
      if (
        (low && !Number.isFinite(min)) ||
        (high && !Number.isFinite(max)) ||
        (!low && !high)
      ) {
        report(
          "error",
          "chart-skipped",
          span,
          `${single(value)} is not a number range, so ${subject} was skipped rather than drawn with more rows.`,
          {
            subject,
            suggestion: "Write a range as 0..10, 5.., or ..100.",
          }
        );
        return undefined;
      }
      return {
        type: "range",
        field,
        ...(min !== undefined ? { min } : {}),
        ...(max !== undefined ? { max } : {}),
      };
    }
    // Match each value to the value the rows hold, so 3 finds the number 3.
    const present = new Map<string, datum>();
    for (const raw of Object.values(columnFor(field))) {
      if (raw != null && !present.has(String(raw))) {
        present.set(String(raw), raw);
      }
    }
    const values: datum[] = [];
    for (const { text, quoted } of value.items) {
      if (!quoted && text === "null") {
        values.push(null);
        continue;
      }
      if (present.has(text)) {
        values.push(present.get(text)!);
        continue;
      }
      const near = closestName(text, present.keys());
      report(
        "warning",
        "no-rows",
        span,
        `${categoryLabel(text)} never occurs in ${name}, so it matches no rows in ${subject}.`,
        {
          subject,
          suggestion: near
            ? `Did you mean ${near}?`
            : "Check the spelling, or write null for missing values.",
        }
      );
      values.push(text);
    }
    return { type: "value", field, values };
  }

  function buildChart(
    declaration: DslDeclaration,
    type: string,
    subject: string
  ): ChartSettings | undefined {
    if (!type) {
      report(
        "error",
        "chart-skipped",
        declaration.span,
        "chart needs a chart type, so this line was skipped.",
        {
          subject,
          suggestion: `Write it as chart boxplot field=Revenue. Types: ${[...chartRegistry.getAll()].map((item) => item.type).join(", ")}.`,
        }
      );
      return undefined;
    }
    if (!chartRegistry.has(type as ChartType)) {
      report(
        "error",
        "chart-skipped",
        declaration.span,
        `${declaration.keyword} charts are not available in this app, so ${subject} was skipped.`,
        { subject }
      );
      return undefined;
    }
    const definition = getChartDefinition(type as ChartType);
    const fail = (span: DslSpan, message: string, suggestion?: string) => {
      report("error", "chart-skipped", span, message, { subject, suggestion });
      return undefined;
    };

    const positional = declaration.positional;
    const pairs = new Map<string, DslPair>();
    for (const pair of declaration.pairs) {
      if (pairs.has(pair.key)) {
        report(
          "warning",
          "setting-ignored",
          pair.span,
          `${pair.key} is set twice in ${subject}. The last value is used.`,
          { subject }
        );
      }
      pairs.set(pair.key, pair);
    }
    const take = (key: string) => {
      const pair = pairs.get(key);
      pairs.delete(key);
      return pair;
    };
    const fieldFrom = (pair: DslPair | undefined) =>
      pair && resolveField(single(pair.value), pair.span, subject);

    let field = "";
    let chart: ChartSettings;
    const layout = { x: 0, y: 0, ...(DEFAULT_SIZES[type] ?? { w: 6, h: 4 }) };

    switch (declaration.keyword) {
      case "scatter": {
        const xPair = take("x");
        const yPair = take("y");
        if (!xPair || !yPair) {
          return fail(
            declaration.span,
            `${subject} needs x= and y= fields, so it was skipped.`,
            "Write it as scatter x=revenue y=margin."
          );
        }
        const x = fieldFrom(xPair);
        const y = fieldFrom(yPair);
        if (!x || !y) {
          return undefined;
        }
        chart = {
          ...definition.createDefaultSettings(layout, y),
          xField: x,
          yField: y,
        } as ChartSettings;
        break;
      }
      case "metric": {
        const aggregations = {
          sum: "sum",
          avg: "average",
          mean: "average",
          average: "average",
        } as const;
        const measurePair = [...pairs.values()].find(
          (pair) => pair.key in aggregations
        );
        const count = positional.some((item) => single(item.value) === "count");
        if (count) {
          positional.splice(
            positional.findIndex((item) => single(item.value) === "count"),
            1
          );
        }
        chart = definition.createDefaultSettings(layout) as ChartSettings;
        if (measurePair) {
          take(measurePair.key);
          const measure = fieldFrom(measurePair);
          if (!measure) {
            return undefined;
          }
          chart = {
            ...chart,
            aggregation:
              aggregations[measurePair.key as keyof typeof aggregations],
            measureField: measure,
          } as ChartSettings;
        } else if (!count) {
          return fail(
            declaration.span,
            `${subject} needs count, sum=, or avg=, so it was skipped.`,
            "Write it as metric sum=revenue or metric count."
          );
        }
        break;
      }
      case "table": {
        const list = positional.shift();
        const names = list
          ? list.value.items.map((item) => item.text)
          : [
              ...sourceFields,
              ...calculations.map((calc) => calc.resultColumnName),
            ];
        const fields = names.map((name) =>
          list ? resolveField(name, list.span, subject) : name
        );
        if (fields.some((item) => !item)) {
          return undefined;
        }
        chart = {
          ...definition.createDefaultSettings(layout),
          columns: (fields as string[]).map((item) => ({
            id: item,
            field: item,
          })),
        } as ChartSettings;
        break;
      }
      case "summary":
        chart = definition.createDefaultSettings(layout) as ChartSettings;
        break;
      case "chart": {
        // Any registered type: defaults first, then settings by path.
        const named = take("field");
        const resolved = named && fieldFrom(named);
        if (named && !resolved) {
          return undefined;
        }
        field = resolved ?? "";
        chart = definition.createDefaultSettings(
          { ...layout, ...(DEFAULT_SIZES[type] ?? {}) },
          resolved || undefined
        ) as ChartSettings;
        if (resolved && chart.field !== resolved) {
          chart = { ...chart, field: resolved };
        }
        break;
      }
      default: {
        // hist, bar, row: one field, positionally or as field=.
        const named = take("field");
        const first =
          named ??
          (positional[0] && {
            key: "field",
            value: positional[0].value,
            span: positional[0].span,
          });
        if (!named && positional.length) {
          positional.shift();
        }
        if (!first) {
          return fail(
            declaration.span,
            `${subject} needs a field, so it was skipped.`,
            `Write it as ${declaration.keyword} Revenue.`
          );
        }
        const resolved = fieldFrom(first);
        if (!resolved) {
          return undefined;
        }
        field = resolved;
        chart = definition.createDefaultSettings(
          layout,
          field
        ) as ChartSettings;
        if (declaration.keyword === "bar" && chart.type === "bar") {
          chart = { ...chart, forceString: fieldType(field) !== "numeric" };
        }
        break;
      }
    }

    for (const extra of positional) {
      report(
        "warning",
        "setting-ignored",
        extra.span,
        `${single(extra.value)} has no setting name in ${subject}, so it was ignored.`,
        {
          subject,
          suggestion: "Write settings as key=value.",
        }
      );
    }

    if (declaration.name) {
      if (usedIds.has(declaration.name)) {
        return fail(
          declaration.span,
          `@${declaration.name} names two charts, so this one was skipped.`,
          "Give each chart its own name."
        );
      }
      chart.id = declaration.name;
    }

    // Filters first: a broken one skips the chart instead of widening it.
    const pathGroups = new Map<
      string,
      { before: ChartSettings; pairs: DslPair[] }
    >();
    const localFilters: Filter[] = [];
    const linked: Filter[] = [];
    for (const [key, pair] of [...pairs]) {
      const target = key.startsWith("where.")
        ? localFilters
        : key.startsWith("select.")
          ? linked
          : undefined;
      if (!target) {
        continue;
      }
      pairs.delete(key);
      const filter = buildFilter(
        key.slice(key.indexOf(".") + 1),
        pair.value,
        pair.span,
        subject
      );
      if (!filter) {
        return undefined;
      }
      target.push(filter);
    }
    if (localFilters.length) {
      chart.localFilters = localFilters;
    }
    if (linked.length) {
      chart.filters = linked;
    }

    for (const [key, pair] of pairs) {
      let result = applySetting(chart, key, pair, subject);
      if (result === "unknown") {
        const before = chart;
        const next = applyPath(chart, key, pair, subject);
        if (typeof next === "object") {
          // Check a setting once all of its paths are in, so a record
          // can be filled field by field.
          const top = parsePath(key)!.segments[0]!;
          const group = pathGroups.get(top) ?? { before, pairs: [] };
          group.pairs.push(pair);
          pathGroups.set(top, group);
          chart = next;
          continue;
        }
        result = next;
      }
      if (result === "unknown") {
        const near = closestName(key, settingNames(chart));
        report(
          "warning",
          "setting-ignored",
          pair.span,
          `${key} is not a ${declaration.keyword} setting, so it was ignored.`,
          {
            subject,
            suggestion: near ? `Did you mean ${near}?` : undefined,
          }
        );
      } else if (result !== "ok" && result !== "ok-reported") {
        report("warning", "setting-default", pair.span, result, { subject });
      }
    }

    for (const [top, group] of pathGroups) {
      if (chartFits(chart)) {
        break;
      }
      const candidate = {
        ...chart,
        [top]: (group.before as unknown as Record<string, unknown>)[top],
      } as ChartSettings;
      const alone = {
        ...group.before,
        [top]: (chart as unknown as Record<string, unknown>)[top],
      } as ChartSettings;
      if (!chartFits(alone)) {
        chart = candidate;
        const first = group.pairs[0]!;
        report(
          "warning",
          "setting-default",
          first.span,
          `${group.pairs.map((pair) => `${pair.key}=${pair.value.raw}`).join(" ")} doesn't fit ${top}, so ${subject} keeps the default ${top}.`,
          { subject }
        );
      }
    }

    if (
      !internal.keepIncomplete &&
      !definition.validateSettings(chart as never)
    ) {
      return fail(
        declaration.span,
        `${subject} is missing a required setting, so it was skipped.`
      );
    }
    usedIds.add(chart.id);
    return chart;
  }

  /**
   * Sets any saved setting by its path, such as xAxis.scaleType or
   * columns.0.width. Returns the changed chart, "unknown" for a name the
   * chart lacks, or a message when the value doesn't fit.
   */
  function applyPath(
    chart: ChartSettings,
    key: string,
    pair: DslPair,
    subject: string
  ): ChartSettings | "unknown" | string {
    const path = parsePath(key);
    if (!path) {
      return `${key} is not a setting path, so it was ignored. Separate names with dots and quote names with spaces.`;
    }
    const top = path.segments[0]!;
    if (
      !CHART_SETTING_KEYS[
        chart.type as keyof typeof CHART_SETTING_KEYS
      ]?.includes(top)
    ) {
      return "unknown";
    }
    const references = {
      colorScaleId: [
        "color scale",
        colorScales.map((item) => item.id),
        "scale",
      ],
      aggregateId: [
        "grouped summary",
        aggregates.map((item) => item.id),
        "group",
      ],
      geometryAssetId: ["map shape", geometryAssets.map((item) => item.id), ""],
    } as const;
    if (top in references && path.segments.length === 1) {
      const [noun, ids, keyword] = references[top as keyof typeof references];
      const id = single(pair.value).replace(/^@/, "");
      if (id !== "unset" && !(ids as readonly string[]).includes(id)) {
        const near = closestName(id, ids);
        report(
          "warning",
          "setting-ignored",
          pair.span,
          `${id} is not a ${noun} in this ${keyword ? "text" : "workspace"}, so ${subject} keeps the default.`,
          {
            subject,
            suggestion: near
              ? `Did you mean ${near}?`
              : keyword
                ? `Declare it with ${keyword} @${id}.`
                : "Map shapes come with the data; check the ID.",
          }
        );
        return "ok-reported";
      }
      return setPath(
        chart,
        path,
        id === "unset"
          ? pair.value
          : { raw: id, items: [{ text: id, quoted: true }] }
      );
    }
    const value = resolveValueFields(key, pair, subject);
    if (!value) {
      return "ok-reported";
    }
    return setPath(chart, path, value);
  }

  function settingNames(chart: ChartSettings) {
    return [
      ...(CHART_SETTING_KEYS[chart.type as keyof typeof CHART_SETTING_KEYS] ??
        []),
      "title",
      "at",
      "color",
      "x.title",
      "x.scale",
      "x.min",
      "x.max",
      "y.title",
      "y.scale",
      "y.min",
      "y.max",
      "xGridLines",
      "yGridLines",
      "margin.top",
      "margin.right",
      "margin.bottom",
      "margin.left",
      "where.<field>",
      "select.<field>",
      ...(chart.type === "bar" ? ["bins"] : []),
      ...(chart.type === "scatter" ? ["size", "opacity", "regression"] : []),
    ];
  }

  /**
   * Applies one setting. Returns "unknown" for a name the chart lacks, or a
   * message when the value is invalid and the app default stays.
   */
  function applySetting(
    chart: ChartSettings,
    key: string,
    pair: DslPair,
    subject: string
  ): "ok" | "unknown" | string {
    const value = pair.value;
    const text = single(value);
    const target = chart as unknown as Record<string, unknown>;
    const number = numberValue(value);
    const needNumber = () =>
      `${key} needs a number, so ${subject} keeps the default.`;
    switch (key) {
      case "title":
        chart.title = text;
        return "ok";
      case "at": {
        const parts = value.items.map((item) => Number(item.text));
        if (
          parts.length !== 4 ||
          parts.some((part) => !Number.isInteger(part) || part < 0) ||
          parts[2] === 0 ||
          parts[3] === 0
        ) {
          return `at needs four whole numbers, x,y,w,h, so ${subject} was placed automatically.`;
        }
        const [x, y, w, h] = parts as [number, number, number, number];
        chart.layout = { x, y, w: Math.min(w, gridSettings.columnCount), h };
        explicitLayouts.add(chart.id);
        return "ok";
      }
      case "color": {
        const field = resolveField(
          text,
          pair.span,
          subject,
          `${subject} is not colored`
        );
        if (!field) {
          return "ok";
        }
        chart.colorField = field;
        chart.colorScaleId = colorScaleFor(field);
        return "ok";
      }
      case "bins":
        if (chart.type !== "bar") {
          return "unknown";
        }
        if (number === undefined || !Number.isInteger(number) || number < 1) {
          return needNumber();
        }
        chart.binCount = number;
        return "ok";
      case "size":
        if (chart.type !== "scatter") {
          return "unknown";
        }
        if (number !== undefined) {
          chart.pointSize = number;
          return "ok";
        }
        {
          const field = resolveField(
            text,
            pair.span,
            subject,
            `${subject} keeps one point size`
          );
          if (!field) {
            return "ok";
          }
          chart.sizeField = field;
        }
        return "ok";
      case "opacity":
        if (chart.type !== "scatter") {
          return "unknown";
        }
        if (number === undefined || number < 0 || number > 1) {
          return `opacity needs a number from 0 to 1, so ${subject} keeps the default.`;
        }
        chart.pointOpacity = number;
        return "ok";
      case "xGridLines":
      case "yGridLines":
        if (number === undefined || number < 0) {
          return needNumber();
        }
        target[key] = number;
        return "ok";
    }
    const axis = /^(x|y)\.(title|scale|min|max)$/.exec(key);
    if (axis) {
      const name = axis[1] === "x" ? "xAxis" : "yAxis";
      const next = { ...chart[name] };
      if (axis[2] === "title") {
        next.title = text;
        chart[name === "xAxis" ? "xAxisLabel" : "yAxisLabel"] = text;
      } else if (axis[2] === "scale") {
        const scales = ["linear", "log", "symlog", "time", "band"] as const;
        if (!scales.includes(text as never)) {
          return `${text} is not an axis scale, so ${subject} keeps the default. Use ${scales.join(", ")}.`;
        }
        next.scaleType = text as (typeof scales)[number];
      } else {
        if (number === undefined) {
          return needNumber();
        }
        next[axis[2] as "min"] = number;
      }
      chart[name] = next;
      return "ok";
    }
    const margin = /^margin\.(top|right|bottom|left)$/.exec(key);
    if (margin) {
      if (number === undefined || number < 0) {
        return needNumber();
      }
      chart.margin = { ...chart.margin, [margin[1]!]: number };
      return "ok";
    }
    if (
      chart.type === "scatter" &&
      (key === "regression" || key.startsWith("regression."))
    ) {
      const methods = ["linear", "polynomial", "loess"] as const;
      if (key === "regression") {
        if (booleanValue(value) === false) {
          delete chart.regression;
          return "ok";
        }
        if (!methods.includes(text as never)) {
          return `${text} is not a fit method, so ${subject} draws no fit. Use ${methods.join(", ")}.`;
        }
        chart.regression = {
          ...chart.regression,
          method: text as (typeof methods)[number],
        };
        return "ok";
      }
      const option = key.slice("regression.".length);
      const regression = { method: "linear" as const, ...chart.regression };
      if (option === "overall") {
        const flag = booleanValue(value);
        if (flag === undefined) {
          return `regression.overall must be true or false, so ${subject} keeps the default.`;
        }
        chart.regression = { ...regression, overall: flag };
        return "ok";
      }
      if (option === "degree" || option === "span") {
        if (number === undefined) {
          return needNumber();
        }
        chart.regression = { ...regression, [option]: number };
        return "ok";
      }
      return "unknown";
    }
    return "unknown";
  }

  placeCharts(charts, explicitLayouts, gridSettings.columnCount);
  if (header) {
    metadataName = viewName(header, viewIndex);
  }

  const now = (options.now ?? (() => new Date()))().toISOString();
  const settings: SavedDataStructure = {
    charts: charts as SavedDataStructure["charts"],
    calculations,
    gridSettings,
    metadata: {
      name: metadataName,
      version: 1,
      createdAt: now,
      modifiedAt: now,
    },
    // Default scales that a later colorScaleId= replaced are dropped.
    colorScales: colorScales.filter(
      (scale) =>
        !generatedScales.has(scale.id) ||
        charts.some((chart) => chart.colorScaleId === scale.id)
    ),
    fieldSettings,
    aggregates,
    geometryAssets,
    ...(rowsSettings ? { rowsSettings } : {}),
    ...(theme ? { theme } : {}),
  };
  if (!validateSavedData(settings)) {
    // Every value above is checked; this guards a gap between the two.
    diagnostics.push({
      severity: "error",
      effect: "chart-skipped",
      message:
        "The built dashboard did not pass the app's own checks. Nothing was applied.",
      line: 1,
      column: 1,
      length: 0,
    });
    (settings as SavedDataStructure).charts = [];
  }

  diagnostics.sort((a, b) => a.line - b.line || a.column - b.column);
  return {
    settings,
    diagnostics,
    charts: built,
    skippedCharts: skipped,
    complete: diagnostics.length === 0,
  };
}

/**
 * Replaces field names in a formula, leaving strings, `["field"]`
 * references, function names, and keywords alone.
 */
export function rewriteFormula(
  formula: string,
  replace: (identifier: string) => string | undefined
): { text: string; unknown: string[] } {
  const unknown: string[] = [];
  let text = "";
  let index = 0;
  const keywords = new Set(["if", "then", "else", "true", "false", "null"]);
  while (index < formula.length) {
    const char = formula[index]!;
    if (char === '"') {
      let end = index + 1;
      while (end < formula.length && formula[end] !== '"') {
        if (formula[end] === "\\") {
          end++;
        }
        end++;
      }
      text += formula.slice(index, end + 1);
      index = end + 1;
      continue;
    }
    if (char === "[") {
      const end = formula.indexOf("]", index);
      const stop = end < 0 ? formula.length : end + 1;
      text += formula.slice(index, stop);
      index = stop;
      continue;
    }
    if (/[A-Za-z_]/.test(char) && !/[\w.]/.test(formula[index - 1] ?? " ")) {
      let end = index;
      while (end < formula.length && /\w/.test(formula[end]!)) {
        end++;
      }
      const identifier = formula.slice(index, end);
      const isCall = /^\s*\(/.test(formula.slice(end));
      if (isCall || keywords.has(identifier)) {
        text += identifier;
      } else {
        const next = replace(identifier);
        if (next === undefined) {
          if (!unknown.includes(identifier)) {
            unknown.push(identifier);
          }
          text += identifier;
        } else {
          text += next;
        }
      }
      index = end;
      continue;
    }
    text += char;
    index++;
  }
  return { text, unknown };
}

function overlaps(a: ChartLayout, b: ChartLayout) {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  );
}

/**
 * Keeps explicit `at=` layouts and fills the rest in document order: each
 * chart takes the first free spot, scanning rows from the top.
 */
function placeCharts(
  charts: ChartSettings[],
  explicit: Set<string>,
  columns: number
) {
  const placed: ChartLayout[] = charts
    .filter((chart) => explicit.has(chart.id))
    .map((chart) => chart.layout);
  for (const chart of charts) {
    if (explicit.has(chart.id)) {
      continue;
    }
    const w = Math.min(chart.layout.w, columns);
    const { h } = chart.layout;
    for (let y = 0; ; y++) {
      const x = Array.from(
        { length: columns - w + 1 },
        (_, index) => index
      ).find(
        (left) => !placed.some((other) => overlaps(other, { x: left, y, w, h }))
      );
      if (x !== undefined) {
        chart.layout = { x, y, w, h };
        placed.push(chart.layout);
        break;
      }
    }
  }
}
