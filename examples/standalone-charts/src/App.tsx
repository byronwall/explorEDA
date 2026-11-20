import { Chart, ChartSettings, type ChartConfig } from "exploreda/chart";
import { useState } from "react";
import "exploreda/dist/chart.css";
import { sales } from "./data";

export function App() {
  const [config, setConfig] = useState<ChartConfig>({
    type: "bar",
    field: "Product",
  });
  return (
    <main>
      <h1>Standalone explorEDA charts</h1>
      <p>
        This page installs <code>exploreda</code> from a packed tarball and
        draws charts with <code>Chart</code>. The serif font, pink buttons, and
        cream background are the host's own styles.
      </p>
      <p>
        <button type="button" data-host-button>
          Host button
        </button>
      </p>

      <section>
        <h2>Side by side</h2>
        <div className="row" data-example="side-by-side">
          <div className="card">
            <Chart
              data={sales}
              config={{ type: "bar", field: "Region" }}
              height={280}
            />
          </div>
          <div className="card">
            <Chart
              data={sales}
              config={{
                type: "scatter",
                xField: "Price",
                yField: "Rating",
                colorField: "Region",
              }}
              height={280}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>More types, sized by the parent</h2>
        <div className="row" data-example="fill">
          <div className="card" style={{ height: 300 }}>
            <Chart
              data={sales}
              config={{
                type: "line",
                xField: "Date",
                seriesField: [],
                time: {
                  interval: "week",
                  aggregation: "sum",
                  measureField: "Units",
                },
                title: "Units by week",
              }}
            />
          </div>
          <div className="card" style={{ height: 300 }}>
            <Chart
              data={sales}
              config={{
                type: "heatmap",
                field: "Region",
                columnField: "Product",
              }}
            />
          </div>
          <div className="card" style={{ height: 300 }}>
            <Chart
              data={sales}
              config={{
                type: "boxplot",
                field: "Price",
                colorField: "Product",
              }}
              title={false}
            />
          </div>
        </div>
      </section>
      <section>
        <h2>Edit at runtime</h2>
        <p>
          The gear and the panel edit the same state. The host keeps it and
          shows it below.
        </p>
        <div className="row" data-example="editable">
          <div className="card">
            <Chart
              data={sales}
              config={config}
              onConfigChange={setConfig}
              height={320}
            />
          </div>
          <div className="card" style={{ flex: "0 1 22rem" }}>
            <ChartSettings
              data={sales}
              config={config}
              onConfigChange={setConfig}
              fields={["Region", "Product", "Price", "Units"]}
            />
          </div>
        </div>
        <pre data-host-config>
          {JSON.stringify(
            {
              type: config.type,
              field: (config as { field?: string }).field,
              colorField: config.colorField,
            },
            null,
            2
          )}
        </pre>
      </section>
    </main>
  );
}
