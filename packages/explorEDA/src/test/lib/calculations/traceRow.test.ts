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
