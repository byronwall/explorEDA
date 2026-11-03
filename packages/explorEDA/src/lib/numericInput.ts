/**
 * Number input conventions: how a field's text writes decimals and digit
 * groups, such as 1,234.5 or 1.234,5. A field uses one convention for all of
 * its values, so 1,234 never reads as 1234 in one row and 1.234 in another.
 */
export type NumberInput =
  | "comma-plain"
  | "dot-comma"
  | "comma-dot"
  | "comma-space";

type Convention = {
  /** The convention as a reader sees it, such as 1,234.5. */
  label: string;
  decimal: "." | ",";
  /** The digit-group separators, or none. */
  groups: readonly string[];
};

/** Regular, nonbreaking, and narrow nonbreaking spaces. */
const SPACES = [" ", "\u00a0", "\u202f"] as const;

export const NUMBER_INPUTS: Record<NumberInput, Convention> = {
  "comma-plain": { label: "1234,5", decimal: ",", groups: [] },
  "dot-comma": { label: "1,234.5", decimal: ".", groups: [","] },
  "comma-dot": { label: "1.234,5", decimal: ",", groups: ["."] },
  "comma-space": { label: "1 234,5", decimal: ",", groups: SPACES },
};

export const NUMBER_INPUT_IDS = Object.keys(NUMBER_INPUTS) as NumberInput[];

/** The label for a field without a convention, which reads plain numbers. */
export const PLAIN_NUMBER_LABEL = "1234.5";

export function isNumberInput(value: unknown): value is NumberInput {
  return typeof value === "string" && value in NUMBER_INPUTS;
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const patterns = new Map<NumberInput, RegExp>();

/**
 * Digits with an optional fraction and exponent. Groups, when present, have
 * one to three leading digits and then groups of three, all with one
 * separator.
 */
function patternFor(input: NumberInput) {
  let pattern = patterns.get(input);
  if (pattern) return pattern;
  const { decimal, groups } = NUMBER_INPUTS[input];
  const grouped = groups.map(
    (separator) => `\\d{1,3}(?:${escape(separator)}\\d{3})+`
  );
  const whole = ["\\d+", ...grouped].join("|");
  const point = escape(decimal);
  pattern = new RegExp(
    `^[+-]?(?:(?:${whole})(?:${point}\\d+)?|${point}\\d+)(?:[eE][+-]?\\d+)?$`
  );
  patterns.set(input, pattern);
  return pattern;
}

const NUMBER_CHARACTERS = /^[\d+\-.,eE \u00a0\u202f]*$/;

/**
 * Read trimmed text as a number written in one convention. Returns the
 * number, or the reason the text is not one.
 */
export function parseNumberInput(
  text: string,
  input: NumberInput
): { value: number | undefined; error?: string } {
  const { label, decimal, groups } = NUMBER_INPUTS[input];
  if (!patternFor(input).test(text)) {
    if (!NUMBER_CHARACTERS.test(text)) {
      return {
        value: undefined,
        error: "Has characters that are not part of a number",
      };
    }
    const separators = [decimal, ...groups];
    return [...text].some(
      (character) => /[.,\s]/.test(character) && !separators.includes(character)
    ) || groups.some((separator) => text.includes(separator))
      ? { value: undefined, error: `Separators do not match ${label}` }
      : { value: undefined, error: `Not a number written as ${label}` };
  }
  const plain = [...text]
    .filter((character) => !groups.includes(character))
    .join("")
    .replace(decimal, ".");
  const value = Number(plain);
  if (!Number.isFinite(value)) {
    return { value: undefined, error: "Too large for a number" };
  }
  if (value === 0 && /[1-9]/.test(plain.replace(/[eE].*$/, ""))) {
    return { value: undefined, error: "Too small for a number" };
  }
  // -0 reads as 0.
  return { value: value + 0 };
}
