import { readFileSync } from "node:fs";
import path from "node:path";
import type { AnalysisSourceRow } from "exploreda";
import { evaluateAnalysisQuery } from "exploreda/analysis";
import { describe, expect, it } from "vitest";
import { beijingAnalysis } from "./beijing";
import { facts as beijingFacts } from "./facts/beijing";
import { facts as flightFacts } from "./facts/flights";
import { flightsAnalysis } from "./flights";
import { earthquakesAnalysis } from "./earthquakes";
import { facts as earthquakeFacts } from "./facts/earthquakes";
import { facts as worldBankFacts } from "./facts/worldbank";
import { worldBankAnalysis } from "./worldbank";
import { catalogue } from "../examples";
import {
  analysisQueryId,
  buildAnalysisViews,
  buildTextViews,
  parseTable,
} from "./loadAnalysis";
import type { ExampleAnalysis } from "./types";

const publicDir = path.resolve(__dirname, "../../../public");

async function readTables(analysis: ExampleAnalysis) {
  const tables: Record<string, AnalysisSourceRow[]> = {};
  for (const [sourceId, url] of Object.entries(analysis.tableFiles)) {
    const text = readFileSync(path.join(publicDir, url), "utf8");
    tables[sourceId] = await parseTable(text);
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

async function evaluate(analysis: ExampleAnalysis) {
  return evaluateAnalysisQuery(
    analysis.project,
    await readTables(analysis),
    analysisQueryId(analysis)
  );
}

async function expectCleanTabs(analysis: ExampleAnalysis, names: string[]) {
  const tables = await readTables(analysis);
  const built = buildAnalysisViews(analysis, tables, { sample: false });
  expect(built.diagnostics).toEqual([]);
  expect(built.skippedCharts).toEqual([]);
  expect([built.name, ...built.views.map((view) => view.name)]).toEqual(names);
  // The workspace checks its text against a sample; it must build the same.
  const sampled = buildAnalysisViews(analysis, tables);
  expect({ ...sampled.savedData, metadata: undefined }).toEqual({
    ...built.savedData,
    metadata: undefined,
  });
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
    await expectCleanTabs(flightsAnalysis, [
      "Delays carry through",
      "Departure predicts arrival",
      "Weather at the scheduled hour",
      "When delays happened",
      "Routes and aircraft",
    ]);
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

describe("Beijing air quality", () => {
  it("keeps the full station-day grid through both lookups", async () => {
    const result = await evaluate(beijingAnalysis);
    const { audit } = beijingFacts;
    expect(result.counts.output).toBe(audit.expectedStationDays);
    expect(sum(result.rows, "days.recorded_hours")).toBe(audit.sourceHours);
    expect(sum(result.rows, "days.pm25_valid_hours")).toBe(
      audit.pm25ValidHours
    );
    expect(
      result.diagnostics.filter((item) =>
        ["missing-lookup", "ambiguous-lookup", "duplicate-key"].includes(
          item.code
        )
      )
    ).toEqual([]);
    expect(
      result.rows.filter((row) => row.data.pm25_status === "Qualified").length
    ).toBe(audit.qualifiedPm25Days);
  });

  it("builds every tab from its text against all rows", async () => {
    await expectCleanTabs(beijingAnalysis, [
      "A year of PM2.5",
      "Coverage and stations",
      "Particles and NO₂",
      "Ozone follows temperature",
      "Six-pollutant profiles",
    ]);
  });
});

describe("World development indicators", () => {
  it("keeps every country-year and each year's population through the lookups", async () => {
    const result = await evaluate(worldBankAnalysis);
    const { audit } = worldBankFacts;
    expect(result.counts.output).toBe(audit.baseRows);
    const population = (year: number) =>
      sum(
        result.rows.filter((row) => row.data["years.year"] === year),
        "years.population"
      );
    expect(population(2000)).toBe(audit.population2000);
    expect(population(2023)).toBe(audit.population2023);
    const missing = (stepId: string) =>
      result.diagnostics.filter(
        (item) => item.code === "missing-lookup" && item.stepId === stepId
      ).length;
    expect(missing("country")).toBe(0);
    expect(missing("gdp")).toBe(audit.baseRows - audit.gdp.matchedBase);
    expect(missing("power")).toBe(
      audit.baseRows - audit.electricity.matchedBase
    );
    expect(
      result.diagnostics.filter((item) => item.code === "ambiguous-lookup")
    ).toEqual([]);
  });

  it("builds every tab from its text against all rows", async () => {
    await expectCleanTabs(worldBankAnalysis, [
      "Income and longevity",
      "Electricity, 2000 and 2023",
      "Different paths",
      "Where people lack power",
      "Room to improve",
    ]);
  });
});

describe("Earthquakes of 2023", () => {
  it("keeps every catalogue event inside the half-open year", async () => {
    const result = await evaluate(earthquakesAnalysis);
    const { audit, findings } = earthquakeFacts;
    expect(result.counts.output).toBe(audit.events);
    expect(new Set(result.rows.map((row) => row.data["events.id"])).size).toBe(
      audit.events
    );
    const dates = result.rows.map((row) => String(row.data["events.date"]));
    expect(dates.every((value) => value.startsWith("2023-"))).toBe(true);
    expect(
      dates.filter((value) => value === findings.busiestDay.date).length
    ).toBe(findings.busiestDay.events);
    expect(typeof result.rows[0]!.data["events.time"]).toBe("string");
  });

  it("builds every tab from its text against all rows", async () => {
    await expectCleanTabs(earthquakesAnalysis, [
      "Where they struck",
      "When they happened",
      "Magnitude and depth",
      "One magnitude type by depth",
      "What each record carries",
    ]);
  });
});

describe("Catalogue", () => {
  it("lists complete analyses whose tabs match the tabs they build", async () => {
    expect(catalogue.map((example) => example.id)).toEqual([
      "january-flights",
      "beijing-air",
      "world-development",
      "earthquakes-2023",
      "wine-chemistry",
      "shop-operations",
      "lorenz-3d",
    ]);
    for (const example of catalogue) {
      let names: string[];
      if (example.analysis) {
        const built = buildAnalysisViews(
          example.analysis,
          await readTables(example.analysis)
        );
        names = [built.name, ...built.views.map((view) => view.name)];
      } else if (example.text) {
        const rows = await parseTable(
          readFileSync(path.join(publicDir, example.data), "utf8")
        );
        const built = buildTextViews(example.text, rows);
        expect(built.diagnostics, example.id).toEqual([]);
        expect(built.skippedCharts, example.id).toEqual([]);
        names = [built.name, ...built.views.map((view) => view.name)];
      } else {
        // The workspace names a saved example's first tab after the example.
        names = [
          example.viewName ?? example.title,
          ...(example.views ?? []).map((view) => view.name),
        ];
      }
      expect(
        example.tabs?.map((tab) => tab.name),
        example.id
      ).toEqual(names);
    }
  });
});
