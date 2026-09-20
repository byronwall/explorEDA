import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { parseExpression } from "@/lib/calculations/parser/semantics";

describe("field settings provider", () => {
  it("keeps raw rows while sharing converted values with calculations and restore", async () => {
    const data = [
      { revenue: "12.5", region: 1 },
      { revenue: "NA", region: "1" },
      { revenue: "bad", region: 2 },
    ];
    let latest: any;
    function Probe() {
      latest = {
        data: useDataLayer((state) => state.data),
        rawData: useDataLayer((state) => state.rawData),
        update: useDataLayer((state) => state.updateFieldSettings),
        addCalculation: useDataLayer((state) => state.addCalculation),
        getColumnData: useDataLayer((state) => state.getColumnData),
        save: useDataLayer((state) => state.saveAnalysisToStructure),
        restore: useDataLayer((state) => state.restoreAnalysisFromStructure),
      };
      return null;
    }

    render(
      <DataLayerProvider data={data} charts={[]}>
        <Probe />
      </DataLayerProvider>
    );

    await act(async () => {
      await latest.addCalculation({
        resultColumnName: "double",
        expression: parseExpression("revenue * 2"),
      });
      latest.update("revenue", { type: "numeric", nullTokens: ["NA"] });
    });

    expect(latest.rawData[0].revenue).toBe("12.5");
    expect(latest.rawData[1].revenue).toBe("NA");
    expect(latest.data.map((row: any) => row.revenue)).toEqual([
      12.5,
      undefined,
      undefined,
    ]);
    expect(latest.getColumnData("double")).toMatchObject({ 0: 25 });
    expect(latest.getColumnData("double")[1]).toBeUndefined();

    const saved = latest.save();
    expect(saved.data.map((row: any) => row.revenue)).toEqual([
      "12.5",
      "NA",
      "bad",
    ]);
    expect(saved.settings.fieldSettings?.revenue).toMatchObject({
      type: "numeric",
    });

    await act(async () => latest.restore(saved));
    expect(latest.data.map((row: any) => row.revenue)).toEqual([
      12.5,
      undefined,
      undefined,
    ]);
  });
});
