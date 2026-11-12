/**
 * The index page's "Which chart?" guide: a question a reader brings, and the
 * chart types that answer it, best first, each with why. The docs gate fails
 * for a chart type here that has no page.
 */
export type ChartQuestion = {
  id: string;
  question: string;
  picks: readonly (readonly [chartType: string, why: string])[];
};

export const CHART_QUESTIONS: readonly ChartQuestion[] = [
  {
    id: "compare",
    question: "Which category is biggest?",
    picks: [
      ["bar", "Counts or a measure per category, side by side."],
      ["row", "The same, when there are many categories or long names."],
      ["pivot", "Exact values per group, with totals."],
    ],
  },
  {
    id: "distribution",
    question: "How are the values spread?",
    picks: [
      ["bar", "Bin a numeric field into a histogram."],
      ["boxplot", "Compare spreads across groups, with outliers."],
      ["ecdf", "Read any percentile, with no bins to choose."],
    ],
  },
  {
    id: "relationship",
    question: "Do two measures move together?",
    picks: [
      ["scatter", "One point per row, with fits and density displays."],
      ["scatter-matrix", "Every pair of several fields at once."],
      ["heatmap", "Two categories crossed, shaded by a count or measure."],
    ],
  },
  {
    id: "time",
    question: "How does it change over time?",
    picks: [
      ["line", "A measure per day, week, month, or year, by series."],
      ["calendar", "Daily values laid out by week, to see rhythms."],
      ["funnel", "How many reach each step of an event log, in order."],
      ["retention", "Whether each start cohort keeps coming back."],
      ["timeline", "Bookings, shifts, or jobs from start to end, by lane."],
    ],
  },
  {
    id: "change",
    question: "What moved the total?",
    picks: [
      [
        "waterfall",
        "One total to another, such as plan to actual, a step per category.",
      ],
      ["bar", "Grouped bars of each category in both periods."],
    ],
  },
  {
    id: "parts",
    question: "What is the total made of?",
    picks: [
      ["hierarchy", "Nested categories as a treemap, icicle, or sunburst."],
      ["sankey", "How rows flow through a sequence of categories."],
      ["bar", "Stacked or 100% bars split by a second field."],
      ["donut", "A few categories' shares of one small whole."],
    ],
  },
  {
    id: "profile",
    question: "What is in this data?",
    picks: [
      ["summary", "Every field's statistics and distribution."],
      ["data-table", "The rows themselves, sortable and searchable."],
      [
        "joint-missingness",
        "Which fields are missing together, and how often.",
      ],
      ["parallel-coordinates", "Every row across many numeric fields."],
    ],
  },
  {
    id: "where",
    question: "Where does it happen?",
    picks: [
      ["map", "Points by latitude and longitude, or shaded regions."],
      ["3d-scatter", "A shape that three numeric fields describe."],
    ],
  },
  {
    id: "headline",
    question: "What is the one number?",
    picks: [
      [
        "metric-card",
        "A count or summary for the rows that pass every filter.",
      ],
      ["markdown", "Notes that explain it beside the charts."],
    ],
  },
];

/**
 * The note near the top of each chart page: when to pick this chart, and the
 * lookalikes to pick instead. Each `when` completes "Use this when …" or
 * "Use <chart> instead when …". The docs tests fail for a chart page with no
 * entry, or for a lookalike with no page.
 */
export type ChartChoice = {
  when: string;
  instead: readonly (readonly [chartType: string, when: string])[];
};

export const CHART_CHOICES: Readonly<Record<string, ChartChoice>> = {
  scatter: {
    when: "you compare two numeric fields row by row, to find trends, clusters, or outliers.",
    instead: [
      ["scatter-matrix", "you do not yet know which pair of fields to plot."],
      ["heatmap", "both fields are categories."],
      ["3d-scatter", "a third numeric field is part of the shape."],
    ],
  },
  bar: {
    when: "you compare a few categories, bin one numeric field, or compare a mix across groups.",
    instead: [
      ["row", "there are many categories, or their names are long."],
      ["donut", "you show a few shares of one small whole."],
      ["waterfall", "you explain how one total became another."],
    ],
  },
  row: {
    when: "you rank many categories, or the names are too long for a column axis.",
    instead: [
      ["bar", "there are few categories, or you split each bar by a series."],
      ["pivot", "readers need exact values and totals."],
    ],
  },
  line: {
    when: "a measure changes over dates or along a numeric field, and you compare series.",
    instead: [
      ["timeline", "each row has a start and an end, not one point in time."],
      ["calendar", "you look for weekday or seasonal rhythm in daily values."],
      ["retention", "you follow whether each start cohort comes back."],
    ],
  },
  boxplot: {
    when: "you compare the spread of one numeric field across groups, with outliers.",
    instead: [
      ["ecdf", "you read exact percentiles, or compare whole distributions."],
      ["bar", "you need the shape of one distribution as a histogram."],
    ],
  },
  ecdf: {
    when: "you ask what share of rows fall below or above a value, with no bins to choose.",
    instead: [
      ["boxplot", "you compare medians and spread across many groups at once."],
      ["bar", "readers expect a histogram of counts per bin."],
    ],
  },
  heatmap: {
    when: "you cross two category fields and shade every pair by a count or measure.",
    instead: [
      ["calendar", "one axis is the days of a year, laid out by week."],
      ["pivot", "readers need the exact numbers, with totals."],
      ["scatter", "both fields are numeric."],
    ],
  },
  calendar: {
    when: "you look for weekday rhythm and seasonal runs in one year of daily values.",
    instead: [
      ["line", "you follow a trend over many years, or compare series."],
      ["heatmap", "you cross two category fields, such as weekday and hour."],
    ],
  },
  hierarchy: {
    when: "a total divides through one to three nested category fields.",
    instead: [
      [
        "sankey",
        "rows move from stage to stage, and the order of stages matters.",
      ],
      ["bar", "there is one level, and you compare its categories."],
      ["donut", "there is one level with a few parts."],
    ],
  },
  donut: {
    when: "you show how a few categories share one small whole.",
    instead: [
      [
        "bar",
        "there are many categories, or you compare the mix across groups.",
      ],
      ["hierarchy", "the categories nest inside each other."],
      ["waterfall", "some values are negative, such as profit."],
    ],
  },
  funnel: {
    when: "each row is one event, and you count who reaches each step in order.",
    instead: [
      ["sankey", "each row is already one path through category fields."],
      [
        "retention",
        "you ask whether people come back over time, not which steps they reach.",
      ],
    ],
  },
  retention: {
    when: "each row is one event, and you ask whether each start cohort keeps coming back.",
    instead: [
      [
        "line",
        "you need total activity per period, new and returning together.",
      ],
      ["funnel", "you count who reaches each step of a sequence."],
    ],
  },
  "joint-missingness": {
    when: "you need to know which fields are missing together, and how many rows are complete.",
    instead: [
      ["summary", "one missing count per field is enough."],
      ["data-table", "you need to read the rows with gaps."],
    ],
  },
  timeline: {
    when: "each row has a start and an end, and you see what was busy or overlapped in each lane.",
    instead: [
      ["line", "each row is one point in time, and you follow a measure."],
      [
        "composition",
        "you lay out a finished graphic of spans, not an exploring chart.",
      ],
    ],
  },
  waterfall: {
    when: "you explain how one total became another, or follow a running total through ordered steps.",
    instead: [
      [
        "bar",
        "you compare the two periods side by side, not their difference.",
      ],
      [
        "line",
        "the steps are many dates, and the trend matters more than each change.",
      ],
    ],
  },
  sankey: {
    when: "each row is one path through two or more category fields, and you follow the flows.",
    instead: [
      [
        "funnel",
        "each row is one event, and the path is built from events in time order.",
      ],
      ["hierarchy", "the fields nest, and you show how a total divides."],
      ["heatmap", "there are only two fields, and you compare every pair."],
    ],
  },
  "parallel-coordinates": {
    when: "you follow each row across many numeric fields, and select ranges on several axes.",
    instead: [
      ["scatter-matrix", "you look for relations between pairs of fields."],
      ["scatter", "only two fields matter."],
    ],
  },
  "scatter-matrix": {
    when: "you check every pair of several fields before you choose one to chart.",
    instead: [
      ["scatter", "you already know the pair, and need fits or labels."],
      ["parallel-coordinates", "you follow single rows across many fields."],
    ],
  },
  "3d-scatter": {
    when: "the shape that three numeric fields make together is the point.",
    instead: [
      ["scatter", "two fields carry the story, or readers need exact values."],
      ["scatter-matrix", "you compare each pair of the three fields."],
    ],
  },
  map: {
    when: "rows have a latitude and longitude, or a key that matches a region.",
    instead: [
      ["bar", "place is only a category, and you compare its totals."],
      ["3d-scatter", "the three axes are numeric fields, not a place."],
    ],
  },
  composition: {
    when: "the layout itself carries meaning, and no built-in chart draws it.",
    instead: [
      ["scatter", "a labeled bubble scatter is enough."],
      ["bar", "you show shares of each group's total."],
      ["timeline", "you explore spans in time, linked to other charts."],
    ],
  },
  "data-table": {
    when: "you need to read, sort, or search the rows themselves.",
    instead: [
      ["pivot", "you need totals per group, not single rows."],
      ["summary", "you need a profile of each field."],
    ],
  },
  pivot: {
    when: "you need exact grouped values with totals in a grid.",
    instead: [
      ["heatmap", "a shade per cell shows the pattern better than numbers."],
      ["data-table", "you need the single rows."],
    ],
  },
  summary: {
    when: "you open new data and need each field's statistics before you choose charts.",
    instead: [
      [
        "joint-missingness",
        "you need to know which fields are missing together.",
      ],
      ["data-table", "you need the rows themselves."],
    ],
  },
  "metric-card": {
    when: "one headline number for the filtered rows is the answer.",
    instead: [
      ["bar", "the number splits into categories you compare."],
      ["line", "the number changes over time."],
    ],
  },
  "color-legend": {
    when: "several charts share one color scale, and you explain it once.",
    instead: [["markdown", "you explain the dashboard in words, not colors."]],
  },
  markdown: {
    when: "you explain a dashboard in formatted text beside its charts.",
    instead: [
      ["metric-card", "the text is one number that must follow the filters."],
      ["color-legend", "you explain shared colors."],
    ],
  },
};
