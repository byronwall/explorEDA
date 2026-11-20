---
title: "Standalone charts: shape"
slug: "standalone-charts"
phase: shape
status: current
last_updated: "2026-11-19"
---

# Standalone charts: shape

**Outcome:** a React host draws any explorEDA chart from rows plus a partial config, with no workspace.
**Primary flow:** `import { Chart } from "exploreda/chart"` → pass `data` and `config` → the chart draws and responds to hover → optionally, the user edits settings and the host stores the new config.

## Feature scope

```text
exploreda/chart
├── PLANNED ADDITIONS
│   ├── <Chart>: one chart from data plus a config
│   │   ├── data: an array of row objects
│   │   ├── config: partial { type, …settings }; missing settings take the type's defaults
│   │   ├── title: from config.title; title={false} hides it
│   │   ├── width, height: explicit numbers win; otherwise fill the parent
│   │   ├── onConfigChange(next): turns on editing; without it the chart is read-only
│   │   ├── fields: limits the columns the settings panel offers
│   │   └── hover readouts stay; click and brush selection are off
│   ├── <ChartSettings>: the existing settings panel for one config, placed by the host
│   │   └── same data, config, onConfigChange, fields props; host state links it to a chart
│   └── exploreda/dist/chart.css: theme and rules under the chart wrapper; no global reset
├── EVALUATE BEFORE COMMITTING
│   └── config as one Dashboard text line, such as "scatter x=Price y=Rating"
└── LATER POSSIBILITIES
    └── render(el, data, config), linked charts, lean per-type imports
```

## Usage

```tsx
import { Chart, ChartSettings, type ChartConfig } from "exploreda/chart";
import "exploreda/dist/chart.css";

const rows = [
  { Region: "West", Price: 12, Rating: 4.1 },
  { Region: "East", Price: 9, Rating: 3.8 },
];

function Side() {
  const [scatter, setScatter] = useState<ChartConfig>({
    type: "scatter",
    xField: "Price",
    yField: "Rating",
  });
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Chart
        data={rows}
        config={{ type: "bar", field: "Region" }}
        height={260}
      />
      <Chart
        data={rows}
        config={scatter}
        onConfigChange={setScatter}
        height={260}
      />
    </div>
  );
}
```

Setting names are the saved names the workspace already uses. The docs reference lists them for each chart type.

## Behavior

| Situation                                 | Result                                                  |
| ----------------------------------------- | ------------------------------------------------------- |
| `config` has only `type` and a field      | The chart draws with that type's defaults.              |
| `config` is invalid for its type          | The chart shows the workspace's empty-chart message.    |
| User clicks a bar                         | Nothing is selected. Hover readout still shows.         |
| User edits a setting, host passes it back | The chart redraws with the new config.                  |
| User edits a setting, host ignores it     | The chart stays on the host's config.                   |
| No `onConfigChange`                       | No gear, no title or axis editing.                      |
| Two charts on one page                    | Each has its own data layer; neither affects the other. |

## Decisions and boundaries

**Appetite:** small. Four milestones, each one PR in a stack.

**Key decision:** reuse, not a new host. Each `<Chart>` mounts the existing `DataLayerProvider` with one chart and draws it through `ChartRenderer`, the path the private docs kit already uses. No chart code changes for M1. `config` becomes saved settings with one chart. The provider already skips a restore when the incoming settings match its own state, so passing `onConfigChange`'s result back does not loop. A framework-free `render()` or a separate package helps no React host now; one entry keeps one package and one release.

**Boundary:** charts select through `updateChart(id, { filters })`; the standalone store drops `filters` from those calls. Without `onConfigChange`, in-place title and axis edits are off too. The workspace does not change.

**First proof:** **Try:** a test renders every registered chart type through `<Chart>` from a minimal config. **Observe:** which types draw a plot and which fail or need workspace context. **Decide:** fix each failing type in M1 or list it as unsupported before M2 starts.
