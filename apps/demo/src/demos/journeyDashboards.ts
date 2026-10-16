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

/** Weekly signup cohorts and the share who came back each week after. */
const weeklyRetention: Chart = {
  ...base,
  id: "retention-weekly",
  type: "retention",
  title: "Fewer than half of new users are back by week 3",
  subtitle: "Share of each signup week active in each week after",
  field: "event",
  entityField: "user_id",
  timeField: "at",
  entryEvent: "signup",
  activityEvents: [
    "signup",
    "session",
    "create_project",
    "invite_team",
    "upgrade",
  ],
  period: "week",
  periods: 10,
  layout: layout(0, 0, 8, 7),
};

export const productRetentionDashboard: SavedDataStructure = {
  charts: [
    weeklyRetention,
    row(
      "retention-channel",
      "Events by channel",
      "channel",
      layout(8, 0, 4, 7)
    ),
    table(
      "retention-events",
      "Events in view",
      ["user_id", "event", "at", "channel", "device"],
      layout(0, 7, 12, 4)
    ),
  ],
  calculations: [],
  colorScales: [],
  gridSettings: grid,
  metadata: metadata("Weekly retention"),
};

/** Four weeks of room bookings, one lane per room. */
const bookingTimeline: Chart = {
  ...base,
  id: "bookings-timeline",
  type: "timeline",
  title: "Harbor and Atlas are held for days at a time",
  subtitle:
    "Room bookings, March 2025, colored by status; drag across time to select",
  field: "room",
  startField: "start",
  endField: "end",
  colorField: "status",
  layout: layout(0, 0, 12, 6),
};

export const roomBookingsDashboard: SavedDataStructure = {
  charts: [
    bookingTimeline,
    {
      ...row("bookings-team", "Bookings by team", "team", layout(0, 6, 4, 4)),
      xAxisLabel: "Bookings",
    } as Chart,
    table(
      "bookings-rows",
      "Bookings in view",
      ["booking_id", "room", "team", "start", "end", "status"],
      layout(4, 6, 8, 4)
    ),
  ],
  calculations: [],
  colorScales: [],
  gridSettings: grid,
  metadata: metadata("Room bookings"),
};
