import { ExpressionError, parseExpression, printExpression, inferExpression, walkExpression, type Expr, type ValueType } from './expressions.js';
import type { Diagnostic, Range, FieldType } from './outline-v1.js';
export interface CalculationInput { name: string; expected?: string; formula: string; formulaRange: Range; range: Range; metadata: { key: string; value: unknown; range: Range }[] }
export interface CalculationOutput { resultColumnName: string; expression: string }
const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o,k);
export function compileCalculations(inputs: CalculationInput[], aliases: Map<string,string>, sourceTypes: Record<string,ValueType>, catalogAvailable: boolean) {
  const diagnostics: Diagnostic[] = []; const native: CalculationOutput[] = []; const types: Record<string,FieldType> = Object.create(null);
  const fieldSettings: Record<string,Record<string,unknown>> = Object.create(null);
  const nodes = new Map<string,{ input: CalculationInput; expr: Expr; deps: string[] }>();
  const origins: { name: string; range: Range; dependencies: string[]; inferredType: ValueType; scope: 'row' }[] = [];
  const report = (code: string, message: string, range: Range, severity: 'error'|'warning' = 'error', extra: Partial<Diagnostic> = {}) => diagnostics.push({ code, message, range, severity, ...extra });
  const tokenRange = (input: CalculationInput, start: number, end: number): Range => ({ start: { ...input.formulaRange.start, character: input.formulaRange.start.character+start }, end: { ...input.formulaRange.start, character: input.formulaRange.start.character+end } });
  const declared = new Set<string>();
  for (const input of inputs) {
    if (declared.has(input.name)) { report('E_CALC_DUPLICATE', `Calculation ${input.name} is already defined.`, input.range); continue; }
    declared.add(input.name);
    if (aliases.has(input.name) || own(sourceTypes,input.name) || ['__proto__','prototype','constructor','__ID'].includes(input.name)) { report('E_CALC_SHADOW', `Calculation ${input.name} collides with a source field, alias, or reserved name.`, input.range); continue; }
    try {
      const expr = parseExpression(input.formula); const deps: string[] = [];
      walkExpression(expr, e => { if (e.kind === 'field') deps.push(e.exact ? e.name : aliases.get(e.name) ?? e.name); });
      nodes.set(input.name, { input, expr, deps: [...new Set(deps)] });
    } catch(error) {
      if (error instanceof ExpressionError) report(error.code,error.message,tokenRange(input,error.token.start,error.token.end));
      else report('E_EXPR', error instanceof Error ? error.message : 'Invalid formula.', input.formulaRange);
    }
  }
  const ordered: string[] = []; const visiting = new Set<string>(); const visited = new Set<string>();
  const visit = (name: string, chain: string[]) => {
    if (visiting.has(name)) { report('E_CALC_CYCLE', `Calculation cycle: ${[...chain,name].join(' -> ')}.`, nodes.get(name)!.input.range); return; }
    if (visited.has(name)) return;
    visiting.add(name);
    for (const dependency of nodes.get(name)!.deps) if (nodes.has(dependency)) visit(dependency,[...chain,name]);
    visiting.delete(name); visited.add(name); ordered.push(name);
  };
  for (const name of nodes.keys()) visit(name,[]);
  for (const name of ordered) {
    const { input, expr, deps } = nodes.get(name)!;
    const fieldType = (ref: string, exact: boolean): ValueType => {
      const raw = exact ? ref : aliases.get(ref) ?? ref;
      return types[raw] ?? sourceTypes[raw] ?? 'unknown';
    };
    const expression = printExpression(expr,(ref,exact,token) => {
      const raw = exact ? ref : aliases.get(ref) ?? ref;
      if (!own(sourceTypes,raw) && !nodes.has(raw) && (catalogAvailable || declared.has(raw))) {
        const candidates = [...aliases.keys(),...Object.keys(sourceTypes),...nodes.keys()];
        // Suggestions are advisory; never silently substitute a source name.
        const suggestions = candidates.filter(x => x.toLowerCase().startsWith(ref.slice(0,Math.max(1,ref.length-2)).toLowerCase())).slice(0,4);
        report('E_CALC_FIELD', `Unknown formula field ${ref}.`, tokenRange(input,token.start,token.end),'error',{ suggestions });
      }
      return raw;
    });
    const inferred = inferExpression(expr,fieldType);
    if (input.expected && inferred !== 'unknown' && inferred !== 'null' && input.expected !== inferred) report('E_CALC_TYPE', `Calculation ${name} is ${inferred}, not declared ${input.expected}. An annotation does not convert a result.`, input.range);
    if (inferred === 'unknown') report('W_CALC_TYPE_DEFERRED', `Calculation ${name} has an unresolved or mixed result type; native sample validation is still required.`,input.range,'warning');
    const effective = inferred === 'null' || inferred === 'unknown' ? input.expected : inferred;
    if (effective && ['numeric','categorical','boolean','datetime'].includes(effective)) types[name] = effective as FieldType;
    // Reject statically incompatible numeric inputs instead of pretending metadata coerces values.
    walkExpression(expr,e => {
      const operands = e.kind === 'binary' && ['+','-','*','/','^','<','<=','>','>='].includes(e.op) ? [e.left,e.right] : e.kind === 'unary' && e.op !== '!' ? [e.operand] : e.kind === 'call' && ['sum','avg','min','max'].includes(e.name.toLowerCase()) ? e.args : [];
      for (const operand of operands) {
        const t = inferExpression(operand,fieldType);
        if (t === 'categorical' || t === 'boolean' || t === 'datetime') report('E_CALC_OPERAND', `Numeric operation received ${t}. Convert explicitly at the source or change the formula.`,tokenRange(input,operand.token.start,operand.token.end));
      }
      if (e.kind === 'call' && ['sum','avg','count'].includes(e.name.toLowerCase()) && e.args.length <= 1) report('W_ROW_FUNCTION', `${e.name} operates on arguments in one row, not on filtered records. Use a metric or grouped aggregate for totals.`,tokenRange(input,e.token.start,e.token.end),'warning');
    });
    const settings: Record<string,unknown> = Object.create(null); const seen = new Map<string,Range>();
    for (const a of input.metadata) {
      if (seen.has(a.key)) { report('E_CONFLICT',`Repeated calculation metadata ${a.key}.`,a.range); continue; }
      seen.set(a.key,a.range);
      if (!['label','description','format','precision','unit','currency'].includes(a.key)) { report('E_CALC_METADATA', 'Calculation metadata is label, description, format, precision, unit, or currency. Change the formula on its definition line.',a.range); continue; }
      if (a.key === 'precision') { if (typeof a.value !== 'number' || !Number.isInteger(a.value) || a.value < 0 || a.value > 20) { report('E_CALC_METADATA','precision is an integer from 0 to 20.',a.range); continue; } }
      else if (typeof a.value !== 'string') { report('E_CALC_METADATA',`${a.key} needs text.`,a.range); continue; }
      if (a.key === 'format' && !['auto','number','currency','percent','date','datetime'].includes(String(a.value))) { report('E_CALC_METADATA','Unknown display format.',a.range); continue; }
      if (a.key === 'currency' && !/^[A-Z]{3}$/.test(String(a.value))) { report('E_CALC_METADATA','currency is a three-letter uppercase code.',a.range); continue; }
      settings[a.key] = a.value;
    }
    if (Object.keys(settings).length) fieldSettings[name] = settings;
    native.push({ resultColumnName:name, expression });
    origins.push({ name,range:input.range,dependencies:deps,inferredType:inferred,scope:'row' });
  }
  return { diagnostics, native, types, fieldSettings, origins };
}
