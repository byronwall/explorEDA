import { datum } from "@/types/ChartTypes";
import { timeFormat } from "d3-time-format";
import {
  type BasicExpression,
  type CalculationContext,
  type CalculationResult,
  type Expression,
  type FunctionExpression,
  type LiteralExpression,
  type TernaryExpression,
  type UnaryExpression,
} from "../types";

type CalcFunction = (...args: any[]) => any;

export class Calculator {
  constructor(private context: CalculationContext) {}

  evaluate(expression: Expression): CalculationResult {
    try {
      let result: any;
      let funcResult: CalculationResult;

      switch (expression.type) {
        case "basic":
          result = this.evaluateBasic(expression as BasicExpression);
          break;
        case "function":
          funcResult = this.evaluateFunction(expression as FunctionExpression);
          if (!funcResult.success) {
            return funcResult;
          }
          result = funcResult.value;
          break;
        case "ternary":
          result = this.evaluateTernary(expression as TernaryExpression);
          break;
        case "unary":
          result = this.evaluateUnary(expression as UnaryExpression);
          break;
        case "literal":
          result = this.evaluateLiteral(expression as LiteralExpression);
          break;
        default:
          throw new Error(
            `Unknown expression type: ${(expression as any).type}`
          );
      }

      // Ensure we return a proper CalculationResult
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

  private evaluateBasic(expression: BasicExpression): datum {
    if (!expression.left || !expression.right) {
      throw new Error(`Invalid basic expression: missing operands`);
    }

    const leftResult = this.evaluate(expression.left);
    if (!leftResult.success) {
      throw new Error(`Failed to evaluate left operand: ${leftResult.error}`);
    }

    const rightResult = this.evaluate(expression.right);
    if (!rightResult.success) {
      throw new Error(`Failed to evaluate right operand: ${rightResult.error}`);
    }

    const left = leftResult.value;
    const right = rightResult.value;

    // Convert operands to numbers if they're strings that look like numbers
    const leftNum = typeof left === "string" ? Number(left) : left;
    const rightNum = typeof right === "string" ? Number(right) : right;

    if (isNaN(leftNum) || isNaN(rightNum)) {
      throw new Error(
        `Invalid operands for operator ${expression.operator}: ${left}, ${right}`
      );
    }

    switch (expression.operator) {
      case "+":
        return leftNum + rightNum;
      case "-":
        return leftNum - rightNum;
      case "*":
        return leftNum * rightNum;
      case "/":
        if (rightNum === 0) {
          throw new Error("Division by zero");
        }
        return leftNum / rightNum;
      case "^":
        return Math.pow(leftNum, rightNum);
      default:
        throw new Error(`Unknown operator: ${expression.operator}`);
    }
  }

  private evaluateFunction(expression: FunctionExpression): CalculationResult {
    // Get the function implementation first
    const func = this.getFunction(expression.functionName);
    if (!func) {
      return {
        success: false,
        value: null,
        error: `Unknown function: ${expression.functionName}`,
      };
    }

    try {
      // Evaluate all arguments

      const evaluatedArgs = expression.arguments.map((arg: Expression) => {
        if (arg.type === "literal") {
          const literalArg = arg as LiteralExpression;

          // If it has a numeric value, use it directly
          if (literalArg.value !== undefined) {
            if (typeof literalArg.value === "number") {
              return literalArg.value;
            }

            // If it's a string literal, use it directly
            if (typeof literalArg.value === "string") {
              // Check if it's a variable reference
              if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(literalArg.value)) {
                const value = this.context.variables.get(literalArg.value);
                if (value !== undefined) {
                  return value;
                }
              }
              return literalArg.value;
            }

            return literalArg.value;
          }

          // If name is defined and it's a number, use it directly
          if (typeof literalArg.name === "string") {
            // If it looks like a number, convert it
            if (!isNaN(Number(literalArg.name))) {
              return Number(literalArg.name);
            }

            // If it looks like a variable, try to resolve it
            if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(literalArg.name)) {
              const value = this.context.variables.get(literalArg.name);
              if (value !== undefined) {
                return value;
              }
            }

            return literalArg.name;
          }

          return literalArg.value !== undefined
            ? literalArg.value
            : literalArg.name;
        }

        const result = this.evaluate(arg);
        if (!result.success) {
          throw new Error(`Failed to evaluate argument: ${result.error}`);
        }
        return result.value;
      });

      // For date functions, ensure the first argument is a Date object
      if (
        expression.functionName.toLowerCase() === "formatdate" ||
        expression.functionName.toLowerCase() === "extractdatecomponent"
      ) {
        if (!(evaluatedArgs[0] instanceof Date)) {
          try {
            // If it's a variable name, try to get the actual date from variables
            if (
              typeof evaluatedArgs[0] === "string" &&
              /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(evaluatedArgs[0])
            ) {
              const dateValue = this.context.variables.get(evaluatedArgs[0]);
              if (dateValue instanceof Date) {
                evaluatedArgs[0] = dateValue;
              } else if (dateValue !== undefined) {
                evaluatedArgs[0] = new Date(dateValue);
              }
            } else {
              evaluatedArgs[0] = new Date(evaluatedArgs[0]);
            }

            if (isNaN(evaluatedArgs[0].getTime())) {
              return {
                success: false,
                value: null,
                error: `Invalid date: ${evaluatedArgs[0]}`,
              };
            }
          } catch (error) {
            return {
              success: false,
              value: null,
              error: `Failed to convert argument to Date: ${
                error instanceof Error ? error.message : String(error)
              }`,
            };
          }
        }
      }

      // Execute the function with evaluated arguments
      const result = func(...evaluatedArgs);
      return {
        success: true,
        value: result,
      };
    } catch (error) {
      return {
        success: false,
        value: null,
        error: `Error executing function ${expression.functionName}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  private getFunction(name: string): CalcFunction | undefined {
    const functions: Record<string, CalcFunction> = {
      sum: (...values: number[]) => {
        return values.reduce((a, b) => Number(a) + Number(b), 0);
      },
      avg: (...values: number[]) => {
        return (
          values.reduce((a, b) => Number(a) + Number(b), 0) / values.length
        );
      },
      min: (...values: number[]) => {
        return Math.min(...values.map((v) => Number(v)));
      },
      max: (...values: number[]) => {
        return Math.max(...values.map((v) => Number(v)));
      },
      count: (...values: any[]) => {
        return values.length;
      },
      formatdate: (date: Date, format: string) => {
        return this.formatDate(date, format);
      },
      extractdatecomponent: (
        date: Date,
        component: "year" | "month" | "day" | "quarter" | "week"
      ) => {
        return this.extractDateComponent(date, component);
      },
    };

    // First try exact match
    if (name in functions) {
      return functions[name];
    }

    // Try case-insensitive match
    const lowerName = name.toLowerCase();
    const functionKey = Object.keys(functions).find(
      (key) => key.toLowerCase() === lowerName
    );
    return functionKey ? functions[functionKey] : undefined;
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

  private evaluateUnary(expression: UnaryExpression): datum {
    if (!expression.operand) {
      throw new Error(`Invalid unary expression: missing operand`);
    }
    return this.evaluateExpression(expression);
  }

  private evaluateTernary(expression: TernaryExpression): datum {
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
    try {
      const formatter = timeFormat(format);
      const result = formatter(date);
      return result;
    } catch (error) {
      throw new Error(
        `Error formatting date: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private getISOWeek(date: Date): number {
    try {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
      const week1 = new Date(d.getFullYear(), 0, 4);
      return (
        1 +
        Math.round(
          ((d.getTime() - week1.getTime()) / 86400000 -
            3 +
            ((week1.getDay() + 6) % 7)) /
            7
        )
      );
    } catch (error) {
      throw new Error(
        `Error calculating ISO week: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private extractDateComponent(
    date: Date,
    component: "year" | "month" | "day" | "quarter" | "week"
  ): number {
    try {
      let result: number;
      switch (component) {
        case "year":
          result = date.getFullYear();
          break;
        case "month":
          result = date.getMonth() + 1; // Adding 1 since getMonth() returns 0-11
          break;
        case "day":
          result = date.getDate();
          break;
        case "quarter":
          result = Math.floor(date.getMonth() / 3) + 1;
          break;
        case "week":
          result = this.getISOWeek(date);
          break;
        default:
          throw new Error(`Unknown date component: ${component}`);
      }
      return result;
    } catch (error) {
      throw new Error(
        `Error extracting date component: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private evaluateLiteral(expression: LiteralExpression): any {
    // If value is defined, use it first
    if (expression.value !== undefined) {
      // If it's a string that looks like an identifier, try to resolve it from variables
      if (
        typeof expression.value === "string" &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression.value)
      ) {
        const value = this.context.variables.get(expression.value);
        if (value === undefined) {
          throw new Error(`Undefined variable: ${expression.value}`);
        }
        return value;
      }
      // If it's a string that looks like a number, convert it
      if (
        typeof expression.value === "string" &&
        !isNaN(Number(expression.value))
      ) {
        return Number(expression.value);
      }
      return expression.value;
    }

    // If name is defined and looks like an identifier, try to resolve it from variables
    if (
      typeof expression.name === "string" &&
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression.name)
    ) {
      const value = this.context.variables.get(expression.name);
      if (value === undefined) {
        throw new Error(`Undefined variable: ${expression.name}`);
      }
      return value;
    }

    // If name is a string that looks like a number, convert it
    if (
      typeof expression.name === "string" &&
      !isNaN(Number(expression.name))
    ) {
      return Number(expression.name);
    }

    return expression.name;
  }
}
