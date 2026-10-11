import { catalogue, examples, type ExampleData } from "./examples";

/** Examples drawn as composed report graphics. */
export function isComposition(example: ExampleData) {
  return (
    example.savedData?.charts.some((chart) => chart.type === "composition") ??
    false
  );
}

export interface ExampleGroup {
  id: string;
  heading: string;
  body: string;
  examples: ExampleData[];
}

const unlisted = examples.filter((example) => !example.listed);

/** Report graphics, newest first. */
export const compositionExamples = unlisted.filter(isComposition).reverse();

/** Every example, grouped the way the examples page lists them. */
export const exampleGroups: ExampleGroup[] = [
  {
    id: "analyses",
    heading: "Complete analyses",
    body: "Finished analyses with several tabs, ready to filter, inspect, and change.",
    examples: catalogue,
  },
  {
    id: "report-graphics",
    heading: "Report graphics",
    body: "Compositions: titles, repeated chart units, scales, and callouts laid out on one artboard, still linked to the data.",
    examples: compositionExamples,
  },
  {
    id: "chart-demos",
    heading: "Chart demos",
    body: "Smaller dashboards that focus on one chart type or workspace feature.",
    examples: unlisted.filter((example) => !isComposition(example)),
  },
];
