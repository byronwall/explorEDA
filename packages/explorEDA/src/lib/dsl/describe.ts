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
  result: Pick<
    DslCompileResult,
    "diagnostics" | "charts" | "skippedCharts" | "complete"
  >,
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
export const DSL_REFERENCE = `Dashboard text: one declaration per line. A line ending in { opens a body
that } closes; in a body, a key=value line adds settings to the declaration,
and a line starting with a word is a child. Spaces never change meaning;
exploreda-dsl fmt indents by brace depth. Quote values with spaces or commas.

  dashboard "Sales"                   view name
  grid columns=12 rowHeight=100       grid settings (also padding=, markers=)
  theme newsprint                     workspace theme
  revenue:num=Revenue label="Rev ($)" alias a field; :num|:cat|:date|:bool checks
                                      its type, as=num converts it
  field "Order Date" label=Ordered    display settings by exact name: label=,
                                      format=, precision=, unit=, currency=
  calc profit = revenue - cost        row calculation (native formula syntax);
                                      the formula runs to the end of the line

Charts (each starts from the app's defaults):
  scatter x=<field> y=<field>         color=, size=<field|number>, opacity=,
                                      regression=linear|polynomial|loess
  hist <field> bins=24                histogram
  bar <field>                         bars by category or bins
  row <field>                         horizontal category bars
  metric count | sum=<field> | avg=<field>
  table <field>,<field>,...           data table (all fields when omitted)
  summary                             field summary table
  chart <type> field=<field>          any chart type, such as chart boxplot

  A chart goes by its @name, or by its field when no other chart shares it:
  row Region is named Region. Long settings go in a body:
    scatter @fit x=Revenue y=Margin {
      title="Margin by revenue" x.scale=log
    }

Settings on any chart: title=, x.title=, x.scale=, x.min=, x.max=, x.grid=,
x.ticks=, the same y.* words, and margin.left= (top, right, bottom).
x.min= and x.max= set the axis range shown; rows outside stay counted.
Any other saved setting is its path: minRowHeight=30, columns.0.width=140.
exploreda-dsl reference <type> lists every setting a chart type takes.
  key[]=a,b    a list (key[]= is empty)    key{}=     an empty object
  key=unset    back to the app default     key=null   a missing value

Placement: a layout block, one line per band of grid rows.
  layout {
    5: size size species island       cells split 12 columns evenly: 6/3/3
    4: bill:7 mass:5                  or say a cell's width
    3: . table table                  . is empty; repeat a name to widen it, or
  }                                   put it in the same cells below to make it taller
  Or give one chart at=x,y,w,h. Charts in neither take the first free space.

Composition: a designed graphic, its parts as child lines named for their
kind. Parts point at each other by name (scales by field); @id only when a
generated ID wouldn't match. Settings equal to a part's default are left out.
  composition @jobs height=704 {      artboard: width=, height=, background=
    scale numeric Year nice=false     also scale position <field>, scale value "Name"
    measure max("Group order")        a per-repeat value; name=, population=, filters=
    title "Jobs" at=32,24             subtitle, footnote; fontSize=, color=, width=
    unit Groups at=56,176 size=120x180 {
      repeat Group columns=5 orderBy="Group order"
      label fontSize=11 value="Group order"
      path Occupations x=Year y=Jobs orderField=Year
    }                                 marks: path point band span strip summary
    legend Key at=620,130 unit=Groups mark=Occupations     stack waffle bar horizon density
                                                           waterfall donut
    rule "1990" at=4,0 unit=Groups value.value="1990"
    note "Peak" at=-30,-40 on=Groups[A] point=0.5,0.7  (or mark=, pick=max)
    override Groups[A] dx=-40
  }

Shared definitions (charts point at them by @name):
  scale @channels field=Channel       color scale; charts: colorScaleId=channels
  group @byRegion groupField=Region aggregation=sum measureField=Revenue
                                      grouped summary; charts: aggregateId=byRegion
  rows sortBy=Revenue where.Units=2.. the Rows view

Filters:
  where.<field>=Web,Store             only these rows, for this chart only
  where.<field>=0..   ..100   5..10   number or date range
  where.<field>=null                  missing values; "a,b" is one value
  where.<field>.contains=text         also equals, startsWith, endsWith
  select.<field>=...                  a linked filter that also narrows other charts
  filter <field>=Web,Store            a workspace filter on its own line: narrows
                                      every chart; one line per field

Several views (one text for every saved view):
  view "Overview" {                   a view's grid, filters, charts, and layout
    row Region                        go in its body
  }
  Fields, calculations, scales, and groups are shared by every view, wherever
  they appear; put them above the first view.

The text describes the whole dashboard: omitted charts are removed and
omitted settings use the app's defaults.`;
