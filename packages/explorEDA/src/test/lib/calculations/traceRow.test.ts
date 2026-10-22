import { expect, it } from "vitest";
import { CalculationManager } from "../../../lib/calculations/CalculationState";
import { parseExpression } from "../../../lib/calculations/parser/semantics";

it("traces only evaluated calculation steps and matches the stored value", () => {
  const rows = [{ __ID: 0, price: 10, cost: 4 }];
  const calculations = [
    { resultColumnName: "net", expression: parseExpression("price - cost") },
    {
      resultColumnName: "ratio",
      expression: parseExpression("if net > 0 then net / price else 1 / 0"),
    },
  ];
  const manager = new CalculationManager(rows, calculations);
  const trace = manager.traceRow("ratio", 0)!;
  expect(trace.value).toBe(manager.executeCalculation(calculations[1]!).get(0));
  expect(trace.dependencies[0]?.value).toBe(6);
  expect(trace.steps.some((step) => step.label === "conditional")).toBe(true);
  expect(trace.steps.some((step) => step.error === "Division by zero")).toBe(
    false
  );
  expect(
    trace.steps.some((step) => step.label === "price" && step.value === 10)
  ).toBe(true);
});

it("traces an absent field the way the batch evaluates it", () => {
  const rows = [{ __ID: 0 }, { __ID: 1, x: undefined }, { __ID: 2, x: 4 }];
  const copy = { resultColumnName: "copy", expression: parseExpression("x") };
  const manager = new CalculationManager(rows, [copy]);
  const batch = manager.executeCalculation(copy);
  for (const row of rows) {
    const trace = manager.traceRow("copy", row.__ID)!;
    expect(trace.value).toBe(batch.get(row.__ID));
    expect(trace.error).toBe(manager.getErrors("copy").get(row.__ID));
  }
  expect(manager.traceRow("copy", 0)?.inputs).toEqual([
    { field: "x", value: undefined },
  ]);
});

it("keeps a dependency's error in the batch and the trace", () => {
  const rows = [
    { __ID: 0, price: 10, cost: 0 },
    { __ID: 1, price: 10, cost: 5 },
  ];
  const calculations = [
    { resultColumnName: "ratio", expression: parseExpression("price / cost") },
    { resultColumnName: "scaled", expression: parseExpression("ratio * 2") },
  ];
  const manager = new CalculationManager(rows, calculations);
  for (const row of rows) {
    for (const name of ["ratio", "scaled"]) {
      expect(manager.traceRow(name, row.__ID)?.error).toBe(
        manager.getErrors(name).get(row.__ID)
      );
    }
  }
  expect(manager.getErrors("ratio").get(0)).toBe("Division by zero");
  expect(manager.traceRow("scaled", 0)?.dependencies[0]?.error).toBe(
    "Division by zero"
  );
});
