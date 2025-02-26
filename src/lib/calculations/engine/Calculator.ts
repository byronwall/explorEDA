import { parseExpression } from "../parser/semantics";
import {
  type AdvancedExpression,
  type BasicExpression,
  type CalculationContext,
  type CalculationResult,
  type Expression,
  type FunctionExpression,
  type GroupExpression,
  type LiteralExpression,
  type RankExpression,
  type TernaryExpression,
  type UnaryExpression,
} from "../types";

type CalcFunction = (...args: any[]) => any;

export class Calculator {
  private cache: Map<string, any>;

  constructor(private context: CalculationContext) {
    this.cache = context.cache || new Map();
  }

  async evaluate(expression: Expression): Promise<CalculationResult> {
    try {
      // Check cache first
      if (this.cache.has(expression.id)) {
        return {
          success: true,
          value: this.cache.get(expression.id),
        };
      }

      let result: any;

      switch (expression.type) {
        case "basic":
          result = await this.evaluateBasic(expression as BasicExpression);
          break;
        case "function":
          result = await this.evaluateFunction(
            expression as FunctionExpression
          );
          break;
        case "group":
          result = await this.evaluateGroup(expression as GroupExpression);
          break;
        case "rank":
          result = await this.evaluateRank(expression as RankExpression);
          break;
        case "advanced":
          result = await this.evaluateAdvanced(
            expression as AdvancedExpression
          );
          break;
        case "ternary":
          result = await this.evaluateTernary(expression as TernaryExpression);
          break;
        case "unary":
          result = await this.evaluateUnary(expression as UnaryExpression);
          break;
        default:
          throw new Error(
            `Unknown expression type: ${(expression as any).type}`
          );
      }

      // Cache the result
      this.cache.set(expression.id, result);

      return {
        success: true,
        value: result,
      };
    } catch (error: unknown) {
      return {
        success: false,
        value: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async evaluateBasic(expression: BasicExpression): Promise<any> {
    if (!expression.left || !expression.right) {
      throw new Error(`Invalid basic expression: missing operands`);
    }
    return this.evaluateExpression(expression);
  }

  private async evaluateFunction(expression: FunctionExpression): Promise<any> {
    // Evaluate all arguments first
    const evaluatedArgs = await Promise.all(
      expression.arguments.map(async (arg: Expression) => {
        // For each argument, first parse it if it's a string expression
        const parsedArg =
          typeof arg.expression === "string"
            ? parseExpression(arg.expression)
            : arg;

        // Then evaluate it
        return this.evaluateExpression(parsedArg);
      })
    );

    // Get the function implementation
    const func = this.getFunction(expression.functionName);
    if (!func) {
      throw new Error(`Unknown function: ${expression.functionName}`);
    }

    // Execute the function with evaluated arguments
    return func(evaluatedArgs);
  }

  private async evaluateGroup(
    expression: GroupExpression
  ): Promise<Record<string, any>> {
    const groupBy = expression.groupBy;
    const aggregation = expression.aggregation;

    // Group the data
    const groups = new Map<string, any[]>();
    for (const row of this.context.data) {
      const key = groupBy.map((field: string) => row[field]).join(":");
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    }

    // Apply aggregation to each group
    const results = new Map<string, any>();
    for (const [key, groupData] of groups) {
      results.set(key, this.aggregate(groupData, aggregation));
    }

    return Object.fromEntries(results);
  }

  private async evaluateRank(
    expression: RankExpression
  ): Promise<Record<number, number>> {
    const rankBy = expression.rankBy;
    const isNormalized = expression.isNormalized;
    const isCumulative = expression.isCumulative;

    // Sort the data
    const sortedData = [...this.context.data].sort((a, b) => {
      for (const field of rankBy) {
        if (a[field] < b[field]) {
          return -1;
        }
        if (a[field] > b[field]) {
          return 1;
        }
      }
      return 0;
    });

    // Assign ranks
    const ranks = new Map<number, number>();
    sortedData.forEach((row, index) => {
      const rank = index + 1;
      ranks.set(row.id, isNormalized ? rank / sortedData.length : rank);
    });

    if (isCumulative) {
      let sum = 0;
      const sortedRanks = Array.from(ranks.entries()).sort(([id1], [id2]) => {
        const row1 = sortedData.find((row) => row.id === id1);
        const row2 = sortedData.find((row) => row.id === id2);
        if (!row1 || !row2) {
          return 0;
        }
        for (const field of rankBy) {
          if (row1[field] < row2[field]) {
            return -1;
          }
          if (row1[field] > row2[field]) {
            return 1;
          }
        }
        return 0;
      });

      for (const [id, value] of sortedRanks) {
        sum += value;
        ranks.set(id, sum);
      }
    }

    return Object.fromEntries(ranks);
  }

  private async evaluateAdvanced(expression: AdvancedExpression): Promise<any> {
    // This would be implemented based on the specific advanced analytics needed
    throw new Error("Advanced analytics not implemented yet");
  }

  private getFunction(name: string): CalcFunction | undefined {
    const functions: Record<string, CalcFunction> = {
      sum: (values: number[]) => values.reduce((a, b) => a + b, 0),
      avg: (values: number[]) =>
        values.reduce((a, b) => a + b, 0) / values.length,
      min: (values: number[]) => Math.min(...values),
      max: (values: number[]) => Math.max(...values),
      count: (values: any[]) => values.length,
    };

    return functions[name.toLowerCase()];
  }

  private aggregate(data: any[], type: string): any {
    const values = data.map((row) => row.value);

    switch (type) {
      case "sum":
        return values.reduce((a, b) => a + b, 0);
      case "average":
        return values.reduce((a, b) => a + b, 0) / values.length;
      case "min":
        return Math.min(...values);
      case "max":
        return Math.max(...values);
      case "count":
        return values.length;
      case "countUnique":
        return new Set(values).size;
      default:
        throw new Error(`Unknown aggregation type: ${type}`);
    }
  }

  private evaluateExpression(expr: Expression): number {
    if (expr.type === "literal") {
      const literalExpr = expr as LiteralExpression;
      if (literalExpr.value !== undefined) {
        // If it's a string and looks like an identifier, try to resolve it from variables
        if (
          typeof literalExpr.value === "string" &&
          /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(literalExpr.value)
        ) {
          const value = this.context.variables.get(literalExpr.value);
          if (value === undefined) {
            throw new Error(`Undefined variable: ${literalExpr.value}`);
          }
          return Number(value);
        }
        return Number(literalExpr.value);
      }
      // Handle identifiers in the name field
      if (
        typeof literalExpr.name === "string" &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(literalExpr.name)
      ) {
        const value = this.context.variables.get(literalExpr.name);
        if (value === undefined) {
          throw new Error(`Undefined variable: ${literalExpr.name}`);
        }
        return Number(value);
      }
      return Number(literalExpr.name);
    }

    if (expr.type === "basic") {
      const basicExpr = expr as BasicExpression;
      if (!basicExpr.left || !basicExpr.right) {
        throw new Error(`Invalid basic expression: missing operands`);
      }

      const left = this.evaluateExpression(basicExpr.left);
      const right = this.evaluateExpression(basicExpr.right);

      switch (basicExpr.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          if (right === 0) {
            throw new Error("Division by zero");
          }
          return left / right;
        case "^":
          return Math.pow(left, right);
        default:
          throw new Error(`Unknown operator: ${basicExpr.operator}`);
      }
    }

    if (expr.type === "unary") {
      const unaryExpr = expr as UnaryExpression;
      if (!unaryExpr.operand) {
        throw new Error(`Invalid unary expression: missing operand`);
      }

      const operand = this.evaluateExpression(unaryExpr.operand);

      switch (unaryExpr.operator) {
        case "-":
          return -operand;
        case "+":
          return operand;
        default:
          throw new Error(`Unknown unary operator: ${unaryExpr.operator}`);
      }
    }

    if (expr.type === "ternary") {
      const ternaryExpr = expr as TernaryExpression;
      if (
        !ternaryExpr.condition ||
        !ternaryExpr.trueBranch ||
        !ternaryExpr.falseBranch
      ) {
        throw new Error(`Invalid ternary expression: missing branches`);
      }

      const condition = this.evaluateExpression(ternaryExpr.condition);
      return condition
        ? this.evaluateExpression(ternaryExpr.trueBranch)
        : this.evaluateExpression(ternaryExpr.falseBranch);
    }

    throw new Error(`Unsupported expression type: ${expr.type}`);
  }

  private async evaluateUnary(expression: UnaryExpression): Promise<number> {
    if (!expression.operand) {
      throw new Error(`Invalid unary expression: missing operand`);
    }
    return this.evaluateExpression(expression);
  }

  private async evaluateTernary(expression: TernaryExpression): Promise<any> {
    if (
      !expression.condition ||
      !expression.trueBranch ||
      !expression.falseBranch
    ) {
      throw new Error(`Invalid ternary expression: missing branches`);
    }
    return this.evaluateExpression(expression);
  }

  // Date Processing Functions
  private formatDate(date: Date, format: string): string {
    throw new Error("Date formatting not implemented");
  }

  private extractDateComponent(
    date: Date,
    component: "year" | "month" | "day" | "quarter" | "week"
  ): number {
    throw new Error("Date component extraction not implemented");
  }

  // String Operation Functions
  private concatenateStrings(strings: string[]): string {
    throw new Error("String concatenation not implemented");
  }

  private extractSubstring(str: string, start: number, end?: number): string {
    throw new Error("Substring extraction not implemented");
  }

  private patternMatch(
    str: string,
    pattern: string,
    replacement?: string
  ): string | string[] {
    throw new Error("Pattern matching not implemented");
  }

  // Statistical Functions
  private calculatePercentile(values: number[], percentile: number): number {
    throw new Error("Percentile calculation not implemented");
  }

  private calculateStandardDeviation(values: number[]): number {
    throw new Error("Standard deviation calculation not implemented");
  }

  private calculateVariance(values: number[]): number {
    throw new Error("Variance calculation not implemented");
  }

  private calculateMedian(values: number[]): number {
    throw new Error("Median calculation not implemented");
  }

  private calculateZScore(value: number, mean: number, stdDev: number): number {
    throw new Error("Z-score calculation not implemented");
  }

  // Advanced Analytics Functions
  private performSOM(
    data: number[][],
    options: Record<string, any>
  ): number[][] {
    throw new Error("Self-organizing maps not implemented");
  }

  private performPCA(data: number[][], components: number): number[][] {
    throw new Error("PCA not implemented");
  }

  private performUMAP(
    data: number[][],
    options: Record<string, any>
  ): number[][] {
    throw new Error("UMAP transformation not implemented");
  }

  private performTSNE(
    data: number[][],
    options: Record<string, any>
  ): number[][] {
    throw new Error("t-SNE transformation not implemented");
  }

  // Regression Analysis Functions
  private performLinearRegression(
    x: number[],
    y: number[]
  ): Record<string, any> {
    throw new Error("Linear regression not implemented");
  }

  private performPolynomialRegression(
    x: number[],
    y: number[],
    degree: number
  ): Record<string, any> {
    throw new Error("Polynomial regression not implemented");
  }

  private calculateResiduals(
    observed: number[],
    predicted: number[]
  ): number[] {
    throw new Error("Residuals calculation not implemented");
  }

  private performANOVA(groups: number[][]): Record<string, any> {
    throw new Error("ANOVA not implemented");
  }

  // Data Transformation Functions
  private normalizeData(values: number[]): number[] {
    throw new Error("Data normalization not implemented");
  }

  private standardizeData(values: number[]): number[] {
    throw new Error("Data standardization not implemented");
  }

  private logTransform(values: number[], base?: number): number[] {
    throw new Error("Logarithmic transformation not implemented");
  }

  private binData(
    values: number[],
    binCount: number
  ): Record<string, number[]> {
    throw new Error("Data binning not implemented");
  }

  private createDummyVariables(categories: string[]): Record<string, number[]> {
    throw new Error("Dummy variable creation not implemented");
  }
}
