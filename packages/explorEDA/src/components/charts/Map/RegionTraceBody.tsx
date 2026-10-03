import { useState } from "react";
import { Button } from "@/components/ui/button";
import { displayAggregateValue } from "@/lib/aggregates";
import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import {
  ChartTraceRowSteps,
  TraceReadout,
  TraceSection,
  TraceSwatch,
} from "../ChartTraceDetails";
import { useChartTrace, useChartTraceApi } from "../trace/ChartTraceScope";
import { projectionLabel } from "./mapGeometry";
import type { RegionTrace } from "./regionTrace";

export function RegionTraceBody({ trace }: { trace: RegionTrace }) {
  const { plan, settings, region, row } = trace;
  const current = useChartTrace(),
    api = useChartTraceApi();
  const [page, setPage] = useState(0);
  const rows = plan.unmatched;
  const pages = Math.max(1, Math.ceil(rows.length / 25)),
    currentPage = Math.min(page, pages - 1);
  const inspect = (kind: string, id: string) =>
    current?.selection && api?.inspect(current.selection.owner, kind, id);
  return (
    <div className="space-y-3 text-xs" aria-label="Region map trace">
      {row && (
        <TraceSection heading={`Source row ${row.sourceId}`}>
          <TraceReadout label="Join key">
            {displayAggregateValue(row.key)} (
            {row.key == null ? "missing" : typeof row.key})
          </TraceReadout>
          <TraceReadout label="State">
            {row.reason ??
              (row.inScope
                ? "Joined to region"
                : "Excluded by another chart filter")}
          </TraceReadout>
          <ChartTraceRowSteps fields={trace.fields ?? []} />
        </TraceSection>
      )}
      {region ? (
        <>
          <TraceSection heading={region.label}>
            <TraceReadout label="Join">
              {settings.regionField} = {displayAggregateValue(region.key)} (
              {typeof region.key})
            </TraceReadout>
            <TraceReadout label="Feature key">
              {settings.featureKey === "@id"
                ? "Feature ID"
                : settings.featureKey}
            </TraceReadout>
            <TraceReadout label="Feature indexes">
              {region.features.join(", ")}
            </TraceReadout>
            <TraceReadout label="Feature IDs">
              {region.features
                .map((index) =>
                  displayAggregateValue(
                    plan.asset?.geometry.features[index]?.id
                  )
                )
                .join(", ")}
            </TraceReadout>
            <details>
              <summary className="cursor-pointer">
                Feature geometry and properties
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto rounded border border-border p-2 text-xs">
                {JSON.stringify(
                  {
                    type: "FeatureCollection",
                    features: region.features.map(
                      (index) => plan.asset?.geometry.features[index]
                    ),
                  },
                  null,
                  2
                )}
              </pre>
            </details>
            {region.features.length > 1 && (
              <p>
                These features share one typed key. They form one region; each
                source row is counted once.
              </p>
            )}
            <TraceReadout label="Matching rows">{region.rowCount}</TraceReadout>
            <TraceReadout label="Joined source rows">
              {region.sourceIds.length}
            </TraceReadout>
            <TraceReadout label="Result">
              {region.state === "empty"
                ? "No rows"
                : region.state === "invalid"
                  ? "No finite result"
                  : String(region.value)}
            </TraceReadout>
            <TraceReadout label="Calculation">
              {settings.aggregation === "count"
                ? "Count matching rows"
                : settings.aggregation === "sum"
                  ? `Sum of ${region.contributors.filter((item) => item.included).length} valid ${settings.measureField} values`
                  : `Sum of valid ${settings.measureField} values ÷ ${region.contributors.filter((item) => item.included).length} used rows`}
            </TraceReadout>
          </TraceSection>
          <TraceSection heading="Contributors">
            {region.rowCount ? (
              <AggregateContributorTable
                compact
                showInputs={settings.aggregation !== "count"}
                row={{
                  ...region,
                  groupValue: region.key,
                  groupLabel: region.label,
                }}
              />
            ) : (
              <p>No rows match this region in the current chart population.</p>
            )}
            <p>
              Use Source row ID below to inspect raw values, field preparation,
              and calculations.
            </p>
          </TraceSection>
          <TraceSection heading="Region encoding">
            <TraceReadout label="Fill">
              {region.state === "value" ? (
                <>
                  <TraceSwatch color={region.fill} />
                  {region.fill}
                </>
              ) : region.state === "empty" ? (
                "Diagonal pattern · no rows"
              ) : (
                "Cross pattern · invalid measure"
              )}
            </TraceReadout>
            <TraceReadout label="Color domain">
              {plan.domain.join(" to ")} · {plan.scaleKind}
            </TraceReadout>
            <p>
              The domain uses full-source bounds across all regions. Filters and
              facets keep the same scale.
            </p>
            <p>
              {settings.aggregation === "count"
                ? "The maximum is the largest full-source row count for one region."
                : settings.aggregation === "sum"
                  ? "Each region has a positive subtotal and a negative subtotal. The largest bounds set the domain; signed domains are symmetric about zero."
                  : "The domain covers the smallest and largest valid source measures, so every filtered average stays within it."}
            </p>
            <TraceReadout label="Projected area">
              {region.area.toFixed(2)} px²
            </TraceReadout>
            <TraceReadout label="Path">
              {region.path
                ? `${region.path.length} characters · D3 geographic path`
                : "Outside the view"}
            </TraceReadout>
            <details>
              <summary className="cursor-pointer">Projected path</summary>
              <code className="mt-2 block max-h-32 overflow-auto break-all rounded border border-border p-2">
                {region.path || "Outside the view"}
              </code>
            </details>
            {region.path && (
              <TraceReadout label="Projected bounds">
                {region.bounds
                  .map((point) =>
                    point.map((value) => value.toFixed(2)).join(", ")
                  )
                  .join(" → ")}{" "}
                px
              </TraceReadout>
            )}
          </TraceSection>
        </>
      ) : (
        !row && (
          <>
            <TraceSection heading="Region joins">
              <p>
                {settings.regionField || "Choose a row key"} →{" "}
                {settings.featureKey || "Choose a feature key"}. Keys match by
                value and type. No text conversion is applied.
              </p>
              <TraceReadout label="Unmatched rows">{rows.length}</TraceReadout>
              <TraceReadout label="Unmatched regions">
                {plan.regions.filter((item) => !item.sourceIds.length).length}
              </TraceReadout>
              <TraceReadout label="Duplicate feature keys">
                {plan.regions.filter((item) => item.features.length > 1).length}
              </TraceReadout>
              <p>
                Unmatched rows use the current chart population. Unmatched
                regions have no source rows in this facet.
              </p>
            </TraceSection>
            {rows.length > 0 && (
              <TraceSection heading="Unmatched source rows">
                <div className="max-h-64 overflow-auto rounded border border-border">
                  <table className="w-full text-left">
                    <caption className="sr-only">
                      Unmatched region source rows
                    </caption>
                    <thead>
                      <tr>
                        <th className="px-2 py-1">Row</th>
                        <th className="px-2 py-1">Key and reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows
                        .slice(currentPage * 25, (currentPage + 1) * 25)
                        .map((row) => (
                          <tr
                            key={row.sourceId}
                            className="border-t border-border"
                          >
                            <td className="px-2 py-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-1 text-xs"
                                tooltip="Inspect this source row and its join key."
                                onClick={() =>
                                  inspect(
                                    "map-region-row",
                                    String(row.sourceId)
                                  )
                                }
                              >
                                {row.sourceId}
                              </Button>
                            </td>
                            <td className="px-2 py-1">
                              {displayAggregateValue(row.key)} ({typeof row.key}
                              )<br />
                              {row.reason}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {pages > 1 && (
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!currentPage}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span>
                      {currentPage + 1} / {pages}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={currentPage + 1 === pages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </TraceSection>
            )}
            <TraceSection heading="Feature keys">
              <p>
                {plan.regions.length} regions. Use Browse chart objects below to
                inspect any key, including unmatched features.
              </p>
            </TraceSection>
          </>
        )
      )}
      <TraceSection heading="Geometry and view">
        <TraceReadout label="Asset">{plan.asset?.name ?? "None"}</TraceReadout>
        <TraceReadout label="Source">
          {plan.asset?.source ?? "None"}
        </TraceReadout>
        <TraceReadout label="Feature count">
          {plan.asset?.geometry.features.length ?? 0}
        </TraceReadout>
        <TraceReadout label="Projection">
          {projectionLabel(settings.projection)}
        </TraceReadout>
        <TraceReadout label="Center">
          {plan.view.center.map((value) => `${value.toFixed(5)}°`).join(", ")} ·
          longitude, latitude
        </TraceReadout>
        <TraceReadout label="Zoom">
          {plan.view.zoom.toFixed(3)} × world scale
        </TraceReadout>
        <p>
          WGS 84 coordinates. D3 draws spherical edges and clips at the date
          line and viewport. The bundled land outline is background.
        </p>
      </TraceSection>
    </div>
  );
}
