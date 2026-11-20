import { Chart } from "exploreda/chart";
import "exploreda/dist/chart.css";
import { sales } from "./data";

export function App() {
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
    </main>
  );
}
