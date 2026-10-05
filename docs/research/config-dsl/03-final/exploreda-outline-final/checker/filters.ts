/** Chart-owned filter shorthand. No data query, hidden calculations, regex or global prefilter. */
import type { ValueType } from './expressions.js';
export type NativeFilter =
  | { type: 'value'; field: string; values: (string | number | boolean | null)[] }
  | { type: 'range'; field: string; min?: number; max?: number }
  | { type: 'date-range'; field: string; min?: string; max?: string }
  | { type: 'text'; field: string; operator: 'contains' | 'equals' | 'startsWith' | 'endsWith'; value: string };
export class FilterError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
export const textOperators: Record<string, 'contains' | 'equals' | 'startsWith' | 'endsWith'> = {
  contains: 'contains', equals: 'equals', starts: 'startsWith', ends: 'endsWith',
};
const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
const scalar = (v: unknown): v is string | number | boolean | null => v === null || typeof v === 'string' || typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v));
/** Decode a shorthand list without treating commas inside quotes as separators. */
export function filterList(raw: string): unknown[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try { const v: unknown = JSON.parse(trimmed); if (Array.isArray(v)) return v; } catch { /* diagnostic below */ }
    throw new FilterError('E_FILTER_VALUE', 'Use a literal JSON array of scalar values.');
  }
  const parts: string[] = []; let start = 0; let quote = ''; let escaped = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]!;
    if (quote) { if (!escaped && c === quote) quote = ''; escaped = !escaped && c === '\\'; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === ',') { parts.push(raw.slice(start, i).trim()); start = i + 1; }
  }
  if (quote) throw new FilterError('E_FILTER_VALUE', 'Close every quoted filter value.');
  parts.push(raw.slice(start).trim());
  return parts.map(p => {
    if (!p) throw new FilterError('E_FILTER_VALUE', 'A list cannot have empty entries. Quote "" for an actual empty string.');
    if (p.startsWith('"')) { try { return JSON.parse(p); } catch { throw new FilterError('E_FILTER_VALUE', 'Invalid quoted filter value.'); } }
    if (p.startsWith("'")) return p.slice(1, -1).replace(/\\(['\\])/g, '$1');
    if (p === 'null') return null;
    if (p === 'true' || p === 'false') return p === 'true';
    if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(p)) return Number(p);
    return p;
  });
}
function validDate(s: string): boolean {
  // Pinned runtime accepts date-only or ISO timestamps; require timezone for timestamp reproducibility.
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(s)) return false;
  const datePart = s.slice(0, 10); const d = new Date(datePart + 'T00:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === datePart && Number.isFinite(Date.parse(s));
}
export interface FilterInput { field: string; raw: string; type: ValueType; operator?: string }
export function lowerFilter({ field, raw, type, operator }: FilterInput): NativeFilter {
  if (operator !== undefined) {
    if (!own(textOperators, operator)) throw new FilterError('E_FILTER_OPERATOR', 'Text suffixes are contains, equals, starts, and ends.');
    if (type !== 'categorical' && type !== 'unknown') throw new FilterError('E_FILTER_TYPE', 'Text matching needs a text/categorical field.');
    const values = filterList(raw);
    if (values.length !== 1 || typeof values[0] !== 'string') throw new FilterError('E_FILTER_TYPE', 'A text match takes one string, not a list.');
    return { type: 'text', field, operator: textOperators[operator]!, value: values[0] };
  }
  if (/^[<>!]/.test(raw)) throw new FilterError('E_FILTER_BOUND', 'Use inclusive MIN..MAX, MIN.., or ..MAX. Strict comparisons belong in an explicit boolean calc; never approximate with epsilon.');
  // Quoted values never become ranges. JSON lists never become a predicate language.
  if (!/^["'\[]/.test(raw) && raw.includes('..')) {
    const parts = raw.split('..');
    if (parts.length !== 2 || (!parts[0] && !parts[1])) throw new FilterError('E_FILTER_RANGE', 'Use MIN..MAX with at least one bound. Use * to remove a field filter in an edit.');
    const [lo, hi] = parts as [string, string];
    if (type === 'datetime') {
      if ((lo && !validDate(lo)) || (hi && !validDate(hi))) throw new FilterError('E_FILTER_DATE', 'Use real ISO dates, or ISO timestamps with an explicit timezone.');
      // Date-only upper bounds cover the whole UTC day in the native engine.
      const upper = hi.length === 10 ? hi + 'T23:59:59.999Z' : hi;
      if (lo && hi && Date.parse(lo) > Date.parse(upper)) throw new FilterError('E_FILTER_RANGE', 'The lower date bound exceeds the upper bound.');
      return { type: 'date-range', field, ...(lo ? { min: lo } : {}), ...(hi ? { max: hi } : {}) };
    }
    if (type !== 'numeric' && type !== 'unknown') throw new FilterError('E_FILTER_TYPE', 'Ranges need a numeric or datetime field. Quote text containing two dots.');
    const number = (s: string) => /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s) && Number.isFinite(Number(s));
    if ((lo && !number(lo)) || (hi && !number(hi))) throw new FilterError('E_FILTER_RANGE', 'Numeric bounds must be finite. Date ranges need a date-typed field contract.');
    if (lo && hi && Number(lo) > Number(hi)) throw new FilterError('E_FILTER_RANGE', 'The lower bound exceeds the upper bound.');
    return { type: 'range', field, ...(lo ? { min: Number(lo) } : {}), ...(hi ? { max: Number(hi) } : {}) };
  }
  const values = filterList(raw);
  if (!values.every(scalar)) throw new FilterError('E_FILTER_VALUE', 'Value filters contain only finite numbers, strings, booleans, or null.');
  if (values.some(v => typeof v === 'string' && ['NaN','Infinity','-Infinity'].includes(v)) && !/^["'\[]/.test(raw)) throw new FilterError('E_FILTER_VALUE', 'Quote nonfinite-looking values when they are literal text.');
  if (type === 'numeric' && values.some(v => v !== null && typeof v !== 'number')) throw new FilterError('E_FILTER_TYPE', 'Numeric filter values must be numbers or null.');
  if (type === 'boolean' && values.some(v => v !== null && typeof v !== 'boolean')) throw new FilterError('E_FILTER_TYPE', 'Boolean filter values must be true, false, or null.');
  if (type === 'numeric' && values.length === 1 && typeof values[0] === 'number') return { type: 'range', field, min: values[0], max: values[0] };
  return { type: 'value', field, values };
}
export function checkNativeFilter(value: unknown): string | undefined {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return 'Each filter must be an object.';
  const f = value as Record<string, unknown>;
  if (typeof f.field !== 'string' || !f.field) return 'A filter needs a native field name.';
  const keys: Record<string, string[]> = { value: ['type','field','values'], range: ['type','field','min','max'], 'date-range': ['type','field','min','max'], text: ['type','field','operator','value'] };
  if (typeof f.type !== 'string' || !own(keys, f.type)) return 'Filter type is value, range, date-range, or text.';
  if (Object.keys(f).some(k => !keys[f.type as string]!.includes(k))) return 'Unknown native filter property.';
  if (f.type === 'value' && (!Array.isArray(f.values) || !f.values.every(scalar))) return 'values must be an array of scalar values.';
  if (f.type === 'range' && [f.min, f.max].some(v => v !== undefined && (typeof v !== 'number' || !Number.isFinite(v)))) return 'Range bounds must be finite numbers.';
  if (f.type === 'range' && typeof f.min === 'number' && typeof f.max === 'number' && f.min > f.max) return 'Reversed numeric range.';
  if (f.type === 'date-range') {
    if ([f.min, f.max].some(v => v !== undefined && (typeof v !== 'string' || !validDate(v)))) return 'Date bounds must be real ISO dates or timezone-qualified timestamps.';
    const min = f.min as string | undefined; const max = f.max as string | undefined;
    if (min && max && Date.parse(min) > Date.parse(max.length === 10 ? max+'T23:59:59.999Z' : max)) return 'Reversed date range.';
  }
  if (f.type === 'text' && (typeof f.value !== 'string' || !['contains','equals','startsWith','endsWith'].includes(String(f.operator)))) return 'Text filters need a valid operator and string value.';
  return undefined;
}
