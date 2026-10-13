import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { planAccumulate, planBridge, type BridgeInput } from "./waterfallPlan";

/** Net budget lines: income is positive, costs negative; two quarters each. */
const LINES = [
  ["Income", "Tuition", [400, 410], [420, 430]],
  ["Income", "Grants", [150, 150], [130, 140]],
  ["Income", "Donations", [40, 60], [55, 70]],
  ["Income", "Interest", [10, 10], [12, 9]],
  ["Costs", "Salaries", [-250, -250], [-260, -265]],
  ["Costs", "Travel", [-30, -20], [-18, -22]],
  ["Costs", "Equipment", [-60, -40], [-75, -50]],
  ["Costs", "Rent", [-45, -45], [-45, -45]],
] as const;

type Row = Record<string, datum>;

const wide: Row[] = LINES.flatMap(([group, line, plan, actual]) =>
  [0, 1].map((quarter) => ({
    group,
    line,
    quarter: `Q${quarter + 1}`,
    plan: plan[quarter],
    actual: actual[quarter],
  }))
);

const long: Row[] = LINES.flatMap(([group, line, plan, actual]) =>
  [0, 1].flatMap((quarter) => [
    {
      group,
      line,
      quarter: `Q${quarter + 1}`,
      scenario: "Plan",
      amount: plan[quarter],
    },
    {
      group,
      line,
      quarter: `Q${quarter + 1}`,
      scenario: "Actual",
      amount: actual[quarter],
    },
  ])
);

const column = (rows: Row[], field: string) =>
  Object.fromEntries(rows.map((row, id) => [id, row[field]])) as Record<
    number,
    datum
  >;

const ids = (rows: Row[]) => rows.map((_, id) => id);

function wideInput(rows = wide, live = ids(rows)): BridgeInput {
  return {
    ids: live,
    orderIds: ids(rows),
    step: column(rows, "line"),
    parent: column(rows, "group"),
    aggregation: "sum",
    states: [
      { label: "Plan", measure: column(rows, "plan"), includes: () => true },
      {
        label: "Actual",
        measure: column(rows, "actual"),
        includes: () => true,
      },
    ],
  };
}

function longInput(rows = long, live = ids(rows)): BridgeInput {
  const scenario = column(rows, "scenario");
  const amount = column(rows, "amount");
  return {
    ids: live,
    orderIds: ids(rows),
    step: column(rows, "line"),
    parent: column(rows, "group"),
    aggregation: "sum",
    states: [
      {
        label: "Plan",
        measure: amount,
        includes: (id) => scenario[id] === "Plan",
      },
      {
        label: "Actual",
        measure: amount,
        includes: (id) => scenario[id] === "Actual",
      },
    ],
  };
}

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);
const shape = (bars: ReturnType<typeof planBridge>["bars"]) =>
  bars.map(({ key, kind, label, amount, from, to }) => ({
    key,
    kind,
    label,
    amount,
    from,
    to,
  }));

describe("planBridge", () => {
  it("draws the same bars from two columns and from a scenario column", () => {
    expect(shape(planBridge(wideInput()).bars)).toEqual(
      shape(planBridge(longInput()).bars)
    );
  });

  it("makes each step the line's actual minus its plan", () => {
    const { bars } = planBridge(wideInput());
    for (const [, line, plan, actual] of LINES) {
      const bar = bars.find((item) => item.label === line)!;
      expect(bar.kind).toBe("step");
      expect(bar.amount).toBe(sum(actual) - sum(plan));
    }
  });

  it("starts at the plan total and ends at the actual total", () => {
    const { bars } = planBridge(wideInput());
    const plan = sum(LINES.flatMap(([, , values]) => values));
    const actual = sum(LINES.flatMap(([, , , values]) => values));
    expect(bars[0]).toMatchObject({ kind: "start", to: plan });
    expect(bars.at(-1)).toMatchObject({ kind: "end", to: actual });
    const steps = bars.filter((bar) => bar.kind === "step");
    expect(plan + sum(steps.map((bar) => bar.amount))).toBe(actual);
  });

  it("orders steps by group, closing each group with its running subtotal", () => {
    const { bars } = planBridge(wideInput());
    expect(bars.map((bar) => bar.label)).toEqual([
      "Plan",
      "Tuition",
      "Grants",
      "Donations",
      "Interest",
      "Income",
      "Salaries",
      "Travel",
      "Equipment",
      "Rent",
      "Costs",
      "Actual",
    ]);
    const income = bars.find(
      (bar) => bar.key.startsWith("subtotal") && bar.label === "Income"
    )!;
    const lastIncomeStep = bars.find((bar) => bar.label === "Interest")!;
    expect(income).toMatchObject({ from: 0, to: lastIncomeStep.to });
    expect(income.members).toEqual([
      "Tuition",
      "Grants",
      "Donations",
      "Interest",
    ]);
    // The last subtotal lands on the end.
    expect(bars.at(-2)!.to).toBe(bars.at(-1)!.to);
  });

  it("floats each step from the running total before it", () => {
    const { bars } = planBridge(wideInput());
    for (let index = 1; index < bars.length; index++) {
      const bar = bars[index]!;
      if (bar.kind !== "step") continue;
      const previous = bars[index - 1]!;
      expect(bar.from).toBe(previous.to);
    }
  });

  it("keeps each state's source rows behind a step", () => {
    const { bars } = planBridge(longInput());
    const grants = bars.find((bar) => bar.label === "Grants")!;
    const [plan, actual] = grants.states!;
    const scenario = column(long, "scenario");
    expect(plan.contributors.map((item) => scenario[item.sourceId])).toEqual([
      "Plan",
      "Plan",
    ]);
    expect(actual.contributors.map((item) => scenario[item.sourceId])).toEqual([
      "Actual",
      "Actual",
    ]);
    expect(plan.value).toBe(300);
    expect(actual.value).toBe(270);
  });

  it("counts a line missing from one state as zero there", () => {
    const rows = [
      ...long,
      {
        group: "Costs",
        line: "Consulting",
        quarter: "Q2",
        scenario: "Actual",
        amount: -25,
      },
    ];
    const { bars } = planBridge(longInput(rows));
    const consulting = bars.find((bar) => bar.label === "Consulting")!;
    expect(consulting).toMatchObject({ amount: -25, missingFrom: 0 });
    expect(consulting.states![0].rowCount).toBe(0);
  });

  it("reports a state left with no rows instead of drawing zeros", () => {
    const actualOnly = ids(long).filter(
      (id) => long[id]!.scenario === "Actual"
    );
    const plan = planBridge(longInput(long, actualOnly));
    expect(plan.bars).toEqual([]);
    expect(plan.message).toBe("Plan has no rows under the current filters.");
  });

  it("bridges over the rows other charts leave", () => {
    const q1 = ids(wide).filter((id) => wide[id]!.quarter === "Q1");
    const { bars } = planBridge(wideInput(wide, q1));
    expect(bars[0]!.to).toBe(sum(LINES.map(([, , plan]) => plan[0])));
    expect(bars.at(-1)!.to).toBe(sum(LINES.map(([, , , actual]) => actual[0])));
  });

  it("bridges row counts without a measure", () => {
    const scenario = column(long, "scenario");
    const { bars } = planBridge({
      ...longInput(),
      aggregation: "count",
      parent: undefined,
      states: [
        { label: "Plan", includes: (id) => scenario[id] === "Plan" },
        { label: "Actual", includes: (id) => scenario[id] === "Actual" },
      ],
    });
    expect(bars[0]!.to).toBe(16);
    expect(
      bars.filter((bar) => bar.kind === "step").every((bar) => bar.amount === 0)
    ).toBe(true);
    expect(bars.some((bar) => bar.kind === "subtotal")).toBe(false);
  });
});

describe("planAccumulate", () => {
  /** A battery's energy flows in kWh: charging is positive. */
  const flows: Row[] = [
    { hour: 6, period: "Morning", flow: "Solar", energy: 4 },
    { hour: 0, period: "Night", flow: "Load", energy: -3 },
    { hour: 6, period: "Morning", flow: "Load", energy: -5 },
    { hour: 12, period: "Midday", flow: "Solar", energy: 12 },
    { hour: 0, period: "Night", flow: "Grid", energy: 6 },
    { hour: 12, period: "Midday", flow: "Load", energy: -4 },
    { hour: 18, period: "Evening", flow: "Load", energy: -9 },
  ];
  const input = (rows = flows, live = ids(rows)) => ({
    ids: live,
    orderIds: ids(rows),
    step: column(rows, "hour"),
    aggregation: "sum" as const,
    measure: column(rows, "energy"),
    labels: ["Charge at midnight", "Charge at day's end"] as [string, string],
  });

  it("runs numeric steps in sequence from the start value", () => {
    const { bars } = planAccumulate({ ...input(), startValue: 20 });
    expect(shape(bars)).toEqual([
      {
        key: "start",
        kind: "start",
        label: "Charge at midnight",
        amount: 20,
        from: 0,
        to: 20,
      },
      {
        key: 'step:["number",0]',
        kind: "step",
        label: "0",
        amount: 3,
        from: 20,
        to: 23,
      },
      {
        key: 'step:["number",6]',
        kind: "step",
        label: "6",
        amount: -1,
        from: 23,
        to: 22,
      },
      {
        key: 'step:["number",12]',
        kind: "step",
        label: "12",
        amount: 8,
        from: 22,
        to: 30,
      },
      {
        key: 'step:["number",18]',
        kind: "step",
        label: "18",
        amount: -9,
        from: 30,
        to: 21,
      },
      {
        key: "end",
        kind: "end",
        label: "Charge at day's end",
        amount: 21,
        from: 0,
        to: 21,
      },
    ]);
  });

  it("starts from zero without a start bar when no start value is set", () => {
    const { bars } = planAccumulate(input());
    expect(bars[0]!.kind).toBe("step");
    expect(bars.at(-1)).toMatchObject({ kind: "end", to: 1 });
  });

  it("keeps each step's rows and every row behind the end", () => {
    const { bars } = planAccumulate(input());
    expect(bars[0]!.rows!.contributors.map((item) => item.sourceId)).toEqual([
      1, 4,
    ]);
    expect(bars.at(-1)!.rows!.rowCount).toBe(flows.length);
  });

  it("orders date steps in time and other steps in data order", () => {
    const dated: Row[] = [
      { day: "2026-03-02", energy: 2 },
      { day: "2026-03-01", energy: 1 },
    ];
    const byDate = planAccumulate({
      ...input(dated),
      step: column(dated, "day"),
      measure: column(dated, "energy"),
    });
    expect(byDate.bars.map((bar) => bar.label)).toEqual([
      "2026-03-01",
      "2026-03-02",
      "Charge at day's end",
    ]);
    const byFlow = planAccumulate({ ...input(), step: column(flows, "flow") });
    expect(byFlow.bars.map((bar) => bar.label)).toEqual([
      "Solar",
      "Load",
      "Grid",
      "Charge at day's end",
    ]);
  });

  it("closes each period with a subtotal of the running total", () => {
    const { bars } = planAccumulate({
      ...input(),
      startValue: 20,
      parent: column(flows, "period"),
    });
    expect(bars.map((bar) => [bar.kind, bar.label, bar.to])).toEqual([
      ["start", "Charge at midnight", 20],
      ["step", "0", 23],
      ["subtotal", "Night", 23],
      ["step", "6", 22],
      ["subtotal", "Morning", 22],
      ["step", "12", 30],
      ["subtotal", "Midday", 30],
      ["step", "18", 21],
      ["subtotal", "Evening", 21],
      ["end", "Charge at day's end", 21],
    ]);
  });

  it("counts rows per step without a measure", () => {
    const { bars } = planAccumulate({
      ...input(),
      aggregation: "count",
      measure: undefined,
    });
    expect(bars.map((bar) => bar.amount)).toEqual([2, 2, 2, 1, 7]);
  });

  it("draws nothing when no rows pass the other filters", () => {
    expect(planAccumulate(input(flows, [])).bars).toEqual([]);
  });
});
