import type { CalculationDefinition } from "@/lib/calculations/CalculationState";
import type { datum } from "@/types/ChartTypes";

export function dependentCalculations(
  calculations: CalculationDefinition[],
  name: string
) {
  const names = new Set([name]);
  let added = true;
  while (added) {
    added = false;
    for (const calc of calculations) {
      if (
        !names.has(calc.resultColumnName) &&
        calc.expression.dependencies.some((field) => names.has(field))
      ) {
        names.add(calc.resultColumnName);
        added = true;
      }
    }
  }
  return calculations.filter(
    (calc) => calc.resultColumnName !== name && names.has(calc.resultColumnName)
  );
}

const numbers = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });
export function calculationValue(value: datum) {
  if (value == null) return "Missing";
  if (typeof value === "number") return numbers.format(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return value === "" ? '""' : value;
}
