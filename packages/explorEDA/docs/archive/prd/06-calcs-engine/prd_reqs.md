# Calculations Engine PRD

## Overview

The calculations engine is a core component of the data visualization program that handles data transformation and calculations. It processes raw data into the format needed by visualizations, providing both basic and advanced mathematical operations.

## Requirements

### Expression Engine

- Build parser using Ohm.js for handling user-defined expressions
- Support arbitrary expressions (A + B, C + D, etc.)
- Support for a ternary operator
- Support basic mathematical operations:
  - Addition
  - Subtraction
  - Multiplication
  - Division
  - Exponentiation
- Support arbitrary function calls with argument lists
  - Function name followed by parentheses
  - Comma-separated argument lists
  - Nested function calls
  - Function validation and mapping to implementations

### Built-in Functions

- Provide access to JavaScript math functions
- Support arbitrary function calling with validation
- Map user-provided function names to implementations
- Provide clear error messages for:
  - Unknown functions
  - Invalid arguments
  - Runtime errors

### Date Processing

- Integrate D3 format library for date formatting
- Support date extraction functions:
  - Year
  - Month
  - Day
  - Quarter
  - Week number

### Statistical Functions

- Z-score calculations (row-wide, column-based)
- Group aggregations with support for:
  - SUM
  - COUNT
  - MIN
  - MAX
  - AVERAGE
  - COUNTUNIQUE
  - Percentiles

### Advanced Analytics

- Machine Learning / Dimensionality Reduction:
  - Self-organizing maps (Kohonen maps)
  - Principal Component Analysis (PCA)
    - First component extraction
    - Second component extraction
  - UMAP transformation
  - t-SNE transformation

### Regression Analysis

- Linear regression
- Polynomial regression
- Support for:
  - Computed results
  - Residuals
- Potential ANOVA/factor analysis (pending library availability)

### Ranking and Ordering

- Row ranking functionality (1 to n)
- Support for group-based ranking
- Normalized ranks (rank/count)
- Percentile rankings
- Cumulative calculations:
  - Running totals
  - Cumulative counts

### Data Transformation

- String operations:
  - Concatenation
  - Substring extraction
  - Pattern matching/replacement (regex)
- Numerical transformations:
  - Normalization
  - Standardization
  - Logarithmic transformations
- Categorization:
  - Binning/bucketing numeric values
  - Dummy variable creation

## Performance Considerations

- Results will be cached at the data layer
- Initial implementation will run calculations client-side
- Potential future enhancement: Server-side processing for complex operations (paid feature)

## Implementation Details

### Core Interfaces

```typescript
// src/lib/calculations/types.ts

export interface Expression {
  id: string;
  type: "basic" | "function" | "group" | "rank" | "advanced";
  name: string;
  expression: string;
  dependencies: string[];
  metadata?: ExpressionMetadata;
  // For function calls
  arguments?: Expression[];
  functionName?: string;
}

export interface ExpressionMetadata {
  // For group calculations
  groupBy?: string[];
  aggregation?: AggregationType;

  // For rank calculations
  rankBy?: string[];
  isNormalized?: boolean;
  isCumulative?: boolean;

  // For advanced calculations
  algorithm?: "pca" | "tsne" | "umap" | "som";
  parameters?: Record<string, any>;

  // For regression
  regressionType?: "linear" | "polynomial";
  degree?: number;
  predictors?: string[];
  response?: string;

  // For function calls
  functionCategory?: string;
  returnType?: string;
  parameterTypes?: string[];
}

export type AggregationType =
  | "sum"
  | "count"
  | "min"
  | "max"
  | "average"
  | "countUnique"
  | "percentile"
  | "median"
  | "stddev"
  | "variance";

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
  cache?: Map<string, any>;
}
```

### Component Structure

```typescript
// src/components/calculations/ExpressionBuilder.tsx

interface ExpressionBuilderProps {
  expression: Expression;
  onChange: (expression: Expression) => void;
  availableFields: string[];
  availableFunctions: string[];
}

// src/components/calculations/FunctionBrowser.tsx

interface FunctionBrowserProps {
  onSelect: (functionName: string) => void;
  categories: {
    name: string;
    functions: Array<{
      name: string;
      description: string;
      syntax: string;
      example: string;
    }>;
  }[];
}

// src/components/calculations/CalculationPreview.tsx

interface CalculationPreviewProps {
  expression: Expression;
  data: any[];
  previewRows?: number;
}

// src/components/calculations/ValidationPanel.tsx

interface ValidationPanelProps {
  expression: Expression;
  errors: Array<{
    type: "error" | "warning";
    message: string;
    location?: {
      start: number;
      end: number;
    };
  }>;
}
```

### Engine Implementation

```typescript
// src/lib/calculations/parser/grammar.ohm

// Basic grammar for expressions
Calculation {
  Expression = BinaryExpr | UnaryExpr | FunctionCall | Term
  BinaryExpr = Expression Operator Expression
  UnaryExpr = UnaryOperator Expression
  FunctionCall = identifier "(" ListOf<Expression, ","> ")"
  Term = number | identifier | "(" Expression ")"
  Operator = "+" | "-" | "*" | "/" | "^"
  UnaryOperator = "-" | "+"
  identifier = letter (letter | digit | "_")*
  number = digit+ ("." digit+)?
}

// src/lib/calculations/functions/registry.ts

interface FunctionDefinition {
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
  implementation: (...args: any[]) => any;
}

// Function categories
const functionRegistry = new Map<string, FunctionDefinition>();

// Register functions from different categories
export function registerFunction(definition: FunctionDefinition) {
  functionRegistry.set(definition.name, definition);
}

export function getFunction(name: string): FunctionDefinition | undefined {
  return functionRegistry.get(name);
}

// src/lib/calculations/functions/docs.ts

interface FunctionDocumentation {
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

const functionDocs = new Map<string, FunctionDocumentation>();

export function registerFunctionDocs(docs: FunctionDocumentation) {
  functionDocs.set(docs.name, docs);
}

export function getFunctionDocs(name: string): FunctionDocumentation | undefined {
  return functionDocs.get(name);
}

// src/lib/calculations/engine/Calculator.ts

export class Calculator {
  constructor(private context: CalculationContext) {}

  async evaluate(expression: Expression): Promise<CalculationResult> {
    switch (expression.type) {
      case "basic":
        return this.evaluateBasic(expression);
      case "function":
        return this.evaluateFunction(expression);
      case "group":
        return this.evaluateGroup(expression);
      case "rank":
        return this.evaluateRank(expression);
      case "advanced":
        return this.evaluateAdvanced(expression);
    }
  }

  private async evaluateBasic(expression: Expression): Promise<CalculationResult> {
    // Implement basic expression evaluation
  }

  private async evaluateFunction(expression: Expression): Promise<CalculationResult> {
    const func = getFunction(expression.name);
    if (!func) {
      return {
        success: false,
        error: `Unknown function: ${expression.name}`,
      };
    }

    try {
      // Evaluate all arguments
      const args = await Promise.all(
        expression.arguments.map((arg) => this.evaluate(arg))
      );

      // Check for errors in arguments
      const errorArg = args.find((arg) => !arg.success);
      if (errorArg) {
        return errorArg;
      }

      // Execute the function
      const result = await func.implementation(...args.map((arg) => arg.value));

      return {
        success: true,
        value: result,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error executing function ${expression.name}: ${error.message}`,
      };
    }
  }

  private async evaluateGroup(expression: Expression): Promise<CalculationResult> {
    // Implement group aggregation
  }

  private async evaluateRank(expression: Expression): Promise<CalculationResult> {
    // Implement ranking with optional normalization and cumulative calcs
  }

  private async evaluateAdvanced(expression: Expression): Promise<CalculationResult> {
    // Implement ML/advanced analytics
  }
}

// src/lib/calculations/functions/index.ts

export const mathFunctions = {
  sum: (values: number[]) => values.reduce((a, b) => a + b, 0),
  mean: (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length,
  // ... other math functions
};

export const dateFunctions = {
  year: (date: Date) => date.getFullYear(),
  month: (date: Date) => date.getMonth() + 1,
  // ... other date functions
};

export const statsFunctions = {
  zscore: (value: number, mean: number, stddev: number) => (value - mean) / stddev,
  percentile: (values: number[], p: number) => {
    // Implement percentile calculation
  },
  // ... other statistical functions
};

export const mlFunctions = {
  pca: async (data: number[][], components: number = 2) => {
    // Implement PCA
  },
  tsne: async (data: number[][], dimensions: number = 2) => {
    // Implement t-SNE
  },
  // ... other ML functions
};
```

### File Structure

```
src/
  components/
    calculations/
      ExpressionBuilder.tsx      # Expression building interface
      FunctionBrowser.tsx        # Browse/search available functions
      CalculationPreview.tsx     # Live preview of calculation results
      ValidationPanel.tsx        # Shows errors/warnings
  lib/
    calculations/
      parser/                    # Ohm.js based expression parser
        grammar.ohm
        semantics.ts
      functions/                 # Implementation of calculation functions
        math.ts
        stats.ts
        dates.ts
        transforms.ts
        ml.ts
      engine/
        Calculator.ts           # Main calculation engine
        Cache.ts               # Result caching logic
      types.ts                 # Type definitions
```

### Integration Points

1. The `Calculator` class will be the main entry point for all calculations.
2. Results will be cached at the data layer level.
3. Advanced calculations (ML/stats) will run client-side initially, with potential server-side processing as a paid feature.
4. The expression builder will use shadcn/ui components for the UI.
5. Error handling will use the sonner toast system.
6. All components will use Tailwind CSS for styling.

## Data Layer Integration

### Overview

The calculations engine will integrate with the DataLayerProvider to:

1. Access source data through the `getColumnData` and `getColumnNames` methods
2. Cache calculation results in the data layer's caching system
3. Support live updates when filters change
4. Provide calculated fields as virtual columns

### Integration Points

1. Extend DataLayerState to include:

```typescript
interface DataLayerState<T extends DatumObject> {
  // ... existing state ...

  // Calculation state
  calculations: Expression[];
  addCalculation: (calc: Omit<Expression, "id">) => void;
  removeCalculation: (id: string) => void;
  updateCalculation: (id: string, updates: Partial<Expression>) => void;

  // Virtual column handling
  virtualColumns: Record<string, CalculationResult>;
  getCalculatedData: (field: string) => { [key: IdType]: datum };
}
```

2. Cache Integration:

- Calculations will be cached at the data layer level
- Cache invalidation will occur when:
  - Source data changes
  - Calculations are modified
  - Dependencies update

3. Live Updates:

- Calculated fields will update when:
  - Filters change
  - Source data updates
  - Calculation definitions change

4. Performance Optimization:

- Lazy evaluation of calculations
- Dependency tracking to minimize recalculations
- Batch updates for multiple calculations

## Outstanding Questions

1. What specific ANOVA/factor analysis libraries are available and suitable?
2. Should server-side processing be implemented immediately for resource-intensive operations?
3. What are the specific performance thresholds for client-side processing?
4. Are there additional statistical functions needed beyond the current set?
5. Should we implement additional regression types beyond linear and polynomial?

## Plans

### Implementation Details

#### Component Structure

```typescript
// Core interfaces
interface Expression {
  type: string;
  value: string;
  dependencies: string[];
}

interface CalculationResult {
  success: boolean;
  value: any;
  error?: string;
}

interface CalculationContext {
  data: Record<string, any>[];
  variables: Record<string, any>;
}
```

#### File Structure

```
src/
  components/
    calculations/
      ExpressionBuilder.tsx      # Expression building interface
      FunctionBrowser.tsx        # Browse/search available functions
      CalculationPreview.tsx     # Live preview of calculation results
      ValidationPanel.tsx        # Shows errors/warnings
  lib/
    calculations/
      parser/                    # Ohm.js based expression parser
        grammar.ohm
        semantics.ts
      functions/                 # Implementation of calculation functions
        math.ts
        stats.ts
        dates.ts
        transforms.ts
      engine/
        Calculator.ts           # Main calculation engine
        Cache.ts               # Result caching logic
```
