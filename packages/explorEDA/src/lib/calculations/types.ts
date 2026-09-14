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
  value: any;
}

export type Expression =
  | BasicExpression
  | FunctionExpression
  | TernaryExpression
  | UnaryExpression
  | LiteralExpression;

export interface CalculationResult {
  success: boolean;
  value: any;
  error?: string;
  metadata?: {
    groupKey?: string;
    rank?: number;
    total?: number;
    sourceRows?: any[];
  };
}

export interface CalculationContext {
  data: Record<string, any>[];
  variables: Record<string, any>;
}
