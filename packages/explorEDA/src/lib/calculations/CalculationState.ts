import { DatumObject, HasId } from "@/providers/DataLayerProvider";
import { Calculator } from "./engine/Calculator";
import { CalculationContext, Expression } from "./types";
import { datum } from "@/types/ChartTypes";

export interface CalculationDefinition {
  expression: Expression;
  resultColumnName: string;
}

export interface CalculationStateType {
  calculations: CalculationDefinition[];
  calculationResults: Map<string, Map<number, any>>;
  dependencyGraph: Map<string, Set<string>>;
}

export const createCalculationState = (): CalculationStateType => {
  return {
    calculations: [],
    calculationResults: new Map(),
    dependencyGraph: new Map(),
  };
};

export class CalculationManager<T extends DatumObject> {
  private calculator: Calculator | null = null;
  private state: CalculationStateType;

  constructor(private data: (T & HasId)[]) {
    this.state = createCalculationState();
  }

  /**
   * Add a new calculation definition
   */
  addCalculation(calculation: CalculationDefinition): Set<string> {
    // Check if a calculation with this result column name already exists
    const existingIndex = this.state.calculations.findIndex(
      (calc) => calc.resultColumnName === calculation.resultColumnName
    );

    if (existingIndex !== -1) {
      throw new Error(
        `A calculation with result column name '${calculation.resultColumnName}' already exists`
      );
    }

    this.state.calculations.push(calculation);
    this.updateDependencyGraph(calculation);

    // Execute the calculation and collect all affected columns
    const affectedColumns = new Set<string>([calculation.resultColumnName]);

    // Find all dependent calculations that were executed
    const dependents = this.findDependents(calculation.resultColumnName);
    for (const dependent of dependents) {
      affectedColumns.add(dependent);
    }

    return affectedColumns;
  }

  /**
   * Remove a calculation by result column name
   */
  removeCalculation(resultColumnName: string): Set<string> {
    const affectedColumns = new Set<string>([resultColumnName]);
    const dependents = this.findDependents(resultColumnName);
    for (const dependent of dependents) {
      affectedColumns.add(dependent);
    }

    this.state.calculations = this.state.calculations.filter(
      (calc) => calc.resultColumnName !== resultColumnName
    );
    this.state.calculationResults.delete(resultColumnName);
    this.state.dependencyGraph.delete(resultColumnName);

    // Remove this calculation from other calculations' dependencies
    for (const [, dependencies] of this.state.dependencyGraph.entries()) {
      dependencies.delete(resultColumnName);
    }

    for (const columnName of dependents) {
      this.state.calculationResults.delete(columnName);
    }

    return affectedColumns;
  }

  /**
   * Get all calculation definitions
   */
  getCalculations(): CalculationDefinition[] {
    return [...this.state.calculations];
  }

  getPreceedingCalculations(
    calculation: CalculationDefinition
  ): CalculationDefinition[] {
    const precedents: CalculationDefinition[] = [];
    const visited = new Set<string>();
    const visit = (resultColumnName: string) => {
      if (visited.has(resultColumnName)) {
        return;
      }
      visited.add(resultColumnName);

      for (const dependency of this.state.dependencyGraph.get(
        resultColumnName
      ) ?? []) {
        visit(dependency);
      }

      const precedent = this.state.calculations.find(
        (calc) => calc.resultColumnName === resultColumnName
      );
      if (precedent) {
        precedents.push(precedent);
      }
    };

    for (const dependency of this.state.dependencyGraph.get(
      calculation.resultColumnName
    ) ?? []) {
      visit(dependency);
    }

    return precedents;
  }

  /**
   * Execute a specific calculation
   */
  executeCalculation(calculation: CalculationDefinition): Map<number, datum> {
    if (!this.calculator) {
      this.initializeCalculator();
    }

    const precedents = this.getPreceedingCalculations(calculation);
    for (const precedent of precedents) {
      this.executeCalculation(precedent);
    }

    const resultMap = new Map<number, datum>();

    // Execute the calculation for each row
    for (const row of this.data) {
      const context: CalculationContext = {
        data: this.data,
        variables: this.createVariablesForRow(row),
      };

      this.calculator = new Calculator(context);
      const result = this.calculator.evaluate(calculation.expression);

      if (result.success) {
        resultMap.set(row.__ID, result.value);
      } else {
        console.error(
          `Calculation error for ${calculation.resultColumnName}:`,
          result.error
        );
        resultMap.set(row.__ID, undefined);
      }
    }

    // Store the results
    this.state.calculationResults.set(calculation.resultColumnName, resultMap);

    return resultMap;
  }

  /**
   * Find all calculations that depend on a given calculation
   */
  private findDependents(resultColumnName: string): Set<string> {
    const dependents = new Set<string>();

    // Find calculations that directly depend on this calculation's result column
    for (const [
      calcName,
      dependencies,
    ] of this.state.dependencyGraph.entries()) {
      // Check if this calculation depends on the target calculation
      if (dependencies.has(resultColumnName)) {
        dependents.add(calcName);

        // Recursively find dependents of this dependent
        const nestedDependents = this.findDependents(calcName);
        for (const nestedName of nestedDependents) {
          dependents.add(nestedName);
        }
      }
    }

    return dependents;
  }

  /**
   * Update the dependency graph for a calculation
   */
  private updateDependencyGraph(calculation: CalculationDefinition): void {
    // Extract variable dependencies from the expression
    const dependencies = new Set<string>(calculation.expression.dependencies);

    // Update the dependency graph
    this.state.dependencyGraph.set(calculation.resultColumnName, dependencies);
  }

  /**
   * Initialize the calculator with current data
   */
  private initializeCalculator(): void {
    const context: CalculationContext = {
      data: this.data,
      variables: new Map(),
    };

    this.calculator = new Calculator(context);
  }

  /**
   * Create variables map for a specific row
   */
  private createVariablesForRow(row: T & HasId): Map<string, any> {
    const variables = new Map<string, any>();

    // Add all row fields as variables
    for (const [key, value] of Object.entries(row)) {
      if (key !== "__ID") {
        variables.set(key, value);
      }
    }

    // Add results from already calculated fields
    for (const calculation of this.state.calculations) {
      const results = this.state.calculationResults.get(
        calculation.resultColumnName
      );
      if (results && results.has(row.__ID)) {
        variables.set(calculation.resultColumnName, results.get(row.__ID));
      }
    }

    return variables;
  }
}
