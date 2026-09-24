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
    <section className="space-y-1 border-t border-border pt-2">
      {heading && <h4 className="font-medium">{heading}</h4>}
      <div className={muted ? "text-muted-foreground" : undefined}>
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
    <div>
      <span className="text-muted-foreground">{label}: </span>
      {children}
    </div>
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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2">
        {[...sources].map(([field, value]) => (
          <div className="contents" key={field}>
            <span className="min-w-0 break-words text-muted-foreground">
              {field}
            </span>
            <span className="text-right">
              {showTraceValue(value.raw)}
              {value.raw !== value.prepared &&
                ` → ${showTraceValue(value.prepared)}`}
              {value.error && ` · ${value.error}`}
            </span>
          </div>
        ))}
      </div>
      {calculations.size > 0 && (
        <div className="border-t border-border pt-2">
          <h4 className="font-medium">Calculations</h4>
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
  return (
    <TraceReadout label={`${axis.toUpperCase()} ${type} scale`}>
      domain {domain.join(" to ")} · range {range.join(" to ")} px
    </TraceReadout>
  );
}

export type ChartTraceGuide = {
  object: string;
  source: string;
  field: string;
  tickValue?: datum | Date;
  bin?: { start: datum | Date; end: datum | Date };
  position?: { x?: number; y?: number };
  line?: { x1?: number; y1?: number; x2?: number; y2?: number };
  label?: string;
  scale?: {
    axis: string;
    type: string;
    domain: readonly unknown[];
    range: readonly unknown[];
  };
  primitive?:
    | {
        kind: "text";
        text: string;
        x: number;
        y: number;
        fontSize?: number;
        textAnchor?: string;
        fullText?: string;
      }
    | {
        kind: "line";
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        stroke?: string;
        hitStrokeWidth?: number;
      };
};

export function TraceGuideDetails({
  guide,
  heading,
}: {
  guide: ChartTraceGuide;
  heading?: string;
}) {
  return (
    <TraceSection heading={heading}>
      <TraceReadout label="Object">{guide.object}</TraceReadout>
      <TraceReadout label="Source">{guide.source}</TraceReadout>
      <TraceReadout label="Field">{guide.field}</TraceReadout>
      {guide.tickValue !== undefined && (
        <TraceReadout label="Tick value">
          {showTraceValue(guide.tickValue)}
        </TraceReadout>
      )}
      {guide.bin && (
        <TraceReadout label="Bin interval">
          {showTraceValue(guide.bin.start)} to {showTraceValue(guide.bin.end)}
        </TraceReadout>
      )}
      {guide.position &&
        (guide.position.x !== undefined || guide.position.y !== undefined) && (
          <TraceReadout label="Position">
            x {Math.round(guide.position.x ?? 0)} px · y{" "}
            {Math.round(guide.position.y ?? 0)} px
          </TraceReadout>
        )}
      {guide.line &&
        (guide.line.x1 !== undefined || guide.line.y1 !== undefined) && (
          <TraceReadout label="Line endpoints">
            ({Math.round(guide.line.x1 ?? 0)}, {Math.round(guide.line.y1 ?? 0)})
            → ( {Math.round(guide.line.x2 ?? 0)},{" "}
            {Math.round(guide.line.y2 ?? 0)}) px
          </TraceReadout>
        )}
      {guide.primitive?.kind === "text" && (
        <>
          <TraceReadout label="Rendered text">
            {guide.primitive.text}
          </TraceReadout>
          <TraceReadout label="Position">
            x {Math.round(guide.primitive.x)} px · y{" "}
            {Math.round(guide.primitive.y)} px
          </TraceReadout>
          <TraceReadout label="Text size">
            {guide.primitive.fontSize ?? "SVG default"} · anchor{" "}
            {guide.primitive.textAnchor ?? "SVG default"} ← guide style
          </TraceReadout>
          {guide.primitive.fullText &&
            guide.primitive.fullText !== guide.primitive.text && (
              <TraceReadout label="Full formatted text">
                {guide.primitive.fullText}
              </TraceReadout>
            )}
        </>
      )}
      {guide.primitive?.kind === "line" && (
        <TraceReadout label="Planned line">
          ({Math.round(guide.primitive.x1)}, {Math.round(guide.primitive.y1)}) →
          ( {Math.round(guide.primitive.x2)}, {Math.round(guide.primitive.y2)})
          px · stroke {guide.primitive.stroke ?? "SVG default"}
          {guide.primitive.hitStrokeWidth &&
            ` · ${guide.primitive.hitStrokeWidth} px hit target`}
        </TraceReadout>
      )}
      {guide.scale && (
        <TraceScaleReadout
          axis={guide.scale.axis}
          type={guide.scale.type}
          domain={guide.scale.domain}
          range={guide.scale.range}
        />
      )}
      {guide.label && <TraceReadout label="Label">{guide.label}</TraceReadout>}
    </TraceSection>
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
