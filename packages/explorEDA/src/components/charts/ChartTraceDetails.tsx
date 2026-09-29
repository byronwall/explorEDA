import type { RowCalculationTrace } from "@/lib/calculations/CalculationState";
import type { datum } from "@/types/ChartTypes";
import type { ReactNode } from "react";

export type ChartTraceField = {
  field: string;
  raw?: datum;
  prepared: datum;
  conversion?: { error?: string };
  calculation?: RowCalculationTrace;
  sources: {
    field: string;
    raw: datum;
    prepared: datum;
    conversion?: { error?: string };
  }[];
};

export const showTraceValue = (value: datum | Date) =>
  value === undefined ? "undefined" : value === null ? "null" : String(value);

export function TraceSection({
  heading,
  children,
  muted = false,
}: {
  heading?: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section className="eda-trace-section">
      {heading && <h4>{heading}</h4>}
      <div
        className={
          muted ? "space-y-1 text-muted-foreground" : "space-y-1 leading-snug"
        }
      >
        {children}
      </div>
    </section>
  );
}

export function TraceReadout({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="eda-trace-readout">
      <span className="text-muted-foreground">
        {label}
        <span className="sr-only">: </span>
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

/** Pass or exclude states for the filters that decide whether a mark shows. */
export function TraceFilterStatus({
  steps,
}: {
  steps: { label: string; state: string; ok: boolean }[];
}) {
  return (
    <dl className="eda-trace-filters" aria-label="Filter status">
      {steps.map((step) => (
        <div key={step.label} data-ok={step.ok || undefined}>
          <dt>{step.label}</dt>
          <dd>{step.state}</dd>
        </div>
      ))}
    </dl>
  );
}

/** One visual channel: which field value sets it and what the chart drew. */
export function TraceEncoding({
  channel,
  input,
  output,
  note,
}: {
  channel: string;
  input?: ReactNode;
  output: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="eda-trace-encoding">
      <span className="eda-trace-channel">
        {channel}
        <span className="sr-only">: </span>
      </span>
      <span className="min-w-0 break-words">
        {input !== undefined && (
          <>
            <span className="text-muted-foreground">{input}</span>
            <span aria-hidden="true"> → </span>
            <span className="sr-only"> maps to </span>
          </>
        )}
        <span className="font-medium">{output}</span>
        {note && <span className="block text-muted-foreground">{note}</span>}
      </span>
    </div>
  );
}

export function TraceSwatch({ color }: { color: string }) {
  return (
    <span
      className="eda-trace-swatch"
      style={{ background: color }}
      aria-hidden="true"
    />
  );
}

export function ChartTraceRowSteps({
  fields,
}: {
  fields: readonly ChartTraceField[];
}) {
  const sources = new Map<
    string,
    { raw: datum; prepared: datum; error?: string }
  >();
  const calculations = new Map<string, RowCalculationTrace>();
  const addCalculation = (trace: RowCalculationTrace) => {
    trace.dependencies.forEach(addCalculation);
    calculations.set(trace.field, trace);
  };
  for (const field of fields) {
    if (field.calculation) {
      addCalculation(field.calculation);
      for (const source of field.sources) {
        sources.set(source.field, {
          raw: source.raw,
          prepared: source.prepared,
          error: source.conversion?.error,
        });
      }
    } else {
      sources.set(field.field, {
        raw: field.raw,
        prepared: field.prepared,
        error: field.conversion?.error,
      });
    }
  }
  return (
    <TraceSection heading="Source row">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5">
        {[...sources].map(([field, value]) => (
          <div className="contents" key={field}>
            <span className="min-w-0 break-words text-muted-foreground">
              {field}
            </span>
            <span className="text-right font-medium tabular-nums">
              {showTraceValue(value.raw)}
              {value.raw !== value.prepared &&
                ` → ${showTraceValue(value.prepared)}`}
              {value.error && ` · ${value.error}`}
            </span>
          </div>
        ))}
      </div>
      {calculations.size > 0 && (
        <div className="pt-1">
          <h5 className="font-medium">Calculations</h5>
          {[...calculations.values()].map((calc) => (
            <details key={calc.field} className="group">
              <summary className="cursor-pointer py-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {calc.field} = {calc.error ?? showTraceValue(calc.value)}
              </summary>
              <div className="ml-3 space-y-1 border-l border-border pl-2 pb-1 text-muted-foreground">
                <code className="block break-words">{calc.expression}</code>
                <ol aria-label={`${calc.field} calculation steps`}>
                  {calc.steps.map((step, index) => (
                    <li
                      key={`${step.id}-${index}`}
                      style={{ paddingLeft: Math.min(step.depth, 5) * 8 }}
                    >
                      {step.label} → {step.error ?? showTraceValue(step.value)}
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          ))}
        </div>
      )}
    </TraceSection>
  );
}

export function TraceScaleReadout({
  axis,
  type,
  domain,
  range,
}: {
  axis: string;
  type: string;
  domain: readonly unknown[];
  range: readonly unknown[];
}) {
  const show = (value: unknown) =>
    typeof value === "number"
      ? String(Math.round(value * 100) / 100)
      : String(value);
  const domainText =
    type === "band"
      ? `${domain.slice(0, 12).map(show).join(", ")}${domain.length > 12 ? `, … (${domain.length} bands)` : ""}`
      : domain.map(show).join(" to ");
  return (
    <TraceReadout label={`${axis.toUpperCase()} ${type} scale`}>
      domain {domainText} · range {range.map(show).join(" to ")} px
    </TraceReadout>
  );
}

export function TraceMarkGeometry({
  label = "Geometry",
  geometry,
}: {
  label?: string;
  geometry: { x?: number; y?: number; width?: number; height?: number };
}) {
  return (
    <TraceReadout label={label}>
      {geometry.x !== undefined && `x ${Math.round(geometry.x)} px`}
      {geometry.y !== undefined && `, y ${Math.round(geometry.y)} px`}
      {geometry.width !== undefined &&
        `, width ${Math.round(geometry.width)} px`}
      {geometry.height !== undefined &&
        `, height ${Math.round(geometry.height)} px`}
    </TraceReadout>
  );
}
