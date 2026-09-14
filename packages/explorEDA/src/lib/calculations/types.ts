// Base interface for common fields
export interface BaseExpression {
  id: string;
  name: string;
  expression: string;
  dependencies: string[];
  rawInput: string;
}

export interface BasicExpression extends BaseExpression {
  type: "basic";
  left: Expression;
  right: Expression;
  operator: string;
}

export interface FunctionExpression extends BaseExpression {
  type: "function";
  functionName: string;
  arguments: Expression[];
  functionCategory?: string;
  returnType?: string;
  parameterTypes?: string[];
}

export interface TernaryExpression extends BaseExpression {
  type: "ternary";
  condition: Expression;
  trueBranch: Expression;
  falseBranch: Expression;
}

export interface UnaryExpression extends BaseExpression {
  type: "unary";
  operand: Expression;
  operator: string;
}

export interface LiteralExpression extends BaseExpression {
  type: "literal";
  value: CalculationValue;
}

export type Expression =
  | BasicExpression
  | FunctionExpression
  | TernaryExpression
  | UnaryExpression
  | LiteralExpression;

export interface CalculationResult {
  success: boolean;
  value: CalculationValue;
  error?: string;
  metadata?: {
    groupKey?: string;
    rank?: number;
    total?: number;
    sourceRows?: Record<string, CalculationValue>[];
  };
}

export interface CalculationContext {
  data: Record<string, CalculationValue>[];
  variables: Map<string, CalculationValue>;
}
import { datum } from "@/types/ChartTypes";

export type CalculationValue = datum | null | Date;
