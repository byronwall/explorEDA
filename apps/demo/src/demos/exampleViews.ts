import type { AnalysisView, SavedDataStructure } from "exploreda";
import {
  penguinDashboard,
  shopDashboard,
  timeSeriesDashboard,
} from "./dashboardSettings";

type Chart = SavedDataStructure["charts"][number];
type Filter = Chart["filters"][number];
type Layout = Chart["layout"];

/** A saved tab an example opens with beside its main view. */
export interface ExampleView {
  name: string;
  savedData: SavedDataStructure;
  queryId?: string;
  bindings?: AnalysisView["bindings"];
}

const at = (x: number, y: number, w: number, h: number): Layout => ({
  x,
  y,
  w,
  h,
});

const values = (field: string, ...picked: string[]): Filter => ({
  type: "value",
  field,
  values: picked,
});

/**
 * Builds a second view from an example's dashboard. It keeps the shared
 * definitions, so calculations, colors, and field settings match every tab.
 */
function view(
  source: SavedDataStructure,
  name: string,
  charts: Array<
    [id: string, layout: Layout, filters?: Filter[], text?: Partial<Chart>]
  >,
  extra: Partial<SavedDataStructure> = {}
): ExampleView {
  const byId = new Map(source.charts.map((chart) => [chart.id, chart]));
  return {
    name,
    savedData: {
      ...source,
      ...extra,
      metadata: { ...source.metadata, name },
      charts: charts.map(([id, layout, filters, text]) => {
        const chart = byId.get(id);
        if (!chart) {
          throw new Error(`Example view ${name} has no chart ${id}`);
        }
        return {
          ...chart,
          ...text,
          layout,
          filters: filters ?? chart.filters,
        } as Chart;
      }),
    },
  };
}

export const shopViews: ExampleView[] = [
  view(shopDashboard, "Web orders", [
    ["shop-count", at(0, 0, 4, 2)],
    ["shop-revenue", at(4, 0, 4, 2)],
    ["shop-average", at(8, 0, 4, 2)],
    ["shop-channel", at(0, 2, 4, 5), [values("Channel", "Web")]],
    ["shop-category", at(4, 2, 4, 5)],
    ["shop-region", at(8, 2, 4, 5)],
    ["shop-orders", at(0, 7, 12, 5)],
  ]),
  view(shopDashboard, "Delivery and returns", [
    ["shop-delivery", at(0, 0, 6, 5)],
    ["shop-flow", at(6, 0, 6, 5)],
    ["shop-order", at(0, 5, 6, 5)],
    ["shop-count", at(6, 5, 6, 2)],
    ["shop-orders", at(0, 10, 12, 5)],
  ]),
];

export const penguinViews: ExampleView[] = [
  view(penguinDashboard, "Gentoo on Biscoe", [
    ["penguin-species", at(0, 0, 3, 5), [values("species", "Gentoo")]],
    ["penguin-island", at(3, 0, 3, 5), [values("island", "Biscoe")]],
    ["penguin-size", at(6, 0, 6, 5)],
    ["penguin-records", at(0, 5, 12, 5)],
  ]),
  view(penguinDashboard, "Bill shape", [
    ["penguin-bill", at(0, 0, 7, 6)],
    ["penguin-species", at(7, 0, 5, 6)],
    ["penguin-mass", at(0, 6, 6, 5)],
    ["penguin-flipper", at(6, 6, 6, 5)],
  ]),
  // The same charts written up as a newspaper graphic.
  view(
    penguinDashboard,
    "Field report",
    [
      [
        "penguin-size",
        at(0, 0, 7, 6),
        undefined,
        {
          title: "Gentoo penguins are the heavyweights",
          subtitle:
            "Body mass (g) against flipper length (mm), 344 birds, Palmer Archipelago 2007–09",
          note: "Source: Palmer Station LTER; Gorman, Williams and Fraser (2014)",
        },
      ],
      [
        "penguin-species",
        at(7, 0, 5, 6),
        undefined,
        {
          title: "Adelie make up almost half the sample",
          subtitle: "Penguins measured, by species",
        },
      ],
      [
        "penguin-bill",
        at(0, 6, 7, 6),
        undefined,
        {
          title: "Bill shape tells the species apart",
          subtitle: "Bill depth against bill length (mm)",
          note: "Species that overlap in body size separate by bill shape.",
        },
      ],
      [
        "penguin-mass",
        at(7, 6, 5, 6),
        undefined,
        {
          title: "Chinstrap and Adelie weigh about the same",
          subtitle: "Body mass (g) by species",
        },
      ],
    ],
    { theme: { id: "newsprint" } }
  ),
];

export const calendarViews: ExampleView[] = [
  view(timeSeriesDashboard, "Web channel", [
    ["time-channels", at(0, 0, 4, 4), [values("Channel", "Web")]],
    ["time-count", at(0, 4, 4, 2)],
    ["time-revenue", at(4, 0, 8, 6)],
    ["time-records", at(0, 6, 12, 5)],
  ]),
  view(timeSeriesDashboard, "Daily rhythm", [
    ["time-calendar", at(0, 0, 8, 5)],
    ["time-count", at(8, 0, 4, 2)],
    ["time-channels", at(8, 2, 4, 3)],
    ["time-weekly", at(0, 5, 12, 5)],
  ]),
];
