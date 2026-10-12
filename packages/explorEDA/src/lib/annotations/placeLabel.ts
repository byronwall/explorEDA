/** Room a label may run past the plot, into the chart's margins. */
const LABEL_OVERHANG = 12;

/**
 * Keeps a callout label readable at the plot's edges without overriding
 * the user's offset: a label that would run off one side reads from its
 * other end, and one past the top or bottom stops at the edge.
 */
export function placeLabel(
  lx: number,
  ly: number,
  anchor: "start" | "end",
  width: number,
  lineCount: number,
  plotWidth: number,
  plotHeight: number,
  fontSize: number
) {
  let next = anchor;
  if (anchor === "start" && lx + width > plotWidth + LABEL_OVERHANG)
    next = "end";
  else if (anchor === "end" && lx - width < -LABEL_OVERHANG) next = "start";
  const height = lineCount * fontSize * 1.2;
  const top = -LABEL_OVERHANG + fontSize / 2;
  const bottom = plotHeight + LABEL_OVERHANG - height + fontSize / 2;
  return {
    lx,
    ly: Math.min(Math.max(ly, top), Math.max(top, bottom)),
    anchor: next,
  };
}
