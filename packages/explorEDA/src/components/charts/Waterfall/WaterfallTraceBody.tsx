import {
  formatFilterLabel,
  useFieldFormatting,
} from "@/components/ActiveFilterStatus";
import type { Filter } from "@/types/FilterTypes";
import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { WaterfallBar } from "./waterfallPlan";

export interface WaterfallTrace {
  kind: "waterfall-bar";
  id: string;
  revision: string;
  owner: string;
  chartId: string;
  bar: WaterfallBar;
  /** Each state's label, measure name, and conditions. */
  states: { label: string; measure: string; filters: Filter[] }[];
  stepLabel: string;
  /** Formats a value in the measure's format. */
  amountText: string;
  valueTexts: [string, string] | undefined;
  showInputs: boolean;
}

const KIND_TEXT = {
  start: "Start total",
  step: "Step",
  subtotal: "Subtotal",
  end: "End total",
};

export function WaterfallTraceBody({ trace }: { trace: WaterfallTrace }) {
  const format = useFieldFormatting();
  const { bar, states } = trace;
  const conditions = (filters: Filter[]) =>
    filters.length
      ? filters.map((filter) => formatFilterLabel(filter, format)).join("; ")
      : "Every row";
  const shownStates =
    bar.kind === "start" ? [0] : bar.kind === "end" ? [1] : [0, 1];

  return (
    <div className="space-y-2" aria-label="Waterfall trace">
      <TraceSection heading={bar.label}>
        <TraceReadout label="Bar">{KIND_TEXT[bar.kind]}</TraceReadout>
        {bar.kind === "step" && (
          <>
            <TraceReadout label={trace.stepLabel}>{bar.label}</TraceReadout>
            <TraceReadout label="Change">{trace.amountText}</TraceReadout>
            <TraceReadout label="Calculation">
              {states[1]!.label} minus {states[0]!.label} for this{" "}
              {trace.stepLabel.toLowerCase()}.
            </TraceReadout>
            {bar.parent && (
              <TraceReadout label="Group">{bar.parent.label}</TraceReadout>
            )}
          </>
        )}
        {bar.kind === "subtotal" && (
          <>
            <TraceReadout label="Running total">
              {trace.amountText}
            </TraceReadout>
            <TraceReadout label="Calculation">
              {states[0]!.label} plus every step through this group.
            </TraceReadout>
            <TraceReadout label="Steps">
              {(bar.members ?? []).length.toLocaleString()}
            </TraceReadout>
          </>
        )}
        {(bar.kind === "start" || bar.kind === "end") && (
          <TraceReadout label="Total">{trace.amountText}</TraceReadout>
        )}
        {bar.missingFrom !== undefined && (
          <TraceReadout label="Missing">
            No {states[bar.missingFrom]!.label} rows, so it counts as 0.
          </TraceReadout>
        )}
      </TraceSection>
      {bar.states &&
        shownStates.map((index) => {
          const value = bar.states![index]!;
          const state = states[index]!;
          return (
            <TraceSection key={index} heading={state.label}>
              <TraceReadout label="Value">
                {trace.valueTexts?.[index]}
              </TraceReadout>
              <TraceReadout label="Measure">{state.measure}</TraceReadout>
              <TraceReadout label="Rows">
                {conditions(state.filters)}
              </TraceReadout>
              {value.contributors.length > 0 ? (
                <AggregateContributorTable
                  showInputs={trace.showInputs}
                  row={{
                    id: `${bar.key}:${index}`,
                    groupValue: bar.value,
                    groupLabel: bar.label,
                    value: value.value,
                    rowCount: value.rowCount,
                    contributors: value.contributors,
                  }}
                />
              ) : (
                <p className="text-muted-foreground">
                  There are no {state.label} rows here.
                </p>
              )}
            </TraceSection>
          );
        })}
      <TraceSection muted>
        Rows pass the other charts&apos; filters before either state counts
        them.
      </TraceSection>
    </div>
  );
}
