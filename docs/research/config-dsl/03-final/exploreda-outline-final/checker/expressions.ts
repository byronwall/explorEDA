/** Native-aligned calculation parsing. AST transformations, never eval or text substitution. */
export type ValueType = 'numeric' | 'categorical' | 'boolean' | 'datetime' | 'null' | 'unknown';
export interface ExprToken { text: string; start: number; end: number }
export type Expr =
  | { kind: 'literal'; value: string | number | boolean | null; token: ExprToken }
  | { kind: 'field'; name: string; exact: boolean; token: ExprToken }
  | { kind: 'unary'; op: string; operand: Expr; token: ExprToken }
  | { kind: 'binary'; op: string; left: Expr; right: Expr; token: ExprToken }
  | { kind: 'conditional'; condition: Expr; yes: Expr; no: Expr; token: ExprToken }
  | { kind: 'call'; name: string; args: Expr[]; token: ExprToken };
export class ExpressionError extends Error {
  constructor(public code: string, message: string, public token: ExprToken) { super(message); }
}
export const functions: Record<string, { min: number; max?: number; type: ValueType; scope: 'row' }> = {
  sum: { min: 1, type: 'numeric', scope: 'row' }, avg: { min: 1, type: 'numeric', scope: 'row' },
  min: { min: 1, type: 'numeric', scope: 'row' }, max: { min: 1, type: 'numeric', scope: 'row' },
  count: { min: 0, type: 'numeric', scope: 'row' },
  formatdate: { min: 2, max: 2, type: 'categorical', scope: 'row' },
  extractdatecomponent: { min: 2, max: 2, type: 'numeric', scope: 'row' },
};
const identifier = /[\p{L}_]/u;
const identifierPart = /[\p{L}\p{N}_]/u;
const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
/** Tokens retain UTF-16 offsets into one physical expression line. */
export function lexExpression(text: string): ExprToken[] {
  const tokens: ExprToken[] = [];
  const token = (start: number, end: number) => ({ text: text.slice(start, end), start, end });
  let i = 0;
  while (i < text.length) {
    if (/\s/.test(text[i]!)) { i++; continue; }
    if ((text[i] === '#' && (!text[i+1] || /\s/.test(text[i+1]!))) || text.slice(i, i+2) === '//') break;
    const start = i;
    if (text[i] === '"') {
      i++; let escaped = false;
      while (i < text.length && (escaped || text[i] !== '"')) { escaped = !escaped && text[i] === '\\'; i++; }
      if (i === text.length) throw new ExpressionError('E_EXPR_STRING', 'Close the formula string on the same line.', token(start, i));
      i++;
      try { JSON.parse(text.slice(start, i)); } catch { throw new ExpressionError('E_EXPR_STRING', 'Formula strings use JSON escapes.', token(start, i)); }
      tokens.push(token(start, i)); continue;
    }
    const number = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(text.slice(i));
    if (number) {
      i += number[0].length;
      if (!Number.isFinite(Number(number[0]))) throw new ExpressionError('E_EXPR_NUMBER', 'Formula numbers must be finite.', token(start, i));
      tokens.push(token(start, i)); continue;
    }
    if (identifier.test(text[i]!)) {
      i++; while (i < text.length && identifierPart.test(text[i]!)) i++;
      tokens.push(token(start, i)); continue;
    }
    const op = /^(?:==|!=|<=|>=|&&|\|\||[+\-*\/^!<>()?,:\[\]])/.exec(text.slice(i));
    if (!op) throw new ExpressionError('E_EXPR_TOKEN', `Unexpected ${JSON.stringify(text[i])}. Use == for equality, ^ for powers, and ["Raw field"] for exact references.`, token(start, i+1));
    i += op[0].length; tokens.push(token(start, i));
    if (tokens.length > 2_048) throw new ExpressionError('E_EXPR_LIMIT', 'Maximum 2,048 expression tokens.', token(start, i));
  }
  if (tokens.length > 2_048) throw new ExpressionError('E_EXPR_LIMIT', 'Maximum 2,048 expression tokens.', token(0, text.length));
  return tokens;
}
const precedence: Record<string, number> = { '||': 1, '&&': 2, '==': 3, '!=': 3, '<': 3, '<=': 3, '>': 3, '>=': 3, '+': 4, '-': 4, '*': 5, '/': 5, '^': 6 };
export function parseExpression(text: string): Expr {
  const tokens = lexExpression(text); let i = 0; let depth = 0;
  const eof = { text: '', start: text.length, end: text.length };
  const peek = () => tokens[i] ?? eof;
  const take = (expected?: string) => {
    const t = tokens[i++] ?? eof;
    if (expected !== undefined && t.text !== expected) throw new ExpressionError('E_EXPR_SYNTAX', `Expected ${expected}, found ${t.text || 'end of formula'}.`, t);
    return t;
  };
  const expression = (min = 0): Expr => {
    depth++; if (depth > 64) throw new ExpressionError('E_EXPR_LIMIT', 'Maximum 64 nested expression levels.', peek());
    let left = term();
    while (own(precedence, peek().text) && precedence[peek().text]! >= min) {
      const op = take(); const p = precedence[op.text]!;
      const right = expression(op.text === '^' ? p : p + 1);
      left = { kind: 'binary', op: op.text, left, right, token: op };
    }
    if (min === 0 && peek().text === '?') {
      const t = take('?'); const yes = expression(); take(':'); const no = expression();
      left = { kind: 'conditional', condition: left, yes, no, token: t };
    }
    depth--; return left;
  };
  const term = (): Expr => {
    const t = take();
    if (!t.text) throw new ExpressionError('E_EXPR_SYNTAX', 'Expected a formula value.', t);
    if (['+', '-', '!'].includes(t.text)) {
      // Native grammar binds unary more tightly than ^. Emit explicit parentheses.
      depth++; if (depth > 64) throw new ExpressionError('E_EXPR_LIMIT', 'Maximum 64 nested expression levels.', t);
      const operand = term(); depth--; return { kind: 'unary', op: t.text, operand, token: t };
    }
    if (t.text === '(') { const e = expression(); take(')'); return e; }
    if (t.text === 'if') {
      const condition = expression(); take('then'); const yes = expression(); take('else'); const no = expression();
      return { kind: 'conditional', condition, yes, no, token: t };
    }
    if (t.text === '[') {
      const name = take();
      if (!name.text.startsWith('"')) throw new ExpressionError('E_EXPR_FIELD', 'An exact field reference is ["Raw field"].', name);
      take(']'); return { kind: 'field', name: JSON.parse(name.text), exact: true, token: name };
    }
    if (t.text.startsWith('"')) return { kind: 'literal', value: JSON.parse(t.text), token: t };
    if (/^(?:\d|\.\d)/.test(t.text)) return { kind: 'literal', value: Number(t.text), token: t };
    if (['true', 'false', 'null'].includes(t.text)) return { kind: 'literal', value: t.text === 'null' ? null : t.text === 'true', token: t };
    if (!/^[\p{L}_][\p{L}\p{N}_]*$/u.test(t.text) || ['then', 'else'].includes(t.text)) throw new ExpressionError('E_EXPR_SYNTAX', `Expected a value, found ${t.text}.`, t);
    if (peek().text !== '(') return { kind: 'field', name: t.text, exact: false, token: t };
    take('('); const args: Expr[] = [];
    if (peek().text !== ')') { args.push(expression()); while (peek().text === ',') { take(','); args.push(expression()); } }
    take(')');
    const key = t.text.toLowerCase(); const fn = own(functions, key) ? functions[key] : undefined;
    if (!fn) throw new ExpressionError('E_EXPR_FUNCTION', `Unknown function ${t.text}. Available: ${Object.keys(functions).join(', ')}.`, t);
    if (args.length < fn.min || (fn.max !== undefined && args.length > fn.max)) throw new ExpressionError('E_EXPR_ARITY', `${t.text} takes ${fn.max === fn.min ? fn.min : 'at least ' + fn.min} argument(s).`, t);
    return { kind: 'call', name: t.text, args, token: t };
  };
  const result = expression();
  if (i !== tokens.length) throw new ExpressionError('E_EXPR_SYNTAX', 'Unexpected text after the formula. Move label/format metadata to a + line.', peek());
  return result;
}
export function walkExpression(e: Expr, visit: (e: Expr) => void): void {
  visit(e);
  if (e.kind === 'unary') walkExpression(e.operand, visit);
  if (e.kind === 'binary') { walkExpression(e.left, visit); walkExpression(e.right, visit); }
  if (e.kind === 'conditional') { walkExpression(e.condition, visit); walkExpression(e.yes, visit); walkExpression(e.no, visit); }
  if (e.kind === 'call') e.args.forEach(arg => walkExpression(arg, visit));
}
/** Native number grammar has no exponent literals; preserve the JS number as decimal. */
function decimal(value: number): string {
  const s = String(value); if (!/[eE]/.test(s)) return s;
  const [m, exp] = s.toLowerCase().split('e'); const [a, b = ''] = m!.split('.');
  const digits = a! + b; const position = a!.length + Number(exp);
  return position <= 0 ? '0.' + '0'.repeat(-position) + digits : position >= digits.length ? digits + '0'.repeat(position - digits.length) : digits.slice(0, position) + '.' + digits.slice(position);
}
export function printExpression(e: Expr, resolve: (name: string, exact: boolean, token: ExprToken) => string): string {
  if (e.kind === 'literal') return typeof e.value === 'number' ? decimal(e.value) : JSON.stringify(e.value);
  if (e.kind === 'field') return '[' + JSON.stringify(resolve(e.name, e.exact, e.token)) + ']';
  if (e.kind === 'unary') return `(${e.op}${printExpression(e.operand, resolve)})`;
  if (e.kind === 'binary') return `(${printExpression(e.left, resolve)} ${e.op} ${printExpression(e.right, resolve)})`;
  if (e.kind === 'conditional') return `(${printExpression(e.condition, resolve)} ? ${printExpression(e.yes, resolve)} : ${printExpression(e.no, resolve)})`;
  return `${e.name}(${e.args.map(arg => printExpression(arg, resolve)).join(', ')})`;
}
export function inferExpression(e: Expr, fieldType: (name: string, exact: boolean) => ValueType): ValueType {
  if (e.kind === 'literal') return e.value === null ? 'null' : typeof e.value === 'number' ? 'numeric' : typeof e.value === 'boolean' ? 'boolean' : 'categorical';
  if (e.kind === 'field') return fieldType(e.name, e.exact);
  if (e.kind === 'unary') return e.op === '!' ? 'boolean' : 'numeric';
  if (e.kind === 'binary') return ['+', '-', '*', '/', '^'].includes(e.op) ? 'numeric' : 'boolean';
  if (e.kind === 'call') return functions[e.name.toLowerCase()]!.type;
  const a = inferExpression(e.yes, fieldType); const b = inferExpression(e.no, fieldType);
  return a === b ? a : a === 'null' ? b : b === 'null' ? a : 'unknown';
}
