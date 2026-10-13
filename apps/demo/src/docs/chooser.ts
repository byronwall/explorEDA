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
