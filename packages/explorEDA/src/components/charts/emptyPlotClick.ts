/**
 * Elements that select something when clicked: marks, their labels, and hit
 * areas drawn for them. Grid and axis guides are not marks, so a plain click
 * on a grid line still counts as a click on empty space.
 */
const MARK_SELECTOR = [
  "[role='button']",
  ".chart-mark",
  "[data-box-group]",
  "[data-marginal-id]",
  "[data-mark-id]",
  ".eda-sankey-label",
].join(", ");

/**
 * True when a click landed on empty plot space rather than a mark. A plain
 * click there clears the chart's filters; a click on a mark selects it.
 */
export function isEmptyPlotTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  const mark = target.closest(MARK_SELECTOR);
  return !mark || mark.matches(".chart-guide-hit, .chart-guide");
}

/** Pointer travel, in pixels, past which a press is a drag and not a click. */
export const CLICK_SLOP = 3;
