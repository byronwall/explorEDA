/**
 * Proposed explorEDA text semantics — standalone reference oracle.
 * This is NOT a repository patch, expression parser, or production implementation.
 * It checks values already evaluated by the caller; Calculator's argument-expression
 * evaluation, source typing, dependency errors, and persistence need integration tests.
 */

export const definitions = Object.freeze({
  textTrim: { min: 1, max: 1, syntax: "textTrim(text)", result: "text" },
  textPart: { min: 3, max: 3, syntax: "textPart(text, delimiter, index)", result: "text" },
  textReplace: { min: 3, max: 3, syntax: "textReplace(text, search, replacement)", result: "text" },
  textConcat: { min: 2, syntax: "textConcat(text1, text2, …)", result: "text" },
  textNormalize: { min: 1, max: 1, syntax: "textNormalize(text)", result: "text" },
  textLower: { min: 1, max: 1, syntax: "textLower(text)", result: "text" },
  textUpper: { min: 1, max: 1, syntax: "textUpper(text)", result: "text" },
  textLength: { min: 1, max: 1, syntax: "textLength(text)", result: "number" },
  textSlice: { min: 2, max: 3, syntax: "textSlice(text, start, count?)", result: "text" },
});

// Exact, frozen profile: ECMAScript WhiteSpace + LineTerminator, 25 code points.
// NEL U+0085, MVS U+180E, ZWSP U+200B, ZWNJ U+200C, ZWJ U+200D,
// and WORD JOINER U+2060 are deliberately absent.
const EDGE_SPACES = /^[\u0009-\u000D\u0020\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+|[\u0009-\u000D\u0020\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+$/gu;

class TextFault extends Error {
  constructor(code, message) {
    super(message);
    this.name = "TextFault";
    this.code = code;
  }
}

function kind(value) {
  if (value === null) return "null";
  if (value instanceof Date) return "date";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function wellFormed(text) {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code >= 0xDC00 && code <= 0xDFFF) return false;
    if (code < 0xD800 || code > 0xDBFF) continue;
    const next = text.charCodeAt(index + 1);
    if (!(next >= 0xDC00 && next <= 0xDFFF)) return false;
    index += 1;
  }
  return true;
}

function textArgument(fn, value, position, nullable) {
  if (nullable && value == null) return null;
  if (typeof value !== "string") {
    const requirement = nullable ? "text or missing" : "text";
    throw new TextFault("TEXT_TYPE", `${fn} argument ${position} must be ${requirement}; received ${kind(value)}.`);
  }
  if (!wellFormed(value)) {
    throw new TextFault("TEXT_UNICODE", `${fn} argument ${position} contains an unpaired UTF-16 surrogate.`);
  }
  return value;
}

function nonempty(fn, value, position) {
  const text = textArgument(fn, value, position, false);
  if (text === "") {
    throw new TextFault("TEXT_EMPTY_PATTERN", `${fn} argument ${position} must not be empty.`);
  }
  return text;
}

function indexArgument(fn, value, position) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new TextFault("TEXT_INDEX", `${fn} argument ${position} must be a non-negative safe integer number.`);
  }
  return value;
}

function part(text, delimiter, requested) {
  let start = 0;
  let component = 0;
  for (;;) {
    const match = text.indexOf(delimiter, start);
    if (component === requested) {
      return match < 0 ? text.slice(start) : text.slice(start, match);
    }
    if (match < 0) return null;
    start = match + delimiter.length;
    component += 1;
  }
}

function replaceLiteral(text, search, replacement) {
  const pieces = [];
  let start = 0;
  for (;;) {
    const match = text.indexOf(search, start);
    if (match < 0) {
      pieces.push(text.slice(start));
      return pieces.join("");
    }
    pieces.push(text.slice(start, match), replacement);
    start = match + search.length;
  }
}

function run(fn, args) {
  // Values are validated in argument order before nullish propagation.
  if (fn === "textConcat") {
    const parts = args.map((value, index) => textArgument(fn, value, index + 1, true));
    if (parts.some((value) => value === null)) return null;
    return parts.join("");
  }

  const text = textArgument(fn, args[0], 1, true);
  if (fn === "textPart") {
    const delimiter = nonempty(fn, args[1], 2);
    const index = indexArgument(fn, args[2], 3);
    if (text === null) return null;
    return part(text, delimiter, index);
  }
  if (fn === "textReplace") {
    const search = nonempty(fn, args[1], 2);
    const replacement = textArgument(fn, args[2], 3, false);
    if (text === null) return null;
    return replaceLiteral(text, search, replacement);
  }
  if (fn === "textSlice") {
    const start = indexArgument(fn, args[1], 2);
    const count = args.length === 3 ? indexArgument(fn, args[2], 3) : undefined;
    if (text === null) return null;
    // A transparent oracle; production can stream code points to avoid this array.
    const points = Array.from(text);
    if (start >= points.length) return "";
    const available = points.length - start;
    const length = count === undefined ? available : Math.min(count, available);
    return points.slice(start, start + length).join("");
  }
  if (text === null) return null;
  if (fn === "textTrim") return text.replace(EDGE_SPACES, "");
  if (fn === "textNormalize") return text.normalize("NFC");
  if (fn === "textLower") return text.toLowerCase();
  if (fn === "textUpper") return text.toUpperCase();
  if (fn === "textLength") return Array.from(text).length;
  throw new Error(`Unimplemented reference function: ${fn}`);
}

export function evaluateTextFunction(name, args) {
  const fn = Object.keys(definitions).find((key) => key.toLowerCase() === name.toLowerCase());
  if (!fn) return { success: false, value: null, error: `Unknown function: ${name}` };
  const definition = definitions[fn];
  if (args.length < definition.min || (definition.max !== undefined && args.length > definition.max)) {
    return { success: false, value: null, errorCode: "TEXT_ARITY", error: `Invalid arguments. Use ${definition.syntax}` };
  }
  try {
    return { success: true, value: run(fn, args) };
  } catch (error) {
    if (!(error instanceof TextFault)) throw error;
    return { success: false, value: null, errorCode: error.code, error: error.message };
  }
}

/** Fixture-only codec. These objects are not accepted by the product functions. */
export function decodeFixtureValue(value) {
  if (!value || typeof value !== "object" || !("$type" in value)) return value;
  if (value.$type === "undefined") return undefined;
  if (value.$type === "date") return new Date(value.iso);
  if (value.$type === "number" && value.value === "NaN") return NaN;
  if (value.$type === "number" && value.value === "Infinity") return Infinity;
  if (value.$type === "number" && value.value === "-Infinity") return -Infinity;
  if (value.$type === "number" && value.value === "-0") return -0;
  throw new Error(`Unknown fixture value: ${JSON.stringify(value)}`);
}
