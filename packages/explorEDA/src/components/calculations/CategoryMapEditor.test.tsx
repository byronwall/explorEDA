import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { buildFieldProfile } from "@/lib/fieldProfiles";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import {
  CalculationEditorProvider,
  useMapCategories,
} from "./CalculationEditor";

const useStateLayer = () => useDataLayer((state) => state);

it("merges selected values in a draft, changes nothing on Cancel, and applies one recode()", async () => {
  let state!: ReturnType<typeof useStateLayer>;
  let mapCategories!: ReturnType<typeof useMapCategories>;
  function Workspace() {
    state = useStateLayer();
    mapCategories = useMapCategories();
    return null;
  }
  render(
    <DataLayerProvider
      data={[
        { Country: "USA" },
        { Country: "US" },
        { Country: " USA" },
        { Country: "Canada" },
        { Country: null },
      ]}
      charts={[]}
    >
      <CalculationEditorProvider>
        <Workspace />
      </CalculationEditorProvider>
    </DataLayerProvider>
  );
  const open = () => act(() => mapCategories!("Country"));

  open();
  fireEvent.click(screen.getByRole("checkbox", { name: "Select “USA”" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Select “ USA”" }));
  fireEvent.change(screen.getByLabelText("Merge selected into"), {
    target: { value: "United States" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Merge" }));
  const result = screen.getByRole("region", { name: /Result/ });
  expect(within(result).getByText(/5 → 4 categories/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(state.calculations).toEqual([]);

  // A new draft starts clean.
  open();
  expect(screen.getByText("0 values mapped · others kept")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("New category for “US”"), {
    target: { value: "United States" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Make missing missing" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  });
  expect(state.calculations.map((calc) => calc.expression.rawInput)).toEqual([
    'recode(["Country"], "US", "United States", null, null)',
  ]);
  expect(Object.values(state.getColumnData("Country group"))).toEqual([
    "USA",
    "United States",
    " USA",
    "Canada",
    // Calculated columns store missing as undefined.
    undefined,
  ]);

  // Codes as number-like text are still categories, not numbers.
  await act(async () => {
    await state.addCalculation({
      resultColumnName: "Code",
      expression: parseExpression(
        'recode(["Country"], "USA", "1", "US", "2", " USA", "1", "Canada", "3", "9")'
      ),
    });
  });
  expect(buildFieldProfile("Code", state.getColumnData("Code")).dataType).toBe(
    "categorical"
  );
});
