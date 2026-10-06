import { categoryLabel } from "@/lib/categories";
import { buildFieldProfiles } from "@/lib/fieldProfiles";
import type { datum } from "@/types/ChartTypes";
import type { DslCompileResult } from "./compile";

const TYPE_SHORT = {
  numeric: "num",
  categorical: "cat",
  datetime: "date",
  boolean: "bool",
} as const;

/** One source field as an author needs to see it before writing text. */
export interface DslFieldSummary {
  name: string;
  type: "num" | "cat" | "date" | "bool";
  missing: number;
  /** Distinct values, or the number range for a number field. */
  sample: string;
}

/** Lists the fields an author can bind, with types and example values. */
export function describeDslSource(
  rows: Array<Record<string, datum>>
): DslFieldSummary[] {
  return buildFieldProfiles(rows).map((profile) => {
    const values = rows.map((row) => row[profile.name]);
    const present = values.filter((value) => value != null && value !== "");
    let sample: string;
    if (profile.dataType === "numeric") {
      const numbers = present.map(Number).filter(Number.isFinite);
      sample = numbers.length
        ? `${Math.min(...numbers)} to ${Math.max(...numbers)}`
        : "no numbers";
    } else {
      const distinct = [
        ...new Set(present.map((value) => categoryLabel(value))),
      ];
      sample = `${distinct.length} distinct: ${distinct.slice(0, 6).join(", ")}${distinct.length > 6 ? ", …" : ""}`;
    }
    return {
      name: profile.name,
      type: TYPE_SHORT[profile.dataType],
      missing: values.length - present.length,
      sample,
    };
  });
}

/**
 * Prints diagnostics the way compilers do, `file:line:column: severity:`,
 * with the suggestion and the effect on the dashboard below each one.
 */
export function formatDslDiagnostics(
  result: DslCompileResult,
  fileName = "dashboard"
): string {
  const lines = result.diagnostics.map((item) =>
    [
      `${fileName}:${item.line}:${item.column}: ${item.severity}: ${item.message}`,
      ...(item.suggestion ? [`  fix: ${item.suggestion}`] : []),
    ].join("\n")
  );
  const built = result.charts.length;
  const skipped = result.skippedCharts.length;
  lines.push(
    result.complete
      ? `ok: ${built} chart${built === 1 ? "" : "s"}, every declaration applied`
      : built === 0
        ? `failed: no chart can be built; fix the errors above`
        : `partial: ${built} chart${built === 1 ? "" : "s"} built, ${skipped} skipped, ${result.diagnostics.length} problem${result.diagnostics.length === 1 ? "" : "s"}`
  );
  return lines.join("\n");
}

/** A short grammar reference for people and agents writing dashboard text. */
export const DSL_REFERENCE = `Dashboard text: one declaration per line. A line starting with + continues
the one above. Values are key=value; quote values with spaces or commas.

  dashboard name="Sales"              view name
  grid columns=12 rowHeight=100       grid settings (also padding=, markers=)
  revenue:num=Revenue label="Rev ($)" alias a field; :num|:cat|:date|:bool checks
                                      its type, as=num converts it; label=,
                                      format=, precision=, unit=, currency=
  calc profit=revenue-cost            row calculation (native formula syntax)
  + format=percent precision=1        display settings for the calculation

Charts (each starts from the app's defaults; @name is optional):
  scatter x=<field> y=<field>         color=, size=<field|number>, opacity=,
                                      regression=linear|polynomial|loess,
                                      regression.degree=, regression.overall=
  hist <field> bins=24                histogram
  bar <field>                         bars by category or bins
  row <field>                         horizontal category bars
  metric count | sum=<field> | avg=<field>
  table <field>,<field>,...           data table (all fields when omitted)
  summary                             field summary table

Settings on any chart: title=, at=x,y,w,h, x.scale=, x.title=, x.min=, x.max=,
y.*, xGridLines=, yGridLines=, margin.left= (top, right, bottom).

Filters:
  where.<field>=Web,Store             only these rows, for this chart only
  where.<field>=0..   ..100   5..10   number or date range
  where.<field>=null                  missing values; "a,b" is one value
  where.<field>.contains=text         also equals, startsWith, endsWith
  select.<field>=...                  a linked filter that also narrows other charts

The text describes the whole dashboard: omitted charts are removed and
omitted settings use the app's defaults.`;
