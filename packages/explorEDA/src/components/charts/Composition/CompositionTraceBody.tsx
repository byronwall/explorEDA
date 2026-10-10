import { useDataLayer } from "@/providers/DataLayerProvider";
import { TraceReadout, TraceSection, TraceSwatch } from "../ChartTraceDetails";
import { formatCalcValue } from "./calculations";
import type { CompositionTrace } from "./compositionTrace";

const SHOWN_ROWS = 8;

const AGGREGATION_TEXT: Record<string, string> = {
  count: "Count of rows",
  sum: "Sum",
  average: "Average",
};

const SCALE_DOMAIN_TEXT = {
  shared: "shared by every repeat",
  instance: "fit to this repeat",
};

export function CompositionTraceBody({ trace }: { trace: CompositionTrace }) {
  const { unit, glyph, path, band, labelValue, guide, anchor } = trace;
  const point = glyph?.datum.point;
  const summary = glyph?.datum.summary;
  const stack = glyph?.datum.stack;
  return (
    <div className="space-y-2" aria-label="Composition trace">
      {glyph && stack && (
        <TraceSection heading={`${glyph.markName} · ${glyph.datum.bin.label}`}>
          <TraceReadout label="Share">
            <TraceSwatch color={glyph.fill} />{" "}
            {new Intl.NumberFormat("en-US", {
              style: "percent",
              maximumFractionDigits: 1,
            }).format(glyph.datum.value)}{" "}
            of this repeat's total
          </TraceReadout>
          <TraceReadout label="Numerator">
            {formatCalcValue(stack.count, "number")}{" "}
            {stack.aggregation === "count"
              ? "rows"
              : `as the sum of ${stack.measureField}`}{" "}
            where {stack.categoryField} = {glyph.datum.bin.label}
          </TraceReadout>
          <TraceReadout label="Denominator">
            {formatCalcValue(stack.total, "number")} across{" "}
            {stack.contributors.length} categories in this repeat, after the
            active filters. Selecting a category fades the others; it does not
            leave the total.
          </TraceReadout>
          <TraceReadout label="Contributors">
            {stack.contributors
              .map(
                (item) =>
                  `${item.category} ${formatCalcValue(item.count, "number")}`
              )
              .join(" · ")}
          </TraceReadout>
          <TraceReadout label="Stacked">
            from{" "}
            {new Intl.NumberFormat("en-US", {
              style: "percent",
              maximumFractionDigits: 1,
            }).format(stack.lower)}{" "}
            to{" "}
            {new Intl.NumberFormat("en-US", {
              style: "percent",
              maximumFractionDigits: 1,
            }).format(stack.upper)}
          </TraceReadout>
        </TraceSection>
      )}
      {glyph && summary && (
        <TraceSection heading={`${glyph.markName} · ${glyph.datum.bin.label}`}>
          <TraceReadout label="Median">
            <TraceSwatch color={glyph.fill} />{" "}
            {formatCalcValue(summary.median, "number")} {summary.measureField}
          </TraceReadout>
          <TraceReadout label="Quartiles">
            {formatCalcValue(summary.q1, "number")} to{" "}
            {formatCalcValue(summary.q3, "number")}, unweighted, from{" "}
            {summary.count.toLocaleString()} values
          </TraceReadout>
          <TraceReadout label="Group">
            {summary.groupField} = {glyph.datum.bin.label}, within this repeat,
            after the active filters
          </TraceReadout>
          <TraceReadout label="Change in median">
            {summary.change === undefined
              ? "Undefined: the first group has no median or a median of zero, so the marker stays neutral"
              : `${summary.changeText} from the first group to the last, which sets the marker color`}
          </TraceReadout>
        </TraceSection>
      )}
      {glyph && point && (
        <TraceSection heading={`${glyph.markName} · ${glyph.datum.bin.label}`}>
          <TraceReadout label={point.xField}>
            <TraceSwatch color={glyph.fill} />{" "}
            {formatCalcValue(point.x, "number")}
          </TraceReadout>
          <TraceReadout label={point.yField}>
            {formatCalcValue(point.y, "number")}
          </TraceReadout>
          <TraceReadout label="Calculation">
            One point per row; no aggregation
          </TraceReadout>
          {glyph.x && (
            <TraceReadout label="X scale">
              {describeNumericScale(glyph.x)}
            </TraceReadout>
          )}
          {glyph.y && (
            <TraceReadout label="Y scale">
              {describeNumericScale(glyph.y)}
            </TraceReadout>
          )}
        </TraceSection>
      )}
      {glyph && !point && !summary && !stack && (
        <TraceSection heading={`${glyph.markName} · ${glyph.datum.bin.label}`}>
          <TraceReadout label="Value">
            <TraceSwatch color={glyph.fill} />{" "}
            {glyph.datum.missing
              ? `No value: ${glyph.datum.rowIds.length.toLocaleString()} ${
                  glyph.datum.rowIds.length === 1 ? "row" : "rows"
                } in this bin, none with a value, so the cell is drawn as missing`
              : formatCalcValue(glyph.datum.value, "number")}
          </TraceReadout>
          <TraceReadout label="Calculation">
            {AGGREGATION_TEXT[glyph.aggregation] ?? glyph.aggregation}
            {glyph.measureField ? ` of ${glyph.measureField}` : ""} for rows in
            this repeat and bin
          </TraceReadout>
          {glyph.position && (
            <TraceReadout label="Position scale">
              {glyph.position.name}
              {glyph.position.name.startsWith(glyph.position.field)
                ? ""
                : ` · ${glyph.position.field}${glyph.position.interval ? ` by ${glyph.position.interval}` : ""}`}
              {" · "}
              {glyph.position.domain === "shared"
                ? "shared by every repeat"
                : "fit to this repeat"}
            </TraceReadout>
          )}
          {glyph.value && (
            <TraceReadout label="Value scale">
              {glyph.value.name} · {glyph.value.transform} ·{" "}
              {glyph.value.domain === "shared"
                ? "shared by every repeat"
                : "fit to this repeat"}
            </TraceReadout>
          )}
        </TraceSection>
      )}
      {path && (
        <TraceSection heading={path.markName}>
          <TraceReadout label="Order">
            <TraceSwatch color={path.stroke} /> {path.datum.orderField},
            ascending; ties keep row order
          </TraceReadout>
          <TraceReadout label="Vertices">
            {path.vertices.length.toLocaleString()} in{" "}
            {path.datum.segments === 1
              ? "one run"
              : `${path.datum.segments} runs`}
            {path.datum.skipped.length
              ? `; ${path.datum.skipped.length} ${
                  path.datum.skipped.length === 1 ? "row" : "rows"
                } skipped for a missing value (${path.datum.skipped
                  .slice(0, 6)
                  .join(", ")}${path.datum.skipped.length > 6 ? ", …" : ""})`
              : "; no gaps"}
          </TraceReadout>
          {path.x && (
            <TraceReadout label="X scale">
              {describeNumericScale(path.x)}
            </TraceReadout>
          )}
          {path.y && (
            <TraceReadout label="Y scale">
              {describeNumericScale(path.y)}
            </TraceReadout>
          )}
          <TraceReadout label="Endpoints">
            rows {path.vertices[0]?.rowId} →{" "}
            {path.vertices[path.vertices.length - 1]?.rowId}
          </TraceReadout>
        </TraceSection>
      )}
      {band && band.datum.stack && (
        <TraceSection
          heading={`${band.markName} · ${band.datum.stack.category}`}
        >
          <TraceReadout label="Share">
            <TraceSwatch color={band.fill} />{" "}
            {describeShareRange(band.datum.stack.points)} of each{" "}
            {band.datum.orderField}'s total, across{" "}
            {band.datum.stack.points.length.toLocaleString()} values of{" "}
            {band.datum.orderField}
          </TraceReadout>
          <TraceReadout label="Numerator">
            {band.datum.stack.aggregation === "count"
              ? "Rows"
              : `Sum of ${band.datum.stack.measureField}`}{" "}
            where {band.datum.stack.categoryField} = {band.datum.stack.category}
            , at each {band.datum.orderField}
          </TraceReadout>
          <TraceReadout label="Denominator">
            Every category at that {band.datum.orderField}, after the active
            filters: {band.datum.stack.categories.join(", ")}
          </TraceReadout>
          <TraceReadout label="Largest share">
            {describeLargest(band.datum.stack.points, band.datum.orderField)}
          </TraceReadout>
        </TraceSection>
      )}
      {band && !band.datum.stack && (
        <TraceSection heading={band.markName}>
          <TraceReadout label="Bounds">
            <TraceSwatch color={band.fill} /> {band.datum.lowerField} to{" "}
            {band.datum.upperField}, supplied by the data
          </TraceReadout>
          <TraceReadout label="Order">
            {band.datum.orderField}, ascending; ties keep row order
          </TraceReadout>
          <TraceReadout label="Vertices">
            {band.vertices.length.toLocaleString()} in{" "}
            {band.datum.segments === 1
              ? "one run"
              : `${band.datum.segments} runs`}
            {band.datum.skipped.length
              ? `; ${band.datum.skipped.length} ${
                  band.datum.skipped.length === 1 ? "row" : "rows"
                } skipped for a missing bound`
              : "; no gaps"}
          </TraceReadout>
          {band.vertices.length > 0 && (
            <TraceReadout label="Ends">
              {formatCalcValue(band.vertices[0]!.lower, "number")} to{" "}
              {formatCalcValue(band.vertices[0]!.upper, "number")} at the start;{" "}
              {formatCalcValue(
                band.vertices[band.vertices.length - 1]!.lower,
                "number"
              )}{" "}
              to{" "}
              {formatCalcValue(
                band.vertices[band.vertices.length - 1]!.upper,
                "number"
              )}{" "}
              at the end
            </TraceReadout>
          )}
          {band.x && (
            <TraceReadout label="X scale">
              {describeNumericScale(band.x)}
            </TraceReadout>
          )}
          {band.y && (
            <TraceReadout label="Y scale">
              {describeNumericScale(band.y)}
            </TraceReadout>
          )}
        </TraceSection>
      )}
      {unit && (
        <TraceSection
          heading={`Repeat: ${unit.instanceKey === "all" ? "the one unit" : unit.instanceKey}`}
        >
          <TraceReadout label="Template">{trace.elementName}</TraceReadout>
          {unit.repeatField && (
            <TraceReadout label="Subset">
              {unit.repeatField} = {unit.instanceKey}
            </TraceReadout>
          )}
          <TraceReadout label="Rows">
            {unit.liveCount.toLocaleString()} of{" "}
            {unit.rowCount.toLocaleString()} pass the filters
          </TraceReadout>
          <TraceReadout label="Override">
            {unit.override
              ? describeOverride(unit.override)
              : "None; drawn from the template"}
          </TraceReadout>
        </TraceSection>
      )}
      {labelValue && (
        <TraceSection heading="Label value">
          <TraceReadout label="Value">{labelValue.text}</TraceReadout>
          <TraceReadout label="Scope">{labelValue.description}</TraceReadout>
        </TraceSection>
      )}
      {guide && (
        <TraceSection heading={trace.elementName}>
          <TraceReadout label="Placed at">
            {guide.source === "constant"
              ? `Fixed value ${guide.constant || "(empty)"}`
              : `Calculation ${guide.calcName ?? "(missing)"}`}
          </TraceReadout>
          {guide.description && (
            <TraceReadout label="Scope">{guide.description}</TraceReadout>
          )}
          {guide.values.slice(0, 12).map((value, index) => (
            <TraceReadout
              key={value.instanceKey ?? index}
              label={value.instanceKey ?? "Value"}
            >
              {value.text} from {value.rowIds.length.toLocaleString()} rows
            </TraceReadout>
          ))}
        </TraceSection>
      )}
      {trace.role === "annotation" && anchor && (
        <TraceSection heading={trace.elementName}>
          <TraceReadout label="Attached to">
            {anchor.kind === "page"
              ? "A fixed point on the page"
              : anchor.kind === "frame"
                ? "A point in a repeat's frame"
                : "A glyph chosen from the data"}
          </TraceReadout>
          {anchor.glyph && (
            <TraceReadout label="Following">
              {anchor.glyph.instanceKey} · {anchor.glyph.bin.label} ·{" "}
              {formatCalcValue(anchor.glyph.value, "number")}
            </TraceReadout>
          )}
          {anchor.missing && (
            <TraceReadout label="Hidden">{anchor.missing}</TraceReadout>
          )}
        </TraceSection>
      )}
      <TraceRows ids={trace.rowIds} fields={trace.fields} />
    </div>
  );
}

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

function describeShareRange(points: { share: number }[]) {
  const shares = points.map((point) => point.share);
  const low = Math.min(...shares);
  const high = Math.max(...shares);
  return low === high
    ? percent.format(low)
    : `${percent.format(low)} to ${percent.format(high)}`;
}

function describeLargest(
  points: { x: number; count: number; total: number; share: number }[],
  xField: string
) {
  const best = points.reduce((top, point) =>
    point.share > top.share ? point : top
  );
  return `${percent.format(best.share)} at ${xField} ${best.x}: ${formatCalcValue(
    best.count,
    "number"
  )} of ${formatCalcValue(best.total, "number")}`;
}

function describeNumericScale(
  scale: NonNullable<CompositionTrace["glyph"]>["x"] & object
) {
  const limits =
    scale.min !== undefined || scale.max !== undefined
      ? ` · fixed ${scale.min ?? "…"} to ${scale.max ?? "…"}`
      : scale.nice
        ? " · rounded to ticks"
        : "";
  return `${scale.name} · ${scale.field} · ${SCALE_DOMAIN_TEXT[scale.domain]}${
    scale.zero ? " · includes zero" : ""
  }${limits}`;
}

function describeOverride(
  override: NonNullable<CompositionTrace["unit"]>["override"]
) {
  if (!override) return "";
  const parts = [];
  if (override.dx || override.dy)
    parts.push(`moved ${override.dx}, ${override.dy} px`);
  if (override.accent) parts.push(`accent ${override.accent}`);
  if (override.opacity !== undefined)
    parts.push(`${Math.round(override.opacity * 100)}% opacity`);
  if (override.emphasize) parts.push("bold label");
  return parts.join(" · ");
}

/** The first source rows behind the object, with the fields that placed it. */
function TraceRows({ ids, fields }: { ids: number[]; fields: string[] }) {
  const getColumnData = useDataLayer((state) => state.getColumnData);
  if (!ids.length)
    return (
      <TraceSection heading="Source rows">
        <p className="text-muted-foreground">No source rows.</p>
      </TraceSection>
    );
  const columns = fields.map((field) => ({
    field,
    values: getColumnData(field),
  }));
  return (
    <TraceSection heading={`Source rows · ${ids.length.toLocaleString()}`}>
      <table className="eda-composition-trace-rows">
        <thead>
          <tr>
            <th scope="col">Row</th>
            {columns.map(({ field }) => (
              <th key={field} scope="col">
                {field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ids.slice(0, SHOWN_ROWS).map((id) => (
            <tr key={id}>
              <td>{id}</td>
              {columns.map(({ field, values }) => (
                <td key={field}>{String(values[id] ?? "null")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {ids.length > SHOWN_ROWS && (
        <p className="text-muted-foreground">
          First {SHOWN_ROWS} of {ids.length.toLocaleString()} shown.
        </p>
      )}
    </TraceSection>
  );
}
