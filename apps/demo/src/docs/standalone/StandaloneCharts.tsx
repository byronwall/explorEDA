import type { ChartConfig, ChartProps } from "exploreda/chart";
import { useEffect, useState, type ReactNode } from "react";
import { CodeFrame } from "../components/code";
import { Link } from "react-router-dom";
import { catalogue } from "../catalogue";
import { docsPath } from "../paths";

type ChartModule = typeof import("exploreda/chart");
type KitModule = typeof import("exploreda/docs-kit");

/**
 * The standalone chart entry, loaded in the browser only: the docs
 * prerender must not draw charts.
 */
function useModules() {
  const [modules, setModules] = useState<[ChartModule, KitModule]>();
  useEffect(() => {
    let live = true;
    void Promise.all([
      import("exploreda/chart"),
      import("exploreda/docs-kit"),
    ]).then((loaded) => {
      if (live) setModules(loaded);
    });
    return () => {
      live = false;
    };
  }, []);
  return modules;
}

function Loading({ height }: { height: number }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center text-sm text-muted-foreground"
      style={{ height }}
    >
      Loading charts…
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 rounded-lg border border-border bg-card p-4">
      {children}
    </div>
  );
}

const SALES = [
  { Region: "West", Price: 12, Rating: 4.1 },
  { Region: "East", Price: 9, Rating: 3.8 },
  { Region: "West", Price: 15, Rating: 4.6 },
  { Region: "North", Price: 7, Rating: 3.1 },
  { Region: "South", Price: 11, Rating: 4.0 },
  { Region: "East", Price: 14, Rating: 4.4 },
  { Region: "North", Price: 8, Rating: 3.5 },
  { Region: "South", Price: 10, Rating: 3.9 },
  { Region: "West", Price: 13, Rating: 4.3 },
  { Region: "East", Price: 6, Rating: 2.9 },
];

export const SIDE_BY_SIDE_CODE = `import { Chart } from "exploreda/chart";
import "exploreda/dist/chart.css";

const rows = [
  { Region: "West", Price: 12, Rating: 4.1 },
  { Region: "East", Price: 9, Rating: 3.8 },
  // …
];

export function SalesCharts() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <div style={{ flex: "1 1 280px" }}>
        <Chart data={rows} config={{ type: "bar", field: "Region" }} height={260} />
      </div>
      <div style={{ flex: "1 1 280px" }}>
        <Chart
          data={rows}
          config={{ type: "scatter", xField: "Price", yField: "Rating" }}
          height={260}
        />
      </div>
    </div>
  );
}`;

/** Two charts side by side from plain rows: the page's first example. */
export function StandaloneSideBySide() {
  const Chart = useModules()?.[0].Chart;
  return (
    <>
      <Frame>
        {Chart ? (
          <div
            className="flex flex-wrap gap-4"
            data-docs-standalone="side-by-side"
          >
            <div style={{ flex: "1 1 280px", minWidth: 0 }}>
              <Chart
                data={SALES}
                config={{ type: "bar", field: "Region" }}
                height={260}
              />
            </div>
            <div style={{ flex: "1 1 280px", minWidth: 0 }}>
              <Chart
                data={SALES}
                config={{ type: "scatter", xField: "Price", yField: "Rating" }}
                height={260}
              />
            </div>
          </div>
        ) : (
          <Loading height={260} />
        )}
      </Frame>
      <CodeFrame code={SIDE_BY_SIDE_CODE} language="tsx" />
    </>
  );
}

function configText(config: ChartConfig) {
  return JSON.stringify(config, null, 2).replace(/"([A-Za-z]\w*)":/g, "$1:");
}

/** Every chart type through `Chart`, each with the config that draws it. */
export function StandaloneGallery() {
  const modules = useModules();
  if (!modules) {
    return <Loading height={320} />;
  }
  const [{ Chart }, { SAMPLE_CONFIGS, SAMPLE_ROWS }] = modules;
  return (
    <div
      className="mt-5 grid gap-4 sm:grid-cols-2"
      data-docs-standalone="gallery"
    >
      {Object.entries(SAMPLE_CONFIGS).map(([type, config]) => (
        <figure
          key={type}
          className="min-w-0 overflow-hidden rounded-lg border border-border bg-card"
          data-chart-type={type}
        >
          <div className="p-3">
            <Chart data={SAMPLE_ROWS} config={config} height={240} />
          </div>
          <figcaption className="flex items-center justify-between gap-3 border-t border-border px-3 py-2 text-xs">
            <code className="font-mono font-semibold text-foreground">
              {type}
            </code>
            <SettingsLink type={type} />
          </figcaption>
          <pre className="m-0 overflow-x-auto border-t border-border bg-muted/40 px-3 py-2 font-mono text-xs leading-5 text-foreground/80">
            {configText(config)}
          </pre>
        </figure>
      ))}
    </div>
  );
}

/** A link to the saved settings a chart type's docs page lists. */
function SettingsLink({ type }: { type: string }) {
  const page = catalogue.find((item) => item.chartType === type);
  if (!page) return null;
  return (
    <Link
      className="text-primary underline-offset-4 hover:underline"
      to={`${docsPath(page.topic)}#saved-settings`}
    >
      {page.title} settings
    </Link>
  );
}

/**
 * One line per prop. The record covers every key of `ChartProps`, so a new
 * prop fails to compile until it is described here.
 */
const CHART_PROPS: Record<keyof ChartProps, string> = {
  data: "The rows to draw, one object per row. Pass a new array when rows change.",
  config:
    'The chart type and any settings that differ from its defaults, such as { type: "bar", field: "Region" }. Setting names are the saved names each chart\'s page lists.',
  title:
    "The heading above the plot. By default it is config.title, or a name built from the chart's fields. Pass false to hide it.",
  width:
    "Width in pixels. Without it, the chart fills the width of its parent.",
  height:
    "Height in pixels, heading included. Without it, the chart fills the height of its parent, or takes 300 px when the parent has no height.",
  className: "A class for the chart's outer element.",
  style: "Inline styles for the chart's outer element.",
};

export function ChartPropsReference() {
  return (
    <dl
      aria-label="Chart props"
      className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
    >
      {Object.entries(CHART_PROPS).map(([prop, line]) => (
        <div
          key={prop}
          className="grid gap-x-6 gap-y-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]"
        >
          <dt>
            <code className="font-mono text-[0.8125rem] font-semibold text-foreground">
              {prop}
            </code>
          </dt>
          <dd className="text-sm leading-6 text-foreground/80">{line}</dd>
        </div>
      ))}
    </dl>
  );
}
