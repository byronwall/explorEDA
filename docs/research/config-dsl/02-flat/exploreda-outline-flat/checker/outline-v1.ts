/**
 * explorEDA DSL review checker, not a production SavedDataStructure compiler.
 * No dependencies, evaluation, network access, or repository mutation.
 * The three front ends share binding, raw-config parsing, and diagnostics.
 */
export type Dialect = "outline" | "phrase" | "slots";
export type FieldType = "numeric" | "categorical" | "datetime" | "boolean";
export type Catalog = Record<string, { fields: Record<string, FieldType> }>;
export interface Position { line: number; character: number }
export interface Range { start: Position; end: Position }
export interface Diagnostic {
  code: string;
  severity: "error" | "warning";
  message: string;
  range: Range;
  suggestions?: string[];
  relatedInformation?: { message: string; range: Range }[];
}
export interface CheckResult {
  ok: boolean;
  dialect: Dialect;
  targetRef: string;
  validation: {
    syntaxAndSubsetSemantics: "pass" | "fail";
    bindings: "checked" | "deferred";
    fullNativeSchema: "not-implemented";
    runtime: "not-run";
  };
  diagnostics: Diagnostic[];
  preview: {
    sourceBinding: string;
    sourceLabel?: string;
    fieldSettings: Record<string, Record<string, unknown>>;
    chartPatches: Record<string, unknown>[];
  };
}
interface Token { value: string; quoted: boolean; line: number; col: number; end: number }
interface Node { text: string; line: number; indent: number; tokens: Token[]; children: Node[] }
interface Field { raw: string; node: Node; expect?: string; optional: boolean; settings: Record<string, unknown> }
interface Source { binding: string; label?: string; node: Node; fields: Map<string, Field> }
const TARGET = "226ffae632239150b54b55e9b346386e5e1e66d4";
const blocked = new Set(["__proto__", "constructor", "prototype"]);
const types: Record<string, string> = {
  scatter: "scatter", hist: "bar", histogram: "bar", bar: "bar",
  row: "row", table: "data-table", metric: "metric-card",
};
const canonicalKind = (value: string) => value === "histogram" ? "hist" : value;
const own = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const dictionary = (): Record<string, unknown> => Object.create(null);
function at(node: Node | Token): Range {
  const col = "col" in node ? node.col : node.indent;
  const end = "end" in node ? node.end : node.indent + node.text.length;
  return { start: { line: node.line, character: col }, end: { line: node.line, character: end } };
}
function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(row[j - 1]! + 1, previous[j]! + 1, previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    previous = row;
  }
  return previous[b.length]!;
}

export function check(text: string, catalog?: Catalog): CheckResult {
  const diagnostics: Diagnostic[] = [];
  let dialect: Dialect = "outline";
  let deferred = false;
  const report = (code: string, message: string, node: Node | Token, severity: "error" | "warning" = "error", extra: Partial<Diagnostic> = {}) => {
    diagnostics.push({ code, severity, message, range: at(node), ...extra });
  };
  const synthetic: Node = { text: "", line: 0, indent: 0, tokens: [], children: [] };
  if (text.length > 200_000) {
    report("E_LIMIT", "The review checker accepts at most 200,000 UTF-16 code units.", synthetic);
    text = "";
  }
  const lex = (line: string, lineNumber: number, base: number): Token[] => {
    const out: Token[] = [];
    for (let i = 0; i < line.length;) {
      if (/\s/.test(line[i]!)) { i++; continue; }
      if (line[i] === "#" && (i + 1 === line.length || /\s/.test(line[i + 1]!))) break;
      const start = i;
      const quote = line[i];
      if (quote === '"' || quote === "'") {
        i++;
        let escaped = false;
        for (; i < line.length; i++) {
          if (!escaped && line[i] === quote) break;
          escaped = !escaped && line[i] === "\\";
        }
        if (i >= line.length) {
          report("E_QUOTE", "Close the quoted token before the end of the line.", { value: "", quoted: true, line: lineNumber, col: base + start, end: base + line.length });
          return out;
        }
        const literal = line.slice(start, ++i);
        let value: string;
        try {
          value = quote === '"' ? JSON.parse(literal) : literal.slice(1, -1).replace(/\\(['\\])/g, "$1");
        } catch {
          report("E_ESCAPE", "Invalid quoted-string escape; double quotes use JSON escapes.", { value: literal, quoted: true, line: lineNumber, col: base + start, end: base + i });
          value = literal.slice(1, -1);
        }
        if (i < line.length && !/\s|;/.test(line[i]!)) report("E_TOKEN", "Put whitespace after a quoted token.", { value, quoted: true, line: lineNumber, col: base + start, end: base + i });
        out.push({ value, quoted: true, line: lineNumber, col: base + start, end: base + i });
        continue;
      }
      if (line[i] === "[" || line[i] === "{") {
        let depth = 0; let inString = false; let escape = false;
        for (; i < line.length; i++) {
          const c = line[i]!;
          if (inString) {
            if (!escape && c === '"') inString = false;
            escape = !escape && c === "\\";
            continue;
          }
          if (c === '"') { inString = true; continue; }
          if (c === "[" || c === "{") depth++;
          if (c === "]" || c === "}") { depth--; if (depth === 0) { i++; break; } }
        }
        out.push({ value: line.slice(start, i), quoted: false, line: lineNumber, col: base + start, end: base + i });
        continue;
      }
      if (line[i] === ";") {
        out.push({ value: ";", quoted: false, line: lineNumber, col: base + i, end: base + i + 1 });
        i++; continue;
      }
      while (i < line.length && !/\s|;/.test(line[i]!)) i++;
      out.push({ value: line.slice(start, i), quoted: false, line: lineNumber, col: base + start, end: base + i });
    }
    return out;
  };
  const roots: Node[] = [];
  const stack: Node[] = [];
  let lastIndent = 0;
  text.replace(/\r\n?/g, "\n").split("\n").forEach((line, lineNumber) => {
    if (!line.trim() || line.trimStart().startsWith("# ") || line.trim() === "#") return;
    const indentation = line.match(/^\s*/)?.[0] ?? "";
    const indent = indentation.length;
    const node: Node = { text: line.slice(indent), line: lineNumber, indent, tokens: [], children: [] };
    if (indentation.includes("\t")) report("E_TABS", "Use spaces for indentation. Tabs are not silently reinterpreted.", node);
    node.tokens = lex(node.text, lineNumber, indent);
    if (!node.tokens.length) return;
    while (stack.length && stack[stack.length - 1]!.indent >= indent) stack.pop();
    if (indent && !stack.length) report("E_INDENT", "A top-level declaration must start in column 1.", node);
    if (indent < lastIndent && stack.length && indent !== stack[stack.length - 1]!.children[0]?.indent) {
      report("E_INDENT", "Dedent to an existing sibling indentation level.", node);
    }
    if (stack.length >= 32) { report("E_LIMIT", "Indentation exceeds 32 levels.", node); return; }
    if (stack.length) stack[stack.length - 1]!.children.push(node); else roots.push(node);
    stack.push(node);
    lastIndent = indent;
  });
  const rest = (node: Node, start: number): string => {
    const ts = node.tokens.slice(start);
    if (!ts.length) return "";
    if (ts.length === 1) return ts[0]!.value;
    return node.text.slice(ts[0]!.col - node.indent, ts[ts.length - 1]!.end - node.indent).trim();
  };
  const scalar = (tokens: Token[], node: Node): unknown => {
    if (!tokens.length) { report("E_VALUE", "Expected a value or an indented block.", node); return null; }
    if (tokens.length === 1 && tokens[0]!.quoted) return tokens[0]!.value;
    const raw = node.text.slice(tokens[0]!.col - node.indent, tokens[tokens.length - 1]!.end - node.indent).trim();
    if (raw === "true") return true;
    if (raw === "false") return false;
    if (raw === "null") return null;
    if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)) {
      const n = Number(raw);
      if (!Number.isFinite(n)) report("E_NUMBER", "A setting must be finite.", tokens[0]!);
      return n;
    }
    if (/^[+-]?(Infinity|NaN)$/.test(raw)) report("E_NUMBER", "Nonfinite settings are not supported; quote this token only when it is literal text.", tokens[0]!);
    if (raw.startsWith("[") || raw.startsWith("{")) {
      try { return JSON.parse(raw); } catch { report("E_JSON", "Invalid inline JSON. Use valid JSON or an indented list/object.", node); return null; }
    }
    return raw;
  };
  const safe = (value: unknown, node: Node, depth = 0): boolean => {
    if (depth > 32) { report("E_LIMIT", "Raw configuration exceeds 32 levels.", node); return false; }
    if (typeof value === "number" && !Number.isFinite(value)) { report("E_NUMBER", "Raw settings must contain finite numbers.", node); return false; }
    if (Array.isArray(value)) return value.every(v => safe(v, node, depth + 1));
    if (!object(value)) return true;
    return Object.entries(value).every(([k, v]) => {
      if (blocked.has(k)) { report("E_UNSAFE_KEY", `Unsafe object key: ${k}.`, node); return false; }
      return safe(v, node, depth + 1);
    });
  };
  const parseObject = (nodes: Node[]): Record<string, unknown> => {
    const out = dictionary();
    for (const n of nodes) {
      const key = n.tokens[0]!.value;
      if (blocked.has(key)) { report("E_UNSAFE_KEY", `Unsafe object key: ${key}.`, n); continue; }
      if (own(out, key)) { report("E_DUPLICATE", `Duplicate raw key ${key}.`, n); continue; }
      out[key] = parseValue(n, 1);
    }
    return out;
  };
  const parseValue = (node: Node, start: number): unknown => {
    const ts = node.tokens.slice(start);
    if (ts.length === 1 && !ts[0]!.quoted && ts[0]!.value === "list") {
      return node.children.map(child => {
        if (child.tokens[0]?.value !== "item") report("E_LIST_ITEM", "A list member starts with item.", child);
        return parseValue(child, 1);
      });
    }
    if (!ts.length && node.children.length) return parseObject(node.children);
    if (node.children.length) report("E_SCALAR_CHILDREN", "A scalar cannot also have child settings.", node);
    const value = scalar(ts, node);
    safe(value, node);
    return value;
  };

  const sources = new Map<string, Source>();
  let use: string | undefined;
  let useNode = synthetic;
  const charts: Node[] = [];
  let headerSeen = false;
  for (const n of roots) {
    const command = n.tokens[0]!.value.toLowerCase();
    if (command === "eda") {
      if (headerSeen) report("E_DUPLICATE", "Only one eda header is allowed.", n);
      headerSeen = true;
      const syntax = n.tokens[2]?.value;
      if (n.tokens[1]?.value !== "1" || !["outline", "phrase", "slots"].includes(syntax ?? "") || n.tokens.length !== 3) report("E_VERSION", "Expected eda 1 outline, eda 1 phrase, or eda 1 slots.", n);
      else dialect = syntax as Dialect;
      continue;
    }
    if (command === "sources") {
      if (n.tokens.length !== 1) report("E_ARITY", "sources takes an indented block, not inline arguments.", n);
      for (const s of n.children) {
        const id = s.tokens[0]!.value;
        if (sources.has(id)) { report("E_SOURCE_DUPLICATE", `Duplicate source alias ${id}.`, s); continue; }
        if (s.tokens.length > 2) report("E_ARITY", "A source line is alias [hostBinding]. Quote a binding containing spaces.", s);
        const src: Source = { binding: s.tokens[1]?.value ?? id, node: s, fields: new Map() };
        for (const child of s.children) {
          const key = child.tokens[0]!.value;
          if (key === "label") { src.label = rest(child, 1); continue; }
          if (key !== "fields") { report("E_SOURCE_SETTING", `Unknown source setting ${key}. Expected label or fields.`, child); continue; }
          for (const f of child.children) {
            const alias = f.tokens[0]!.value;
            if (src.fields.has(alias)) { report("E_FIELD_DUPLICATE", `Duplicate field alias ${alias}.`, f); continue; }
            if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(alias)) report("E_ALIAS", "Use an ASCII identifier for an alias; raw names may contain arbitrary quoted text.", f.tokens[0]!);
            const field: Field = { raw: rest(f, 1) || alias, node: f, optional: false, settings: dictionary() };
            const metadata = new Set<string>();
            for (const detail of f.children) {
              const k = detail.tokens[0]!.value;
              if (metadata.has(k)) report("E_DUPLICATE", `Duplicate field setting ${k}.`, detail);
              metadata.add(k);
              const v = parseValue(detail, 1);
              if (k === "expect") field.expect = String(v);
              else if (k === "optional") { if (typeof v !== "boolean") report("E_BOOLEAN", "optional expects true or false.", detail); else field.optional = v; }
              else if (k === "coerce") field.settings.type = v;
              else if (["label", "format", "precision", "unit", "currency", "description", "datePreset", "nullTokens"].includes(k)) field.settings[k] = v;
              else report("E_FIELD_SETTING", `Unknown field setting ${k}.`, detail);
            }
            for (const type of [field.expect, field.settings.type]) {
              if (type !== undefined && !["numeric", "categorical", "datetime", "boolean"].includes(String(type))) report("E_FIELD_TYPE", `Unknown field type ${String(type)}.`, f);
            }
            if (field.settings.precision !== undefined && !(typeof field.settings.precision === "number" && Number.isInteger(field.settings.precision) && field.settings.precision >= 0 && field.settings.precision <= 20)) report("E_PRECISION", "precision must be an integer from 0 through 20.", f);
            if (field.settings.currency !== undefined && !/^[A-Z]{3}$/.test(String(field.settings.currency))) report("E_CURRENCY", "currency must be a three-letter uppercase code.", f);
            if (field.settings.format !== undefined && !["auto", "number", "currency", "percent", "date", "datetime"].includes(String(field.settings.format))) report("E_FORMAT", "Unknown display format.", f);
            if (field.settings.datePreset !== undefined && !["iso", "month-day-year", "day-month-year"].includes(String(field.settings.datePreset))) report("E_DATE_PRESET", "Unknown date preset.", f);
            if (field.settings.nullTokens !== undefined && !(Array.isArray(field.settings.nullTokens) && field.settings.nullTokens.every(v => typeof v === "string"))) report("E_NULL_TOKENS", "nullTokens must be an array of strings.", f);
            src.fields.set(alias, field);
          }
        }
        sources.set(id, src);
      }
      continue;
    }
    if (command === "use") {
      if (use !== undefined) report("E_DUPLICATE", "Only one use is allowed in the review checker's implicit workspace.", n);
      use = n.tokens[1]?.value;
      useNode = n;
      if (!use || n.tokens.length !== 2) report("E_SOURCE", "use expects one source alias.", n);
      continue;
    }
    if (own(types, command)) { charts.push(n); continue; }
    if (["workspace", "defaults", "edit", "calc", "aggregate", "config", "lab", "chart"].includes(command)) report("E_REVIEW_LIMIT", `${command} is specified in the review but is outside this runnable prototype. It was not accepted or discarded.`, n);
    else report("E_ROOT", `Unknown declaration ${command}. Indent chart settings or use a supported chart type.`, n);
  }
  if (charts.length > 500) report("E_LIMIT", "At most 500 charts are accepted.", charts[500]!);
  use ??= sources.size === 1 ? [...sources.keys()][0] : "data";
  const source = sources.get(use);
  if (sources.size && !source) report("E_SOURCE", `Choose one declared source with use. ${use} is not declared.`, useNode);
  const binding = source?.binding ?? use;
  const host = catalog && own(catalog, binding) ? catalog[binding] : undefined;
  if (catalog && !host) report("E_SOURCE_MISSING", `Host binding ${binding} is missing from the supplied catalog.`, source?.node ?? useNode);
  if (!host) { deferred = true; report("W_BINDING_DEFERRED", "No host field catalog is available. Existence and inferred-type checks are deferred, not passed.", source?.node ?? useNode, "warning"); }
  const fieldSettings: Record<string, Record<string, unknown>> = Object.create(null);
  for (const [alias, f] of source?.fields ?? []) {
    if (blocked.has(f.raw)) { report("E_UNSAFE_KEY", `The prototype cannot safely write field settings for ${f.raw}.`, f.node); continue; }
    if (host && own(host.fields, alias) && alias !== f.raw) report("E_ALIAS_SHADOW", `Alias ${alias} shadows a different exact raw field. Rename the alias.`, f.node);
    if (host && !own(host.fields, f.raw) && !f.optional) report("E_FIELD_MISSING", `Required source field ${f.raw} is missing.`, f.node);
    if (host && own(host.fields, f.raw) && f.expect && host.fields[f.raw] !== f.expect) report("E_FIELD_TYPE", `${f.raw} is ${host.fields[f.raw]}, expected ${f.expect}. expect does not coerce data.`, f.node);
    if (own(fieldSettings, f.raw) && JSON.stringify(fieldSettings[f.raw]) !== JSON.stringify(f.settings)) report("E_FIELD_SETTINGS_CONFLICT", `Two aliases set conflicting metadata for ${f.raw}.`, f.node);
    if (Object.keys(f.settings).length) fieldSettings[f.raw] = f.settings;
  }
  const resolve = (t: Token, canonicalOnly = false): string => {
    const f = !canonicalOnly ? source?.fields.get(t.value) : undefined;
    const raw = f?.raw ?? t.value;
    if (host && !own(host.fields, raw)) {
      const candidates = [...new Set([...(source?.fields.keys() ?? []), ...Object.keys(host.fields)])];
      const suggestions = candidates.map(value => ({ value, score: distance(t.value, value) })).filter(x => x.score <= 3).sort((a, b) => a.score - b.score || a.value.localeCompare(b.value)).slice(0, 3).map(x => x.value);
      report("E_UNKNOWN_FIELD", `Field ${t.value} does not resolve in ${binding}.`, t, "error", { suggestions });
    }
    return raw;
  };
  const fieldType = (raw: string) => fieldSettings[raw]?.type ?? (host && own(host.fields, raw) ? host.fields[raw] : undefined);
  const patches: Record<string, unknown>[] = [];
  const identifiers = new Map<string, Node>();
  for (const [chartIndex, chart] of charts.slice(0, 500).entries()) {
    const kind = canonicalKind(chart.tokens[0]!.value.toLowerCase());
    const patch = dictionary();
    patch.type = types[kind];
    const writes = new Map<string, { node: Node | Token; rank: number; value: unknown }>();
    const write = (path: string[], value: unknown, n: Node | Token, rank = 1) => {
      if (path.some(p => blocked.has(p))) { report("E_UNSAFE_KEY", "Unsafe configuration path.", n); return; }
      const key = path.join("/");
      const old = writes.get(key);
      if (old) {
        const same = JSON.stringify(old.value) === JSON.stringify(value);
        report(same ? "W_DUPLICATE" : old.rank === rank ? "E_DUPLICATE" : "W_OVERRIDE", `${key} is assigned more than once${same ? " with the same value" : ""}.`, n, same || old.rank !== rank ? "warning" : "error", { relatedInformation: [{ message: "Previous assignment", range: at(old.node) }] });
      }
      writes.set(key, { node: n, rank, value });
      let parent = patch;
      for (const segment of path.slice(0, -1)) {
        if (own(parent, segment) && !object(parent[segment])) { report("E_PATH", `Cannot descend through scalar/array ${segment}. Replace the complete array or use a nested object.`, n); return; }
        if (!own(parent, segment)) parent[segment] = dictionary();
        parent = parent[segment] as Record<string, unknown>;
      }
      parent[path[path.length - 1]!] = value;
    };
    const rawBlocks: Node[] = [];
    const tok = (value: string, anchor: Token): Token => ({ ...anchor, value, quoted: false });
    const apply = (ts: Token[], n: Node) => {
      for (let i = 0; i < ts.length;) {
        let key = ts[i]!.value.toLowerCase().replace(/:$/, "");
        if (key === ";") { i++; continue; }
        const origin = ts[i++]!;
        if (ts[i]?.value === "=") i++;
        if (key === "colour") { report("W_ALIAS", "colour is accepted; the canonical spelling is color.", origin, "warning"); key = "color"; }
        if (key === "point-size") key = "points";
        const take = () => {
          const t = ts[i++];
          if (!t || t.value === ";") { report("E_VALUE", `${key} needs another value.`, origin); return tok("", origin); }
          return t;
        };
        const numeric = () => {
          const t = take(); const value = Number(t.value);
          if (!t.value || !Number.isFinite(value)) report("E_NUMBER", `${key} expects a finite number.`, t);
          return value;
        };
        if (["id", "source"].includes(key)) {
          const t = take();
          if (key === "source") { if (t.value !== use) report("E_MIXED_SOURCE", "One workspace receives one data array. Use separate workspace blocks in the full design.", t); }
          else write(["id"], t.value, t);
          continue;
        }
        if (key === "title") {
          const values: Token[] = [];
          while (i < ts.length && ts[i]!.value !== ";") values.push(ts[i++]!);
          if (!values.length) report("E_VALUE", "title expects text; use quotes for an explicitly empty title.", origin);
          write(["title"], values.length === 1 ? values[0]!.value : values.map(t => t.value).join(" "), origin);
          continue;
        }
        if (key === "x" || key === "y") {
          const t = take();
          if (t.value === "scale" && !t.quoted) write([`${key}Axis`, "scaleType"], take().value, t);
          else write([`${key}Field`], resolve(t), t);
          continue;
        }
        if (["field", "color", "measure"].includes(key)) {
          const t = take(); write([key === "color" ? "colorField" : key === "measure" ? "measureField" : "field"], resolve(t), t); continue;
        }
        if (["points", "opacity", "bins"].includes(key)) {
          write([key === "points" ? "pointSize" : key === "opacity" ? "pointOpacity" : "binCount"], numeric(), origin); continue;
        }
        if (key === "aggregation") { write(["aggregation"], take().value, origin); continue; }
        if (key === "fields") {
          const fields: string[] = [];
          while (i < ts.length && ts[i]!.value !== ";") fields.push(resolve(ts[i++]!));
          if (!fields.length) report("E_VALUE", "fields expects one or more field references.", origin);
          write(["columns"], fields.map(field => ({ id: field, field })), origin); continue;
        }
        if (key === "at") {
          const [x, y, w, h] = [numeric(), numeric(), numeric(), numeric()];
          write(["layout"], { x, y, w, h }, origin); continue;
        }
        if (key === "facet") {
          let first = take(); let mode = "wrap";
          if (["grid", "wrap"].includes(first.value) && !first.quoted) { mode = first.value; first = take(); }
          const rowVariable = resolve(first);
          const f: Record<string, unknown> = { enabled: true, type: mode, rowVariable };
          if (mode === "grid") f.columnVariable = resolve(take());
          else { f.columnCount = 2; if (ts[i]?.value === "columns") { i++; f.columnCount = numeric(); } }
          write(["facet"], f, origin); continue;
        }
        if (key === "filter") {
          const field = resolve(take()); const operator = take();
          let f: Record<string, unknown>;
          if (operator.value === "between") {
            f = { type: "range", field };
            for (const edge of ["min", "max"]) { const t = take(); if (t.value !== "*") { const value = Number(t.value); if (!Number.isFinite(value)) report("E_NUMBER", "Filter bounds must be finite or * for an open side.", t); f[edge] = value; } }
          } else if (operator.value === "in") {
            const values: unknown[] = [];
            while (i < ts.length && ts[i]!.value !== ";") { const t = ts[i++]!; values.push(scalar([t], n)); }
            if (!values.length) report("E_VALUE", "in expects one or more values; use config for an intentionally empty selection.", origin);
            f = { type: "value", field, values };
          } else { report("E_FILTER", "Use filter FIELD between MIN MAX or filter FIELD in VALUE ...", operator); return; }
          patch.filters = [...(Array.isArray(patch.filters) ? patch.filters : []), f]; continue;
        }
        report("E_SETTING", `Unknown setting ${key}.`, origin, "error", { suggestions: ["x", "y", "color", "opacity", "points", "bins", "config"].filter(k => distance(key, k) <= 3) });
        return;
      }
    };
    const segments: Token[][] = [[]];
    for (const t of chart.tokens.slice(1)) { if (t.value === ";" && !t.quoted) segments.push([]); else segments[segments.length - 1]!.push(t); }
    const head = segments[0]!;
    const tokens: Token[] = [];
    const push = (key: string, value?: Token) => { if (value) tokens.push(tok(key, value), value); else report("E_HEADER", `Missing ${key} in ${kind} header.`, chart); };
    if (dialect === "outline") tokens.push(...head);
    else if (kind === "scatter") {
      if (dialect === "slots") {
        push("x", head[0]); push("y", head[1]);
        if (head[2]) push("color", head[2]);
        if (head.length > 3) report("E_HEADER", "Slots scatter is X Y [COLOR]. Put more settings after ; or on indented lines.", head[3]!);
      } else {
        push("y", head[0]);
        if (head[1]?.value !== "against") report("E_HEADER", "Phrase scatter is Y against X [colored by COLOR].", head[1] ?? chart);
        push("x", head[2]);
        if (head.length > 3) {
          if (head[3]?.value !== "colored" || head[4]?.value !== "by" || head.length !== 6) report("E_HEADER", "Use colored by FIELD after the X field.", head[3]!);
          push("color", head[5]);
        }
      }
    } else if (kind === "hist") {
      push("field", head[0]);
      if (dialect === "slots") { if (head[1]) push("bins", head[1]); if (head.length > 2) report("E_HEADER", "Slots hist is FIELD [BIN_COUNT].", head[2]!); }
      else if (head.length > 1) { if (head[1]?.value !== "into" || head[3]?.value !== "bins" || head.length !== 4) report("E_HEADER", "Phrase hist is FIELD [into COUNT bins].", chart); push("bins", head[2]); }
    } else if (kind === "row" || kind === "bar") {
      push("field", head[0]); if (head.length !== 1) report("E_HEADER", `${kind} takes one field.`, chart);
    } else if (kind === "table") {
      tokens.push(tok("fields", chart.tokens[0]!), ...head);
    } else if (kind === "metric") {
      push("aggregation", head[0]); if (head[1]) push("measure", head[1]); if (head.length > 2) report("E_HEADER", "metric takes an aggregation and optional measure.", chart);
    }
    apply(tokens, chart);
    for (const seg of segments.slice(1)) apply(seg, chart);
    for (const child of chart.children) {
      if (child.tokens[0]?.value === "config") { rawBlocks.push(child); continue; }
      if (child.children.length) report("E_REVIEW_LIMIT", "Nested shorthand groups are a full-design feature. Use a config block in this prototype.", child);
      apply(child.tokens, child);
    }
    const base = ["type", "id", "title", "field", "layout", "colorScaleId", "colorField", "facet", "xAxis", "yAxis", "margin", "filters", "xAxisLabel", "yAxisLabel", "xGridLines", "yGridLines"];
    const extra: Record<string, string[]> = {
      scatter: ["xField", "yField", "pointSize", "pointOpacity"], hist: ["binCount", "forceString", "aggregateId"], bar: ["binCount", "forceString", "aggregateId"], row: ["minRowHeight", "maxRowHeight"], table: ["columns", "sortBy", "sortDirection", "globalSearch", "showDistributions"], metric: ["aggregation", "measureField"],
    };
    const allowed = new Set([...base, ...(extra[kind] ?? [])]);
    const raw = (value: unknown, path: string[], n: Node) => {
      if (path.some(key => blocked.has(key))) { report("E_UNSAFE_KEY", "Unsafe configuration path.", n); return; }
      if (object(value) && Object.keys(value).length) { for (const [key, child] of Object.entries(value)) raw(child, [...path, key], n); return; }
      if (!allowed.has(path[0]!)) { report("E_UNKNOWN_CONFIG", `Unknown ${kind} setting ${path[0]}. config is not a validation bypass.`, n); return; }
      write(path, value, n, 2);
    };
    for (const block of rawBlocks) {
      if (block.tokens.length === 1) {
        const value = parseObject(block.children);
        if (safe(value, block)) for (const [key, v] of Object.entries(value)) raw(v, [key], block);
      } else {
        const p = block.tokens[1]!.value;
        const path = p.startsWith("/") ? p.slice(1).split("/").map(s => s.replace(/~1/g, "/").replace(/~0/g, "~")) : p.split(".");
        if (p.includes("~") && /~(?![01])/.test(p)) report("E_POINTER", "JSON Pointer escapes are ~0 and ~1.", block.tokens[1]!);
        const v = parseValue(block, 2);
        if (safe(v, block)) raw(v, path, block);
      }
    }
    if (patch.type !== types[kind]) report("E_TYPE_CONFLICT", "config.type must agree with the chart declaration.", chart);
    for (const key of Object.keys(patch)) if (!allowed.has(key)) report("E_SETTING_FOR_CHART", `${key} does not apply to ${kind}.`, chart);
    const location = (key: string): Node | Token => writes.get(key)?.node ?? chart;
    const requireString = (key: string) => { if (typeof patch[key] !== "string" || !patch[key]) report("E_REQUIRED", `${kind} needs ${key}.`, chart); };
    if (kind === "scatter") { requireString("xField"); requireString("yField"); }
    if (["hist", "row", "bar"].includes(kind)) requireString("field");
    if (kind === "table" && (!Array.isArray(patch.columns) || !patch.columns.length)) report("E_REQUIRED", "table needs at least one column in this prototype.", chart);
    if (kind === "metric" && !["count", "sum", "average"].includes(String(patch.aggregation))) report("E_AGGREGATION", "metric aggregation is count, sum, or average.", chart);
    if (kind === "metric" && patch.aggregation !== "count") requireString("measureField");
    for (const key of ["xField", "yField", "field", "colorField", "measureField", "sortBy"]) {
      const v = patch[key]; if (writes.get(key)?.rank === 2 && typeof v === "string" && v && host && !own(host.fields, v)) report("E_RAW_FIELD", `${key} contains unknown canonical field ${v}. Raw config does not expand aliases.`, chart);
    }
    if (kind === "hist" && patch.field && fieldType(String(patch.field)) !== undefined && fieldType(String(patch.field)) !== "numeric") report("E_EXPECT_NUMERIC", "hist requires a numeric field. Use bar for categorical counts.", chart);
    if (kind === "metric" && patch.aggregation !== "count" && patch.measureField && fieldType(String(patch.measureField)) !== undefined && fieldType(String(patch.measureField)) !== "numeric") report("E_EXPECT_NUMERIC", "A sum/average metric requires a numeric measure.", chart);
    if (patch.pointOpacity !== undefined && !(typeof patch.pointOpacity === "number" && patch.pointOpacity >= 0 && patch.pointOpacity <= 1)) report("E_OPACITY", "pointOpacity must be between 0 and 1.", location("pointOpacity"));
    if (patch.pointSize !== undefined && !(typeof patch.pointSize === "number" && Number.isFinite(patch.pointSize) && patch.pointSize > 0)) report("E_POINT_SIZE", "pointSize must be positive and finite.", chart);
    if (typeof patch.pointSize === "number" && (patch.pointSize < 1 || patch.pointSize > 12)) report("W_UI_RANGE", "pointSize is outside the inspected editor's 1..12 control range.", chart, "warning");
    if (patch.binCount !== undefined && !(typeof patch.binCount === "number" && Number.isInteger(patch.binCount) && patch.binCount > 0)) report("E_BINS", "binCount must be a positive integer.", location("binCount"));
    if (object(patch.layout)) {
      const l = patch.layout;
      if (![l.x, l.y, l.w, l.h].every(v => typeof v === "number" && Number.isInteger(v)) || Number(l.x) < 0 || Number(l.y) < 0 || Number(l.w) <= 0 || Number(l.h) <= 0) report("E_LAYOUT", "at is X Y WIDTH HEIGHT: nonnegative integer coordinates and positive integer sizes.", chart);
    }
    for (const axis of ["x", "y"]) {
      const a = patch[`${axis}Axis`];
      if (!object(a)) { if (a !== undefined) report("E_CONFIG_TYPE", `${axis}Axis must be an object.`, chart); continue; }
      for (const k of Object.keys(a)) if (!["title", "scaleType", "grid", "min", "max"].includes(k)) report("E_UNKNOWN_CONFIG", `Unknown ${axis}Axis.${k}.`, chart);
      if (a.grid !== undefined && typeof a.grid !== "boolean") report("E_CONFIG_TYPE", `${axis}Axis.grid must be boolean.`, chart);
      if (kind === "scatter" && a.scaleType !== undefined && !["linear", "symlog"].includes(String(a.scaleType))) report("E_UNSUPPORTED_SCALE", "The inspected scatter renderer explicitly chooses linear or symlog for numeric axes. Categorical bands are inferred.", location(`${axis}Axis/scaleType`));
      if (kind === "scatter" && a.scaleType === "symlog" && fieldType(String(patch[`${axis}Field`])) !== undefined && fieldType(String(patch[`${axis}Field`])) !== "numeric") report("E_SCALE_FIELD", "symlog needs a numeric field; this scatter axis would use categorical bands.", chart);
      if (kind === "scatter" && (a.min !== undefined || a.max !== undefined)) report("W_IGNORED_SETTING", "The inspected scatter axis computes domains from all source rows; stored min/max are not an effective domain override.", chart, "warning");
    }
    if (object(patch.margin)) for (const [k, v] of Object.entries(patch.margin)) {
      if (!["top", "right", "bottom", "left"].includes(k)) report("E_UNKNOWN_CONFIG", `Unknown margin.${k}.`, chart);
      if (typeof v !== "number" || !Number.isFinite(v)) report("E_CONFIG_TYPE", `margin.${k} must be finite.`, chart);
    }
    if (Array.isArray(patch.filters)) for (const f of patch.filters) {
      if (!object(f) || typeof f.field !== "string") { report("E_FILTER", "Each filter needs a canonical field.", chart); continue; }
      if (host && !own(host.fields, f.field)) report("E_RAW_FIELD", `Unknown filter field ${f.field}.`, chart);
      if (f.type === "range" && f.min !== undefined && f.max !== undefined && Number(f.min) > Number(f.max)) report("E_RANGE", "A filter minimum must not exceed its maximum.", chart);
      if (kind === "row" && (f.field !== patch.field || f.type !== "value")) report("E_FILTER_CAPABILITY", "The inspected row chart uses a value filter on its own field.", chart);
    }
    if (object(patch.facet)) {
      const f = patch.facet;
      for (const name of ["rowVariable", ...(f.type === "grid" ? ["columnVariable"] : [])]) if (typeof f[name] === "string" && host && !own(host.fields, f[name])) report("E_RAW_FIELD", `Unknown facet field ${f[name]}.`, chart);
      if (f.type === "wrap" && !(typeof f.columnCount === "number" && Number.isInteger(f.columnCount) && f.columnCount > 0)) report("E_FACET", "Wrap facets require a positive integer columnCount.", chart);
    }
    if (Array.isArray(patch.columns)) for (const c of patch.columns) {
      if (!object(c) || typeof c.id !== "string" || typeof c.field !== "string") { report("E_COLUMN", "A column needs id and canonical field strings.", chart); continue; }
      if (host && !own(host.fields, c.field)) report("E_RAW_FIELD", `Unknown column field ${c.field}.`, chart);
    }
    if (!patch.id) {
      patch.id = `${kind}-${chartIndex + 1}`;
      report("W_AUTO_ID", `Preview ID ${patch.id} is position-dependent. Persist an explicit id before structural edits.`, chart, "warning");
    }
    if (typeof patch.id !== "string") report("E_ID", "A chart ID must be a string.", chart);
    const id = String(patch.id);
    if (identifiers.has(id)) report("E_ID_DUPLICATE", `Duplicate chart ID ${id}.`, chart, "error", { relatedInformation: [{ message: "First declaration", range: at(identifiers.get(id)!) }] });
    identifiers.set(id, chart);
    patches.push(patch);
  }
  diagnostics.sort((a, b) => a.range.start.line - b.range.start.line || a.range.start.character - b.range.start.character || a.code.localeCompare(b.code));
  const ok = !diagnostics.some(d => d.severity === "error");
  return {
    ok, dialect, targetRef: TARGET,
    validation: { syntaxAndSubsetSemantics: ok ? "pass" : "fail", bindings: deferred ? "deferred" : "checked", fullNativeSchema: "not-implemented", runtime: "not-run" },
    diagnostics,
    preview: { sourceBinding: binding, ...(source?.label ? { sourceLabel: source.label } : {}), fieldSettings, chartPatches: patches },
  };
}
