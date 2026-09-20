import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, it } from "vitest";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { CalculationEditorProvider } from "./CalculationEditor";
import { CalculatedFieldBadge } from "./CalculatedFieldBadge";

const definition = (resultColumnName: string, expression: string) => ({
  resultColumnName,
  expression: parseExpression(expression),
});
const useStateLayer = () => useDataLayer((state) => state);

it("inspects a chain in place, keeps drafts across steps, and applies only the selected edit", async () => {
  let state!: ReturnType<typeof useStateLayer>;
  function Workspace() {
    state = useStateLayer();
    return (
      <CalculationEditorProvider>
        <CalculatedFieldBadge field="Retained" showName />
      </CalculationEditorProvider>
    );
  }
  render(
    <DataLayerProvider
      data={[
        { Revenue: 10, Cost: 2 },
        { Revenue: 20, Cost: 4 },
      ]}
      charts={[]}
    >
      <Workspace />
    </DataLayerProvider>
  );
  await act(async () => {
    await state.addCalculation(definition("Net", "Revenue - Cost"));
    await state.addCalculation(definition("Retained", "Net * 0.8"));
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Inspect Retained calculation" })
  );
  expect(screen.getByText("Net * 0.8")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Inspect chain & edit" }));
  await screen.findByText("Valid for all 2 rows.");
  const chain = () =>
    screen.getByRole("list", { name: "Calculation dependency chain" });
  fireEvent.click(within(chain()).getByRole("button", { name: /Net/ }));
  expect(screen.getByLabelText("Field name")).toHaveValue("Net");
  fireEvent.change(screen.getByLabelText("Formula"), {
    target: { value: "Revenue - Cost - 1" },
  });
  await screen.findByText("Valid for all 2 rows.");
  expect(state.getColumnData("Net")[0]).toBe(8);
  fireEvent.click(within(chain()).getByRole("button", { name: /Retained/ }));
  fireEvent.click(within(chain()).getByRole("button", { name: /Net/ }));
  expect(screen.getByLabelText("Formula")).toHaveValue("Revenue - Cost - 1");
  await waitFor(() =>
    expect(screen.getByRole("button", { name: /Apply changes/ })).toBeEnabled()
  );
  fireEvent.keyDown(screen.getByLabelText("Formula"), {
    key: "Enter",
    ctrlKey: true,
  });
  await waitFor(() => expect(state.getColumnData("Net")[0]).toBe(7));
  expect(state.getColumnData("Retained")[0]).toBeCloseTo(5.6);
  fireEvent.change(screen.getByLabelText("Formula"), {
    target: { value: "unknown(Revenue)" },
  });
  await screen.findByRole("alert");
  expect(screen.getByRole("button", { name: /Apply changes/ })).toBeDisabled();
  expect(screen.getByText(/The chain shows saved values/)).toBeInTheDocument();
  expect(within(chain()).queryByText("Draft preview")).not.toBeInTheDocument();
  expect(state.getColumnData("Net")[0]).toBe(7);
  fireEvent.click(screen.getByRole("button", { name: "Discard draft" }));
  expect(screen.getByLabelText("Formula")).toHaveValue("Revenue - Cost - 1");
});
