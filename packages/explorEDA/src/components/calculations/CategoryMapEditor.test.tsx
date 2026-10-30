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

it("reviews suggestions without accepting any, and saves accepted ones as explicit entries", async () => {
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
        { Region: "North" },
        { Region: "North" },
        { Region: "north" },
        { Region: "North " },
        { Region: "US" },
        { Region: "us" },
        { Region: "Café" },
        { Region: "Café" },
      ]}
      charts={[]}
    >
      <CalculationEditorProvider>
        <Workspace />
      </CalculationEditorProvider>
    </DataLayerProvider>
  );
  act(() => mapCategories!("Region"));
  fireEvent.click(screen.getByRole("button", { name: "Trim edges" }));
  fireEvent.click(screen.getByRole("button", { name: "Ignore case" }));
  const list = () => screen.getByRole("region", { name: "Suggested groups" });
  // North with its case and space variants, and US with us; the two
  // spellings of Café stay apart.
  expect(within(list()).getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("0 values mapped · others kept")).toBeInTheDocument();

  const [north, us] = within(list()).getAllByRole("listitem");
  fireEvent.click(within(us!).getByRole("button", { name: "Dismiss" }));
  fireEvent.click(within(north!).getByRole("button", { name: "Accept" }));
  expect(
    screen.getByText("Every suggestion is accepted or dismissed.")
  ).toBeInTheDocument();
  expect(screen.getByText("2 values mapped · others kept")).toBeInTheDocument();
  expect(state.calculations).toEqual([]);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  });
  expect(state.calculations.map((calc) => calc.expression.rawInput)).toEqual([
    'recode(["Region"], "north", "North", "North ", "North")',
  ]);
});

it("renames a result category to merge it, and Enter never applies", async () => {
  let state!: ReturnType<typeof useStateLayer>;
  let mapCategories!: ReturnType<typeof useMapCategories>;
  function Workspace() {
    state = useStateLayer();
    mapCategories = useMapCategories();
    return null;
  }
  render(
    <DataLayerProvider
      data={[{ Country: "USA" }, { Country: "US" }, { Country: "Canada" }]}
      charts={[]}
    >
      <CalculationEditorProvider>
        <Workspace />
      </CalculationEditorProvider>
    </DataLayerProvider>
  );
  act(() => mapCategories!("Country"));
  const target = screen.getByLabelText("New category for “USA”");
  fireEvent.change(target, { target: { value: "United States" } });
  fireEvent.keyDown(target, { key: "Enter" });
  expect(screen.getByLabelText("New category for “US”")).toHaveFocus();
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  // Renaming "US" to an existing name merges the two groups.
  fireEvent.click(screen.getByRole("button", { name: "Rename “US”" }));
  const rename = screen.getByRole("textbox", { name: "Rename “US”" });
  fireEvent.change(rename, { target: { value: "United States" } });
  fireEvent.keyDown(rename, { key: "Enter" });
  const result = screen.getByRole("region", { name: /Result/ });
  expect(within(result).getByText(/3 → 2 categories/)).toBeInTheDocument();

  await act(async () => {
    fireEvent.keyDown(screen.getByLabelText("New field"), {
      key: "Enter",
      metaKey: true,
    });
  });
  expect(state.calculations.map((calc) => calc.expression.rawInput)).toEqual([
    'recode(["Country"], "USA", "United States", "US", "United States")',
  ]);
});
