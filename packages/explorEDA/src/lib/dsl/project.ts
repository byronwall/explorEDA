/**
 * Project text: a project's sources, relationships, queries, and parameters
 * as declarations in the dashboard-text syntax. `exportProjectText` writes
 * an `AnalysisProject`; `compileProjectText` reads it back exactly. Values a
 * rule can supply, such as a label made from an ID or a step's input, are
 * left out of the text.
 */
import type {
  AggregateMeasure,
  AnalysisFilterOperator,
  AnalysisParameter,
  AnalysisProject,
  AnalysisQuery,
  AnalysisStep,
  FieldDefinition,
  RelationshipDefinition,
  SourceDefinition,
} from "@/types/AnalysisProject";
import type { DslDiagnostic } from "./compile";
import { parseDocument, type DslDeclaration, type DslSpan } from "./parse";
import { encodeScalar } from "./paths";
import { block } from "./print";

/**
 * A named database connection: its driver and the settings that are safe
 * to commit. Passwords and other secrets never appear in project text.
 */
export interface ConnectionDefinition {
  id: string;
  /** `sqlite`, `postgres`, and so on. */
  driver: string;
  /** Every other setting, in the order the text gives them. */
  settings: Record<string, string>;
}

/** Where a database source's rows come from: a table, or a query. */
export interface DatabaseSource {
  /** The connection's ID, written as `db=`. */
  connection: string;
  table?: string;
  sql?: string;
  /** The most rows a read may return; the default applies otherwise. */
  limit?: number;
}

export interface ProjectTextOptions {
  /** Source ID to the file that holds its rows, written as `path=`. */
  paths?: Record<string, string>;
  connections?: ConnectionDefinition[];
  /** Source ID to the database it reads, written as `db=`. */
  databases?: Record<string, DatabaseSource>;
}

export interface ProjectTextResult {
  project: AnalysisProject;
  /** Source ID to the `path=` its declaration names. */
  paths: Record<string, string>;
  connections: ConnectionDefinition[];
  /** Source ID to the database it reads. */
  databases: Record<string, DatabaseSource>;
  diagnostics: DslDiagnostic[];
}

/** Settings that hold secrets, which project text refuses. */
const SECRET_SETTINGS = new Set([
  "password",
  "pass",
  "pwd",
  "secret",
  "token",
  "key",
  "url",
  "uri",
  "dsn",
  "connectionstring",
  "connection-string",
]);

const FIELD_TYPES = new Set(["string", "number", "boolean", "date", "unknown"]);
const PARAMETER_TYPES = new Set(["string", "number", "boolean", "date"]);
const CARDINALITIES = new Set([
  "many-to-one",
  "one-to-one",
  "one-to-many",
  "many-to-many",
]);
const DEFAULT_CARDINALITY = "many-to-one";
const OPERATIONS = new Set(["count", "sum", "average"]);
const OPERATORS: Record<string, AnalysisFilterOperator> = {
  "=": "eq",
  "!=": "neq",
  ">": "gt",
  ">=": "gte",
  "<": "lt",
  "<=": "lte",
};
const NULL_OPERATORS: Record<string, AnalysisFilterOperator> = {
  "is-null": "is-null",
  "not-null": "is-not-null",
};
const SAFE_NAME = /^[A-Za-z0-9_][\w.-]*$/;

/**
 * The label a rule gives an ID: words split at `_`, `-`, and lower-to-upper
 * case changes, in sentence case, with `id` written `ID`.
 * `orderId` → "Order ID", `order-customer` → "Order customer".
 */
export function labelFromId(id: string): string {
  const words = id
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => (/^id$/i.test(word) ? "ID" : word.toLowerCase()));
  const text = words.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function nameToken(id: string): string {
  return SAFE_NAME.test(id) ? `@${id}` : `id=${JSON.stringify(id)}`;
}

/** A value that must not read as one of `reserved`, or as a parameter. */
function text(value: string, reserved?: Set<string>): string {
  return reserved?.has(value) || value.startsWith("$")
    ? JSON.stringify(value)
    : encodeScalar(value);
}

// ── Export ────────────────────────────────────────────────────────────────

function fieldLine(field: FieldDefinition): string {
  return [
    "field",
    text(field.id, FIELD_TYPES),
    ...(field.name === labelFromId(field.id)
      ? []
      : [text(field.name, FIELD_TYPES)]),
    ...(field.type ? [field.type] : []),
  ].join(" ");
}

/** One source's declaration, as project text and analysis files write it. */
export function exportSourceText(
  source: SourceDefinition,
  path?: string
): string {
  return `${sourceLines(source, path).join("\n")}\n`;
}

function databaseSettings(database: DatabaseSource | undefined): string[] {
  if (!database) {
    return [];
  }
  return [
    `db=${encodeScalar(database.connection)}`,
    ...(database.table === undefined
      ? []
      : [`table=${encodeScalar(database.table)}`]),
    ...(database.sql === undefined
      ? []
      : [`sql=${JSON.stringify(database.sql)}`]),
    ...(database.limit === undefined ? [] : [`limit=${database.limit}`]),
  ];
}

function connectionLine(connection: ConnectionDefinition): string {
  return [
    `connection ${nameToken(connection.id)}`,
    `driver=${encodeScalar(connection.driver)}`,
    ...Object.entries(connection.settings).map(
      ([key, value]) => `${key}=${encodeScalar(value)}`
    ),
  ].join(" ");
}

function sourceLines(
  source: SourceDefinition,
  path?: string,
  database?: DatabaseSource
): string[] {
  const name =
    source.name === labelFromId(source.id) ? [] : [text(source.name)];
  const glyph =
    source.glyph === source.name.charAt(0).toUpperCase()
      ? []
      : [`glyph=${encodeScalar(source.glyph)}`];
  return block(
    `source ${nameToken(source.id)}`,
    [
      ...name,
      ...glyph,
      ...(source.entityKey ? [`key=${encodeScalar(source.entityKey)}`] : []),
      ...(path === undefined ? [] : [`path=${encodeScalar(path)}`]),
      ...databaseSettings(database),
    ],
    source.fields.map(fieldLine)
  );
}

function relationshipLine(relationship: RelationshipDefinition): string {
  const { from, to, cardinality } = relationship;
  return [
    `relate ${nameToken(relationship.id)}`,
    `${from.sourceId}.${from.fieldId}`,
    "->",
    `${to.sourceId}.${to.fieldId}`,
    ...(cardinality === DEFAULT_CARDINALITY ? [] : [cardinality]),
    ...(relationship.name === labelFromId(relationship.id)
      ? []
      : [text(relationship.name, CARDINALITIES)]),
  ].join(" ");
}

function stepDefaultId(step: AnalysisStep): string | undefined {
  switch (step.kind) {
    case "source":
      return step.sourceId;
    case "lookup":
    case "expand":
      return step.as;
    case "calculate":
      return step.fieldId;
    default:
      return undefined;
  }
}

function flag(word: string, value: boolean | undefined): string[] {
  return value === undefined ? [] : [value ? word : `${word}=false`];
}

function filterValue(value: unknown): string {
  if (value === undefined) {
    return "";
  }
  return typeof value === "string"
    ? text(value)
    : encodeScalar(value as number | boolean | null);
}

function measureLine(measure: AggregateMeasure): string {
  return [
    measure.operation,
    nameToken(measure.id),
    ...(measure.fieldId === undefined ? [] : [text(measure.fieldId)]),
    ...(measure.label === labelFromId(measure.id)
      ? []
      : [`label=${text(measure.label)}`]),
    ...(measure.entityFieldId === undefined
      ? []
      : [`per=${text(measure.entityFieldId)}`]),
  ].join(" ");
}

function stepLines(step: AnalysisStep, previous?: AnalysisStep): string[] {
  const id = step.id === stepDefaultId(step) ? [] : [nameToken(step.id)];
  const input =
    "inputStepId" in step && step.inputStepId !== previous?.id
      ? [`from=${encodeScalar(step.inputStepId)}`]
      : [];
  switch (step.kind) {
    case "source":
      return [["source", ...id, text(step.sourceId)].join(" ")];
    case "lookup":
    case "expand":
      return [
        [
          step.kind,
          ...id,
          text(step.as),
          `via=${encodeScalar(step.relationshipId)}`,
          ...(step.inputFieldId === undefined
            ? []
            : [`on=${text(step.inputFieldId)}`]),
          ...input,
          ...(step.kind === "expand"
            ? flag("keep-unmatched", step.keepUnmatched)
            : []),
        ].join(" "),
      ];
    case "calculate":
      return [
        [
          "calc",
          ...id,
          text(step.fieldId),
          ...(step.label === labelFromId(step.fieldId)
            ? []
            : [text(step.label)]),
          ...input,
          "=",
          step.expression,
        ].join(" "),
      ];
    case "filter": {
      const operator =
        Object.entries(NULL_OPERATORS).find(
          ([, value]) => value === step.operator
        )?.[0] ??
        Object.entries(OPERATORS).find(
          ([, value]) => value === step.operator
        )![0];
      const value =
        step.parameterId !== undefined
          ? `$${step.parameterId}`
          : filterValue(step.value);
      return [
        [
          "filter",
          ...id,
          ...input,
          text(step.fieldId),
          operator,
          ...(value ? [value] : []),
        ].join(" "),
      ];
    }
    case "aggregate":
      return block(
        ["aggregate", ...id].join(" "),
        [
          ...(step.groupBy.length
            ? [`by=${step.groupBy.map((field) => text(field)).join(",")}`]
            : []),
          ...input,
        ],
        step.measures.map(measureLine)
      );
  }
}

function queryLines(query: AnalysisQuery): string[] {
  const first = query.steps.find((step) => step.kind === "source");
  const frame =
    first?.kind === "source" && first.sourceId === query.frameLabel
      ? []
      : [`frame=${text(query.frameLabel)}`];
  const output =
    query.outputStepId === query.steps.at(-1)?.id
      ? []
      : [`output=${encodeScalar(query.outputStepId)}`];
  const head = [
    `query ${nameToken(query.id)}`,
    ...(query.name === labelFromId(query.id) ? [] : [text(query.name)]),
  ].join(" ");
  const steps = query.steps.flatMap((step, index) =>
    stepLines(step, query.steps[index - 1])
  );
  return block(
    head,
    [`glyph=${encodeScalar(query.glyph)}`, ...frame, ...output],
    steps
  );
}

function parameterLine(parameter: AnalysisParameter): string {
  const reserved = new Set([...PARAMETER_TYPES, "required"]);
  const options = parameter.options;
  return [
    `param ${nameToken(parameter.id)}`,
    ...(parameter.name === labelFromId(parameter.id)
      ? []
      : [text(parameter.name, reserved)]),
    parameter.type,
    ...flag("required", parameter.required),
    ...(options
      ? [
          `pick=${options.sourceId}${
            options.labelFieldId === undefined ? "" : `.${options.labelFieldId}`
          }`,
        ]
      : []),
  ].join(" ");
}

/** Writes a project as text that `compileProjectText` reads back exactly. */
export function exportProjectText(
  project: AnalysisProject,
  options: ProjectTextOptions = {}
): string {
  const sections: string[][] = [[`project ${nameToken(project.id)}`]];
  if (options.connections?.length) {
    sections.push(options.connections.map(connectionLine));
  }
  sections.push(
    ...project.sources.map((source) =>
      sourceLines(
        source,
        options.paths?.[source.id],
        options.databases?.[source.id]
      )
    )
  );
  if (project.relationships.length) {
    sections.push(project.relationships.map(relationshipLine));
  }
  sections.push(...project.queries.map(queryLines));
  if (project.parameters?.length) {
    sections.push(project.parameters.map(parameterLine));
  }
  return `${sections.map((lines) => lines.join("\n")).join("\n\n")}\n`;
}

// ── Compile ───────────────────────────────────────────────────────────────

type Report = (
  span: DslSpan,
  message: string,
  suggestion?: string,
  severity?: DslDiagnostic["severity"]
) => void;

function single(declaration: DslDeclaration, key: string): string | undefined {
  const pair = declaration.pairs.find((item) => item.key === key);
  return pair?.value.items.map((item) => item.text).join(",");
}

function idOf(declaration: DslDeclaration): string | undefined {
  return declaration.name ?? single(declaration, "id");
}

/** Positional values as text, and whether each was quoted. */
function words(declaration: DslDeclaration) {
  return declaration.positional.map((item) => ({
    text: item.value.items.map((part) => part.text).join(","),
    quoted: item.value.items.some((part) => part.quoted),
    span: item.span,
  }));
}

function checkPairs(
  declaration: DslDeclaration,
  allowed: string[],
  report: Report
) {
  for (const pair of declaration.pairs) {
    if (!allowed.includes(pair.key) && pair.key !== "id") {
      report(
        pair.span,
        `${pair.key}= is not a ${declaration.keyword} setting, so it was ignored.`,
        allowed.length
          ? `Use ${allowed.map((key) => `${key}=`).join(", ")}.`
          : undefined,
        "warning"
      );
    }
  }
}

function flagValue(
  declaration: DslDeclaration,
  word: string,
  rest: ReturnType<typeof words>
): boolean | undefined {
  if (rest.some((item) => !item.quoted && item.text === word)) {
    return true;
  }
  const pair = single(declaration, word);
  return pair === undefined ? undefined : pair !== "false";
}

function compileConnection(
  declaration: DslDeclaration,
  report: Report
): ConnectionDefinition | undefined {
  const id = idOf(declaration);
  const driver = single(declaration, "driver");
  if (!id || !driver) {
    report(
      declaration.span,
      "A connection needs a name and a driver.",
      "Write it as connection @app driver=sqlite path=data/app.db."
    );
    return undefined;
  }
  const settings: Record<string, string> = {};
  for (const pair of declaration.pairs) {
    if (pair.key === "id" || pair.key === "driver") {
      continue;
    }
    if (SECRET_SETTINGS.has(pair.key.toLowerCase())) {
      report(
        pair.span,
        `${pair.key}= can hold a secret, so project text doesn't keep it.`,
        `Remove it. explorEDA reads ${id}'s password from your settings, so the project stays safe to commit.`
      );
      continue;
    }
    settings[pair.key] = pair.value.items.map((item) => item.text).join(",");
  }
  return { id, driver, settings };
}

/** A source's `db=` settings, or undefined when it reads a file. */
function compileDatabase(
  declaration: DslDeclaration,
  report: Report
): DatabaseSource | undefined {
  const connection = single(declaration, "db");
  const table = single(declaration, "table");
  const sql = single(declaration, "sql");
  const limitText = single(declaration, "limit");
  if (connection === undefined) {
    for (const key of ["table", "sql", "limit"]) {
      const pair = declaration.pairs.find((item) => item.key === key);
      if (pair) {
        report(
          pair.span,
          `${key}= reads a database, so it needs db=.`,
          "Name the connection, as db=app."
        );
      }
    }
    return undefined;
  }
  if (single(declaration, "path") !== undefined) {
    report(
      declaration.span,
      "A source reads a file or a database, not both.",
      "Keep path= or db=."
    );
  }
  if ((table === undefined) === (sql === undefined)) {
    report(
      declaration.span,
      table === undefined
        ? "A database source needs table= or sql=."
        : "A database source reads table= or sql=, not both.",
      'Write table=orders, or sql="select id, region from customers".'
    );
  }
  let limit: number | undefined;
  if (limitText !== undefined) {
    limit = Number(limitText);
    if (!Number.isSafeInteger(limit) || limit < 1) {
      report(
        declaration.span,
        `limit=${limitText} isn't a whole number of rows.`,
        "Write it as limit=250000."
      );
      limit = undefined;
    }
  }
  return {
    connection,
    ...(table === undefined ? {} : { table }),
    ...(sql === undefined || table !== undefined ? {} : { sql }),
    ...(limit === undefined ? {} : { limit }),
  };
}

function compileSource(
  declaration: DslDeclaration,
  report: Report
): SourceDefinition | undefined {
  const id = idOf(declaration);
  const entityKey = single(declaration, "key");
  // A source read from a file or a database can leave its key to the data,
  // as it can its fields.
  if (
    !id ||
    (!entityKey &&
      single(declaration, "path") === undefined &&
      single(declaration, "db") === undefined)
  ) {
    report(
      declaration.span,
      "A source needs a name and a key.",
      "Write it as source @orders key=orderId path=data/orders.csv."
    );
    return undefined;
  }
  checkPairs(
    declaration,
    ["key", "glyph", "path", "db", "table", "sql", "limit"],
    report
  );
  const name = words(declaration)[0]?.text ?? labelFromId(id);
  const fields: FieldDefinition[] = [];
  for (const child of declaration.children) {
    const parts = words(child);
    if (child.keyword !== "field" || !parts.length) {
      report(
        child.span,
        `${child.keyword} doesn't belong in a source.`,
        'List fields as field orderId "Order ID" string.'
      );
      continue;
    }
    const [fieldId, ...rest] = parts;
    const type = rest.find(
      (item) => !item.quoted && FIELD_TYPES.has(item.text)
    );
    const label = rest.find((item) => item !== type);
    fields.push({
      id: fieldId!.text,
      name: label?.text ?? labelFromId(fieldId!.text),
      ...(type ? { type: type.text as FieldDefinition["type"] } : {}),
    });
  }
  return {
    id,
    name,
    glyph: single(declaration, "glyph") ?? name.charAt(0).toUpperCase(),
    entityKey: entityKey ?? "",
    fields,
  };
}

function fieldReference(textValue: string) {
  const dot = textValue.indexOf(".");
  return dot > 0
    ? { sourceId: textValue.slice(0, dot), fieldId: textValue.slice(dot + 1) }
    : undefined;
}

function compileRelationship(
  declaration: DslDeclaration,
  report: Report
): RelationshipDefinition | undefined {
  const id = idOf(declaration);
  const [fromText, arrow, toText, ...rest] = words(declaration);
  const from = fromText && fieldReference(fromText.text);
  const to = toText && fieldReference(toText.text);
  if (!id || !from || arrow?.text !== "->" || !to) {
    report(
      declaration.span,
      "A relationship needs a name and source.field -> source.field.",
      "Write it as relate @order-customer orders.customerId -> customers.customerId."
    );
    return undefined;
  }
  checkPairs(declaration, [], report);
  const cardinality = rest.find(
    (item) => !item.quoted && CARDINALITIES.has(item.text)
  );
  const name = rest.find((item) => item !== cardinality);
  return {
    id,
    name: name?.text ?? labelFromId(id),
    from,
    to,
    cardinality: (cardinality?.text ??
      DEFAULT_CARDINALITY) as RelationshipDefinition["cardinality"],
  };
}

function scalar(item: { text: string; quoted: boolean }) {
  if (item.quoted) {
    return item.text;
  }
  if (item.text === "null") {
    return null;
  }
  if (item.text === "true" || item.text === "false") {
    return item.text === "true";
  }
  const number = Number(item.text);
  return item.text.trim() !== "" && Number.isFinite(number)
    ? number
    : item.text;
}

/** Reads `field op value` from a filter's tokens, however they were spaced. */
function filterParts(declaration: DslDeclaration) {
  const tokens = [
    ...declaration.positional.map((item) => ({
      span: item.span,
      raw: item.value.raw,
    })),
    ...declaration.pairs
      .filter((pair) => pair.key !== "from" && pair.key !== "id")
      .map((pair) => ({
        span: pair.span,
        raw: `${pair.key}=${pair.value.raw}`,
      })),
  ].sort((a, b) => a.span.line - b.span.line || a.span.column - b.span.column);
  const joined = tokens.map((token) => token.raw).join(" ");
  const nullMatch = /^("(?:[^"\\]|\\.)*"|[^\s"]+)\s+(is-null|not-null)$/.exec(
    joined
  );
  if (nullMatch) {
    return { field: nullMatch[1]!, operator: nullMatch[2]!, value: undefined };
  }
  const match =
    /^("(?:[^"\\]|\\.)*"|[^\s"!<>=]+)\s*(!=|>=|<=|=|>|<)\s*(.+)$/.exec(joined);
  return match
    ? { field: match[1]!, operator: match[2]!, value: match[3]!.trim() }
    : undefined;
}

function unquoted(raw: string) {
  const parsed = parseDocument(`x ${raw}`).declarations[0];
  const item = parsed?.positional[0]?.value.items[0];
  return item
    ? { text: item.text, quoted: item.quoted }
    : { text: raw, quoted: false };
}

function compileStep(
  declaration: DslDeclaration,
  previous: AnalysisStep | undefined,
  report: Report
): AnalysisStep | undefined {
  const parts = words(declaration);
  const explicitId = idOf(declaration);
  const inputStepId = single(declaration, "from") ?? previous?.id ?? "";
  const fail = (message: string, suggestion: string) => {
    report(declaration.span, message, suggestion);
    return undefined;
  };
  switch (declaration.keyword) {
    case "source": {
      checkPairs(declaration, [], report);
      const sourceId = parts[0]?.text;
      if (!sourceId) {
        return fail(
          "A source step names a source.",
          "Write it as source orders."
        );
      }
      return { id: explicitId ?? sourceId, kind: "source", sourceId };
    }
    case "lookup":
    case "expand": {
      const expand = declaration.keyword === "expand";
      checkPairs(
        declaration,
        ["via", "on", "from", ...(expand ? ["keep-unmatched"] : [])],
        report
      );
      const as = parts[0]?.text;
      const relationshipId = single(declaration, "via");
      if (!as || !relationshipId) {
        return fail(
          `A ${declaration.keyword} step needs a name and via=.`,
          `Write it as ${declaration.keyword} customer via=order-customer.`
        );
      }
      const inputFieldId = single(declaration, "on");
      const base = {
        id: explicitId ?? as,
        inputStepId,
        relationshipId,
        as,
        ...(inputFieldId === undefined ? {} : { inputFieldId }),
      };
      if (!expand) {
        return { ...base, kind: "lookup" };
      }
      const keepUnmatched = flagValue(
        declaration,
        "keep-unmatched",
        parts.slice(1)
      );
      return {
        ...base,
        kind: "expand",
        ...(keepUnmatched === undefined ? {} : { keepUnmatched }),
      };
    }
    case "calc": {
      checkPairs(declaration, ["from"], report);
      const [fieldId, label] = parts;
      if (!fieldId || !declaration.expression) {
        return fail(
          "A calc step needs a field and a formula.",
          'Write it as calc margin "Margin" = revenue - cost.'
        );
      }
      return {
        id: explicitId ?? fieldId.text,
        kind: "calculate",
        inputStepId,
        fieldId: fieldId.text,
        label: label?.text ?? labelFromId(fieldId.text),
        expression: declaration.expression.text,
      };
    }
    case "filter": {
      const filter = filterParts(declaration);
      if (!explicitId || !filter) {
        return fail(
          "A filter step needs a name and field operator value.",
          "Write it as filter @recent orders.orderedAt >= $from."
        );
      }
      const field = unquoted(filter.field).text;
      const operator =
        NULL_OPERATORS[filter.operator] ?? OPERATORS[filter.operator]!;
      const base = {
        id: explicitId,
        kind: "filter" as const,
        inputStepId,
        fieldId: field,
        operator,
      };
      if (filter.value === undefined) {
        return base;
      }
      if (filter.value.startsWith("$")) {
        return { ...base, parameterId: filter.value.slice(1) };
      }
      return { ...base, value: scalar(unquoted(filter.value)) };
    }
    case "aggregate": {
      checkPairs(declaration, ["by", "from"], report);
      if (!explicitId) {
        return fail(
          "An aggregate step needs a name.",
          "Write it as aggregate @totals by=orders.customerId { sum @amount orders.amount }."
        );
      }
      const by = declaration.pairs.find((pair) => pair.key === "by");
      const measures: AggregateMeasure[] = [];
      for (const child of declaration.children) {
        const measureId = idOf(child);
        if (!OPERATIONS.has(child.keyword) || !measureId) {
          report(
            child.span,
            `${child.keyword} isn't a measure.`,
            "Write a measure as sum @amount orders.amount, average @mean …, or count @rows."
          );
          continue;
        }
        checkPairs(child, ["label", "per"], report);
        const fieldId = words(child)[0]?.text;
        const entityFieldId = single(child, "per");
        measures.push({
          id: measureId,
          label: single(child, "label") ?? labelFromId(measureId),
          operation: child.keyword as AggregateMeasure["operation"],
          ...(fieldId === undefined ? {} : { fieldId }),
          ...(entityFieldId === undefined ? {} : { entityFieldId }),
        });
      }
      return {
        id: explicitId,
        kind: "aggregate",
        inputStepId,
        groupBy: by ? by.value.items.map((item) => item.text) : [],
        measures,
      };
    }
    default:
      return fail(
        `${declaration.keyword} isn't a query step.`,
        "Use source, lookup, expand, calc, filter, or aggregate."
      );
  }
}

function compileQuery(
  declaration: DslDeclaration,
  report: Report
): AnalysisQuery | undefined {
  const id = idOf(declaration);
  const glyph = single(declaration, "glyph");
  if (!id || !glyph) {
    report(
      declaration.span,
      "A query needs a name and a glyph.",
      'Write it as query @orders "Orders with customers" glyph=◆ { … }.'
    );
    return undefined;
  }
  checkPairs(declaration, ["glyph", "frame", "output"], report);
  const steps: AnalysisStep[] = [];
  for (const child of declaration.children) {
    const step = compileStep(child, steps.at(-1), report);
    if (step) {
      steps.push(step);
    }
  }
  const first = steps.find((step) => step.kind === "source");
  return {
    id,
    name: words(declaration)[0]?.text ?? labelFromId(id),
    glyph,
    frameLabel:
      single(declaration, "frame") ??
      (first?.kind === "source" ? first.sourceId : id),
    steps,
    outputStepId: single(declaration, "output") ?? steps.at(-1)?.id ?? "",
  };
}

function compileParameter(
  declaration: DslDeclaration,
  report: Report
): AnalysisParameter | undefined {
  const id = idOf(declaration);
  const parts = words(declaration);
  const type = parts.find(
    (item) => !item.quoted && PARAMETER_TYPES.has(item.text)
  );
  if (!id || !type) {
    report(
      declaration.span,
      "A parameter needs a name and a type.",
      "Write it as param @from From date required."
    );
    return undefined;
  }
  checkPairs(declaration, ["pick", "required"], report);
  const name = parts.find(
    (item) => item !== type && (item.quoted || item.text !== "required")
  );
  const required = flagValue(declaration, "required", parts);
  const pick = single(declaration, "pick");
  const dot = pick?.indexOf(".") ?? -1;
  return {
    id,
    name: name?.text ?? labelFromId(id),
    type: type.text as AnalysisParameter["type"],
    ...(required === undefined ? {} : { required }),
    ...(pick === undefined
      ? {}
      : {
          options:
            dot > 0
              ? {
                  sourceId: pick.slice(0, dot),
                  labelFieldId: pick.slice(dot + 1),
                }
              : { sourceId: pick },
        }),
  };
}

/** Checks that every reference names something the project declares. */
function checkReferences(
  project: AnalysisProject,
  spans: Map<object, DslSpan>,
  report: Report,
  connections: ConnectionDefinition[] = [],
  databases: Record<string, DatabaseSource> = {},
  paths: Record<string, string> = {}
) {
  const fromData = new Set([...Object.keys(databases), ...Object.keys(paths)]);
  const sources = new Map(project.sources.map((source) => [source.id, source]));
  const connectionIds = new Set(connections.map((item) => item.id));
  const relationships = new Set(project.relationships.map((item) => item.id));
  const parameters = new Set(project.parameters?.map((item) => item.id));
  const where = (item: object) =>
    spans.get(item) ?? { line: 1, column: 1, length: 1 };
  const nearest = (options: Iterable<string>) => {
    const list = [...options];
    return list.length ? `Use ${list.join(", ")}.` : undefined;
  };
  const seenConnections = new Set<string>();
  for (const connection of connections) {
    if (seenConnections.has(connection.id)) {
      report(
        where(connection),
        `Two connections are named ${connection.id}.`,
        "Give one of them its own @name."
      );
    }
    seenConnections.add(connection.id);
  }
  for (const [sourceId, database] of Object.entries(databases)) {
    if (!connectionIds.has(database.connection)) {
      const source = sources.get(sourceId);
      report(
        source ? where(source) : { line: 1, column: 1, length: 1 },
        `No connection is named ${database.connection}.`,
        nearest(connectionIds) ??
          "Add one, as connection @app driver=sqlite path=data/app.db."
      );
    }
  }
  for (const relationship of project.relationships) {
    for (const end of [relationship.from, relationship.to]) {
      const source = sources.get(end.sourceId);
      if (!source) {
        report(
          where(relationship),
          `No source is named ${end.sourceId}.`,
          nearest(sources.keys())
        );
      } else if (
        // A source with no field lines takes its fields from its data.
        (source.fields.length || !fromData.has(source.id)) &&
        !source.fields.some((field) => field.id === end.fieldId)
      ) {
        report(
          where(relationship),
          `${end.sourceId} has no field ${end.fieldId}.`,
          nearest(source.fields.map((field) => field.id)),
          "warning"
        );
      }
    }
  }
  for (const query of project.queries) {
    const ids = new Set<string>();
    for (const step of query.steps) {
      if (ids.has(step.id)) {
        report(
          where(step),
          `Two steps in ${query.id} are named ${step.id}.`,
          "Give one of them its own @name."
        );
      }
      if ("inputStepId" in step && !ids.has(step.inputStepId)) {
        report(
          where(step),
          `${step.id} reads ${step.inputStepId || "nothing"}, which comes later or doesn't exist.`,
          "Name an earlier step with from=."
        );
      }
      ids.add(step.id);
      if (step.kind === "source" && !sources.has(step.sourceId)) {
        report(
          where(step),
          `No source is named ${step.sourceId}.`,
          nearest(sources.keys())
        );
      }
      if (
        (step.kind === "lookup" || step.kind === "expand") &&
        !relationships.has(step.relationshipId)
      ) {
        report(
          where(step),
          `No relationship is named ${step.relationshipId}.`,
          nearest(relationships)
        );
      }
      if (
        step.kind === "filter" &&
        step.parameterId !== undefined &&
        !parameters.has(step.parameterId)
      ) {
        report(
          where(step),
          `No parameter is named ${step.parameterId}.`,
          nearest(parameters)
        );
      }
    }
    if (!ids.has(query.outputStepId)) {
      report(
        where(query),
        `${query.id} has no step named ${query.outputStepId}.`,
        nearest(ids)
      );
    }
  }
  for (const parameter of project.parameters ?? []) {
    if (parameter.options && !sources.has(parameter.options.sourceId)) {
      report(
        where(parameter),
        `No source is named ${parameter.options.sourceId}.`,
        nearest(sources.keys())
      );
    }
  }
}

/** Reads project text into a project, its source paths, and any problems. */
export function compileProjectText(
  textValue: string,
  {
    fragment = false,
  }: {
    /**
     * Reads only the `source … path=` lines of other text, such as an
     * analysis file that brings its own data.
     */
    fragment?: boolean;
  } = {}
): ProjectTextResult {
  const parsed = parseDocument(textValue);
  // The text's own reader reports syntax problems in a fragment.
  const diagnostics: DslDiagnostic[] = (fragment ? [] : parsed.problems).map(
    (problem) => ({
      severity: "error",
      effect: "setting-ignored",
      message: problem.message,
      line: problem.span.line,
      column: problem.span.column,
      length: problem.span.length,
      ...(problem.suggestion ? { suggestion: problem.suggestion } : {}),
    })
  );
  const report: Report = (span, message, suggestion, severity = "error") => {
    diagnostics.push({
      severity,
      effect: "setting-ignored",
      message,
      line: span.line,
      column: span.column,
      length: span.length,
      ...(suggestion ? { suggestion } : {}),
    });
  };
  const project: AnalysisProject = {
    id: "",
    version: 1,
    sources: [],
    relationships: [],
    queries: [],
  };
  const paths: Record<string, string> = {};
  const connections: ConnectionDefinition[] = [];
  const databases: Record<string, DatabaseSource> = {};
  const spans = new Map<object, DslSpan>();
  const keep = <T extends object>(item: T | undefined, span: DslSpan) => {
    if (item) {
      spans.set(item, span);
    }
    return item;
  };
  const declarations = fragment
    ? parsed.declarations.filter(
        (item) =>
          item.keyword === "source" && single(item, "path") !== undefined
      )
    : parsed.declarations;
  for (const declaration of declarations) {
    switch (declaration.keyword) {
      case "project":
        project.id = idOf(declaration) ?? "";
        break;
      case "source": {
        const source = keep(
          compileSource(declaration, report),
          declaration.span
        );
        if (source) {
          project.sources.push(source);
          const database = compileDatabase(declaration, report);
          const path = single(declaration, "path");
          if (database) {
            databases[source.id] = database;
          } else if (path !== undefined) {
            paths[source.id] = path;
          }
        }
        break;
      }
      case "connection": {
        const connection = keep(
          compileConnection(declaration, report),
          declaration.span
        );
        if (connection) {
          connections.push(connection);
        }
        break;
      }
      case "relate": {
        const relationship = keep(
          compileRelationship(declaration, report),
          declaration.span
        );
        if (relationship) {
          project.relationships.push(relationship);
        }
        break;
      }
      case "query": {
        const query = keep(compileQuery(declaration, report), declaration.span);
        if (query) {
          query.steps.forEach((step, index) =>
            spans.set(
              step,
              declaration.children[index]?.span ?? declaration.span
            )
          );
          project.queries.push(query);
        }
        break;
      }
      case "param": {
        const parameter = keep(
          compileParameter(declaration, report),
          declaration.span
        );
        if (parameter) {
          (project.parameters ??= []).push(parameter);
        }
        break;
      }
      default:
        report(
          declaration.span,
          `${declaration.keyword} isn't part of project text.`,
          "Use project, connection, source, relate, query, or param."
        );
    }
  }
  if (!project.id && !fragment) {
    report(
      { line: 1, column: 1, length: 1 },
      "Project text starts with project @name.",
      "Add project @my-project as the first line."
    );
  }
  checkReferences(project, spans, report, connections, databases, paths);
  return { project, paths, connections, databases, diagnostics };
}
