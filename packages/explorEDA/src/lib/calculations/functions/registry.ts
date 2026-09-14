export interface FunctionDefinition {
  name: string;
  category: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }[];
  returnType: string;
  implementation: (...args: never[]) => unknown;
}

export interface FunctionDocumentation {
  name: string;
  category: string;
  description: string;
  syntax: string;
  examples: string[];
  parameters: {
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }[];
  returnType: string;
  notes?: string[];
}

// Function registry to store all available functions
const functionRegistry = new Map<string, FunctionDefinition>();
const functionDocs = new Map<string, FunctionDocumentation>();

// Register a function with its implementation and documentation
export function registerFunction(
  definition: FunctionDefinition,
  documentation: FunctionDocumentation
) {
  functionRegistry.set(definition.name, definition);
  functionDocs.set(definition.name, documentation);
}

// Get a function implementation by name
export function getFunction(name: string): FunctionDefinition | undefined {
  return functionRegistry.get(name);
}

// Get function documentation by name
export function getFunctionDocs(
  name: string
): FunctionDocumentation | undefined {
  return functionDocs.get(name);
}

// Get all functions in a category
export function getFunctionsByCategory(category: string): FunctionDefinition[] {
  return Array.from(functionRegistry.values()).filter(
    (func) => func.category === category
  );
}

// Get all available categories
export function getCategories(): string[] {
  const categories = new Set<string>();
  for (const func of functionRegistry.values()) {
    categories.add(func.category);
  }
  return Array.from(categories);
}

// Register built-in functions
function registerBuiltInFunctions() {
  // Math functions
  registerFunction(
    {
      name: "sum",
      category: "math",
      description: "Calculate the sum of a list of numbers",
      parameters: [
        {
          name: "values",
          type: "number[]",
          description: "Array of numbers to sum",
        },
      ],
      returnType: "number",
      implementation: (...args: never[]) =>
        (args[0] as unknown as CalculationValue[]).reduce<number>(
          (a, b) => Number(a) + Number(b),
          0
        ),
    },
    {
      name: "sum",
      category: "math",
      description: "Calculate the sum of a list of numbers",
      syntax: "sum(values)",
      examples: ["sum([1, 2, 3]) // Returns 6"],
      parameters: [
        {
          name: "values",
          type: "number[]",
          description: "Array of numbers to sum",
        },
      ],
      returnType: "number",
    }
  );

  registerFunction(
    {
      name: "average",
      category: "math",
      description: "Calculate the arithmetic mean of a list of numbers",
      parameters: [
        {
          name: "values",
          type: "number[]",
          description: "Array of numbers to average",
        },
      ],
      returnType: "number",
      implementation: (...args: never[]) => {
        const numbers = args[0] as unknown as CalculationValue[];
        return (
          numbers.reduce<number>((a, b) => Number(a) + Number(b), 0) /
          numbers.length
        );
      },
    },
    {
      name: "average",
      category: "math",
      description: "Calculate the arithmetic mean of a list of numbers",
      syntax: "average(values)",
      examples: ["average([1, 2, 3]) // Returns 2"],
      parameters: [
        {
          name: "values",
          type: "number[]",
          description: "Array of numbers to average",
        },
      ],
      returnType: "number",
    }
  );

  // Statistical functions
  registerFunction(
    {
      name: "standardDeviation",
      category: "statistics",
      description: "Calculate the standard deviation of a list of numbers",
      parameters: [
        {
          name: "values",
          type: "number[]",
          description: "Array of numbers",
        },
      ],
      returnType: "number",
      implementation: (...args: never[]) => {
        const numbers = args[0] as unknown as CalculationValue[];
        const avg =
          numbers.reduce<number>((a, b) => Number(a) + Number(b), 0) /
          numbers.length;
        const squareDiffs = numbers.map((value) => {
          const diff = Number(value) - avg;
          return diff * diff;
        });
        const avgSquareDiff =
          squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
        return Math.sqrt(avgSquareDiff);
      },
    },
    {
      name: "standardDeviation",
      category: "statistics",
      description: "Calculate the standard deviation of a list of numbers",
      syntax: "standardDeviation(values)",
      examples: ["standardDeviation([1, 2, 3, 4, 5])"],
      parameters: [
        {
          name: "values",
          type: "number[]",
          description: "Array of numbers",
        },
      ],
      returnType: "number",
    }
  );

  // Date functions
  registerFunction(
    {
      name: "year",
      category: "date",
      description: "Extract the year from a date",
      parameters: [
        {
          name: "date",
          type: "Date",
          description: "Date to extract year from",
        },
      ],
      returnType: "number",
      implementation: (date: Date) => date.getFullYear(),
    },
    {
      name: "year",
      category: "date",
      description: "Extract the year from a date",
      syntax: "year(date)",
      examples: ['year(new Date("2024-01-01")) // Returns 2024'],
      parameters: [
        {
          name: "date",
          type: "Date",
          description: "Date to extract year from",
        },
      ],
      returnType: "number",
    }
  );

  // String functions
  registerFunction(
    {
      name: "concat",
      category: "string",
      description: "Concatenate multiple strings",
      parameters: [
        {
          name: "strings",
          type: "string[]",
          description: "Array of strings to concatenate",
        },
        {
          name: "separator",
          type: "string",
          description: "Optional separator between strings",
          optional: true,
        },
      ],
      returnType: "string",
      implementation: (strings: string[], separator = "") =>
        strings.join(separator),
    },
    {
      name: "concat",
      category: "string",
      description: "Concatenate multiple strings",
      syntax: "concat(strings, separator?)",
      examples: [
        'concat(["Hello", "World"]) // Returns "HelloWorld"',
        'concat(["Hello", "World"], " ") // Returns "Hello World"',
      ],
      parameters: [
        {
          name: "strings",
          type: "string[]",
          description: "Array of strings to concatenate",
        },
        {
          name: "separator",
          type: "string",
          description: "Optional separator between strings",
          optional: true,
        },
      ],
      returnType: "string",
    }
  );
}

// Initialize the registry with built-in functions
registerBuiltInFunctions();

export default {
  registerFunction,
  getFunction,
  getFunctionDocs,
  getFunctionsByCategory,
  getCategories,
};
import type { CalculationValue } from "../types";
