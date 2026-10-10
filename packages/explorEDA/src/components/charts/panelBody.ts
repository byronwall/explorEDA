/** Room the chart panel's frame takes outside its header, at its default size. */
const PANEL_FRAME = 58;
/** Header height the frame allowance already covers. */
const COMPACT_HEADER = 32;
/** The details view's taller header. */
const EXPANDED_HEADER = 54;
/** Extra room the details view gives its title. */
const EXPANDED_EXTRA = 14;

/**
 * The height left for the chart once the header, note, and strips have their
 * room. Headers up to the compact height cost nothing extra, so a one-line
 * title keeps today's plot; a taller headline takes its growth from the plot.
 */
export function planPanelBody(input: {
  panelHeight: number;
  /** Measured header height; undefined before the first measurement. */
  headerHeight?: number;
  noteHeight?: number;
  /** Calculated-field and local-filter strips. */
  stripHeight?: number;
  /** Legend line, or the facet bar that holds it. */
  legendHeight?: number;
  expanded?: boolean;
}) {
  const baseline = input.expanded ? EXPANDED_HEADER : COMPACT_HEADER;
  const headerGrowth = Math.max(0, (input.headerHeight ?? baseline) - baseline);
  return Math.max(
    1,
    input.panelHeight -
      PANEL_FRAME -
      (input.expanded ? EXPANDED_EXTRA : 0) -
      headerGrowth -
      (input.noteHeight ?? 0) -
      (input.stripHeight ?? 0) -
      (input.legendHeight ?? 0)
  );
}
