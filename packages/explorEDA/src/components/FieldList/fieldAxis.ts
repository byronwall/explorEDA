import { getChartAxisFields } from "@/components/charts/chartAccessibility";
import type { FieldProfile } from "@/lib/fieldProfiles";
import { finiteNumber } from "@/lib/numeric";
import type { ChartSettings, datum } from "@/types/ChartTypes";

export type AxisName = "x" | "y";

/** A chart axis that can take a field from the field list. */
export type AxisTarget = {
  chart: ChartSettings;
  axis: AxisName;
  /** The field the axis shows now. */
  current?: string;
};

/** What the axis needs from a field: numbers, or values to group by. */
type AxisNeed = "any" | "numbers" | "numbers-or-dates" | "groups";

function axisNeed(chart: ChartSettings, axis: AxisName): AxisNeed | undefined {
  switch (chart.type) {
    case "bar":
      // A grouped bar derives its field from an aggregate definition.
      return axis === "x" && !chart.aggregateId ? "any" : undefined;
    case "row":
      return axis === "y" ? "groups" : undefined;
    case "scatter":
      return "numbers";
    case "line":
      if (axis === "x") return "numbers-or-dates";
      return chart.seriesField.length === 1 ? "numbers" : undefined;
    case "boxplot":
      return axis === "y" ? "numbers" : undefined;
    default:
      return undefined;
  }
}

/** Every axis in the workspace that a field could replace. */
export function axisTargets(charts: ChartSettings[]): AxisTarget[] {
  return charts.flatMap((chart) => {
    const fields = getChartAxisFields(chart);
    return (["x", "y"] as const)
      .filter((axis) => axisNeed(chart, axis) !== undefined)
      .map((axis) => ({ chart, axis, current: fields[axis] }));
  });
}

/** True when at least one value is a finite measurement. */
export function hasFiniteNumber(values: Record<number, datum>) {
  for (const value of Object.values(values)) {
    if (finiteNumber(value) !== undefined) return true;
  }
  return false;
}

export type FieldFacts = {
  field: string;
  label: string;
  dataType: FieldProfile["dataType"];
  /** Whether any value is a finite number, by the shared numeric rule. */
  hasNumbers: boolean;
};

/**
 * Why the axis cannot show this field, or undefined when it can.
 * The reason is shown beside the choice and on a refused drop.
 */
export function axisRefusal(
  target: AxisTarget,
  facts: FieldFacts
): string | undefined {
  const need = axisNeed(target.chart, target.axis);
  if (!need) return "This axis does not take a field";
  if (target.current === facts.field) return "Already on this axis";
  const numbers = facts.dataType === "numeric" && facts.hasNumbers;
  switch (need) {
    case "any":
      return undefined;
    case "groups":
      return facts.dataType === "numeric"
        ? "Row charts group text values. Use a bar chart for numbers"
        : undefined;
    case "numbers":
      return numbers
        ? undefined
        : facts.dataType === "numeric"
          ? `${facts.label} has no finite numbers`
          : `This axis needs numbers, and ${facts.label} is ${
              facts.dataType === "datetime"
                ? "a date"
                : facts.dataType === "boolean"
                  ? "true or false"
                  : "text"
            }`;
    case "numbers-or-dates":
      return numbers || facts.dataType === "datetime"
        ? undefined
        : `This axis needs numbers or dates, and ${facts.label} is ${
            facts.dataType === "numeric"
              ? "missing finite numbers"
              : facts.dataType === "boolean"
                ? "true or false"
                : "text"
          }`;
  }
}

/**
 * The settings change that puts a field on one axis. It leaves the chart
 * type, layout, filters, and every other field as they were, and clears only
 * that axis's custom label so the new field's name shows.
 */
export function axisUpdate(
  target: AxisTarget,
  field: string
): Partial<ChartSettings> {
  const { chart, axis } = target;
  const label = axis === "x" ? { xAxisLabel: "" } : { yAxisLabel: "" };
  switch (chart.type) {
    case "scatter":
      return axis === "x"
        ? { xField: field, ...label }
        : { yField: field, ...label };
    case "line":
      return axis === "x"
        ? { xField: field, ...label }
        : { seriesField: [field], ...label };
    default:
      return { field, ...label };
  }
}
