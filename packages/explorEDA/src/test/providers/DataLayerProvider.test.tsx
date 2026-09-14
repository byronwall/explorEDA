import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parseExpression } from "../../lib/calculations/parser/semantics";
import {
  DataLayerProvider,
  useDataLayer,
} from "../../providers/DataLayerProvider";
import { SavedDataStructure } from "../../types/SavedDataStructure";

const data = [
  { name: "A", value: 2 },
  { name: "B", value: 3 },
];

function Probe() {
  const rows = useDataLayer((state) => state.data);
  const calculations = useDataLayer((state) => state.calculations);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getColumnData = useDataLayer((state) => state.getColumnData);

  return (
    <>
      <output data-testid="rows">{rows.length}</output>
      <output data-testid="calculations">{calculations.length}</output>
      <output data-testid="columns">{JSON.stringify(getColumnNames())}</output>
      <output data-testid="values">
        {JSON.stringify(getColumnData("double"))}
      </output>
    </>
  );
}

function savedData(calculations: SavedDataStructure["calculations"] = []) {
  return {
    charts: [],
    calculations,
    gridSettings: {
      columnCount: 12,
      rowHeight: 100,
      containerPadding: 10,
      showBackgroundMarkers: true,
    },
    metadata: {
      name: "Test",
      version: 1,
      createdAt: "2025-01-01T00:00:00.000Z",
      modifiedAt: "2025-01-01T00:00:00.000Z",
    },
    colorScales: [],
  } satisfies SavedDataStructure;
}

describe("DataLayerProvider", () => {
  it("exposes source columns without the internal row id", () => {
    render(
      <DataLayerProvider data={data}>
        <Probe />
      </DataLayerProvider>
    );

    expect(screen.getByTestId("rows")).toHaveTextContent("2");
    expect(screen.getByTestId("columns")).toHaveTextContent("name");
    expect(screen.getByTestId("columns")).toHaveTextContent("value");
    expect(screen.getByTestId("columns")).not.toHaveTextContent("__ID");
  });

  it("replaces data when the input prop changes", async () => {
    const view = render(
      <DataLayerProvider data={data}>
        <Probe />
      </DataLayerProvider>
    );

    view.rerender(
      <DataLayerProvider data={[{ name: "C", value: 7 }]}>
        <Probe />
      </DataLayerProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("rows")).toHaveTextContent("1")
    );
    expect(screen.getByTestId("columns")).toHaveTextContent("name");
  });

  it("restores saved calculations when the input prop changes", async () => {
    const view = render(
      <DataLayerProvider data={data}>
        <Probe />
      </DataLayerProvider>
    );
    const calculation = {
      expression: parseExpression("value * 2"),
      resultColumnName: "double",
    };

    view.rerender(
      <DataLayerProvider data={data} savedData={savedData([calculation])}>
        <Probe />
      </DataLayerProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("calculations")).toHaveTextContent("1")
    );
    expect(screen.getByTestId("columns")).toHaveTextContent("double");
    expect(screen.getByTestId("values")).toHaveTextContent("4");
  });
});
