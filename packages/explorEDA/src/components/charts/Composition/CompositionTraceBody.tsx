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

export function CompositionTraceBody({ trace }: { trace: CompositionTrace }) {
  const { unit, glyph, labelValue, guide, anchor } = trace;
  return (
    <div className="space-y-2" aria-label="Composition trace">
      {glyph && (
        <TraceSection heading={`${glyph.markName} · ${glyph.datum.bin.label}`}>
          <TraceReadout label="Value">
            <TraceSwatch color={glyph.fill} />{" "}
            {formatCalcValue(glyph.datum.value, "number")}
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
      {unit && (
        <TraceSection heading={`Repeat: ${unit.instanceKey === "all" ? "the one unit" : unit.instanceKey}`}>
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
            {unit.override ? describeOverride(unit.override) : "None; drawn from the template"}
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

function describeOverride(override: NonNullable<CompositionTrace["unit"]>["override"]) {
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
  const columns = fields.map((field) => ({ field, values: getColumnData(field) }));
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
