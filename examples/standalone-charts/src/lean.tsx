import { Chart, registerCharts } from "exploreda/chart-core";
import { barChartDefinition } from "exploreda/charts/bar";
import { scatterPlotDefinition } from "exploreda/charts/scatter";
import "exploreda/dist/chart.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { sales } from "./data";
import "./host.css";

// Only these two types reach the bundle.
registerCharts(barChartDefinition, scatterPlotDefinition);

function Lean() {
  return (
    <main>
      <h1>Two chart types, nothing else</h1>
      <div className="row" data-example="lean">
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
            config={{ type: "scatter", xField: "Price", yField: "Rating" }}
            height={280}
          />
        </div>
        <div className="card">
          {/* Not registered: the chart says which import to add. */}
          <Chart
            data={sales}
            config={{ type: "line", xField: "Date" }}
            height={280}
          />
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Lean />
  </StrictMode>
);
