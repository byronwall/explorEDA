import { type Expression } from "../types";
import * as ohm from "ohm-js";

// Define the grammar inline
const grammarSource = `Calculation {
  Expression = IfExpr | TernaryExpr | LogicalExpr

  LogicalExpr = LogicalExpr LogicalOp ComparisonExpr  -- binary
              | ComparisonExpr                        -- term

  ComparisonExpr = ComparisonExpr ComparisonOp AddExpr  -- binary
                 | AddExpr                              -- term

  AddExpr = AddExpr ("+" | "-") MulExpr  -- binary
         | MulExpr                       -- term

  MulExpr = MulExpr ("*" | "/") PowerExpr  -- binary
         | PowerExpr                       -- term

  PowerExpr = Term "^" PowerExpr  -- binary
           | Term                 -- term

  TernaryExpr = LogicalExpr "?" Expression ":" Expression
  Term = UnaryExpr | FunctionCall | ParenTerm | number | string | boolean | null | identifier
  UnaryExpr = UnaryOperator Term
  FunctionCall = identifier "(" ListOf<Expression, ","> ")"
  ParenTerm = "(" Expression ")"
  IfExpr = "if" Expression "then" Expression "else" Expression

  ComparisonOp = "==" | "!=" | "<=" | ">=" | "<" | ">"
  LogicalOp = "&&" | "||"
  UnaryOperator = "-" | "+" | "!"

  identifier = ~keyword letter (letter | digit | "_")*
  number = digit+ ("." digit+)?
  string = "\\"" stringChar* "\\""
  stringChar = ~("\\"" | "\\\\") any  -- nonEscape
             | "\\\\" any              -- escape
  boolean = "true" | "false"
  null = "null"

  // Built-in keywords
  keyword = "if" | "then" | "else" | "true" | "false" | "null"

  // Whitespace handling
  space += comment
  comment = "//" (~"\\n" any)* "\\n"  // Single line comments
}`;

// Create the grammar
const grammar = ohm.grammar(grammarSource);

export interface ParsedExpression {
  type: string;
  value?: any;
  children?: ParsedExpression[];
  operator?: string;
  left?: ParsedExpression;
  right?: ParsedExpression;
  name?: string;
  arguments?: ParsedExpression[];
  operand?: ParsedExpression;
  condition?: ParsedExpression;
  trueBranch?: ParsedExpression;
  falseBranch?: ParsedExpression;
  dependencies?: string[];
  expression?: string;
}

type Node = ohm.Node;

// Create semantics
const semantics = grammar.createSemantics();

semantics.addOperation<ParsedExpression>("eval", {
  Expression(e: Node): ParsedExpression {
    return e.eval();
  },
  LogicalExpr_binary(left: Node, op: Node, right: Node): ParsedExpression {
    return {
      type: "basic",
      operator: op.sourceString,
      expression: op.sourceString,
      left: left.eval(),
      right: right.eval(),
    };
  },
  LogicalExpr_term(term: Node): ParsedExpression {
    return term.eval();
  },
  ComparisonExpr_binary(left: Node, op: Node, right: Node): ParsedExpression {
    return {
      type: "basic",
      operator: op.sourceString,
      expression: op.sourceString,
      left: left.eval(),
      right: right.eval(),
    };
  },
  ComparisonExpr_term(term: Node): ParsedExpression {
    return term.eval();
  },
  AddExpr_binary(left: Node, op: Node, right: Node): ParsedExpression {
    return {
      type: "basic",
      operator: op.sourceString,
      expression: op.sourceString,
      left: left.eval(),
      right: right.eval(),
    };
  },
  AddExpr_term(term: Node): ParsedExpression {
    return term.eval();
  },
  MulExpr_binary(left: Node, op: Node, right: Node): ParsedExpression {
    return {
      type: "basic",
      operator: op.sourceString,
      expression: op.sourceString,
      left: left.eval(),
      right: right.eval(),
    };
  },
  MulExpr_term(term: Node): ParsedExpression {
    return term.eval();
  },
  PowerExpr_binary(left: Node, op: Node, right: Node): ParsedExpression {
    return {
      type: "basic",
      operator: op.sourceString,
      expression: op.sourceString,
      left: left.eval(),
      right: right.eval(),
    };
  },
  PowerExpr_term(term: Node): ParsedExpression {
    return term.eval();
  },
  LogicalExpr(expr: Node): ParsedExpression {
    return expr.eval();
  },
  ComparisonExpr(expr: Node): ParsedExpression {
    return expr.eval();
  },
  AddExpr(expr: Node): ParsedExpression {
    return expr.eval();
  },
  MulExpr(expr: Node): ParsedExpression {
    return expr.eval();
  },
  PowerExpr(expr: Node): ParsedExpression {
    return expr.eval();
  },
  TernaryExpr(...nodes: Node[]): ParsedExpression {
    const [condition, , trueBranch, , falseBranch] = nodes;
    return {
      type: "ternary",
      condition: condition.eval(),
      trueBranch: trueBranch.eval(),
      falseBranch: falseBranch.eval(),
      expression: "?:",
      name: `${condition.sourceString} ? ${trueBranch.sourceString} : ${falseBranch.sourceString}`,
    };
  },
  IfExpr(...nodes: Node[]): ParsedExpression {
    const [, condition, , trueBranch, , falseBranch] = nodes;
    return {
      type: "ternary",
      condition: condition.eval(),
      trueBranch: trueBranch.eval(),
      falseBranch: falseBranch.eval(),
      expression: "if",
      name: `if ${condition.sourceString} then ${trueBranch.sourceString} else ${falseBranch.sourceString}`,
    };
  },
  UnaryExpr(op: Node, expr: Node): ParsedExpression {
    return {
      type: "unary",
      operator: op.sourceString,
      expression: op.sourceString,
      operand: expr.eval(),
    };
  },
  FunctionCall(...nodes: Node[]): ParsedExpression {
    const [name, , args] = nodes;
    return {
      type: "function",
      name: name.sourceString,
      arguments: args.asIteration().children.map((arg: Node) => arg.eval()),
    };
  },
  ParenTerm(...nodes: Node[]): ParsedExpression {
    return nodes[1]!.eval();
  },
  number(): ParsedExpression {
    return {
      type: "literal",
      value: parseFloat(this.sourceString),
      expression: this.sourceString,
    };
  },
  string(...nodes: Node[]): ParsedExpression {
    const chars = nodes[1]!;
    return {
      type: "literal",
      value: chars.sourceString.replace(/\\(.)/g, "$1"),
      expression: chars.sourceString,
    };
  },
  boolean(): ParsedExpression {
    return {
      type: "literal",
      value: this.sourceString === "true",
      expression: this.sourceString,
    };
  },
  null(): ParsedExpression {
    return {
      type: "literal",
      value: null,
      expression: "null",
    };
  },
  identifier(): ParsedExpression {
    return {
      type: "identifier",
      name: this.sourceString,
      expression: this.sourceString,
    };
  },
});

export function parseExpression(input: string): Expression {
  const matchResult = grammar.match(input);

  if (matchResult.failed()) {
    throw new Error(`Parse error: ${matchResult.message}`);
  }

  const parsed = semantics(matchResult).eval();

  // Convert the parsed expression to our Expression type
  return convertToExpression(parsed, input);
}

function convertToExpression(
  parsed: ParsedExpression,
  rawInput: string
): Expression {
  const id = crypto.randomUUID();

  switch (parsed.type) {
    case "basic":
      if (!parsed.left || !parsed.right) {
        throw new Error("Basic expression must have left and right operands");
      }
      return {
        id,
        type: "basic",
        name: `${parsed.left?.name || ""} ${parsed.operator} ${
          parsed.right?.name || ""
        }`,
        expression: parsed.operator || "",
        dependencies: getDependencies(parsed),
        left: convertToExpression(parsed.left, ""),
        right: convertToExpression(parsed.right, ""),
        operator: parsed.operator || "",
        rawInput,
      };
    case "unary":
      if (!parsed.operand) {
        throw new Error("Unary expression must have an operand");
      }
      return {
        id,
        type: "unary",
        name: `${parsed.operator}${parsed.operand?.name || ""}`,
        expression: parsed.operator || "",
        dependencies: getDependencies(parsed),
        operand: convertToExpression(parsed.operand, ""),
        operator: parsed.operator || "",
        rawInput,
      };
    case "ternary":
      if (!parsed.condition || !parsed.trueBranch || !parsed.falseBranch) {
        throw new Error(
          "Ternary expression must have condition and both branches"
        );
      }
      return {
        id,
        type: "ternary",
        name:
          parsed.name ||
          `${parsed.condition?.name || ""} ? ${
            parsed.trueBranch?.name || ""
          } : ${parsed.falseBranch?.name || ""}`,
        expression: parsed.expression || "?:",
        dependencies: getDependencies(parsed),
        condition: convertToExpression(parsed.condition, ""),
        trueBranch: convertToExpression(parsed.trueBranch, ""),
        falseBranch: convertToExpression(parsed.falseBranch, ""),
        rawInput,
      };
    case "function":
      return {
        id,
        type: "function",
        name: parsed.name || "",
        expression: "",
        functionName: parsed.name || "",
        arguments:
          parsed.arguments?.map((arg) => convertToExpression(arg, "")) || [],
        dependencies: getDependencies(parsed),
        rawInput,
      };
    case "identifier":
      // Create a literal expression for identifiers instead of basic
      return {
        id,
        type: "literal",
        name: parsed.name || "",
        expression: parsed.name || "",
        dependencies: [parsed.name || ""],
        value: parsed.name || "",
        rawInput,
      };
    case "literal":
      return {
        id,
        type: "literal",
        name: String(parsed.value),
        expression: String(parsed.value),
        dependencies: [],
        value: parsed.value,
        rawInput,
      };
    default:
      throw new Error(`Unsupported expression type: ${parsed.type}`);
  }
}

function getDependencies(parsed: ParsedExpression): string[] {
  const deps = new Set<string>();

  function collect(expr: ParsedExpression) {
    if (expr.type === "identifier") {
      deps.add(expr.name || "");
    }
    if (expr.arguments) {
      expr.arguments.forEach(collect);
    }
    if (expr.left) {
      collect(expr.left);
    }
    if (expr.right) {
      collect(expr.right);
    }
    if (expr.operand) {
      collect(expr.operand);
    }
    if (expr.condition) {
      collect(expr.condition);
      collect(expr.trueBranch!);
      collect(expr.falseBranch!);
    }
  }

  collect(parsed);
  return Array.from(deps);
}

export default semantics;
