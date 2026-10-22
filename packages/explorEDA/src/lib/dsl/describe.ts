import { categoryLabel } from "@/lib/categories";
import { buildFieldProfiles } from "@/lib/fieldProfiles";
import type { datum } from "@/types/ChartTypes";
import type { DslCompileResult } from "./compile";
import { calculationFunctions } from "@/lib/calculations/functions/registry";

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

/** The formula language for calc lines, from the engine's own functions. */
const FORMULA_REFERENCE = `Formulas (calc name = formula), evaluated per row:
  fields      Revenue, or ["Unit Price"] for a name with spaces or symbols
  values      12, 0.5, "text", true, false, null
  operators   + - * / ^   == != < <= > >=   && || !   ( )
  choices     if cond then a else b      cond ? a : b
  functions
${Object.values(calculationFunctions)
  .map((fn) => `    ${fn.syntax.padEnd(36)}${fn.description}`)
  .join("\n")}
  Missing values are null: Discount == null ? 0 : Discount. Clamp a value with
  min(max(x, low), high). A field reads as a number only when its values do;
  convert one with as=num on its field line.`;

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
  calc profit = revenue - cost        row calculation; the formula runs to the
                                      end of the line (Formulas, below)

Charts (each starts from the app's defaults):
  scatter x=<field> y=<field>         color=, size=<field|number>, opacity=,
                                      regression=linear|polynomial|loess
  hist <field> bins=24                histogram
  bar <field>                         bars by category or bins
  row <field>                         horizontal category bars; group=<@group>
  boxplot | calendar | ecdf | heatmap <field>; boxplot color=<field> draws
                                      one box per value
  line x=<field> y=<field>,<field>    one line per y field; color=<field>
                                      splits each into one line per value
  line x=<date> time.interval=week time.aggregation=sum time.measureField=Revenue
       time.splitField=Channel time.display=stacked-area
                                      a total per period, one line per Channel
  metric count | sum(<field>) | avg(<field>) | max(<field>) | min(<field>)
  table <field>,<field>,...           data table (all fields when omitted)
  pivot rows=<field> columns=<field>  values as child lines (below)
  parallel <field>,<field>,...        parallel coordinates, one axis per field
  sankey stages=a,b | hierarchy levels=a,b | markdown content="…" | map
  summary                             field summary table
  chart <type> field=<field>          any other chart type

  A chart goes by its @name, or by its field when no other chart shares it:
  row Region is named Region. Long settings go in a body:
    scatter @fit x=Revenue y=Margin {
      title="Margin by revenue" x.scale=log
    }

Settings on any chart: title=, subtitle=, note= (a source line), x.title=, x.scale=, x.min=, x.max=, x.grid=,
x.ticks=, the same y.* words, and margin.left= (top, right, bottom).
x.min= and x.max= set the axis range shown; rows outside stay counted.
Small multiples: facet.enabled=true facet.rowVariable=Region facet.columnCount=3.
Any other saved setting is its path: minRowHeight=30, hexbin.columns=18.
A setting that holds a list reads a,b; key= empties it. Colors read plainly:
color=#3479a8. exploreda-dsl reference <type> lists every setting a type takes.
  key=unset    back to the app default     key=null   a missing value

Lists of records are child lines, named by their main field:
  table @orders {                     column Revenue width=140
  pivot rows=Month {                  value sum("Net sales") label="Net sales"
  parallel {                          axis body_mass_g inverted=true
  line x=Date y=Visits {              series Visits lineColor=#3479a8

Annotations are child lines of the chart they mark (dates read as ISO):
  callout "Day 31" on=Day:31 offset=-24,-28   or at=x,y, pick=max, category=West
  rule y=4 "Target"   rule x=mean "Mean"      also median, min, max
  band x=2024-06-01..2024-08-31 "Sale" display=bracket
  region x=275..345 y=4.1..5.15 shape=ellipse "Fast days"
  interval "80% of outcomes" lower=P10 upper=P90
  records "Slow days" on=Day keys=31,44

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
    rule "1990" at=4,0 unit=Groups value="1990"   at= is required
    note "Peak" at=-30,-40 on=Groups[A] point=0.5,0.7  (or mark=, pick=max)
    override Groups[A] dx=-40
  }
  A value scale colors by a measure; a diverging one has a center color:
    scale value "Gap" colors=#1a8fd0,#e3173b center=#b9b9b9 max=100
  A frame label shows a measure by name: measure last(Central) orderField=Year
  name=Latest, then label value=Latest. per-instance scales: domain=instance.
  A legend can relabel marks: legend Key at=… unit=U mark=M { item "Label" mark=M }.
  A rule shown on some repeats only: repeats="GDP growth". Quote a repeat key
  with spaces after the unit name: on=Groups["Admin support"].
  Mark colors: stroke= on a path, fill= on other marks; colorField= with colors=
  colors by category; valueField= with valueScale=<value scale> colors by a
  measure. A unit's axis titles: axisTitles.x=, axisTitles.y=.
  A band mark fills between two fields: band "80%" x=Year y=Value orderField=Year
  lowerField=P10 upperField=P90 (x= and y= name scales). A part missing a
  required setting is left out with a diagnostic at its line.
  exploreda-dsl reference composition lists every part's settings.

Shared definitions (charts point at them by @name):
  scale @channels field=Channel map=Web:#3479a8,Store:#c77a45
                                      color scale; charts: colorScale=channels
  group @byRegion sum(Revenue) by=Region
                                      grouped summary; charts: group=byRegion;
                                      count, sum(), avg(), max(), or min()
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
  row Region title="By region"        charts above the views are defined once
  view "Overview" {                   a view's grid, theme, filters, charts, and
    Region select.Region=West         layout go in its body; a line naming a chart
    hist Revenue                      above places it here, with settings that
    layout { 4: Region Revenue }      replace that chart's own
  }
  A view shows a chart defined above when its layout places it or a line names
  it; a view that names none shows them all. Fields, calculations, scales, and
  groups are shared by every view, wherever they appear.

In a project folder (each view charts one of the project's queries):
  eda query=order-lines               the query every view charts
  view "Aster" query=customer-orders bind.customer=C01
                                      a view's own query and parameter values

The text describes the whole dashboard: omitted charts are removed and
omitted settings use the app's defaults.

${FORMULA_REFERENCE}`;
