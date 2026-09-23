import type { DatumObject, HasId } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import {
  Calculator,
  validateExpression,
  type CalculationStep,
} from "./engine/Calculator";
import type { CalculationValue, Expression } from "./types";

export interface CalculationDefinition {
  expression: Expression;
  resultColumnName: string;
}

export interface RowCalculationTrace {
  field: string;
  expression: string;
  value: datum;
  error?: string;
  steps: CalculationStep[];
  inputs: { field: string; value: CalculationValue }[];
  dependencies: RowCalculationTrace[];
}

export class CalculationManager<T extends DatumObject> {
  private calculations: CalculationDefinition[] = [];
  private results = new Map<string, Map<number, datum>>();
  private errors = new Map<string, Map<number, string>>();

  constructor(
    private data: (T & HasId)[],
    calculations: CalculationDefinition[] = []
  ) {
    this.setCalculations(calculations);
  }

  setCalculations(calculations: CalculationDefinition[]): Set<string> {
    const sourceFields = new Set(this.data.flatMap((row) => Object.keys(row)));
    const names = calculations.map((calc) => calc.resultColumnName);
    for (const name of names) {
      if (!name.trim()) throw new Error("Enter a result column name");
      if (
        sourceFields.has(name) ||
        names.filter((other) => other === name).length > 1
      ) {
        throw new Error(`Field already exists: ${name}`);
      }
    }
    const fields = [...sourceFields, ...names];
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (calc: CalculationDefinition) => {
      const name = calc.resultColumnName;
      if (visiting.has(name)) throw new Error(`Circular calculation: ${name}`);
      if (visited.has(name)) return;
      visiting.add(name);
      validateExpression(calc.expression, fields);
      for (const field of calc.expression.dependencies) {
        const dependency = calculations.find(
          (item) => item.resultColumnName === field
        );
        if (dependency) visit(dependency);
      }
      visiting.delete(name);
      visited.add(name);
    };
    calculations.forEach(visit);
    const affected = new Set([
      ...this.calculations.map((calc) => calc.resultColumnName),
      ...names,
    ]);
    // ponytail: edits clear all calculated results; invalidate dependents only if edit latency warrants it.
    this.calculations = [...calculations];
    this.results.clear();
    this.errors.clear();
    return affected;
  }

  addCalculation(calculation: CalculationDefinition): Set<string> {
    return this.setCalculations([...this.calculations, calculation]);
  }

  updateCalculation(
    name: string,
    calculation: CalculationDefinition
  ): Set<string> {
    if (!this.calculations.some((calc) => calc.resultColumnName === name)) {
      throw new Error(`Unknown calculation: ${name}`);
    }
    return this.setCalculations(
      this.calculations.map((calc) =>
        calc.resultColumnName === name ? calculation : calc
      )
    );
  }

  removeCalculation(name: string): Set<string> {
    return this.setCalculations(
      this.calculations.filter((calc) => calc.resultColumnName !== name)
    );
  }

  getCalculations(): CalculationDefinition[] {
    return [...this.calculations];
  }

  getErrors(name: string): Map<number, string> {
    const calculation = this.calculations.find(
      (calc) => calc.resultColumnName === name
    );
    if (calculation) this.executeCalculation(calculation);
    return this.errors.get(name) ?? new Map();
  }

  traceRow(name: string, rowId: number): RowCalculationTrace | undefined {
    const calc = this.calculations.find(
      (item) => item.resultColumnName === name
    );
    const row = this.data.find((item) => item.__ID === rowId);
    if (!calc || !row) return undefined;
    const dependencies = calc.expression.dependencies.flatMap((field) => {
      const trace = this.traceRow(field, rowId);
      return trace ? [trace] : [];
    });
    const variables = new Map<string, CalculationValue>(Object.entries(row));
    for (const field of calc.expression.dependencies) {
      const dependency = dependencies.find((item) => item.field === field);
      if (dependency) variables.set(field, dependency.value);
    }
    const steps: CalculationStep[] = [];
    const result = new Calculator(
      { data: this.data, variables },
      steps
    ).evaluate(calc.expression);
    return {
      field: name,
      expression: calc.expression.rawInput,
      value:
        result.success && !(result.value instanceof Date)
          ? (result.value ?? undefined)
          : undefined,
      error: result.error,
      steps,
      inputs: calc.expression.dependencies.map((field) => ({
        field,
        value: variables.get(field),
      })),
      dependencies,
    };
  }

  executeCalculation(calculation: CalculationDefinition): Map<number, datum> {
    const name = calculation.resultColumnName;
    const cached = this.results.get(name);
    if (cached) return cached;
    for (const field of calculation.expression.dependencies) {
      const dependency = this.calculations.find(
        (calc) => calc.resultColumnName === field
      );
      if (dependency) this.executeCalculation(dependency);
    }
    const values = new Map<number, datum>();
    const errors = new Map<number, string>();
    for (const row of this.data) {
      const variables = new Map<string, CalculationValue>(Object.entries(row));
      for (const field of calculation.expression.dependencies) {
        const results = this.results.get(field);
        variables.set(field, results ? results.get(row.__ID) : row[field]);
      }
      const result = new Calculator({ data: this.data, variables }).evaluate(
        calculation.expression
      );
      values.set(
        row.__ID,
        result.success && !(result.value instanceof Date)
          ? (result.value ?? undefined)
          : undefined
      );
      if (!result.success)
        errors.set(row.__ID, result.error ?? "Calculation failed");
    }
    this.results.set(name, values);
    this.errors.set(name, errors);
    return values;
  }
}
