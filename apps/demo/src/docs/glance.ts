/**
 * The "At a glance" strip on each chart page: what the chart answers, what
 * it needs, and the gestures it takes. The gestures follow each chart's own
 * status-line hint and accessible description, so keep them in step when a
 * chart's interactions change. The docs gate fails for a chart page without
 * an entry here.
 */
export type Glance = {
  /** The question the chart answers, as one phrase. */
  useFor: string;
  /** The fields it needs before it can draw. */
  needs: string;
  /** Gestures on the chart, each with what it does. */
  gestures: readonly (readonly [gesture: string, effect: string])[];
};

export const GLANCES: Readonly<Record<string, Glance>> = {
  scatter: {
    useFor:
      "Seeing how two fields relate row by row: trends, clusters, and outliers.",
    needs: "An X field and a Y field. Color and size fields are optional.",
    gestures: [
      ["Drag", "Select a rectangle on both axes"],
      ["Alt-click", "Trace a point to its source values"],
    ],
  },
  bar: {
    useFor:
      "Comparing category counts, a numeric field's distribution, or a measure per group.",
    needs:
      "One field to count or bin. A series field or grouped summary is optional.",
    gestures: [
      ["Click", "Select a category"],
      ["Drag", "Select a range of bins"],
      ["Alt-click", "Inspect how a bar was computed"],
    ],
  },
  row: {
    useFor: "Comparing counts across many categories, or long category names.",
    needs: "One category field.",
    gestures: [["Click", "Select a category by its bar or label"]],
  },
  line: {
    useFor: "Following a measure over dates, or along a numeric field.",
    needs: "A date or numeric X field, and one or more series.",
    gestures: [
      ["Click", "Select a period and series, on a date axis"],
      ["Drag", "Select a range, on a numeric axis"],
      ["Alt-click", "Inspect a point's records"],
    ],
  },
  boxplot: {
    useFor:
      "Comparing how a numeric field spreads across groups, and spotting values that stand apart.",
    needs: "A numeric field and a group field.",
    gestures: [
      ["Click", "Select or clear a group"],
      ["Alt-click", "Inspect a group"],
    ],
  },
  ecdf: {
    useFor:
      "Reading what share of rows fall below or above any value, with no bins to choose.",
    needs: "A numeric field. A split field is optional.",
    gestures: [
      ["Click", "Select every row up to, or from, a value"],
      ["Drag", "Select a span of values"],
      ["Alt-Enter", "Trace the focused value"],
    ],
  },
  heatmap: {
    useFor:
      "Comparing a count or a measure across every pair of values of two categories.",
    needs: "Two category fields. A measure is optional.",
    gestures: [
      ["Click", "Select a cell or a label"],
      ["Alt-click", "Inspect a cell"],
    ],
  },
  calendar: {
    useFor: "Seeing weekday rhythm and seasonal runs across a year of days.",
    needs: "A date field. A measure is optional.",
    gestures: [
      ["Click", "Select a day"],
      ["Shift-click", "Extend the selection"],
    ],
  },
  hierarchy: {
    useFor: "Seeing how a total divides through nested categories.",
    needs: "One to three category fields. A measure to sum is optional.",
    gestures: [
      ["Click", "Select a branch"],
      ["Double-click", "Zoom into a branch"],
    ],
  },
  sankey: {
    useFor: "Following rows through a sequence of categories.",
    needs: "Category fields as stages, in order. A measure is optional.",
    gestures: [["Click", "Select a value or a flow"]],
  },
  "parallel-coordinates": {
    useFor: "Comparing many numeric fields at once, one line per row.",
    needs: "Several numeric fields, one per axis.",
    gestures: [["Drag along an axis", "Select a range on it"]],
  },
  "scatter-matrix": {
    useFor:
      "Seeing every pairing of a set of fields before choosing one to chart.",
    needs: "Several numeric or category fields. A color field is optional.",
    gestures: [
      ["Drag in a cell", "Select ranges on its two fields"],
      ["Click a mark", "Select its values"],
      ["Alt-click", "Trace a mark"],
    ],
  },
  "3d-scatter": {
    useFor: "Seeing a shape that three numeric fields describe together.",
    needs: "X, Y, and Z numeric fields. Color and size are optional.",
    gestures: [
      ["Drag", "Turn the scene"],
      ["Scroll", "Zoom"],
      ["Right-drag", "Pan"],
    ],
  },
  map: {
    useFor: "Placing rows by location, or shading regions by a measure.",
    needs:
      "Latitude and longitude fields, or a key that matches a region in a GeoJSON file.",
    gestures: [
      ["Click", "Select a point's row or a region's rows"],
      ["Drag", "Pan the map"],
    ],
  },
  composition: {
    useFor:
      "Building a custom graphic from text, guides, and chart units bound to your rows.",
    needs: "The fields its chart units and text use.",
    gestures: [
      ["Click a repeat", "Filter by its value"],
      ["Alt-click a mark", "Trace it"],
    ],
  },
  "data-table": {
    useFor: "Reading, sorting, and searching the rows themselves.",
    needs: "Nothing to start: every field becomes a column.",
    gestures: [
      ["Click a heading", "Sort by that column"],
      ["Right-click", "Filter, sort, move, hide, or copy"],
    ],
  },
  pivot: {
    useFor: "Grouping rows and summarizing measures in a grid, with totals.",
    needs: "Fields to group rows by, and value fields with an aggregation.",
    gestures: [["Click a column heading", "Select that value"]],
  },
  summary: {
    useFor: "Profiling every field at once, before you choose charts.",
    needs: "Nothing: every field gets a row.",
    gestures: [],
  },
  funnel: {
    useFor:
      "Seeing how many people or accounts reach each step of a process, in order, and where they drop off.",
    needs:
      "An event log: an entity field, an event field, and a time field. Steps are event values.",
    gestures: [
      ["Click a step", "Select every event of the entities that reached it"],
      ["Alt-click", "Trace a step to its rule, drop-off, and counted events"],
    ],
  },
  timeline: {
    useFor:
      "Seeing who or what was busy when, such as room bookings, machine jobs, or shifts, and what overlapped a stretch of time.",
    needs:
      "A lane field and start and end fields. A blank end means the row has not ended.",
    gestures: [
      ["Drag across time", "Keep every row that overlaps that window"],
      ["Click a bar", "Select its row"],
      ["Alt-click", "Trace a bar to its start, end, and the window"],
    ],
  },
  retention: {
    useFor:
      "Seeing whether people who started in a given week or month keep coming back, and how that changes from cohort to cohort.",
    needs:
      "An event log: an entity field and a time field. An event field is optional, to choose the entry event and what counts as active.",
    gestures: [
      ["Click a cell", "Select every event of the entities active in it"],
      ["Alt-click", "Trace a cell to its cohort, rate, and counted events"],
    ],
  },
  donut: {
    useFor:
      "Showing how a small whole divides among a few categories, such as revenue by channel.",
    needs: "A category field. A measure to sum is optional.",
    gestures: [
      ["Click a slice or legend entry", "Select its category"],
      ["Click Other", "Select every category it pools"],
      ["Alt-click", "Trace a slice to its share and source rows"],
    ],
  },
  waterfall: {
    useFor:
      "Explaining how one total became another, such as plan to actual, or following a running total through ordered steps.",
    needs:
      "A measure and a step field. A bridge also needs two states, each the rows it counts.",
    gestures: [
      ["Click a step", "Select its rows in both states"],
      ["Click a subtotal", "Select every step in its group"],
      ["Click the start or end", "Select that state's rows"],
      ["Alt-click", "Trace a bar to both states' rows"],
    ],
  },
  "metric-card": {
    useFor: "Showing one headline number for the rows that pass every filter.",
    needs: "Nothing for a row count, or a measure field to summarize.",
    gestures: [["Alt-click", "List the rows behind the value"]],
  },
  "color-legend": {
    useFor:
      "Explaining shared colors once, for every chart that uses the same scale.",
    needs: "The fields whose color scales it shows.",
    gestures: [["Alt-click a field", "Trace its color scale"]],
  },
  markdown: {
    useFor: "Explaining a dashboard in formatted text, beside its charts.",
    needs: "Nothing: just write.",
    gestures: [],
  },
};
