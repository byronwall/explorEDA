import { shopProject } from "./demos/multiSourceShop";
import { describe, expect, it } from "vitest";
import type { SavedDataStructure } from "exploreda";
import {
  buildTimeline,
  classifyChange,
  describeChanges,
  describeEntry,
  groupTimeline,
  pushCheckpoint,
} from "./savedViewsHistory";
import type {
  HistoryEntry,
  SavedView,
  SavedViewsSession,
} from "./savedViewsSession";

type Chart = SavedDataStructure["charts"][number];

function settings(
  overrides: Partial<SavedDataStructure> = {}
): SavedDataStructure {
  return {
    charts: [],
    calculations: [],
    gridSettings: {
      columnCount: 12,
      rowHeight: 100,
      containerPadding: 10,
      showBackgroundMarkers: true,
    },
    metadata: {
      name: "Sales",
      version: 1,
      createdAt: "2026-10-05T00:00:00.000Z",
      modifiedAt: "2026-10-05T00:00:00.000Z",
    },
    colorScales: [],
    rowsSettings: {
      columns: [],
      sortDirection: "asc",
      filters: [],
      globalSearch: "",
    },
    ...overrides,
  };
}

function chart(overrides: Partial<Chart> = {}): Chart {
  return {
    id: "c1",
    title: "Revenue by region",
    type: "bar",
    field: "region",
    layout: { x: 0, y: 0, w: 6, h: 4 },
    filters: [],
    ...overrides,
  } as Chart;
}

const view = (
  name: string,
  overrides: Partial<SavedDataStructure> = {},
  id = name
): SavedView => ({ id, name, settings: settings(overrides) });

describe("history change descriptions", () => {
  it("names chart, filter, and Rows changes with their values", () => {
    const before = [view("Sales", { charts: [chart()] })];
    const after = [
      view("Sales", {
        charts: [
          chart({
            filters: [
              { type: "value", field: "region", values: ["North", "South"] },
            ],
          }),
          chart({ id: "c2", title: "", type: "scatter", field: "revenue" }),
        ],
        rowsSettings: {
          columns: [],
          sortDirection: "asc",
          filters: [{ type: "range", field: "revenue", min: 10 }],
          globalSearch: "west",
        },
      }),
    ];
    expect(describeChanges(before, after)).toMatchObject([
      {
        kind: "filter",
        text: "Filtered “Revenue by region”",
        subject: "“Revenue by region”",
        before: undefined,
        after: "region is North, South",
        view: "Sales",
      },
      {
        kind: "chart-add",
        text: "Added “Scatter plot of revenue”",
        after: "Scatter plot",
        view: "Sales",
      },
      {
        kind: "filter",
        text: "Filtered Rows",
        before: undefined,
        after: "revenue ≥ 10",
        view: "Sales",
      },
      {
        kind: "filter",
        text: "Searched Rows for “west”",
        before: undefined,
        after: "“west”",
        view: "Sales",
      },
    ]);
  });

  it("names workspace filter changes as filter steps", () => {
    const before = [view("Sales")];
    const filtered = [
      view("Sales", {
        workspaceFilters: [
          { type: "value", field: "region", values: ["West"] },
        ],
      }),
    ];
    expect(classifyChange(before, filtered)).toBe("Filter");
    expect(describeChanges(before, filtered)).toMatchObject([
      {
        kind: "filter",
        text: "Filtered the workspace",
        after: "region is West",
        subject: "Workspace",
      },
    ]);
    expect(describeChanges(filtered, before)).toMatchObject([
      { text: "Cleared workspace filters", before: "region is West" },
    ]);
  });

  it("reports layout only when no chart was placed or removed", () => {
    const before = [view("Sales", { charts: [chart()] })];
    const moved = [
      view("Sales", {
        charts: [chart({ layout: { x: 6, y: 0, w: 6, h: 4 } })],
      }),
    ];
    expect(describeChanges(before, moved).map((change) => change.text)).toEqual(
      ["Moved or resized “Revenue by region”"]
    );
    const removed = [view("Sales")];
    expect(
      describeChanges(before, removed).map((change) => change.text)
    ).toEqual(["Removed “Revenue by region”"]);
  });

  it("names view and shared definition changes once", () => {
    const before = [view("Sales", {}, "a"), view("Web", {}, "b")];
    const calculations = [{ resultColumnName: "margin", expression: "a - b" }];
    const after = [
      view("Store", { calculations }, "a"),
      view("New view", { calculations }, "c"),
    ];
    expect(describeChanges(before, after).map((change) => change.text)).toEqual(
      [
        "Renamed view “Sales” to “Store”",
        "Created view “New view”",
        "Deleted view “Web”",
        "Added calculation “margin”",
      ]
    );
  });

  it("headlines restores and keeps the first change as detail", () => {
    const first = [view("Sales")];
    const second = [view("Sales", { charts: [chart()] })];
    const history: HistoryEntry[] = [
      { at: "2026-10-05T10:00:00.000Z", label: "View", tabs: first },
      {
        at: "2026-10-05T10:05:00.000Z",
        label: "View",
        tabs: second,
        parent: 0,
        restoredFrom: "2026-10-05T09:00:00.000Z",
      },
    ];
    const described = describeEntry({ history, path: [0, 1] }, 1);
    expect(described.headline).toMatch(/^Restored the version from /);
    expect(described.detail).toBe("Added “Revenue by region”");
    expect(described.more).toBe(0);
  });
});

describe("history timeline", () => {
  function session(
    history: HistoryEntry[],
    path: number[],
    cursor = path.length - 1
  ): SavedViewsSession {
    return {
      version: 1,
      sourceAnalysis: "",
      tabs: history[path[cursor]!]!.tabs,
      activeTabId: "Sales",
      history,
      path,
      cursor,
    };
  }
  const entry = (parent?: number): HistoryEntry => ({
    at: "2026-10-05T10:00:00.000Z",
    label: "View",
    tabs: [view("Sales")],
    parent,
  });

  it("draws the current path on lane 0 and a replaced branch beside it", () => {
    // 0 → 1 → 2, then Undo to 1 and edit: 3 replaces 2.
    const rows = buildTimeline(
      session([entry(), entry(0), entry(1), entry(1)], [0, 1, 3])
    );
    expect(rows.map((row) => [row.index, row.lane, row.state])).toEqual([
      [3, 0, "current"],
      [2, 1, "branch"],
      [1, 0, "past"],
      [0, 0, "past"],
    ]);
    const fork = rows.find((row) => row.index === 1)!;
    expect(fork.merges).toEqual([{ fromLane: 1, state: "branch" }]);
    const branch = rows.find((row) => row.index === 2)!;
    expect(branch.segments).toContainEqual({
      lane: 1,
      above: false,
      below: true,
      state: "branch",
    });
    // The main line passes the branch's row.
    expect(branch.segments).toContainEqual({
      lane: 0,
      above: true,
      below: true,
      state: "current",
    });
  });

  it("marks steps after the cursor as undone", () => {
    const rows = buildTimeline(
      session([entry(), entry(0), entry(1)], [0, 1, 2], 1)
    );
    expect(rows.map((row) => row.state)).toEqual(["future", "current", "past"]);
  });

  it("remaps parents when the oldest checkpoint drops", () => {
    let current = session([entry()], [0]);
    for (let step = 0; step < 52; step += 1) {
      current = pushCheckpoint(current, current.tabs, "Filter");
    }
    expect(current.history).toHaveLength(50);
    expect(current.history[0]!.parent).toBeUndefined();
    expect(current.history[49]!.parent).toBe(48);
    expect(current.path).toEqual(
      Array.from({ length: 50 }, (_, index) => index)
    );
  });
});

describe("history bundles", () => {
  const regionFilter = (...picked: string[]) =>
    view("Sales", {
      charts: [
        chart({
          filters: picked.length
            ? [{ type: "value", field: "region", values: picked }]
            : [],
        }),
      ],
    });
  const step = (
    minute: number,
    tabs: SavedView[],
    parent?: number,
    extra: Partial<HistoryEntry> = {}
  ): HistoryEntry => ({
    at: `2026-10-05T10:${String(minute).padStart(2, "0")}:00.000Z`,
    label: parent === undefined ? "View" : "Filter",
    tabs,
    parent,
    ...extra,
  });
  const at = Date.parse("2026-10-05T12:00:00.000Z");
  const group = (history: HistoryEntry[]) => {
    const path = history.map((_, index) => index);
    const session: SavedViewsSession = {
      version: 1,
      sourceAnalysis: "",
      tabs: history[history.length - 1]!.tabs,
      activeTabId: "Sales",
      history,
      path,
      cursor: path.length - 1,
    };
    return groupTimeline(session, buildTimeline(session), at);
  };

  it("folds related filter steps into one bundle with their net effect", () => {
    const items = group([
      step(0, [regionFilter()]),
      step(1, [regionFilter("North")], 0),
      step(2, [regionFilter("North", "South")], 1),
      step(3, [regionFilter("South")], 2),
      step(4, [regionFilter("West")], 3),
    ]);
    expect(items.map((item) => item.type)).toEqual(["step", "bundle", "step"]);
    const bundle = items[1]!;
    if (bundle.type !== "bundle") {
      throw new Error("Expected a bundle");
    }
    expect(bundle.rows.map((row) => row.index)).toEqual([3, 2, 1]);
    expect(bundle.headline).toBe("3 filter changes on “Revenue by region”");
    // The net effect skips the steps in between.
    expect(bundle.net).toMatchObject([
      { text: "Filtered “Revenue by region”", after: "region is South" },
    ]);
  });

  it("keeps deliberate actions and distant steps on their own", () => {
    const items = group([
      step(0, [regionFilter()]),
      step(1, [regionFilter("North")], 0),
      step(2, [regionFilter("South")], 1, { action: "Moved “Sales” left" }),
      step(3, [regionFilter("East")], 2),
      step(30, [regionFilter("West")], 3),
      step(31, [regionFilter("North")], 4),
    ]);
    expect(items.every((item) => item.type === "step")).toBe(true);
  });

  it("adds day headings when the history spans several days", () => {
    const history = [
      step(0, [regionFilter()]),
      step(1, [regionFilter("North")], 0),
    ];
    history[0]!.at = "2026-10-04T10:00:00.000Z";
    const items = group(history);
    expect(
      items.filter((item) => item.type === "day").map((item) => item.type)
    ).toHaveLength(2);
    expect(items[0]).toMatchObject({ type: "day", label: "Today" });
  });
});

it("checkpoints query bindings and definitions together", () => {
  const initial = makeProjectSession();
  const project = { ...initial.project!, relationships: [] };
  const tabs = initial.tabs.map((tab) => ({
    ...tab,
    queryId: "items-by-order",
    bindings: { customer: "C1" },
  }));
  const changed = pushCheckpoint(initial, tabs, undefined, undefined, project);
  expect(changed.history.at(-1)?.project).toEqual(project);
  expect(changed.history.at(-1)?.tabs[0]?.queryId).toBe("items-by-order");
  expect(initial.history[0]?.project?.relationships).not.toHaveLength(0);
  expect(classifyChange(initial.tabs, changed.tabs)).toBe("View");
});

function makeProjectSession(): SavedViewsSession {
  const { project } = structuredClone(shopProject);
  const tabs = [
    { id: "order-view", name: "Orders", queryId: "orders-by-customer" },
  ];
  return {
    version: 1,
    sourceAnalysis: "",
    project,
    tabs,
    activeTabId: "order-view",
    history: [{ at: "2026-10-05", label: "View", tabs, project }],
    path: [0],
    cursor: 0,
  };
}
