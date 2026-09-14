import { describe, it, expect } from "vitest";
import { parseExpression } from "../../../../lib/calculations/parser/semantics";
import { FunctionExpression } from "../../../../lib/calculations/types";

describe("Calculator Parser", () => {
  describe("Basic Operations", () => {
    it("should parse simple addition", () => {
      const result = parseExpression("2 + 3");
      expect(result.type).toBe("basic");
      expect(result.expression).toBe("+");
      expect(result.dependencies).toEqual([]);
    });

    it("should parse simple multiplication", () => {
      const result = parseExpression("4 * 5");
      expect(result.type).toBe("basic");
      expect(result.expression).toBe("*");
      expect(result.dependencies).toEqual([]);
    });

    it("should parse variable references", () => {
      const result = parseExpression("x + y");
      expect(result.type).toBe("basic");
      expect(result.expression).toBe("+");
      expect(result.dependencies).toEqual(["x", "y"]);
    });
  });

  describe("Function Calls", () => {
    it("should parse simple function calls", () => {
      const result = parseExpression("sum(1, 2, 3)");
      expect(result.type).toBe("function");
      expect((result as FunctionExpression).functionName).toBe("sum");
      expect((result as FunctionExpression).arguments).toHaveLength(3);
      expect(result.dependencies).toEqual([]);
    });

    it("should parse nested function calls", () => {
      const result = parseExpression("max(min(1, 2), 3)");
      expect(result.type).toBe("function");
      expect((result as FunctionExpression).functionName).toBe("max");
      expect((result as FunctionExpression).arguments).toHaveLength(2);
      expect(result.dependencies).toEqual([]);
    });

    it("should parse function calls with variable references", () => {
      const result = parseExpression("average(x, y, z)");
      expect(result.type).toBe("function");
      expect((result as FunctionExpression).functionName).toBe("average");
      expect((result as FunctionExpression).arguments).toHaveLength(3);
      expect(result.dependencies).toEqual(["x", "y", "z"]);
    });
  });

  describe("Complex Expressions", () => {
    it("should parse complex arithmetic expressions", () => {
      const result = parseExpression("(2 + 3) * (4 - 1)");
      expect(result.type).toBe("basic");
      expect(result.expression).toBe("*");
      expect(result.dependencies).toEqual([]);
    });

    it("should parse expressions with functions and arithmetic", () => {
      const result = parseExpression("sum(x + y, z * 2)");
      expect(result.type).toBe("function");
      expect((result as FunctionExpression).functionName).toBe("sum");
      expect((result as FunctionExpression).arguments).toHaveLength(2);
      expect(result.dependencies).toEqual(["x", "y", "z"]);
    });
  });

  describe("Error Handling", () => {
    it("should throw error for invalid expressions", () => {
      expect(() => parseExpression("2 + ")).toThrow();
      expect(() => parseExpression("(2 + 3")).toThrow();
      expect(() => parseExpression("sum(1,)")).toThrow();
    });
  });

  describe("Operator Precedence", () => {
    it("should respect multiplication over addition", () => {
      const result = parseExpression("2 + 3 * 4");
      expect(result.type).toBe("basic");
      expect(result.expression).toBe("+");
      expect(result.dependencies).toEqual([]);
    });

    it("should respect parentheses over operator precedence", () => {
      const result = parseExpression("(2 + 3) * 4");
      expect(result.type).toBe("basic");
      expect(result.expression).toBe("*");
      expect(result.dependencies).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle whitespace variations", () => {
      const result = parseExpression("  sum(  1,2,   3  )  ");
      expect(result.type).toBe("function");
      expect((result as FunctionExpression).functionName).toBe("sum");
      expect((result as FunctionExpression).arguments).toHaveLength(3);
    });

    it("should handle nested expressions in function arguments", () => {
      const result = parseExpression("max(min(1, 2 + 3), 4 * 5)");
      expect(result.type).toBe("function");
      expect((result as FunctionExpression).functionName).toBe("max");
      expect((result as FunctionExpression).arguments).toHaveLength(2);
    });

    it("should handle unary operators", () => {
      const result = parseExpression("-x");
      expect(result.type).toBe("unary");
      expect(result.dependencies).toEqual(["x"]);
    });

    it("should handle string literals", () => {
      const result = parseExpression('"hello"');
      expect(result.type).toBe("literal");
      expect(result.expression).toBe("hello");
    });
  });

  describe("Error Cases", () => {
    it("should throw error for mismatched parentheses", () => {
      expect(() => parseExpression("(2 + 3")).toThrow();
      expect(() => parseExpression("2 + 3)")).toThrow();
    });

    it("should throw error for invalid function calls", () => {
      expect(() => parseExpression("sum(,)")).toThrow();
      expect(() => parseExpression("sum(1,)")).toThrow();
      expect(() => parseExpression("sum(,1)")).toThrow();
    });
  });

  describe("Ternary Expressions", () => {
    it("should parse simple ternary expressions", () => {
      const result = parseExpression("x > 0 ? 1 : -1");
      expect(result.type).toBe("ternary");
      expect(result.dependencies).toEqual(["x"]);
    });

    it("should parse nested ternary expressions", () => {
      const result = parseExpression("x > 0 ? y > 0 ? 1 : 0 : -1");
      expect(result.type).toBe("ternary");
      expect(result.dependencies).toEqual(["x", "y"]);
    });

    it("should parse ternary with function calls", () => {
      const result = parseExpression("sum(x, y) > 0 ? max(a, b) : min(c, d)");
      expect(result.type).toBe("ternary");
      expect(result.dependencies).toEqual(["x", "y", "a", "b", "c", "d"]);
    });
  });

  describe("Additional Operators", () => {
    it("should parse comparison operators", () => {
      const ops = ["==", "!=", "<", "<=", ">", ">="];
      for (const op of ops) {
        const result = parseExpression(`x ${op} y`);
        expect(result.type).toBe("basic");
        expect(result.expression).toBe(op);
        expect(result.dependencies).toEqual(["x", "y"]);
      }
    });

    it("should parse logical operators", () => {
      const ops = ["&&", "||"];
      for (const op of ops) {
        const result = parseExpression(`x ${op} y`);
        expect(result.type).toBe("basic");
        expect(result.expression).toBe(op);
        expect(result.dependencies).toEqual(["x", "y"]);
      }
    });

    it("should parse exponentiation", () => {
      const result = parseExpression("x ^ y");
      expect(result.type).toBe("basic");
      expect(result.expression).toBe("^");
      expect(result.dependencies).toEqual(["x", "y"]);
    });
  });

  describe("Comments and Whitespace", () => {
    it("should handle single line comments", () => {
      const result = parseExpression("x + y // this is a comment\n + z");
      expect(result.type).toBe("basic");
      expect(result.dependencies).toEqual(["x", "y", "z"]);
    });

    it("should handle expressions with multiple comments", () => {
      const result = parseExpression(`
        // first comment
        x + y // middle comment
        // last comment
      `);
      expect(result.type).toBe("basic");
      expect(result.dependencies).toEqual(["x", "y"]);
    });
  });

  describe("String Literals", () => {
    it("should handle empty strings", () => {
      const result = parseExpression('""');
      expect(result.type).toBe("literal");
      expect(result.expression).toBe("");
    });
  });

  describe("Complex Nested Structures", () => {
    it("should handle deeply nested expressions", () => {
      const result = parseExpression("sum(max(a, b), min(c, d)) * pow(x, 2)");
      expect(result.type).toBe("basic");
      expect(result.expression).toBe("*");
      expect(result.dependencies).toEqual(["a", "b", "c", "d", "x"]);
    });

    it("should handle mixed operators and functions", () => {
      const result = parseExpression("(x + y) * sum(a, b) / max(c, d)");
      expect(result.type).toBe("basic");
      expect(result.dependencies).toEqual(["x", "y", "a", "b", "c", "d"]);
    });
  });

  describe("Keywords and Boolean Literals", () => {
    it("should handle true and false literals", () => {
      const result1 = parseExpression("true");
      expect(result1.type).toBe("literal");
      expect(result1.expression).toBe("true");

      const result2 = parseExpression("false");
      expect(result2.type).toBe("literal");
      expect(result2.expression).toBe("false");
    });

    it("should handle null literal", () => {
      const result = parseExpression("null");
      expect(result.type).toBe("literal");
      expect(result.expression).toBe("null");
    });

    it("should handle boolean operations", () => {
      const result = parseExpression("true && !false");
      expect(result.type).toBe("basic");
      expect(result.expression).toBe("&&");
      expect(result.dependencies).toEqual([]);
    });

    it("should handle if-then-else expressions", () => {
      const result = parseExpression("if x > 0 then y else z");
      expect(result.type).toBe("ternary");
      expect(result.dependencies).toEqual(["x", "y", "z"]);
    });
  });
});
