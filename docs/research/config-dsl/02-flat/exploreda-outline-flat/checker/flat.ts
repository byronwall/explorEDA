/**
 * Outline Flat: experimental authoring front end over the previous review checker.
 * Outputs chart PATCHES, never executable SavedDataStructure or runtime assurance.
 * No eval, network, dependencies, filesystem access, or repository writes.
 */
import { check as checkV1, type Catalog, type Diagnostic, type Range } from './outline-v1.js';
export type { Catalog, Diagnostic, Range };
export interface Atom { raw: string; range: Range }
export interface Statement { atoms: Atom[]; lines: number[]; commented: boolean }
export interface ParseResult { statements: Statement[]; diagnostics: Diagnostic[] }
export interface Assignment { key: string; value: unknown; atom: Atom; valueRange: Range }
const zero: Range = { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };
const isObject = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const own = (x: object, key: string) => Object.prototype.hasOwnProperty.call(x, key);
const blocked = new Set(['__proto__', 'constructor', 'prototype']);
const idPattern = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const typeNames: Record<string, string> = { num: 'numeric', numeric: 'numeric', cat: 'categorical', categorical: 'categorical', date: 'datetime', datetime: 'datetime', bool: 'boolean', boolean: 'boolean' };
const kinds: Record<string, string> = { scatter: 'scatter', hist: 'hist', histogram: 'hist', bar: 'bar', row: 'row', table: 'table', metric: 'metric' };
function range(line: number, from: number, to: number): Range { return { start: { line, character: from }, end: { line, character: to } }; }
function diagnostic(code: string, message: string, r: Range, extra: Partial<Diagnostic> = {}): Diagnostic { return { code, severity: 'error', message, range: r, ...extra }; }
function editDistance(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) next.push(Math.min(next[j - 1]! + 1, row[j]! + 1, row[j - 1]! + Number(a[i - 1] !== b[j - 1])));
    row = next;
  }
  return row[b.length]!;
}
function suggestions(name: string, choices: string[]): string[] { return [...new Set(choices)].map(x => [x, editDistance(name, x)] as const).filter(x => x[1] <= 3).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])).slice(0, 3).map(x => x[0]); }

/** Whitespace has no ownership semantics. Only + continues a declaration. */
export function parse(text: string): ParseResult {
  const diagnostics: Diagnostic[] = [];
  const statements: Statement[] = [];
  if (text.length > 200_000) return { statements, diagnostics: [diagnostic('E_LIMIT', 'Maximum document size is 200,000 UTF-16 code units.', zero)] };
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  let previous: Statement | undefined;
  for (const [lineIndex, line] of lines.entries()) {
    let cursor = 0;
    const atoms: Atom[] = [];
    let commented = false;
    let failed = false;
    while (cursor < line.length) {
      if (/\s/.test(line[cursor]!)) { cursor++; continue; }
      if (line[cursor] === '#' && (!line[cursor + 1] || /\s/.test(line[cursor + 1]!))) { commented = true; break; }
      const start = cursor;
      let quote = ''; let escaped = false;
      const stack: string[] = [];
      while (cursor < line.length) {
        const c = line[cursor]!;
        if (quote) {
          if (!escaped && c === quote) quote = '';
          escaped = !escaped && c === '\\';
          cursor++; continue;
        }
        if (c === '"' || c === "'") { quote = c; cursor++; continue; }
        if (c === '[' || c === '{') {
          stack.push(c);
          if (stack.length > 32) { diagnostics.push(diagnostic('E_LIMIT', 'JSON nesting exceeds 32 levels.', range(lineIndex, start, cursor + 1))); failed = true; break; }
          cursor++; continue;
        }
        if (c === ']' || c === '}') {
          if (stack.pop() !== (c === ']' ? '[' : '{')) { diagnostics.push(diagnostic('E_BRACKET', 'Mismatched closing bracket.', range(lineIndex, cursor, cursor + 1))); failed = true; break; }
          cursor++; continue;
        }
        if (!stack.length && /\s/.test(c)) break;
        cursor++;
      }
      if (failed) break;
      if (quote || stack.length) { diagnostics.push(diagnostic(quote ? 'E_QUOTE' : 'E_JSON', 'Close this string or JSON value on the same physical line.', range(lineIndex, start, line.length))); failed = true; break; }
      atoms.push({ raw: line.slice(start, cursor), range: range(lineIndex, start, cursor) });
    }
    if (failed) { previous = undefined; continue; } // Never attach a later + to an earlier valid declaration after a broken one.
    if (!atoms.length) { if (commented && previous) previous.commented = true; continue; }
    // Accept optional spaces around = without accepting whitespace-separated settings.
    for (let i = 0; i < atoms.length; i++) {
      if (atoms[i + 1]?.raw === '=') {
        const a = atoms[i]!; const b = atoms[i + 2];
        if (!b || equalIndex(b.raw) >= 0) { diagnostics.push(diagnostic('E_VALUE', 'Expected a value after =.', atoms[i + 1]!.range)); atoms.splice(i + 1, 1); continue; }
        a.raw += '=' + b.raw; a.range.end = b.range.end; atoms.splice(i + 1, 2);
      } else if (atoms[i]!.raw.endsWith('=') && atoms[i + 1] && equalIndex(atoms[i + 1]!.raw) < 0) {
        atoms[i]!.raw += atoms[i + 1]!.raw; atoms[i]!.range.end = atoms[i + 1]!.range.end; atoms.splice(i + 1, 1);
      } else if (atoms[i + 1]?.raw.startsWith('=') && atoms[i + 1]!.raw !== '=') {
        atoms[i]!.raw += atoms[i + 1]!.raw; atoms[i]!.range.end = atoms[i + 1]!.range.end; atoms.splice(i + 1, 1);
      }
    }
    if (atoms[0]!.raw === '+') {
      if (!previous) { diagnostics.push(diagnostic('E_CONTINUATION', '+ must follow a declaration. Use edit ID for a detached chart update.', atoms[0]!.range)); continue; }
      if (atoms.length === 1) diagnostics.push(diagnostic('E_CONTINUATION', 'Put at least one key=value pair after +.', atoms[0]!.range));
      previous.atoms.push(...atoms.slice(1)); previous.lines.push(lineIndex); previous.commented ||= commented;
      continue;
    }
    previous = { atoms, lines: [lineIndex], commented }; statements.push(previous);
  }
  if (statements.length > 2_000) diagnostics.push(diagnostic('E_LIMIT', 'At most 2,000 declarations are accepted.', statements[2_000]!.atoms[0]!.range));
  return { statements: statements.slice(0, 2_000), diagnostics };
}

/** Assignment separators are found only outside quoted/bracketed path segments. */
function equalIndex(raw: string): number {
  let quote = ''; let escaped = false; let depth = 0;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]!;
    if (quote) { if (!escaped && c === quote) quote = ''; escaped = !escaped && c === '\\'; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '[') depth++;
    if (c === ']') depth--;
    if (!depth && c === '=') return i;
  }
  return -1;
}
function strictJSON(raw: string): unknown {
  const value: unknown = JSON.parse(raw);
  // JSON.parse alone silently keeps the last duplicate key. Reject that ambiguity.
  const stack: Array<Set<string> | null> = [];
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]!;
    if (c === '{') { stack.push(new Set()); continue; }
    if (c === '[') { stack.push(null); continue; }
    if (c === '}' || c === ']') { stack.pop(); continue; }
    if (c !== '"') continue;
    const start = i++; let escaped = false;
    while (i < raw.length) {
      if (!escaped && raw[i] === '"') break;
      escaped = !escaped && raw[i] === '\\'; i++;
    }
    let next = i + 1;
    while (/\s/.test(raw[next] ?? '') && next < raw.length) next++;
    if (raw[next] !== ':') continue;
    const keys = stack[stack.length - 1];
    if (!keys) continue;
    const key = JSON.parse(raw.slice(start, i + 1)) as string;
    if (keys.has(key)) throw new Error(`Duplicate JSON key ${key}.`);
    keys.add(key);
  }
  return value;
}
function decode(raw: string): unknown {
  if (raw.startsWith('"') || raw.startsWith('[') || raw.startsWith('{')) return strictJSON(raw);
  if (raw.startsWith("'")) return raw.slice(1, -1).replace(/\\(['\\])/g, '$1');
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === 'null') return null;
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)) return Number(raw);
  if (/^[+-]?(?:Infinity|NaN)$/.test(raw)) throw new Error('Nonfinite settings are not supported.');
  return raw;
}
function safeValue(value: unknown, depth = 0): boolean {
  if (depth > 32 || (typeof value === 'number' && !Number.isFinite(value))) return false;
  if (Array.isArray(value)) return value.every(v => safeValue(v, depth + 1));
  if (!isObject(value)) return true;
  return Object.entries(value).every(([k, v]) => !blocked.has(k) && safeValue(v, depth + 1));
}
function assignments(atoms: Atom[], diagnostics: Diagnostic[]): Assignment[] {
  const out: Assignment[] = [];
  for (const atom of atoms) {
    const e = equalIndex(atom.raw);
    if (e < 1) { diagnostics.push(diagnostic('E_PAIR', 'Expected key=value. Quote multiword values; use + to wrap a declaration.', atom.range)); continue; }
    const key = atom.raw.slice(0, e);
    const valueText = atom.raw.slice(e + 1);
    // Optional separator spaces mean raw is normalized; anchor the value at its physical end.
    const valueRange = { start: { ...atom.range.end, character: atom.range.end.character - valueText.length }, end: atom.range.end };
    if (!valueText) { diagnostics.push(diagnostic('E_VALUE', `${key} needs a value. Use "" for empty text.`, atom.range)); continue; }
    try {
      const value = decode(valueText);
      if (!safeValue(value)) { diagnostics.push(diagnostic('E_UNSAFE_VALUE', 'Values must be finite and must not contain unsafe prototype keys.', valueRange)); continue; }
      out.push({ key, value, atom, valueRange });
    } catch (e) { diagnostics.push(diagnostic('E_VALUE', e instanceof Error ? e.message : 'Invalid value.', valueRange)); }
  }
  return out;
}
function stringValue(a: Assignment, diagnostics: Diagnostic[]): string | undefined {
  if (typeof a.value === 'string') return a.value;
  diagnostics.push(diagnostic('E_TEXT', `${a.key} needs text. Quote values such as "true" or "12" when they are text.`, a.valueRange)); return undefined;
}
function pathOf(key: string): string[] | undefined {
  const parts: string[] = [];
  let at = 0;
  while (at < key.length) {
    const name = /^[A-Za-z_][A-Za-z0-9_-]*/.exec(key.slice(at));
    if (name) { parts.push(name[0]); at += name[0].length; }
    else if (key[at] === '[') {
      const part = /^\[("(?:\\.|[^"\\])*")\]/.exec(key.slice(at));
      if (!part) return undefined;
      parts.push(JSON.parse(part[1]!)); at += part[0].length;
    } else return undefined;
    if (at === key.length) break;
    if (key[at] === '.') { at++; if (at === key.length) return undefined; }
    else if (key[at] !== '[') return undefined;
  }
  return parts.length && !parts.some(k => blocked.has(k)) ? parts : undefined;
}
interface Source { alias: string; binding: string; statement: Statement; properties: Assignment[]; fields: Field[] }
interface Field { alias: string; raw: string; expected?: string; atom: Atom; properties: Assignment[] }
interface Operation { path: string[]; value: unknown; assignment: Assignment }
interface Chart { kind: string; statement: Statement; properties: Assignment[]; operations: Operation[] }
const encodedPath = (path: string[]) => '/' + path.map(s => s.replace(/~/g, '~0').replace(/\//g, '~1')).join('/');
const collide = (a: string[], b: string[]) => a.slice(0, Math.min(a.length, b.length)).every((s, i) => s === b[i]);

export function check(text: string, catalog?: Catalog) {
  const parsed = parse(text); const diagnostics = [...parsed.diagnostics];
  const sources: Source[] = []; const charts: Chart[] = []; const edits: { target: string; properties: Assignment[]; atom: Atom }[] = [];
  let active: Source | undefined; let selected: string | undefined; let useOrigin: Atom | undefined; let header = false; let chartSeen = false;
  const pairList = (s: Statement, start: number) => assignments(s.atoms.slice(start), diagnostics);
  for (const s of parsed.statements) {
    const first = s.atoms[0]!; const command = first.raw.toLowerCase();
    if (command === 'eda') {
      if (header || s.atoms.map(x => x.raw).join(' ') !== 'eda 2 flat') diagnostics.push(diagnostic('E_VERSION', 'Use one optional eda 2 flat header.', first.range));
      header = true; active = undefined; continue;
    }
    if (command === 'source') {
      if (chartSeen) diagnostics.push(diagnostic('E_SOURCE_ORDER', 'Declare sources before charts. This prototype has one workspace.', first.range));
      const name = s.atoms[1];
      if (!name) { diagnostics.push(diagnostic('E_SOURCE', 'source needs an alias, optionally alias=hostBinding.', first.range)); active = undefined; continue; }
      const e = equalIndex(name.raw); const alias = e < 0 ? name.raw : name.raw.slice(0, e);
      let binding = alias;
      if (e >= 0) {
        const a = assignments([name], diagnostics)[0];
        if (a) binding = stringValue(a, diagnostics) ?? alias;
      }
      if (!idPattern.test(alias)) diagnostics.push(diagnostic('E_ALIAS', 'Source aliases are simple identifiers.', name.range));
      if (sources.some(x => x.alias === alias)) diagnostics.push(diagnostic('E_SOURCE_DUPLICATE', `Source ${alias} is already declared.`, name.range));
      active = { alias, binding, statement: s, properties: pairList(s, 2), fields: [] }; sources.push(active); continue;
    }
    if (command === 'use') {
      if (chartSeen) diagnostics.push(diagnostic('E_SOURCE_ORDER', 'Select one source before charts; changing use does not start a new workspace.', first.range));
      if (selected !== undefined) diagnostics.push(diagnostic('E_DUPLICATE', 'Select a source only once in this workspace.', first.range));
      if (s.atoms.length !== 2) diagnostics.push(diagnostic('E_SOURCE', 'use takes one source alias.', first.range));
      selected = s.atoms[1]?.raw; useOrigin = first; active = undefined; continue;
    }
    if (own(kinds, command)) {
      chartSeen = true; active = undefined;
      const rest = s.atoms.slice(1); let properties: Assignment[] = [];
      if (rest[0]?.raw.startsWith('@')) {
        const id = rest.shift()!; const value = id.raw.slice(1);
        if (!idPattern.test(value)) diagnostics.push(diagnostic('E_ID', 'Use @simple-id, or id="an unusual id".', id.range));
        properties.push({ key: 'id', value, atom: id, valueRange: id.range });
      }
      // Single-input charts may omit the redundant field=/fields= name.
      // Scatter never accepts positional X/Y, where a swap could be valid but wrong.
      if (rest[0] && equalIndex(rest[0].raw) < 0 && ['hist', 'histogram', 'bar', 'row', 'table'].includes(command)) {
        const primary = rest.shift()!;
        const key = command === 'table' ? 'fields' : 'field';
        const generated = { ...primary, raw: key + '=' + primary.raw };
        const a = assignments([generated], diagnostics)[0];
        if (a) { a.valueRange = primary.range; a.atom = generated; properties.push(a); }
      }
      properties = [...properties, ...assignments(rest, diagnostics)];
      charts.push({ kind: kinds[command]!, statement: s, properties, operations: [] }); continue;
    }
    if (command === 'edit') {
      active = undefined;
      const target = s.atoms[1];
      if (!target) { diagnostics.push(diagnostic('E_EDIT', 'edit needs an explicit chart ID and key=value pairs.', first.range)); continue; }
      let name = target.raw.replace(/^@/, '');
      try { name = String(decode(name)); } catch { diagnostics.push(diagnostic('E_EDIT', 'Invalid chart ID.', target.range)); }
      const properties = pairList(s, 2);
      if (!properties.length) diagnostics.push(diagnostic('E_EDIT', 'Provide at least one setting to edit.', first.range));
      edits.push({ target: name, properties, atom: target }); continue;
    }
    if (active) {
      const m = /^([A-Za-z_][A-Za-z0-9_-]*)(?::([A-Za-z]+))?(?:=(.+))?$/.exec(first.raw);
      if (!m) { diagnostics.push(diagnostic('E_FIELD', 'A source field is alias[:type][=RawField] followed by key=value metadata.', first.range)); continue; }
      const alias = m[1]!; const typ = m[2]; let raw = alias;
      if (typ && !own(typeNames, typ)) diagnostics.push(diagnostic('E_FIELD_TYPE', `Unknown type ${typ}; use num, cat, date, or bool.`, first.range));
      if (m[3] !== undefined) {
        try { const v = decode(m[3]); if (typeof v !== 'string') throw new Error(); raw = v; }
        catch { diagnostics.push(diagnostic('E_FIELD', 'The raw field name must be text; quote names containing spaces.', first.range)); }
      }
      if (active.fields.some(x => x.alias === alias)) diagnostics.push(diagnostic('E_FIELD_DUPLICATE', `Field alias ${alias} is already declared.`, first.range));
      active.fields.push({ alias, raw, expected: typ && typeNames[typ], atom: first, properties: pairList(s, 1) }); continue;
    }
    diagnostics.push(diagnostic(equalIndex(first.raw) > 0 ? 'E_CONTINUATION' : 'E_DECLARATION', equalIndex(first.raw) > 0 ? 'A detached key=value line has no owner. Add + for a continuation or edit ID for an explicit update.' : `Unknown declaration ${first.raw}. This prototype supports scatter, hist, bar, row, table and metric.`, first.range));
  }
  if (sources.length > 1 && selected === undefined) diagnostics.push(diagnostic('E_SOURCE', 'Multiple sources require an explicit use SOURCE; a binding named data is not a default.', sources[0]!.statement.atoms[0]!.range));
  selected ??= sources.length === 1 ? sources[0]!.alias : 'data';
  const source = sources.find(x => x.alias === selected);
  if (sources.length && !source) diagnostics.push(diagnostic('E_SOURCE', 'With multiple sources, use SOURCE must select exactly one.', useOrigin?.range ?? zero));
  const hostBinding = source?.binding ?? selected;
  const host = catalog && own(catalog, hostBinding) ? catalog[hostBinding] : undefined;
  const aliases = new Map(source?.fields.map(f => [f.alias, f.raw]) ?? []);
  const fieldNames = [...aliases.keys(), ...Object.keys(host?.fields ?? {})];
  const unresolvedFields = new Set<string>();
  const bind = (value: string, a: Assignment) => {
    const raw = aliases.get(value) ?? value;
    if (host && !own(host.fields, raw)) {
      unresolvedFields.add(raw);
      diagnostics.push(diagnostic('E_UNKNOWN_FIELD', `Field ${value} does not resolve in ${hostBinding}.`, a.valueRange, { suggestions: suggestions(value, fieldNames) }));
    }
    return raw;
  };
  const list = (a: Assignment): unknown[] => Array.isArray(a.value) ? a.value : typeof a.value === 'string' && a.atom.raw.slice(equalIndex(a.atom.raw) + 1)[0] !== '"' && a.atom.raw.slice(equalIndex(a.atom.raw) + 1)[0] !== "'" ? a.value.split(',').map(s => s.trim()) : [a.value];
  const lower = (a: Assignment): Operation[] => {
    const out: Operation[] = [];
    const add = (path: string[], value: unknown) => {
      if (isObject(value) && Object.keys(value).length) { for (const [k, v] of Object.entries(value)) add([...path, k], v); return; }
      out.push({ path, value, assignment: a });
    };
    const aliases: Record<string, string[]> = { x: ['xField'], y: ['yField'], size: ['pointSize'], points: ['pointSize'], opacity: ['pointOpacity'], bins: ['binCount'], color: ['colorField'], colour: ['colorField'], measure: ['measureField'], 'x.scale': ['xAxis', 'scaleType'], 'y.scale': ['yAxis', 'scaleType'], 'x.grid': ['xAxis', 'grid'], 'y.grid': ['yAxis', 'grid'] };
    if (['x', 'y', 'field', 'color', 'colour', 'measure'].includes(a.key)) {
      const v = stringValue(a, diagnostics); if (v !== undefined) add(aliases[a.key] ?? [a.key], bind(v, a)); return out;
    }
    if (a.key === 'fields') {
      const values = list(a);
      if (!values.length || values.some(v => typeof v !== 'string' || !v)) { diagnostics.push(diagnostic('E_FIELDS', 'fields needs a comma-list or JSON array of field names.', a.valueRange)); return out; }
      add(['columns'], values.map(v => { const field = bind(String(v), a); return { id: field, field }; })); return out;
    }
    if (a.key === 'at') {
      const values = list(a).map(v => typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
      if (values.length !== 4 || values.some(v => !Number.isFinite(v))) { diagnostics.push(diagnostic('E_LAYOUT', 'at needs four integers: X,Y,WIDTH,HEIGHT.', a.valueRange)); return out; }
      ['x', 'y', 'w', 'h'].forEach((k, i) => add(['layout', k], values[i])); return out;
    }
    if (a.key === 'config') {
      if (!isObject(a.value)) { diagnostics.push(diagnostic('E_CONFIG', 'config expects a literal JSON object of exact native settings.', a.valueRange)); return out; }
      for (const [key, value] of Object.entries(a.value)) add([key], value); return out;
    }
    const path = own(aliases, a.key) ? aliases[a.key]! : pathOf(a.key);
    if (!path) { diagnostics.push(diagnostic('E_PATH', 'Use a dotted native path or quoted bracket key. Replace arrays as a whole; index updates are not supported.', a.atom.range)); return out; }
    add(path, a.value); return out;
  };
  const merge = (chart: Chart, ops: Operation[], edit = false, assignedInEdits = new Map<string, Operation>()) => {
    for (const op of ops) {
      const previous = chart.operations.filter(x => collide(x.path, op.path));
      const earlierEdit = [...assignedInEdits.values()].find(x => collide(x.path, op.path));
      const conflict = edit ? earlierEdit : previous[0];
      if (conflict) {
        const same = encodedPath(conflict.path) === encodedPath(op.path) && JSON.stringify(conflict.value) === JSON.stringify(op.value);
        diagnostics.push(diagnostic(same ? 'W_DUPLICATE' : 'E_CONFLICT', `${encodedPath(op.path)} has more than one explicit value. Use a single value or an explicit edit.`, op.assignment.atom.range, { severity: same ? 'warning' : 'error', relatedInformation: [{ message: 'Other assignment', range: conflict.assignment.atom.range }] })); continue;
      }
      if (edit) {
        chart.operations = chart.operations.filter(x => !collide(x.path, op.path));
        assignedInEdits.set(encodedPath(op.path), op);
        if (previous.length) diagnostics.push(diagnostic('I_EDIT', `Explicit edit replaces ${encodedPath(op.path)}.`, op.assignment.atom.range, { severity: 'warning', relatedInformation: previous.map(x => ({ message: 'Replaced assignment', range: x.assignment.atom.range })) }));
      }
      chart.operations.push(op);
    }
  };
  for (const chart of charts) merge(chart, chart.properties.flatMap(lower));
  const editWrites = new Map<Chart, Map<string, Operation>>();
  for (const edit of edits) {
    const matching = charts.filter(c => c.operations.some(op => op.path.length === 1 && op.path[0] === 'id' && op.value === edit.target));
    if (matching.length !== 1) { diagnostics.push(diagnostic('E_EDIT_TARGET', 'An edit must resolve to exactly one explicitly named chart, including forward references.', edit.atom.range)); continue; }
    const chart = matching[0]!;
    const ops = edit.properties.flatMap(lower);
    if (ops.some(x => ['id', 'type'].includes(x.path[0]!))) { diagnostics.push(diagnostic('E_EDIT_IDENTITY', 'Edit settings, not a chart ID or type. Change the declaration explicitly.', edit.atom.range)); continue; }
    if (!editWrites.has(chart)) editWrites.set(chart, new Map());
    merge(chart, ops, true, editWrites.get(chart)!);
  }

  // Reuse the original semantic checker with source-map remapping of its diagnostics.
  const lines: string[] = []; const origins: Range[] = []; const keyOrigins: Range[] = [];
  const emit = (text: string, r: Range, keyRange = r) => { lines.push(text); origins.push(r); keyOrigins.push(keyRange); };
  const json = (v: unknown) => JSON.stringify(v);
  emit('eda 1 outline', zero);
  if (sources.length) emit('sources', sources[0]!.statement.atoms[0]!.range);
  for (const src of sources) {
    emit(`  ${json(src.alias)} ${json(src.binding)}`, src.statement.atoms[1]!.range);
    const seen = new Set<string>();
    for (const a of src.properties) {
      if (a.key !== 'label') { diagnostics.push(diagnostic('E_SOURCE_SETTING', 'Only label is a source metadata setting in this prototype.', a.atom.range)); continue; }
      if (seen.has(a.key)) diagnostics.push(diagnostic('E_CONFLICT', 'Duplicate source metadata.', a.atom.range)); seen.add(a.key);
      stringValue(a, diagnostics); emit(`    label ${json(a.value)}`, a.valueRange);
    }
    if (src.fields.length) emit('    fields', src.statement.atoms[0]!.range);
    for (const f of src.fields) {
      emit(`      ${f.alias} ${json(f.raw)}`, f.atom.range);
      if (f.expected) emit(`        expect ${f.expected}`, f.atom.range);
      const seen = new Set<string>();
      for (const a of f.properties) {
        if (seen.has(a.key)) diagnostics.push(diagnostic('E_CONFLICT', `Duplicate field metadata ${a.key}.`, a.atom.range)); seen.add(a.key);
        if (a.key === 'expect') { diagnostics.push(diagnostic('E_FIELD_TYPE', 'Put the expected type after the alias, such as revenue:num.', a.atom.range)); continue; }
        if (['label', 'description', 'unit', 'currency'].includes(a.key)) stringValue(a, diagnostics);
        if (a.key === 'coerce' && typeof a.value === 'string') emit(`        coerce ${json(typeNames[a.value] ?? a.value)}`, a.valueRange);
        else emit(`        ${a.key} ${json(a.value)}`, a.valueRange);
      }
    }
  }
  if (sources.length || useOrigin) emit(`use ${json(selected)}`, useOrigin?.range ?? source?.statement.atoms[0]!.range ?? zero);
  if (charts.length > 500) diagnostics.push(diagnostic('E_LIMIT', 'At most 500 charts are accepted.', charts[500]!.statement.atoms[0]!.range));
  for (const chart of charts.slice(0, 500)) {
    emit(chart.kind, chart.statement.atoms[0]!.range);
    for (const op of chart.operations) emit(`  config ${encodedPath(op.path)} ${json(op.value)}`, op.assignment.valueRange, op.assignment.atom.range);
  }
  const backend = checkV1(lines.join('\n'), catalog);
  for (const d of backend.diagnostics) {
    if (d.code === 'W_AUTO_ID') continue; // Ephemeral identities are returned as status, not a warning on every sketch.
    // Suppress only the same unresolved field's lowering echo, not independent native-field errors.
    if (d.code === 'E_RAW_FIELD' && [...unresolvedFields].some(raw => d.message.endsWith(`canonical field ${raw}. Raw config does not expand aliases.`) || d.message === `Unknown column field ${raw}.`)) continue;
    diagnostics.push({ ...d, ...(d.code === 'E_UNKNOWN_CONFIG' ? { suggestions: suggestions((lines[d.range.start.line]?.match(/config \/([^ /]+)/)?.[1] ?? ''), ['pointSize', 'pointOpacity', 'binCount', 'margin', 'xAxis', 'yAxis', 'xGridLines', 'yGridLines', 'columns', 'sortDirection', 'sortBy']) } : {}), range: (d.code === 'E_UNKNOWN_CONFIG' ? keyOrigins : origins)[d.range.start.line] ?? zero, relatedInformation: d.relatedInformation?.map(x => ({ ...x, range: origins[x.range.start.line] ?? zero })) });
  }
  // Supplement known holes in the inherited subset validator; this is not a full schema.
  for (const chart of charts) {
    for (const op of chart.operations) {
      const p = op.path.join('.');
      const stringPaths = ['id', 'title', 'type', 'field', 'xField', 'yField', 'colorField', 'colorScaleId', 'measureField', 'aggregation', 'sortBy', 'sortDirection', 'globalSearch', 'xAxisLabel', 'yAxisLabel', 'xAxis.scaleType', 'yAxis.scaleType', 'xAxis.title', 'yAxis.title', 'facet.type', 'facet.rowVariable', 'facet.columnVariable'];
      const numberPaths = ['pointSize', 'pointOpacity', 'binCount', 'xGridLines', 'yGridLines', 'minRowHeight', 'maxRowHeight', 'facet.columnCount'];
      const booleanPaths = ['xAxis.grid', 'yAxis.grid', 'facet.enabled', 'forceString', 'showDistributions'];
      if ((stringPaths.includes(p) && typeof op.value !== 'string') || (numberPaths.includes(p) && typeof op.value !== 'number') || (booleanPaths.includes(p) && typeof op.value !== 'boolean')) diagnostics.push(diagnostic('E_CONFIG_TYPE', `${p} has the wrong scalar type.`, op.assignment.valueRange));
      if (['columns', 'filters', 'facet.visibleFacetIds'].includes(p) && !Array.isArray(op.value)) diagnostics.push(diagnostic('E_CONFIG_TYPE', `${p} must be an array.`, op.assignment.valueRange));
      if (p === 'sortDirection' && !['asc', 'desc'].includes(String(op.value))) diagnostics.push(diagnostic('E_SORT', 'sortDirection is asc or desc.', op.assignment.valueRange));
      if (p === 'facet.enabled' && op.value === true) {
        const type = chart.operations.find(x => x.path.join('.') === 'facet.type')?.value;
        if (!['wrap', 'grid'].includes(String(type))) diagnostics.push(diagnostic('E_FACET', 'An enabled facet needs facet.type=wrap or facet.type=grid.', op.assignment.valueRange));
      }
    }
  }
  diagnostics.sort((a, b) => a.range.start.line - b.range.start.line || a.range.start.character - b.range.start.character || a.code.localeCompare(b.code));
  const ok = !diagnostics.some(x => x.severity === 'error');
  return {
    ok, dialect: 'flat' as const, version: 2, targetRef: backend.targetRef,
    validation: { ...backend.validation, syntaxAndSubsetSemantics: ok ? 'pass' : 'fail', nativeOutput: 'patches-only', identity: charts.every(c => c.operations.some(x => x.path.join('.') === 'id')) ? 'explicit' : 'ephemeral' },
    diagnostics, preview: backend.preview,
    origins: charts.map((chart, i) => ({ id: backend.preview.chartPatches[i]?.id, properties: Object.fromEntries(chart.operations.map(x => [encodedPath(x.path), x.assignment.atom.range])) })),
  };
}

/** Lossless in meaning, not whitespace. Lines containing comments are left untouched. */
export function format(text: string, width = 64): { ok: boolean; text: string; diagnostics: Diagnostic[] } {
  const result = parse(text);
  if (result.diagnostics.length) return { ok: false, text, diagnostics: result.diagnostics };
  if (!Number.isInteger(width) || width < 32 || width > 160) return { ok: false, text, diagnostics: [diagnostic('E_WIDTH', 'Format width must be an integer from 32 through 160.', zero)] };
  const input = text.replace(/\r\n?/g, '\n').split('\n');
  const output: string[] = []; let cursor = 0;
  for (const statement of result.statements) {
    const first = statement.lines[0]!; const last = statement.lines[statement.lines.length - 1]!;
    output.push(...input.slice(cursor, first));
    const between = input.slice(first, last + 1);
    if (statement.commented || between.some(x => /^\s*#/.test(x))) output.push(...between);
    else {
      const command = statement.atoms[0]!.raw;
      const prefixCount = ['eda'].includes(command) ? 3 : ['source', 'use', 'edit'].includes(command) || statement.atoms[1]?.raw.startsWith('@') ? 2 : 1;
      let line = statement.atoms.slice(0, prefixCount).map(x => x.raw).join(' ');
      for (const atom of statement.atoms.slice(prefixCount)) {
        if (line.length + 1 + atom.raw.length > width) { output.push(line); line = '+ ' + atom.raw; }
        else line += ' ' + atom.raw;
      }
      output.push(line);
    }
    cursor = last + 1;
  }
  output.push(...input.slice(cursor));
  return { ok: true, text: output.join('\n').replace(/\n*$/, '\n'), diagnostics: [] };
}
