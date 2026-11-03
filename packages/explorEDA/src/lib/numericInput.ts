/**
 * Number input conventions: how a field's text writes decimals and digit
 * groups, such as 1,234.5 or 1.234,5. A field uses one convention for all of
 * its values, so 1,234 never reads as 1234 in one row and 1.234 in another.
 */
export type NumberInput =
  | "comma-plain"
  | "dot-comma"
  | "comma-dot"
  | "comma-space"
  | "dot-space"
  | "indian-dot";

type Convention = {
  /** The convention as a reader sees it, such as 1,234.5. */
  label: string;
  decimal: "." | ",";
  /** The digit-group separators, or none. */
  groups: readonly string[];
  /** Groups of two before the last three, as in 12,34,567. */
  indian?: boolean;
};

/** Regular, nonbreaking, and narrow nonbreaking spaces. */
const SPACES = [" ", "\u00a0", "\u202f"] as const;

export const NUMBER_INPUTS: Record<NumberInput, Convention> = {
  "comma-plain": { label: "1234,5", decimal: ",", groups: [] },
  "dot-comma": { label: "1,234.5", decimal: ".", groups: [","] },
  "comma-dot": { label: "1.234,5", decimal: ",", groups: ["."] },
  "comma-space": { label: "1 234,5", decimal: ",", groups: SPACES },
  "dot-space": { label: "1 234.5", decimal: ".", groups: SPACES },
  "indian-dot": {
    label: "12,34,567.8",
    decimal: ".",
    groups: [","],
    indian: true,
  },
};

const PLAIN: Convention = { label: "1234.5", decimal: ".", groups: [] };

export const NUMBER_INPUT_IDS = Object.keys(NUMBER_INPUTS) as NumberInput[];

/** The label for a field without a convention, which reads plain numbers. */
export const PLAIN_NUMBER_LABEL = PLAIN.label;

export function isNumberInput(value: unknown): value is NumberInput {
  return typeof value === "string" && value in NUMBER_INPUTS;
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const patterns = new Map<Convention, RegExp>();

/**
 * Digits with an optional fraction and exponent. Groups, when present, have
 * one to three leading digits and then groups of three, all with one
 * separator. Indian groups have one or two leading digits, then pairs, then
 * a last group of three.
 */
function patternFor(convention: Convention) {
  let pattern = patterns.get(convention);
  if (pattern) return pattern;
  const { decimal, groups, indian } = convention;
  const grouped = groups.map((separator) => {
    const group = escape(separator);
    return indian
      ? `\\d{1,2}(?:${group}\\d{2})*${group}\\d{3}`
      : `\\d{1,3}(?:${group}\\d{3})+`;
  });
  const whole = ["\\d+", ...grouped].join("|");
  const point = escape(decimal);
  pattern = new RegExp(
    `^[+-]?(?:(?:${whole})(?:${point}\\d+)?|${point}\\d+)(?:[eE][+-]?\\d+)?$`
  );
  patterns.set(convention, pattern);
  return pattern;
}

const NUMBER_CHARACTERS = /^[\d+\-.,eE \u00a0\u202f]*$/;
const CURRENCY_SIGNS = /[$€£¥₹₩₽¢]|(?:^|\s)[A-Z]{3}(?:$|\s)/;

export type NumberInputOptions = {
  /** Text values end in %, and 12% reads as 0.12. */
  percent?: boolean;
  /** (1,234.50) reads as -1234.5. */
  accounting?: boolean;
  /** A three-letter code whose symbol or code a value can carry. */
  currency?: string;
};

/** The ways a currency code is written beside an amount, such as $ and USD. */
export function currencySigns(code: string) {
  const signs = new Set([code]);
  for (const currencyDisplay of ["symbol", "narrowSymbol"] as const) {
    try {
      const sign = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        currencyDisplay,
      })
        .formatToParts(1)
        .find((part) => part.type === "currency")?.value;
      if (sign) signs.add(sign);
    } catch {
      // An unknown code has only itself.
    }
  }
  // Longest first, so CA$ is taken before $.
  return [...signs].sort((a, b) => b.length - a.length);
}

type Parsed = { value: number | undefined; error?: string };
const fail = (error: string): Parsed => ({ value: undefined, error });

/** Remove one currency sign at either end, after any +/- sign. */
function stripCurrency(text: string, code: string): Parsed | string {
  const sign = /^[+-]/.test(text) ? text.slice(0, 1) : "";
  const body = text.slice(sign.length);
  for (const mark of currencySigns(code)) {
    if (body.startsWith(mark)) {
      return sign + body.slice(mark.length).trimStart();
    }
    if (body.endsWith(mark)) {
      return sign + body.slice(0, -mark.length).trimEnd();
    }
  }
  return CURRENCY_SIGNS.test(body)
    ? fail(`Currency does not match ${code}`)
    : text;
}

/**
 * Read trimmed text as a number written in one convention, with optional
 * accounting parentheses, a currency sign, and a percent sign, from the
 * outside in: ($1,234.50) or (12%). Returns the number, or the reason the
 * text is not one.
 */
export function parseNumberInput(
  text: string,
  input: NumberInput | undefined,
  options: NumberInputOptions = {}
): Parsed {
  let body = text;
  let negate = false;
  if (body.startsWith("(") && body.endsWith(")")) {
    if (!options.accounting) {
      return fail("Parentheses need accounting negatives");
    }
    body = body.slice(1, -1);
    if (body !== body.trim() || /^[+-]/.test(body)) {
      return fail("Accounting negatives take no sign or spaces inside");
    }
    negate = true;
  }
  if (options.currency) {
    const stripped = stripCurrency(body, options.currency);
    if (typeof stripped !== "string") return stripped;
    body = stripped;
  } else if (CURRENCY_SIGNS.test(body)) {
    return fail("Has a currency sign; turn on currency input");
  }
  if (options.percent) {
    if (!body.endsWith("%")) return fail("Missing a percent sign");
    body = body.slice(0, -1);
  } else if (body.includes("%")) {
    return fail("Has a percent sign; turn on percent input");
  }
  const read = parsePlainNumber(
    body,
    input ? NUMBER_INPUTS[input] : PLAIN,
    options.percent ? -2 : 0
  );
  return negate && read.value !== undefined ? { value: -read.value + 0 } : read;
}

function parsePlainNumber(
  text: string,
  convention: Convention,
  shift: number
): Parsed {
  const { label, decimal, groups } = convention;
  if (!patternFor(convention).test(text)) {
    if (!NUMBER_CHARACTERS.test(text)) {
      return fail("Has characters that are not part of a number");
    }
    const separators = [decimal, ...groups];
    return [...text].some(
      (character) => /[.,\s]/.test(character) && !separators.includes(character)
    ) || groups.some((separator) => text.includes(separator))
      ? fail(`Separators do not match ${label}`)
      : fail(`Not a number written as ${label}`);
  }
  const plain = [...text]
    .filter((character) => !groups.includes(character))
    .join("")
    .replace(decimal, ".");
  // A percent moves the decimal point exactly, before any rounding.
  const [mantissa = "", exponent = "0"] = plain.split(/[eE]/);
  const value = Number(`${mantissa}e${Number(exponent) + shift}`);
  if (!Number.isFinite(value)) {
    return fail("Too large for a number");
  }
  if (value === 0 && /[1-9]/.test(mantissa)) {
    return fail("Too small for a number");
  }
  // -0 reads as 0.
  return { value: value + 0 };
}
