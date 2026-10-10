import type { AxisSettings, ChartSettings } from "@/types/ChartTypes";

const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/** Whether an axis sets either bound. A bounded axis is drawn exactly, never niced. */
export function hasAxisBounds(axis?: AxisSettings) {
  return finite(axis?.limits?.min) || finite(axis?.limits?.max);
}

/** Whether a minimum and maximum, as entered, would turn the axis inside out. */
export function boundsInverted(axis?: AxisSettings) {
  const limits = axis?.limits;
  return finite(limits?.min) && finite(limits?.max) && limits.min >= limits.max;
}

/**
 * The domain an axis draws: its saved limits over the chart's automatic
 * domain. A blank side keeps the automatic value. Bounds only change what
 * is shown; marks outside are clipped, and no row is filtered.
 *
 * A bound that passes the automatic value on the other side keeps the
 * automatic span beside it, so a minimum above every value still draws.
 * Inverted bounds are ignored, as the settings never apply them.
 */
export function boundedDomain(
  auto: [number, number],
  axis?: AxisSettings
): [number, number] {
  if (!hasAxisBounds(axis) || boundsInverted(axis)) return auto;
  const span = Math.abs(auto[1] - auto[0]) || 1;
  const min = finite(axis?.limits?.min) ? axis.limits.min : undefined;
  const max = finite(axis?.limits?.max) ? axis.limits.max : undefined;
  const low =
    min ?? (max !== undefined && max <= auto[0] ? max - span : auto[0]);
  const high =
    max ?? (min !== undefined && min >= auto[1] ? min + span : auto[1]);
  return [low, high];
}

/**
 * Which of a chart's axes show numbers, and so can take bounds. Category,
 * date, and band axes have no range to set.
 */
export function numericAxes(
  settings: ChartSettings,
  isNumericField: (field: string) => boolean
): { x: boolean; y: boolean } {
  const numeric = (field?: string) =>
    Boolean(field) && (field === "__ID" || isNumericField(field!));
  switch (settings.type) {
    case "scatter":
      return { x: numeric(settings.xField), y: numeric(settings.yField) };
    case "bar":
      return {
        x:
          !settings.aggregateId &&
          !settings.seriesField &&
          numeric(settings.field),
        y: true,
      };
    case "row":
      return { x: true, y: false };
    case "boxplot":
      return { x: false, y: true };
    case "line":
      return { x: !settings.time, y: true };
    default:
      return { x: false, y: false };
  }
}
