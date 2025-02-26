import { describe, it, expect } from "vitest";
import { Calculator } from "../../../../lib/calculations/engine/Calculator";
import { parseExpression } from "../../../../lib/calculations/parser/semantics";

describe("Calculator", () => {
  describe("Basic Expression Evaluation", () => {
    const calculator = new Calculator({
      data: [],
      cache: new Map(),
      variables: new Map(),
    });

    it("should evaluate simple addition", async () => {
      const expr = parseExpression("2 + 3");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(5);
    });

    it("should evaluate simple multiplication", async () => {
      const expr = parseExpression("4 * 5");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(20);
    });

    it("should handle division by zero", async () => {
      const expr = parseExpression("5 / 0");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Division by zero");
    });

    it("should evaluate complex expressions", async () => {
      const expr = parseExpression("(2 + 3) * 4");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(20);
    });
  });

  describe("Function Evaluation", () => {
    const calculator = new Calculator({
      data: [],
      cache: new Map(),
      variables: new Map(),
    });

    it("should evaluate sum function", async () => {
      const expr = parseExpression("sum(1, 2, 3)");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(6);
    });

    it("should handle unknown functions", async () => {
      const expr = parseExpression("unknown(1, 2)");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown function");
    });
  });

  describe("Caching", () => {
    it("should cache results", async () => {
      const cache = new Map();
      const calculator = new Calculator({
        data: [],
        cache,
        variables: new Map(),
      });

      const expr = parseExpression("2 + 3");

      // First evaluation
      const result1 = await calculator.evaluate(expr);
      expect(result1.success).toBe(true);
      expect(result1.value).toBe(5);

      // Second evaluation should use cache
      const result2 = await calculator.evaluate(expr);
      expect(result2.success).toBe(true);
      expect(result2.value).toBe(5);

      // Verify it's in the cache
      expect(cache.has(expr.id)).toBe(true);
      expect(cache.get(expr.id)).toBe(5);
    });
  });
});
