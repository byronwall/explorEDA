import type { SavedDataStructure } from "exploreda";

type Chart = SavedDataStructure["charts"][number];

const base = {
  field: "",
  colorField: undefined,
  colorScaleId: undefined,
  xAxis: { grid: true },
  yAxis: { grid: false },
  margin: { top: 16, right: 24, bottom: 44, left: 62 },
  facet: {
    enabled: false,
    type: "wrap" as const,
    rowVariable: "",
    columnCount: 2,
  },
  xAxisLabel: "",
  yAxisLabel: "",
  xGridLines: 5,
  yGridLines: 4,
  filters: [],
};
const layout = (x: number, y: number, w: number, h: number) => ({
  x,
  y,
  w,
  h,
});
const row = (
  id: string,
  title: string,
  field: string,
  position: ReturnType<typeof layout>
): Chart => ({
  ...base,
  id,
  type: "row",
  title,
  field,
  layout: position,
  minRowHeight: 22,
  maxRowHeight: 36,
  xAxisLabel: "Events",
});
const table = (
  id: string,
  title: string,
  fields: string[],
  position: ReturnType<typeof layout>
): Chart => ({
  ...base,
  id,
  type: "data-table",
  title,
  layout: position,
  columns: fields.map((field) => ({ id: field, field })),
  sortDirection: "asc",
  globalSearch: "",
});
const metadata = (name: string) => ({
  name,
  version: 1,
  createdAt: "2026-10-13T00:00:00Z",
  modifiedAt: "2026-10-13T00:00:00Z",
});
const grid = {
  columnCount: 12,
  rowHeight: 76,
  containerPadding: 0,
  showBackgroundMarkers: false,
};

/** Visitors through signup to a paid plan, in order. */
const signupFunnel: Chart = {
  ...base,
  id: "funnel-signup",
  type: "funnel",
  title: "One visitor in 18 reaches a paid plan",
  subtitle: "Users reaching each step in order, January to June 2025",
  field: "event",
  entityField: "user_id",
  timeField: "at",
  steps: ["visit", "signup", "create_project", "invite_team", "upgrade"],
  layout: layout(0, 0, 7, 5),
};

export const productFunnelDashboard: SavedDataStructure = {
  charts: [
    signupFunnel,
    row("funnel-channel", "Events by channel", "channel", layout(7, 0, 5, 5)),
    table(
      "funnel-events",
      "Events in view",
      ["user_id", "event", "at", "channel", "device"],
      layout(0, 5, 12, 4)
    ),
  ],
  calculations: [],
  colorScales: [],
  gridSettings: grid,
  metadata: metadata("Signup funnel"),
};
