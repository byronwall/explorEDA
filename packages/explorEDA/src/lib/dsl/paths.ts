/**
 * Flat setting paths, so any nested setting is one readable `key=value` pair
 * and no value needs JSON:
 *
 *   xAxis.scaleType=symlog        nested object member
 *   columns.0.width=120           member of the first record in a list
 *   columns[]=                    an empty list (records follow by index)
 *   fields[]=Region,Channel       a list of plain values
 *   hexbin{}=                     an empty object
 *   "Order Date".label=Ordered    a quoted segment holds dots or spaces
 *   regression=unset              removes a setting, back to the default
 *   sortBy=null                   a missing value
 *   title=""                      an empty string; quoted text is always text
 */
import type { DslItem, DslValue } from "./parse";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Container = Record<string, unknown> | unknown[];

export interface DslPath {
  segments: string[];
  /** A `[]` or `{}` marker after the last segment. */
  marker?: "list" | "object";
}

const PLAIN_SEGMENT = /^[A-Za-z_][\w-]*$|^\d+$/;

export function parsePath(key: string): DslPath | undefined {
  let marker: DslPath["marker"];
  let text = key;
  if (text.endsWith("[]")) {
    marker = "list";
    text = text.slice(0, -2);
  } else if (text.endsWith("{}")) {
    marker = "object";
    text = text.slice(0, -2);
  }
  const segments: string[] = [];
  let index = 0;
  while (index < text.length) {
    if (text[index] === '"') {
      let end = index + 1;
      let segment = "";
      while (end < text.length && text[end] !== '"') {
        if (text[end] === "\\") {
          end++;
        }
        segment += text[end] ?? "";
        end++;
      }
      if (end >= text.length) {
        return undefined;
      }
      segments.push(segment);
      index = end + 1;
    } else {
      const end = text.indexOf(".", index);
      const segment = text.slice(index, end < 0 ? text.length : end);
      if (!segment) {
        return undefined;
      }
      segments.push(segment);
      index = end < 0 ? text.length : end;
    }
    if (index < text.length) {
      if (text[index] !== ".") {
        return undefined;
      }
      index++;
      if (index === text.length) {
        return undefined;
      }
    }
  }
  return segments.length ? { segments, marker } : undefined;
}

export function formatPath(segments: string[]): string {
  return segments
    .map((segment) =>
      PLAIN_SEGMENT.test(segment) ? segment : JSON.stringify(segment)
    )
    .join(".");
}

/** Reads one item, using the setting's current type when there is one. */
function decodeItem(item: DslItem, current: unknown): Json {
  if (item.quoted) {
    return item.text;
  }
  const text = item.text;
  if (text === "null") {
    return null;
  }
  if (typeof current === "string") {
    return text;
  }
  if (text === "true" || text === "false") {
    return text === "true";
  }
  if (text.trim() !== "" && Number.isFinite(Number(text))) {
    return Number(text);
  }
  return text;
}

export function getPath(target: unknown, segments: string[]): unknown {
  let value = target;
  for (const segment of segments) {
    if (value == null || typeof value !== "object") {
      return undefined;
    }
    value = (value as Record<string, unknown>)[segment];
  }
  return value;
}

/**
 * Sets a path on a copy-on-write basis: every object along the path is
 * copied, so the caller can keep the old value to restore it.
 */
export function setPath<T>(target: T, path: DslPath, value: DslValue): T {
  const { segments, marker } = path;
  const current = getPath(target, segments);
  const unset =
    !marker &&
    value.items.length === 1 &&
    !value.items[0]!.quoted &&
    value.items[0]!.text === "unset";
  let next: unknown;
  if (marker === "list") {
    next =
      value.raw === ""
        ? []
        : value.items.map((item) => decodeItem(item, undefined));
  } else if (marker === "object") {
    next = {};
  } else if (value.items.length > 1) {
    next = value.items.map((item) => decodeItem(item, undefined));
  } else {
    next = decodeItem(value.items[0]!, current);
  }
  const write = (container: unknown, depth: number): unknown => {
    const segment = segments[depth]!;
    const isIndex = /^\d+$/.test(segment);
    const copy: Container = Array.isArray(container)
      ? [...container]
      : container && typeof container === "object"
        ? { ...(container as Record<string, unknown>) }
        : isIndex
          ? []
          : {};
    const key = isIndex && Array.isArray(copy) ? Number(segment) : segment;
    if (depth === segments.length - 1) {
      if (unset) {
        if (Array.isArray(copy)) {
          copy.splice(key as number, 1);
        } else {
          delete copy[key as string];
        }
      } else {
        (copy as Record<string | number, unknown>)[key] = next;
      }
      return copy;
    }
    const child = (copy as Record<string | number, unknown>)[key];
    (copy as Record<string | number, unknown>)[key] = write(child, depth + 1);
    return copy;
  };
  return write(target, 0) as T;
}

const RESERVED = /^(null|unset|true|false)$/;

/** Writes a plain value so it reads back as the same value. */
export function encodeScalar(value: string | number | boolean | null): string {
  if (value === null) {
    return "null";
  }
  if (typeof value !== "string") {
    return String(value);
  }
  const plain =
    /^[^\s",=#@+[\]{}][^\s",=]*$/.test(value) &&
    !RESERVED.test(value) &&
    !value.includes("..") &&
    !Number.isFinite(Number(value));
  return plain ? value : JSON.stringify(value);
}

function isPlain(value: unknown): value is string | number | boolean | null {
  return (
    value === null || ["string", "number", "boolean"].includes(typeof value)
  );
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Lists the pairs that turn `base` into `next`. Records in a list are
 * rewritten whole, so their order survives.
 */
export function diffPaths(
  base: unknown,
  next: unknown,
  prefix: string[] = []
): string[] {
  if (sameValue(base, next)) {
    return [];
  }
  const key = formatPath(prefix);
  if (next === undefined) {
    return [`${key}=unset`];
  }
  if (isPlain(next)) {
    // A whole number written as text must stay text.
    return [
      `${key}=${typeof base === "string" && typeof next === "string" ? encodeScalarAsText(next) : encodeScalar(next)}`,
    ];
  }
  if (Array.isArray(next)) {
    if (
      next.every(isPlain) &&
      next.every((item) => !(typeof item === "string" && item === ""))
    ) {
      return [`${key}[]=${next.map((item) => encodeScalar(item)).join(",")}`];
    }
    return [
      `${key}[]=`,
      ...next.flatMap((item, index) =>
        diffPaths(undefined, item, [...prefix, String(index)])
      ),
    ];
  }
  const object = next as Record<string, unknown>;
  const previous =
    base && typeof base === "object" && !Array.isArray(base)
      ? (base as Record<string, unknown>)
      : undefined;
  if (!Object.keys(object).length) {
    return [`${key}{}=`];
  }
  const pairs: string[] = [];
  if (
    !previous &&
    prefix.length &&
    Object.values(object).every((value) => value === undefined)
  ) {
    return [`${key}{}=`];
  }
  for (const name of new Set([
    ...Object.keys(previous ?? {}),
    ...Object.keys(object),
  ])) {
    if (object[name] === undefined && previous?.[name] === undefined) {
      continue;
    }
    pairs.push(...diffPaths(previous?.[name], object[name], [...prefix, name]));
  }
  if (!previous || !prefix.length) {
    return pairs;
  }
  // Rewriting the object whole reads better than clearing many members.
  const whole = [
    `${key}{}=`,
    ...Object.keys(object).flatMap((name) =>
      object[name] === undefined
        ? []
        : diffPaths(undefined, object[name], [...prefix, name])
    ),
  ];
  return whole.length < pairs.length ? whole : pairs;
}

/** Text whose setting is text: only quote when the plain form misreads. */
function encodeScalarAsText(value: string) {
  return /^[^\s",=#@+[\]{}][^\s",=]*$/.test(value) &&
    value !== "null" &&
    value !== "unset"
    ? value
    : JSON.stringify(value);
}
