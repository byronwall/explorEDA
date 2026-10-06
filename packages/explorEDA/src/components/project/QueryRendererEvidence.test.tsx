import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { calculateGroupedAggregate } from "@/lib/aggregates";
import { formatFieldValue } from "@/lib/fieldSettings";
import type { CalculationManager } from "@/lib/calculations/CalculationState";
import type { datum } from "@/types/ChartTypes";
import { barChartDefinition } from "../charts/BarChart/definition";
import { planBarChart } from "../charts/BarChart/barPlan";
import { resolveBarTrace } from "../charts/BarChart/barTrace";
import { metricCardDefinition } from "../charts/MetricCard/definition";
import { planMetricCard } from "../charts/MetricCard/metricCardPlan";
import { makeMetricCardTraceSource } from "../charts/MetricCard/metricCardTrace";
import { scatterPlotDefinition } from "../charts/ScatterPlot/definition";
import { planScatter } from "../charts/ScatterPlot/scatterPlan";
import { resolveScatterTrace } from "../charts/ScatterPlot/scatterTrace";
import { lineChartDefinition } from "../charts/LineChart/definition";
import { planTimeSeries } from "../charts/LineChart/timeSeriesPlan";
import { timeSeriesTraceSource } from "../charts/LineChart/timeSeriesTrace";
import { DEFAULT_TIME_SERIES } from "../charts/LineChart/definition";
import { QueryRendererEvidence } from "./QueryRendererEvidence";
import type { QueryFlowTraceHandoff } from "../AnalysisChartContext";
import { AnalysisChartContextProvider } from "../AnalysisChartContext";
import { ChartTracePanel } from "../charts/trace/ChartTracePanel";
import {
  ChartTraceScope,
  useChartTraceApi,
  useTraceSource,
} from "../charts/trace/ChartTraceScope";
import type { TraceSource } from "../charts/trace/traceTypes";
import { useMemo } from "react";
import { useCallback, useRef, useState } from "react";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { queryChartFilterRevision } from "../AnalysisChartContext";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { useDataLayer } from "@/providers/DataLayerProvider";

const queryRevision = "query-r1";
const rowsById = {
  0: {
    key: "source-a",
    values: {},
    data: {},
    sourceRows: [],
    contributors: [],
  },
  1: {
    key: "source-b",
    values: {},
    data: {},
    sourceRows: [],
    contributors: [],
  },
} as never;

function show(
  trace: NonNullable<QueryFlowTraceHandoff["trace"]>,
  otherScopes: {
    chartId: string;
    label: string;
    filters: { type: "value"; field: string; values: string[] }[];
  }[] = []
) {
  const filters =
    trace.kind === "metric-card" ||
    trace.kind === "bar" ||
    trace.kind === "point"
      ? trace.filters
      : [];
  const chartFilterScopes = [
    { chartId: "chart-1", label: "Selected chart", filters },
    ...otherScopes,
  ];
  return render(
    <DataLayerProvider data={[]}>
      <QueryRendererEvidence
        handoff={{
          trace,
          owner: "chart-1",
          chartId: "chart-1",
          queryRevision,
          filterRevision: queryChartFilterRevision(
            "chart-1",
            chartFilterScopes
          ),
          traceRevision: trace.revision,
        }}
        queryRevision={queryRevision}
        traceRevisions={{ "chart-1": trace.revision }}
        rowsById={rowsById}
        chartFilterScopes={chartFilterScopes}
      />
    </DataLayerProvider>
  );
}

describe("QueryRendererEvidence", () => {
  it("hands the selected renderer trace to the query flow and clears it after renderer revision changes", async () => {
    function Source({
      revision,
      refresh,
    }: {
      revision: string;
      refresh: number;
    }) {
      const api = useChartTraceApi()!;
      const source = useMemo(
        (): TraceSource => ({
          role: "chart",
          revision,
          resolve: (kind, id) =>
            kind === "title"
              ? {
                  kind: "title",
                  id,
                  revision,
                  text: "Revenue",
                  source: "chart-setting",
                }
              : undefined,
        }),
        [revision, refresh]
      );
      useTraceSource("chart-1", source, "chart-1");
      return (
        <button onClick={() => api.inspect("chart-1", "title", "chart-title")}>
          Select mark
        </button>
      );
    }
    function Workspace({
      revision,
      refresh = 0,
    }: {
      revision: string;
      refresh?: number;
    }) {
      const [handoff, setHandoff] = useState<QueryFlowTraceHandoff>();
      const [traceRevisions, setTraceRevisions] = useState<
        Record<string, string>
      >({});
      const revisionReports = useRef(0);
      const [panelOpen, setPanelOpen] = useState(true);
      const chartFilterScopes = [
        { chartId: "chart-1", label: "Chart", filters: [] },
      ];
      const open = useCallback(
        (
          _rowKey: string | undefined,
          value: QueryFlowTraceHandoff | undefined
        ) => setHandoff(value),
        []
      );
      const reportRevision = useCallback(
        (owner: string | undefined, value?: string) => {
          if (!owner) return;
          revisionReports.current += 1;
          setTraceRevisions((current) => {
            const next = { ...current };
            if (value) next[owner] = value;
            else delete next[owner];
            return next;
          });
        },
        []
      );
      return (
        <DataLayerProvider data={[]}>
          <AnalysisChartContextProvider
            value={{
              query: { id: "query", label: "Query", glyph: "Q" },
              queryRevision,
              frame: { id: "frame", label: "Frame", glyph: "Q" },
              availableCount: 0,
              resultRowsById: { 0: { key: "row-a" } } as never,
              chartFilterScopes,
              onOpenQueryFlow: open,
              onTraceRevision: reportRevision,
            }}
          >
            <ChartTraceScope>
              <Source revision={revision} refresh={refresh} />
              {panelOpen && <ChartTracePanel />}
              <button onClick={() => setPanelOpen(false)}>
                Close trace panel
              </button>
              <output aria-label="Current trace revision">
                {traceRevisions["chart-1"]}
              </output>
              <output aria-label="Revision report count">
                {revisionReports.current}
              </output>
              <QueryRendererEvidence
                handoff={handoff}
                queryRevision={queryRevision}
                traceRevisions={traceRevisions}
                rowsById={{ 0: { key: "row-a" } } as never}
                chartFilterScopes={chartFilterScopes}
              />
            </ChartTraceScope>
          </AnalysisChartContextProvider>
        </DataLayerProvider>
      );
    }

    const view = render(<Workspace revision="trace-r1" />);
    fireEvent.click(screen.getByText("Select mark"));
    fireEvent.click(screen.getByText("Open query flow"));
    expect(screen.getByLabelText("Current trace revision")).toHaveTextContent(
      "trace-r1"
    );
    expect(screen.getByLabelText("Revision report count")).toHaveTextContent(
      "1"
    );
    expect(screen.getByLabelText("Chart operations")).toBeInTheDocument();
    view.rerender(<Workspace revision="trace-r1" refresh={1} />);
    expect(screen.getByLabelText("Chart operations")).toBeInTheDocument();
    expect(screen.getByLabelText("Revision report count")).toHaveTextContent(
      "1"
    );
    fireEvent.click(screen.getByText("Close trace panel"));
    expect(screen.getByLabelText("Chart operations")).toBeInTheDocument();

    view.rerender(<Workspace revision="trace-r2" />);
    await waitFor(() =>
      expect(screen.getByLabelText("Current trace revision")).toHaveTextContent(
        "trace-r2"
      )
    );
    expect(screen.getByLabelText("Revision report count")).toHaveTextContent(
      "2"
    );
    expect(screen.queryByLabelText("Chart operations")).not.toBeInTheDocument();
  });

  it("hands off the metric plan's actual contributors, aggregation, and exclusions", () => {
    const settings = {
      ...metricCardDefinition.createDefaultSettings({ x: 0, y: 0, w: 4, h: 2 }),
      aggregation: "sum" as const,
      measureField: "amount",
    };
    const plan = planMetricCard(
      settings,
      {
        revision: "renderer-r1",
        liveIds: [0, 1],
        measureData: { 0: 3, 1: Number.NaN },
        rawInputs: { 0: "3", 1: "bad" },
        exclusionReasons: { 1: "Not a finite number" },
      },
      (field) => field,
      formatFieldValue
    );
    const trace = makeMetricCardTraceSource(plan, [], ["amount"]).resolve(
      "metric-card",
      "metric-card:total"
    )!;
    show(trace);
    expect(screen.getByLabelText("Chart operations")).toHaveTextContent(
      "This chart’s own filters are shown with its chart result."
    );
    expect(screen.getByLabelText("Metric card trace")).toHaveTextContent(
      "Sum of amount"
    );
    expect(screen.getByLabelText("Metric card trace")).toHaveTextContent(
      "Not a finite number"
    );
    expect(screen.getByLabelText("Chart operations")).toHaveTextContent(
      "source-a, source-b"
    );
  });

  it("hands off grouped-bar rows and real numeric exclusion reasons", () => {
    const settings = {
      ...barChartDefinition.createDefaultSettings(
        { x: 0, y: 0, w: 6, h: 4 },
        "group"
      ),
      aggregateId: "sales",
      filters: [{ type: "value" as const, field: "group", values: ["A"] }],
    };
    const aggregate = calculateGroupedAggregate(
      [
        { __ID: 0, group: "A", amount: 3 },
        { __ID: 1, group: "A", amount: "bad" },
      ],
      {
        id: "sales",
        name: "Sales",
        groupField: "group",
        measureField: "amount",
        aggregation: "sum",
      }
    );
    const plan = planBarChart({
      settings,
      width: 400,
      height: 240,
      snapshot: {
        revision: "bar-r1",
        allValues: ["A"],
        liveIds: [0, 1],
        fieldData: { 0: "A", 1: "A" },
        aggregate,
      },
      getColor: () => "blue",
      getFieldLabel: (field) => field,
    });
    const trace = resolveBarTrace(
      plan,
      "bar",
      plan.bars[0]!.id,
      settings.filters,
      ["group", "amount"]
    )!;
    show(trace);
    expect(screen.getByLabelText("Chart operations")).toHaveTextContent(
      "group: A"
    );
    expect(screen.getByLabelText("Bar trace")).toHaveTextContent(
      "sum of amount"
    );
    expect(screen.getByLabelText("Bar trace")).toHaveTextContent(
      "Not a finite number"
    );
  });

  it("shows CalculationManager expressions for metric and grouped-bar fields", () => {
    const metricSettings = {
      ...metricCardDefinition.createDefaultSettings({ x: 0, y: 0, w: 4, h: 2 }),
      aggregation: "sum" as const,
      measureField: "doubled",
    };
    const metricPlan = planMetricCard(
      metricSettings,
      {
        revision: "calculation-r1",
        liveIds: [0],
        measureData: { 0: 6 },
        rawInputs: { 0: 6 },
        exclusionReasons: {},
      },
      (field) => field,
      formatFieldValue
    );
    const metricTrace = makeMetricCardTraceSource(
      metricPlan,
      [],
      ["doubled"]
    ).resolve("metric-card", "metric-card:total")!;
    const barSettings = {
      ...barChartDefinition.createDefaultSettings(
        { x: 0, y: 0, w: 6, h: 4 },
        "group"
      ),
      aggregateId: "sales",
    };
    const barAggregate = calculateGroupedAggregate(
      [{ __ID: 0, group: "A", doubled: 6 }],
      {
        id: "sales",
        name: "Sales",
        groupField: "group",
        measureField: "doubled",
        aggregation: "sum",
      }
    );
    const barPlan = planBarChart({
      settings: barSettings,
      width: 400,
      height: 240,
      snapshot: {
        revision: "calculation-r1",
        allValues: ["A"],
        liveIds: [0],
        fieldData: { 0: "A" },
        aggregate: barAggregate,
      },
      getColor: () => "blue",
      getFieldLabel: (field) => field,
    });
    const barTrace = resolveBarTrace(
      barPlan,
      "bar",
      barPlan.bars[0]!.id,
      [],
      ["group", "doubled"]
    )!;

    function ConfigureCalculation() {
      const manager = useDataLayer((state) => state.calculationManager);
      if (!manager.getCalculations().length) {
        manager.addCalculation({
          resultColumnName: "doubled",
          expression: parseExpression("amount * 2"),
        });
      }
      return null;
    }

    render(
      <DataLayerProvider data={[{ amount: 3 }]}>
        <ConfigureCalculation />
        <QueryRendererEvidence
          handoff={{
            trace: metricTrace,
            owner: "chart-1",
            chartId: "chart-1",
            queryRevision,
            filterRevision: queryChartFilterRevision("chart-1", []),
            traceRevision: metricTrace.revision,
          }}
          queryRevision={queryRevision}
          traceRevisions={{ "chart-1": metricTrace.revision }}
          rowsById={rowsById}
          chartFilterScopes={[]}
        />
        <QueryRendererEvidence
          handoff={{
            trace: barTrace,
            owner: "chart-2",
            chartId: "chart-2",
            queryRevision,
            filterRevision: queryChartFilterRevision("chart-2", []),
            traceRevision: barTrace.revision,
          }}
          queryRevision={queryRevision}
          traceRevisions={{ "chart-2": barTrace.revision }}
          rowsById={rowsById}
          chartFilterScopes={[]}
        />
      </DataLayerProvider>
    );

    expect(
      screen
        .getAllByLabelText("Chart operations")
        .every((section) =>
          section.textContent?.includes("doubled = amount * 2")
        )
    ).toBe(true);
  });

  it("shows the actual calculation expression for a derived time-series measure", () => {
    const settings = {
      ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
      xField: "date",
      time: {
        ...DEFAULT_TIME_SERIES,
        aggregation: "sum" as const,
        measureField: "doubled",
        splitField: undefined,
      },
    };
    const plan = planTimeSeries(
      settings,
      {
        revision: "time-r1",
        allIds: [0],
        liveIds: [0],
        dates: { 0: "2025-01-01" },
        measures: { 0: 6 },
        groups: {},
        rawDates: { 0: "2025-01-01" },
        rawInputs: { 0: 6 },
        exclusionReasons: {},
      },
      400,
      240,
      (field) => field,
      (_, value) => String(value)
    );
    const trace = timeSeriesTraceSource(plan, settings.filters, [
      settings.xField,
      settings.time.measureField,
    ]).resolve("time-bucket", plan.points[0]!.id)!;

    function ConfigureCalculation() {
      const manager = useDataLayer((state) => state.calculationManager);
      if (!manager.getCalculations().length) {
        manager.addCalculation({
          resultColumnName: "doubled",
          expression: parseExpression("amount * 2"),
        });
      }
      return null;
    }

    render(
      <DataLayerProvider data={[{ amount: 3 }]}>
        <ConfigureCalculation />
        <QueryRendererEvidence
          handoff={{
            trace,
            owner: "chart-time",
            chartId: settings.id,
            queryRevision,
            filterRevision: queryChartFilterRevision(settings.id, [
              { chartId: settings.id, label: "Time series", filters: [] },
            ]),
            traceRevision: trace.revision,
          }}
          queryRevision={queryRevision}
          traceRevisions={{ "chart-time": trace.revision }}
          rowsById={rowsById}
          chartFilterScopes={[
            { chartId: settings.id, label: "Time series", filters: [] },
          ]}
        />
      </DataLayerProvider>
    );

    expect(screen.getByLabelText("Chart operations")).toHaveTextContent(
      "doubled = amount * 2"
    );
  });

  it("shows scatter renderer filter populations and hides a stale handoff", () => {
    const settings = {
      ...scatterPlotDefinition.createDefaultSettings({
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      }),
      xField: "x",
      yField: "y",
      filters: [{ type: "range" as const, field: "x", min: 0, max: 2 }],
    };
    const snapshot = {
      revision: "scatter-r1",
      allIds: [0, 1],
      chartIds: [0, 1],
      filteredIds: [0],
      xData: { 0: 1, 1: 3 },
      yData: { 0: 2, 1: 4 },
      colorData: {},
      fieldSettings: {},
    };
    const plan = planScatter(settings, snapshot, 400, 240);
    const trace = resolveScatterTrace(
      { kind: "point", id: plan.points[0]!.id },
      plan,
      snapshot,
      settings,
      [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ] as Record<string, datum>[],
      [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ] as Record<string, datum>[],
      [],
      { traceRow: () => undefined } as unknown as CalculationManager<
        Record<string, datum>
      >
    )!;
    const otherScopes = [
      {
        chartId: "chart-2",
        label: "Region chart",
        filters: [
          { type: "value" as const, field: "region", values: ["West"] },
        ],
      },
    ];
    const { rerender } = show(trace, otherScopes);
    expect(screen.getByLabelText("Chart operations")).toHaveTextContent(
      "Region chart · region: West"
    );
    expect(screen.getByLabelText("Scatter trace")).toHaveTextContent(
      "Other filters"
    );
    expect(screen.getByLabelText("Scatter trace")).toHaveTextContent(
      "This chart"
    );
    rerender(
      <DataLayerProvider data={[]}>
        <QueryRendererEvidence
          handoff={{
            trace,
            owner: "chart-1",
            chartId: "chart-1",
            queryRevision,
            filterRevision: queryChartFilterRevision("chart-1", [
              {
                chartId: "chart-1",
                label: "Selected chart",
                filters: trace.kind === "point" ? trace.filters : [],
              },
              ...otherScopes,
            ]),
            traceRevision: trace.revision,
          }}
          queryRevision="query-r2"
          traceRevisions={{ "chart-1": trace.revision }}
          rowsById={rowsById}
          chartFilterScopes={[
            {
              chartId: "chart-1",
              label: "Selected chart",
              filters: trace.kind === "point" ? trace.filters : [],
            },
            ...otherScopes,
          ]}
        />
      </DataLayerProvider>
    );
    expect(screen.queryByLabelText("Chart operations")).not.toBeInTheDocument();
    const ownScope = {
      chartId: "chart-1",
      label: "Selected chart",
      filters: trace.kind === "point" ? trace.filters : [],
    };
    const changedScopes = [
      ownScope,
      {
        chartId: "chart-2",
        label: "Region chart",
        filters: [
          { type: "value" as const, field: "region", values: ["East"] },
        ],
      },
    ];
    rerender(
      <DataLayerProvider data={[]}>
        <QueryRendererEvidence
          handoff={{
            trace,
            owner: "chart-1",
            chartId: "chart-1",
            queryRevision,
            filterRevision: queryChartFilterRevision("chart-1", [
              ownScope,
              ...otherScopes,
            ]),
            traceRevision: trace.revision,
          }}
          queryRevision={queryRevision}
          traceRevisions={{ "chart-1": trace.revision }}
          rowsById={rowsById}
          chartFilterScopes={changedScopes}
        />
      </DataLayerProvider>
    );
    expect(screen.queryByLabelText("Chart operations")).not.toBeInTheDocument();
  });
});
