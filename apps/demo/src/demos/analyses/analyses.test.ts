import { readFileSync } from "node:fs";
import path from "node:path";
import type { AnalysisSourceRow } from "exploreda";
import { evaluateAnalysisQuery } from "exploreda/analysis";
import { describe, expect, it } from "vitest";
import { parseCsvData } from "@/csvParser";
import { facts as flightFacts } from "./facts/flights";
import { flightsAnalysis } from "./flights";
import { analysisQueryId, buildAnalysisViews } from "./loadAnalysis";
import type { ExampleAnalysis } from "./types";

const publicDir = path.resolve(__dirname, "../../../public");

async function readTables(analysis: ExampleAnalysis) {
  const tables: Record<string, AnalysisSourceRow[]> = {};
  for (const [sourceId, url] of Object.entries(analysis.tableFiles)) {
    const text = readFileSync(path.join(publicDir, url), "utf8");
    tables[sourceId] = (await parseCsvData(text)) as AnalysisSourceRow[];
  }
  return tables;
}

function sum(rows: { data: Record<string, unknown> }[], field: string) {
  return rows.reduce((total, row) => {
    const value = row.data[field];
    return typeof value === "number" && Number.isFinite(value)
      ? total + value
      : total;
  }, 0);
}

describe("January flights", () => {
  it("keeps every flight and its distance total through the lookups", async () => {
    const tables = await readTables(flightsAnalysis);
    const result = evaluateAnalysisQuery(
      flightsAnalysis.project,
      tables,
      analysisQueryId(flightsAnalysis)
    );
    const { audit } = flightFacts;
    expect(result.counts.output).toBe(audit.flights);
    expect(
      new Set(result.rows.map((row) => row.data["flights.flight_id"])).size
    ).toBe(audit.uniqueFlightIds);
    expect(sum(result.rows, "flights.distance")).toBe(audit.distanceSum);

    const missing = (stepId: string) =>
      result.diagnostics.filter(
        (item) => item.code === "missing-lookup" && item.stepId === stepId
      ).length;
    expect(missing("airline")).toBe(0);
    expect(missing("plane")).toBe(
      audit.lookups.planes.unmatched + audit.lookups.planes.missingTailnum
    );
    expect(missing("weather")).toBe(audit.lookups.weather.unmatched);
    expect(
      result.diagnostics.filter((item) => item.code === "ambiguous-lookup")
    ).toEqual([]);
  });

  it("builds every tab from its text against all rows", async () => {
    const tables = await readTables(flightsAnalysis);
    const built = buildAnalysisViews(flightsAnalysis, tables, {
      sample: false,
    });
    expect(built.diagnostics).toEqual([]);
    expect(built.skippedCharts).toEqual([]);
    expect([built.name, ...built.views.map((view) => view.name)]).toEqual([
      "Delays carry through",
      "Departure predicts arrival",
      "Weather at the scheduled hour",
      "When delays happened",
      "Routes and aircraft",
    ]);
    const sampled = buildAnalysisViews(flightsAnalysis, tables);
    expect({ ...sampled.savedData, metadata: undefined }).toEqual({
      ...built.savedData,
      metadata: undefined,
    });
  });

  it("states findings that match the query result", async () => {
    const tables = await readTables(flightsAnalysis);
    const rows = evaluateAnalysisQuery(
      flightsAnalysis.project,
      tables,
      analysisQueryId(flightsAnalysis)
    ).rows.map((row) => row.data);
    const { findings } = flightFacts;
    const count = (field: string, value: string) =>
      rows.filter((row) => row[field] === value).length;
    expect(count("dep_band", "1 On time or early")).toBe(
      findings.bandCounts["On time or early"]
    );
    expect(count("dep_band", "4 Over 60 min late")).toBe(
      findings.overHourDepartures
    );
    expect(count("dep_band", "5 Not recorded")).toBe(
      findings.bandCounts["Not recorded"]
    );
    expect(
      rows.filter(
        (row) =>
          row.dep_band === "4 Over 60 min late" &&
          row.arr_band === "4 Over 60 min late"
      ).length
    ).toBe(findings.overHourStillOverHour);
  });
});
