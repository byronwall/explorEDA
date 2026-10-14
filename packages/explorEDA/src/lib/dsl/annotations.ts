/**
 * Chart annotations in dashboard text, as child lines of the chart:
 *
 *   scatter @trials x=Speed y=Conversion {
 *     callout "Day 31: slowest response" on=Day:31 offset=-24,-28
 *     rule y=4 "Conversion target 4%"
 *     rule x=mean "Mean response"
 *     band x=2024-06-01..2024-08-31 "Summer sale" display=bracket
 *     region x=275..345 y=4.1..5.15 shape=ellipse "Fast days"
 *     interval lower=P10 upper=P90 "80% of outcomes"
 *     records on=Day keys=31,44 "Slow days"
 *   }
 *
 * Dates on a date axis read and write as ISO text. An annotation's @id is
 * written only when it isn't the one compile would give it.
 */
import type { ChartAnnotation } from "@/lib/annotations/types";
import { parseDateText } from "@/lib/valueParsing";
import type { DslDeclaration, DslPair, DslSpan, DslValue } from "./parse";
import { encodeValue } from "./composition";

export const ANNOTATION_KEYWORDS: Record<string, ChartAnnotation["type"]> = {
  callout: "callout",
  rule: "reference-line",
  band: "band",
  region: "region",
  interval: "interval",
  records: "record-set",
};

const KEYWORD_OF: Record<string, string> = Object.fromEntries(
  Object.entries(ANNOTATION_KEYWORDS).map(([word, type]) => [type, word])
);

export interface AnnotationProblem {
  message: string;
  span: DslSpan;
  suggestion?: string;
}

/** Which of a chart's axes show dates, so their values read as dates. */
export interface DateAxes {
  x: boolean;
  y: boolean;
}

type Record_ = Record<string, unknown>;

const STATISTICS = ["mean", "median", "min", "max"];
const GENERATED_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** What compile names an annotation without @id. */
function naturalIds(annotations: ChartAnnotation[], chartId: string) {
  const counts = new Map<string, number>();
  return annotations.map((annotation) => {
    const next = (counts.get(annotation.type) ?? 0) + 1;
    counts.set(annotation.type, next);
    return `${chartId}-${annotation.type}-${next}`;
  });
}

/** A timestamp as ISO text, without a time at midnight UTC. */
export function dateText(ms: number): string {
  const iso = new Date(ms).toISOString();
  return iso.endsWith("T00:00:00.000Z")
    ? iso.slice(0, 10)
    : iso.replace(/\.000Z$/, "Z");
}

function axisValue(value: number, date: boolean): string {
  return date && Number.isFinite(value) ? dateText(value) : String(value);
}

function quote(text: string): string {
  return JSON.stringify(text);
}

/** Settings every annotation shares, and their order in text. */
const COMMON = ["name", "color", "hidden", "facet", "yAxis"] as const;

function commonTokens(annotation: Record_): string[] {
  return COMMON.flatMap((key) =>
    annotation[key] === undefined
      ? []
      : [`${key}=${encodeValue(annotation[key])}`]
  );
}

/** Writes a chart's annotations as child lines. */
export function liftAnnotations(
  annotations: ChartAnnotation[],
  chartId: string,
  dates: DateAxes
): string[] {
  const natural = naturalIds(annotations, chartId);
  return annotations.map((annotation, index) => {
    const word = KEYWORD_OF[annotation.type]!;
    const tokens: string[] = [];
    // Generated IDs carry no meaning; compile gives each line its own.
    if (annotation.id !== natural[index] && !GENERATED_ID.test(annotation.id)) {
      tokens.push(`@${annotation.id}`);
    }
    const record = annotation as unknown as Record_;
    switch (annotation.type) {
      case "callout": {
        tokens.push(quote(annotation.text));
        const attach = annotation.attach;
        if (attach.kind === "record") {
          tokens.push(
            `on=${attach.keyFields
              .map(
                (field, at) =>
                  `${encodeValue(field)}:${encodeValue(attach.key[at])}`
              )
              .join(",")}`
          );
          if (attach.yField !== undefined) {
            tokens.push(`yField=${encodeValue(attach.yField)}`);
          }
        } else if (attach.kind === "coordinate") {
          tokens.push(
            `at=${axisValue(attach.x, dates.x)},${axisValue(attach.y, dates.y)}`
          );
        } else if (attach.kind === "query") {
          tokens.push(`pick=${attach.pick}`);
          if (attach.field !== undefined) {
            tokens.push(`field=${encodeValue(attach.field)}`);
          }
          if (attach.population !== "filtered") {
            tokens.push(`population=${attach.population}`);
          }
        } else {
          tokens.push(`category=${encodeValue(attach.value)}`);
        }
        if (annotation.offset.dx || annotation.offset.dy) {
          tokens.push(`offset=${annotation.offset.dx},${annotation.offset.dy}`);
        }
        for (const key of ["leader", "arrow"] as const) {
          if (annotation[key] !== undefined) {
            tokens.push(`${key}=${annotation[key]}`);
          }
        }
        break;
      }
      case "reference-line": {
        const date = dates[annotation.axis];
        if (annotation.calculated) {
          tokens.push(`${annotation.axis}=${annotation.calculated.statistic}`);
          if (annotation.calculated.population !== "filtered") {
            tokens.push(`population=${annotation.calculated.population}`);
          }
          if (annotation.value !== 0) {
            tokens.push(`value=${axisValue(annotation.value, date)}`);
          }
        } else {
          tokens.push(
            `${annotation.axis}=${axisValue(annotation.value, date)}`
          );
        }
        if (annotation.label !== undefined)
          tokens.push(quote(annotation.label));
        if (annotation.lineStyle !== undefined) {
          tokens.push(`lineStyle=${annotation.lineStyle}`);
        }
        break;
      }
      case "band": {
        const date = dates[annotation.axis];
        tokens.push(
          `${annotation.axis}=${axisValue(annotation.from, date)}..${axisValue(annotation.to, date)}`
        );
        if (annotation.label !== undefined)
          tokens.push(quote(annotation.label));
        if (annotation.display !== undefined) {
          tokens.push(`display=${annotation.display}`);
        }
        break;
      }
      case "region":
        tokens.push(
          `x=${axisValue(annotation.x0, dates.x)}..${axisValue(annotation.x1, dates.x)}`,
          `y=${axisValue(annotation.y0, dates.y)}..${axisValue(annotation.y1, dates.y)}`
        );
        if (annotation.shape !== "rect")
          tokens.push(`shape=${annotation.shape}`);
        if (annotation.label !== undefined)
          tokens.push(quote(annotation.label));
        break;
      case "interval":
        tokens.push(quote(annotation.meaning));
        tokens.push(
          `lower=${encodeValue(annotation.lowerField)}`,
          `upper=${encodeValue(annotation.upperField)}`
        );
        break;
      case "record-set":
        if (annotation.label !== undefined)
          tokens.push(quote(annotation.label));
        tokens.push(`on=${annotation.keyFields.map(encodeValue).join(",")}`);
        // One key field: keys=31,44. Several: keys="31/Web,44/Store".
        tokens.push(
          annotation.keyFields.length === 1
            ? `keys=${annotation.keys.map((key) => encodeValue(key[0])).join(",")}`
            : `keys=${quote(JSON.stringify(annotation.keys))}`
        );
        if (annotation.yField !== undefined) {
          tokens.push(`yField=${encodeValue(annotation.yField)}`);
        }
        break;
    }
    tokens.push(...commonTokens(record));
    return [word, ...tokens].join(" ");
  });
}

// ---------------------------------------------------------------------------
// Compile

function single(value: DslValue): string {
  return value.items.length === 1 ? value.items[0]!.text : value.raw;
}

/** A number, or a date read as its timestamp. */
function readNumber(text: string): number | undefined {
  const trimmed = text.trim();
  if (trimmed === "") return undefined;
  const number = Number(trimmed);
  if (Number.isFinite(number)) return number;
  const date = parseDateText(trimmed, "iso");
  return Number.isFinite(date) ? date : undefined;
}

function readRange(text: string): [number, number] | undefined {
  const parts = text.split("..");
  if (parts.length !== 2) return undefined;
  const [low, high] = parts.map(readNumber);
  return low === undefined || high === undefined ? undefined : [low, high];
}

function readKey(text: string): string | number {
  const number = Number(text);
  return text.trim() !== "" && Number.isFinite(number) ? number : text;
}

/**
 * Splits `Field:value` at the last colon outside quotes. A quoted value
 * stays text, so "17" doesn't read as a number.
 */
export function splitColon(raw: string): [string, string | number] | undefined {
  let inQuote = false;
  let at = -1;
  for (let index = 0; index < raw.length; index++) {
    const char = raw[index];
    if (char === "\\") {
      index++;
    } else if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ":" && !inQuote) {
      at = index;
    }
  }
  if (at < 0) return undefined;
  const read = (text: string) =>
    text.startsWith('"') ? (JSON.parse(text) as string) : text;
  const value = raw.slice(at + 1);
  return [
    read(raw.slice(0, at)),
    value.startsWith('"') ? read(value) : readKey(value),
  ];
}

/** Splits a value at commas outside quotes, keeping each piece's raw text. */
export function rawItems(raw: string): string[] {
  const items: string[] = [];
  let start = 0;
  let inQuote = false;
  for (let index = 0; index < raw.length; index++) {
    const char = raw[index];
    if (inQuote && char === "\\") {
      index++;
    } else if (char === '"') {
      inQuote = !inQuote;
    } else if (!inQuote && char === ",") {
      items.push(raw.slice(start, index));
      start = index + 1;
    }
  }
  items.push(raw.slice(start));
  return items;
}

/**
 * Builds a chart's annotations from its child lines. Returns undefined for
 * a line that isn't an annotation, so the caller can treat it otherwise.
 */
export function lowerAnnotation(
  declaration: DslDeclaration,
  index: { [type: string]: number },
  chartId: string,
  problems: AnnotationProblem[]
): ChartAnnotation | undefined {
  const type = ANNOTATION_KEYWORDS[declaration.keyword];
  if (!type) return undefined;
  index[type] = (index[type] ?? 0) + 1;
  const id = declaration.name ?? `${chartId}-${type}-${index[type]}`;
  const pairs = new Map<string, DslPair>(
    declaration.pairs.map((pair) => [pair.key, pair])
  );
  const take = (key: string) => {
    const pair = pairs.get(key);
    pairs.delete(key);
    return pair;
  };
  const text = declaration.positional[0]?.value.items[0]?.text;
  const fail = (message: string, suggestion?: string) => {
    problems.push({ message, span: declaration.span, suggestion });
    return undefined;
  };
  let annotation: Record_ | undefined;
  switch (type) {
    case "callout": {
      if (text === undefined) {
        return fail(
          "A callout needs its text, so it was skipped.",
          'Write it as callout "Peak" on=Day:31.'
        );
      }
      const on = take("on");
      const at = take("at");
      const pick = take("pick");
      const category = take("category");
      let attach: Record_ | undefined;
      if (on) {
        const pieces = rawItems(on.value.raw).map(splitColon);
        if (pieces.some((piece) => !piece)) {
          return fail(
            "on= names the record by field and value, as in on=Day:31.",
            "Join several key fields with commas: on=Day:31,Region:West."
          );
        }
        attach = {
          kind: "record",
          keyFields: pieces.map((piece) => piece![0]),
          key: pieces.map((piece) => piece![1]),
        };
        const yField = take("yField");
        if (yField) attach.yField = single(yField.value);
      } else if (at) {
        const [x, y] = rawItems(at.value.raw).map(readNumber);
        if (x === undefined || y === undefined) {
          return fail("at= needs an x and a y value, as in at=10,20.");
        }
        attach = { kind: "coordinate", x, y };
      } else if (pick) {
        const population = take("population");
        attach = {
          kind: "query",
          pick: single(pick.value),
          population: population ? single(population.value) : "filtered",
        };
        const field = take("field");
        if (field) attach.field = single(field.value);
      } else if (category) {
        attach = { kind: "category", value: single(category.value) };
      } else {
        return fail(
          "A callout points at something, so this one was skipped.",
          "Add on=Field:value, at=x,y, pick=max, or category=Name."
        );
      }
      const offset = take("offset");
      const [dx, dy] = offset ? rawItems(offset.value.raw).map(Number) : [0, 0];
      annotation = {
        id,
        type,
        text,
        attach,
        offset: { dx: dx ?? 0, dy: dy ?? 0 },
      };
      for (const key of ["leader", "arrow"]) {
        const pair = take(key);
        if (pair) annotation[key] = single(pair.value) === "true";
      }
      break;
    }
    case "reference-line": {
      const axisPair = take("x") ?? take("y");
      if (!axisPair) {
        return fail(
          "A rule is on x or y, so this one was skipped.",
          'Write it as rule y=4 "Target" or rule x=mean.'
        );
      }
      const axis = axisPair.key as "x" | "y";
      const raw = single(axisPair.value);
      annotation = { id, type, axis, value: 0 };
      if (STATISTICS.includes(raw)) {
        const population = take("population");
        annotation.calculated = {
          statistic: raw,
          population: population ? single(population.value) : "filtered",
        };
        const value = take("value");
        if (value) annotation.value = readNumber(single(value.value)) ?? 0;
      } else {
        const value = readNumber(raw);
        if (value === undefined) {
          return fail(
            `${raw} is not a number, a date, or mean, median, min, or max.`
          );
        }
        annotation.value = value;
      }
      if (text !== undefined) annotation.label = text;
      const style = take("lineStyle");
      if (style) annotation.lineStyle = single(style.value);
      break;
    }
    case "band": {
      const axisPair = take("x") ?? take("y");
      const range = axisPair && readRange(axisPair.value.raw);
      if (!axisPair || !range) {
        return fail(
          "A band spans a range on x or y, so this one was skipped.",
          'Write it as band x=2024-06-01..2024-08-31 "Sale".'
        );
      }
      annotation = {
        id,
        type,
        axis: axisPair.key,
        from: range[0],
        to: range[1],
      };
      if (text !== undefined) annotation.label = text;
      const display = take("display");
      if (display) annotation.display = single(display.value);
      break;
    }
    case "region": {
      const x = take("x");
      const y = take("y");
      const xs = x && readRange(x.value.raw);
      const ys = y && readRange(y.value.raw);
      if (!xs || !ys) {
        return fail(
          "A region needs an x range and a y range, so it was skipped.",
          "Write it as region x=10..20 y=0..5."
        );
      }
      const shape = take("shape");
      annotation = {
        id,
        type,
        shape: shape ? single(shape.value) : "rect",
        x0: xs[0],
        x1: xs[1],
        y0: ys[0],
        y1: ys[1],
      };
      if (text !== undefined) annotation.label = text;
      break;
    }
    case "interval": {
      const lower = take("lower");
      const upper = take("upper");
      if (!lower || !upper || text === undefined) {
        return fail(
          "An interval names its lower and upper fields and what it means.",
          'Write it as interval "80% of outcomes" lower=P10 upper=P90.'
        );
      }
      annotation = {
        id,
        type,
        lowerField: single(lower.value),
        upperField: single(upper.value),
        meaning: text,
      };
      break;
    }
    case "record-set": {
      const on = take("on");
      const keys = take("keys");
      if (!on || !keys) {
        return fail(
          "Saved records name their key fields and keys.",
          'Write them as records "Slow days" on=Day keys=31,44.'
        );
      }
      const keyFields = on.value.items.map((item) => item.text);
      annotation = {
        id,
        type,
        keyFields,
        keys:
          keyFields.length === 1
            ? keys.value.items.map((item) => [
                item.quoted ? item.text : readKey(item.text),
              ])
            : (JSON.parse(single(keys.value)) as unknown[]),
      };
      if (text !== undefined) annotation.label = text;
      const yField = take("yField");
      if (yField) annotation.yField = single(yField.value);
      break;
    }
  }
  for (const key of COMMON) {
    const pair = take(key);
    if (!pair) continue;
    annotation![key] =
      key === "hidden" ? single(pair.value) === "true" : single(pair.value);
  }
  for (const pair of pairs.values()) {
    problems.push({
      message: `${pair.key} is not a ${declaration.keyword} setting, so it was ignored.`,
      span: pair.span,
    });
  }
  return annotation as unknown as ChartAnnotation;
}
