import {
  isXyMark,
  type CompositionDefinition,
  type MarkDefinition,
} from "./compositionTypes";

const TYPE_NAMES: Record<MarkDefinition["type"], string> = {
  strip: "Strip",
  point: "Points",
  path: "Path",
  band: "Band",
  summary: "Summary",
  stack: "Stack",
  waffle: "Waffle",
  bar: "Bars",
  density: "Density",
  span: "Spans",
  horizon: "Horizon",
  waterfall: "Waterfall",
  donut: "Donut",
};

/**
 * One line that says what a mark draws and from which fields, so a list of
 * marks can be scanned without opening each one: "Path · Year → GDP as
 * ranks · by Country".
 */
export function describeMark(
  mark: MarkDefinition,
  definition: CompositionDefinition
): string {
  const scaleName = (id: string | undefined) =>
    definition.scales.find((scale) => scale.id === id)?.name;
  const parts: string[] = [TYPE_NAMES[mark.type]];
  switch (mark.type) {
    case "strip": {
      const measure =
        mark.aggregation === "count"
          ? "count"
          : `${mark.aggregation} of ${mark.measureField ?? "?"}`;
      parts.push(`${scaleName(mark.positionScaleId) ?? "?"} · ${measure}`);
      break;
    }
    case "point":
    case "path": {
      const x = scaleName(mark.xScaleId) ?? "?";
      const y = mark.yScaleId ? scaleName(mark.yScaleId) : undefined;
      parts.push(
        y
          ? `${x} → ${y}${mark.rank ? " as ranks" : ""}`
          : `${x} ${mark.type === "point" && mark.spread === "swarm" ? "as a swarm" : "on a dot row"}`
      );
      if (mark.seriesField) parts.push(`by ${mark.seriesField}`);
      if (mark.colorField) parts.push(`colored by ${mark.colorField}`);
      break;
    }
    case "span":
      parts.push(
        `${scaleName(mark.xScaleId) ?? "?"} · ${mark.startField} to ${mark.endField}`
      );
      if (mark.colorField) parts.push(`colored by ${mark.colorField}`);
      break;
    case "band":
      parts.push(
        `${scaleName(mark.xScaleId) ?? "?"} · ${mark.lowerField} to ${mark.upperField}`
      );
      break;
    case "summary": {
      parts.push(`quartiles of ${mark.measureField} by ${mark.groupField}`);
      const shown = mark.parts ?? { band: true, line: true, points: true };
      const drawn = [
        shown.band && "band",
        shown.line && "median line",
        shown.points && "median dots",
      ].filter(Boolean);
      if (drawn.length < 3) parts.push(drawn.join(", ") || "nothing drawn");
      break;
    }
    case "stack":
      parts.push(
        `${mark.categoryField} · ${
          mark.aggregation === "count" ? "count" : `sum of ${mark.measureField}`
        }${mark.xScaleId ? ` across ${scaleName(mark.xScaleId) ?? "x"}` : ""}`
      );
      break;
    case "waffle":
      parts.push(
        `${mark.categoryField} · ${
          mark.normalize
            ? "100 shares"
            : mark.each > 1
              ? `one cell per ${mark.each} rows`
              : "one cell per row"
        }`
      );
      break;
    case "bar":
      parts.push(
        mark.aggregation === "count"
          ? "count"
          : `${mark.aggregation} of ${mark.measureField ?? "?"}`
      );
      if (mark.categoryField) parts.push(`split by ${mark.categoryField}`);
      break;
    case "horizon":
      parts.push(
        `${scaleName(mark.xScaleId) ?? "?"} · ${mark.field} from ${mark.baseline}${mark.relative ? " as a share" : ""} · ${mark.bands} bands`
      );
      break;
    case "waterfall":
      parts.push(
        `${mark.mode === "bridge" ? `${mark.states[0]?.label ?? "start"} to ${mark.states[1]?.label ?? "end"}` : "running total"} by ${mark.stepField}`
      );
      parts.push(
        mark.aggregation === "count"
          ? "count"
          : `sum of ${mark.measureField ?? "?"}`
      );
      if (mark.parentField) parts.push(`subtotals by ${mark.parentField}`);
      break;
    case "donut":
      parts.push(
        `${mark.categoryField} · ${mark.aggregation === "count" ? "count" : `sum of ${mark.measureField ?? "?"}`}`
      );
      if (mark.topN) parts.push(`top ${mark.topN}`);
      break;
    case "density":
      parts.push(`${scaleName(mark.xScaleId) ?? "?"} · ${mark.height} height`);
      if (mark.colorScaleId)
        parts.push(`shaded by ${scaleName(mark.colorScaleId) ?? "?"}`);
      break;
  }
  if (isXyMark(mark) && mark.frameId) parts.push("in an inset");
  return parts.join(" · ");
}
