import { getFunction, numericValue } from "../functions/registry";
import type {
  CalculationContext,
  CalculationResult,
  CalculationValue,
  Expression,
} from "../types";

export interface CalculationStep {
  id: string;
  depth: number;
  label: string;
  value?: CalculationValue;
  error?: string;
}

export function validateExpression(
  expression: Expression,
  fields: string[]
): void {
  for (const field of expression.dependencies) {
    if (!fields.includes(field)) throw new Error(`Unknown field: ${field}`);
  }
  switch (expression.type) {
    case "function":
      getFunction(expression.functionName, expression.arguments.length);
      expression.arguments.forEach((arg) => validateExpression(arg, fields));
      break;
    case "basic":
      validateExpression(expression.left, fields);
      validateExpression(expression.right, fields);
      break;
    case "unary":
      validateExpression(expression.operand, fields);
      break;
    case "ternary":
      validateExpression(expression.condition, fields);
      validateExpression(expression.trueBranch, fields);
      validateExpression(expression.falseBranch, fields);
  }
}

export class Calculator {
  private depth = 0;

  constructor(
    private context: CalculationContext,
    private steps?: CalculationStep[]
  ) {}

  evaluate(expression: Expression): CalculationResult {
    try {
      return { success: true, value: this.value(expression) };
    } catch (error) {
      return {
        success: false,
        value: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private value(expression: Expression): CalculationValue {
    const depth = this.depth++;
    const label =
      expression.type === "literal"
        ? (expression.dependencies[0] ?? String(expression.value))
        : expression.type === "function"
          ? expression.functionName
          : expression.type === "ternary"
            ? "conditional"
            : expression.operator;
    try {
      const result = this.evaluateValue(expression);
      if (typeof result === "number" && !Number.isFinite(result)) {
        throw new Error("Calculation produced a non-finite number");
      }
      this.steps?.push({ id: expression.id, depth, label, value: result });
      return result;
    } catch (error) {
      this.steps?.push({
        id: expression.id,
        depth,
        label,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      this.depth--;
    }
  }

  private evaluateValue(expression: Expression): CalculationValue {
    switch (expression.type) {
      case "literal": {
        // The parser records a dependency only for a field reference, never quoted text.
        const field = expression.dependencies[0];
        if (field === undefined) return expression.value;
        if (!this.context.variables.has(field))
          throw new Error(`Undefined variable: ${field}`);
        return this.context.variables.get(field);
      }
      case "function":
        return getFunction(
          expression.functionName,
          expression.arguments.length
        ).evaluate(...expression.arguments.map((arg) => this.value(arg)));
      case "ternary":
        if (
          !expression.condition ||
          !expression.trueBranch ||
          !expression.falseBranch
        ) {
          throw new Error("Invalid ternary expression: missing branches");
        }
        return this.value(
          this.value(expression.condition)
            ? expression.trueBranch
            : expression.falseBranch
        );
      case "unary": {
        if (!expression.operand)
          throw new Error("Invalid unary expression: missing operand");
        const value = this.value(expression.operand);
        switch (expression.operator) {
          case "!":
            return !value;
          case "-":
            return -numericValue(value);
          case "+":
            return numericValue(value);
          default:
            throw new Error(`Unknown unary operator: ${expression.operator}`);
        }
      }
      case "basic": {
        if (!expression.left || !expression.right)
          throw new Error("Invalid basic expression: missing operands");
        const left = this.value(expression.left);
        // Do not evaluate an unused branch, such as a guarded division by zero.
        if (expression.operator === "&&")
          return Boolean(left) && Boolean(this.value(expression.right));
        if (expression.operator === "||")
          return Boolean(left) || Boolean(this.value(expression.right));
        const right = this.value(expression.right);
        if (expression.operator === "==")
          return left == null ? right == null : left === right;
        if (expression.operator === "!=")
          return left == null ? right != null : left !== right;
        const a = numericValue(left);
        const b = numericValue(right);
        switch (expression.operator) {
          case "+":
            return a + b;
          case "-":
            return a - b;
          case "*":
            return a * b;
          case "/":
            if (b === 0) throw new Error("Division by zero");
            return a / b;
          case "^":
            return a ** b;
          case ">":
            return a > b;
          case ">=":
            return a >= b;
          case "<":
            return a < b;
          case "<=":
            return a <= b;
          default:
            throw new Error(`Unknown operator: ${expression.operator}`);
        }
      }
      default:
        throw new Error("Unknown expression type");
    }
  }
}
