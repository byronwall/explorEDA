#!/usr/bin/env node
/**
 * Exact empty-selection fixture verifier — design companion, not product code.
 * Baseline: d3920a285f3755a8324998775deb131747e959f5.
 * Run: node verify-empty-selection-fixtures.mjs [fixtures.json] [--output result.json]
 * Requires Node 18+; no package dependencies or repository checkout.
 *
 * The next section embeds unchanged predicate bodies from the supplied baseline,
 * with TypeScript annotations/module imports removed. DataTable and Bar selection
 * compiler bodies are also exact baseline bodies. Population/candidate plumbing
 * and the limited count/average finding oracle are original test scaffolding.
 * No live Crossfilter, React UI, provider, persistence or history is exercised.
 * Hand-authored expected memberships are stored separately in the JSON file.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


// Baseline d3920a285f3755a8324998775deb131747e959f5: packages/explorEDA/src/lib/valueParsing.ts
/**
 * Every rule for reading raw values as missing, numbers, booleans, or dates.
 * Type detection, conversion, filters, bins, and charts all call these helpers
 * so one value never reads two ways.
 */

// Missing values ------------------------------------------------------------

/**
 * Missing values (null, undefined, and blank or whitespace-only strings) are
 * not measurements.
 */
function isMissingValue(value       )          {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  );
}

// Numbers -------------------------------------------------------------------

// Number() also reads "0x1A", "0b11", and "0o17"; those are labels, not measurements.
const RADIX_PREFIX = /^\s*[+-]?0[xbo]/i;

/**
 * The number a value reads as, or NaN. Booleans, blanks, and radix-prefixed
 * text are not numbers. Non-finite text such as "Infinity" reads as itself.
 */
function parseNumber(value       )         {
  if (typeof value === "number") return value;
  if (typeof value !== "string" || value.trim() === "") return NaN;
  if (RADIX_PREFIX.test(value)) return NaN;
  return Number(value);
}

/**
 * True when a present value reads as a number, finite or not. Booleans are not
 * numbers. Numbers and numeric strings that are not finite (NaN, Infinity,
 * -Infinity) belong to a numeric field but are excluded from measurements,
 * bins, extents, and aggregates.
 */
function isNumberLike(value       )          {
  if (typeof value === "number") return true;
  if (typeof value !== "string" || value.trim() === "") return false;
  return value.trim() === "NaN" || !Number.isNaN(parseNumber(value));
}

const EXACT_NUMBER =
  /^[+-]?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$|^[+-]?\.\d+(?:[eE][+-]?\d+)?$/;
const PLAIN_INTEGER = /^[+-]?\d+$/;
const NON_FINITE = /^[+-]?(?:Infinity|NaN)$/;

/**
 * True when text is a number that a JavaScript number holds without changing
 * it. Leading zeros ("0012") mark identifiers, and integers past 2^53 would
 * round, so both stay text. Thousands separators, radix prefixes, and units
 * are not numbers.
 */
function isExactNumberText(text        )          {
  const value = text.trim();
  if (!EXACT_NUMBER.test(value)) return false;
  const number = Number(value);
  if (!Number.isFinite(number)) return false;
  return !PLAIN_INTEGER.test(value) || Number.isSafeInteger(number);
}

/**
 * True when a present value belongs in a numeric field: a number, exact
 * number text, or NaN and Infinity text, which numeric fields hold but
 * measurements skip.
 */
function isNumericValue(value       )          {
  if (typeof value === "number") return true;
  if (typeof value !== "string") return false;
  return isExactNumberText(value) || NON_FINITE.test(value.trim());
}

                                    
                   
                 
                                    
                          

function numericExclusionReason(
  value       
)                                     {
  if (value === undefined || value === null || value === "") {
    return "Missing value";
  }
  if (typeof value === "boolean") return "Boolean values are not numeric";
  if (typeof value === "string" && value.trim() === "") return "Blank value";
  return Number.isFinite(parseNumber(value))
    ? undefined
    : "Not a finite number";
}

/** The finite measurement for a value, or undefined when it is ineligible. */
function finiteNumber(value       )                     {
  const number = parseNumber(value);
  return Number.isFinite(number) ? number : undefined;
}

/** Finite measurements from a list of values, in input order. */
function finiteNumbers(values                 )           {
  const numbers           = [];
  for (const value of values) {
    const number = finiteNumber(value);
    if (number !== undefined) numbers.push(number);
  }
  return numbers;
}

// Booleans ------------------------------------------------------------------

/** true or false for booleans and "true"/"false" text in any case, else undefined. */
function parseBoolean(value       )                      {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const text = value.trim().toLowerCase();
  return text === "true" ? true : text === "false" ? false : undefined;
}

// Dates ---------------------------------------------------------------------

/**
 * How numeric dates such as 01/02/2025 are read. "iso" accepts only ISO dates
 * and date-times. Without a preset, ISO, month-first numeric dates, and
 * month-name dates are all accepted.
 */
                                                                     

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
const MONTH_NAME =
  /^(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?$/i;
const WEEKDAY = /^(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?$/i;

// 08:00, 8:00:05.250, 8:00 PM, 08:00:00Z, 08:00+05:30, 08:00 GMT
const TIME =
  /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(?:\s*([ap])\.?m\.?)?\s*(z|utc|gmt|[+-]\d{2}:?\d{2})?$/i;
const ISO = /^(\d{4})-(\d{2})(?:-(\d{2}))?(?:[T ](.+))?$/i;
const YEAR_FIRST = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[T ](.+))?$/i;
const YEAR_LAST = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})(?:[T ](.+))?$/i;

function calendarTime(
  year        ,
  month        ,
  day        ,
  time = 0
)         {
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCFullYear(year);
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date.getTime() + time
    : NaN;
}

/** Milliseconds into the day, shifted to UTC by any offset; NaN when invalid. */
function timeOfDay(text                    )         {
  if (text === undefined) return 0;
  const match = TIME.exec(text.trim());
  if (!match) return NaN;
  const [, hourText, minuteText, secondText, fraction, meridiem, zone] = match;
  let hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText ?? 0);
  if (meridiem) {
    if (hour < 1 || hour > 12) return NaN;
    hour = (hour % 12) + (meridiem.toLowerCase() === "p" ? 12 : 0);
  }
  if (hour > 23 || minute > 59 || second > 59) return NaN;
  const ms = fraction ? Math.round(Number(`0.${fraction}`) * 1000) : 0;
  let offset = 0;
  if (zone && /^[+-]/.test(zone)) {
    const digits = zone.replace(":", "");
    const minutes = Number(digits.slice(1, 3)) * 60 + Number(digits.slice(3));
    offset = (zone.startsWith("-") ? -1 : 1) * minutes * 60_000;
  }
  return ((hour * 60 + minute) * 60 + second) * 1000 + ms - offset;
}

function fullYear(text        )         {
  const year = Number(text);
  if (text.length === 4) return year;
  return year < 50 ? 2000 + year : 1900 + year;
}

function monthNameDate(text        )         {
  // Jan 15 2025, January 15, 2025, 15 Jan 2025, Wed, 15 Jan 2025 08:00:00 GMT
  const tokens = text.split(/[\s,]+/).filter(Boolean);
  if (tokens[0] && WEEKDAY.test(tokens[0])) tokens.shift();
  const [first = "", second = "", yearText = "", ...rest] = tokens;
  const firstMonth = MONTH_NAME.exec(first);
  const secondMonth = MONTH_NAME.exec(second);
  const monthText = firstMonth?.[1] ?? secondMonth?.[1];
  const dayText = firstMonth ? second : first;
  if (!monthText || !/^\d{1,2}$/.test(dayText) || !/^\d{4}$/.test(yearText)) {
    return NaN;
  }
  const month = MONTHS.indexOf(monthText.slice(0, 3).toLowerCase()) + 1;
  return calendarTime(
    Number(yearText),
    month,
    Number(dayText),
    timeOfDay(rest.length ? rest.join(" ") : undefined)
  );
}

/**
 * Milliseconds since the epoch for date text, or NaN when the text is not a
 * date. Unlike Date.parse, this rejects labels like "Depot 2" and impossible
 * days like 2025-02-30, and reads every form without an offset as UTC.
 */
function parseDateText(value        , preset             )         {
  const text = value.trim();

  const iso = ISO.exec(text);
  if (iso) {
    const [, year, month, day, time] = iso;
    if (day === undefined && time !== undefined) return NaN;
    return calendarTime(
      Number(year),
      Number(month),
      Number(day ?? 1),
      timeOfDay(time)
    );
  }
  if (preset === "iso") return NaN;

  const yearLast = YEAR_LAST.exec(text);
  if (yearLast) {
    const [, first, second, year, time] = yearLast;
    if (preset !== undefined && year .length !== 4) return NaN;
    const dayFirst = preset === "day-month-year";
    return calendarTime(
      fullYear(year ),
      Number(dayFirst ? second : first),
      Number(dayFirst ? first : second),
      timeOfDay(time)
    );
  }
  if (preset !== undefined) return NaN;

  const yearFirst = YEAR_FIRST.exec(text);
  if (yearFirst) {
    const [, year, month, day, time] = yearFirst;
    return calendarTime(
      Number(year),
      Number(month),
      Number(day),
      timeOfDay(time)
    );
  }
  return monthNameDate(text);
}

/**
 * A date filter bound. A date-only upper bound such as 2025-01-31 covers that
 * whole day.
 */
function dateBound(text        , end = false)         {
  const trimmed = text.trim();
  return parseDateText(
    end && /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
      ? `${trimmed}T23:59:59.999Z`
      : trimmed
  );
}

/** True when text reads as a date under {@link parseDateText}. */
function isDateText(value        , preset             )          {
  return Number.isFinite(parseDateText(value, preset));
}

/**
 * The timestamp for a date value: finite numbers are already timestamps and
 * text goes through {@link parseDateText}. Undefined for anything else.
 */
function timestampOf(value              )                     {
  const time =
    value instanceof Date
      ? value.getTime()
      : typeof value === "number"
        ? value
        : typeof value === "string"
          ? parseDateText(value)
          : NaN;
  return Number.isFinite(time) ? time : undefined;
}




// Baseline d3920a285f3755a8324998775deb131747e959f5: packages/explorEDA/src/lib/categories.ts
const categoryValue = (value       )        => value ?? null;
const MISSING_KEY = JSON.stringify(["missing"]);
const TRUE_KEY = JSON.stringify(["boolean", true]);
const FALSE_KEY = JSON.stringify(["boolean", false]);
// Charts key every row, so string keys are kept rather than serialized
// again. The cache starts over once a field has very many distinct values.
const STRING_KEY_LIMIT = 10_000;
const stringKeys = new Map                ();

/**
 * A key that keeps values of different types apart, such as 1 and "1". It
 * is the JSON text of `[typeof value, value]`, built without serializing a
 * finite number or a seen string again.
 */
const categoryKey = (value       )         => {
  if (value == null) return MISSING_KEY;
  if (typeof value === "number") {
    // A finite number's JSON text is its string form, with -0 as "0".
    return Number.isFinite(value)
      ? `["number",${value}]`
      : JSON.stringify(["number", String(value)]);
  }
  if (typeof value === "boolean") return value ? TRUE_KEY : FALSE_KEY;
  let key = stringKeys.get(value);
  if (key === undefined) {
    if (stringKeys.size >= STRING_KEY_LIMIT) stringKeys.clear();
    key = `["string",${JSON.stringify(value)}]`;
    stringKeys.set(value, key);
  }
  return key;
};

function categoryEqual(left       , right       )          {
  return (
    (left == null && right == null) ||
    left === right ||
    (typeof left === "number" &&
      typeof right === "number" &&
      Number.isNaN(left) &&
      Number.isNaN(right))
  );
}

function categoryIncludes(values         , value       )          {
  return (
    values.includes(value) ||
    (value == null && values.some((item) => item == null))
  );
}

function categoryLabel(value       )         {
  if (value == null) return "(missing)";
  if (
    typeof value === "string" &&
    (!value.trim() ||
      !Number.isNaN(Number(value)) ||
      /^(true|false|null|undefined|NaN|Other categories|\(missing\))$/.test(
        value
      ) ||
      value.startsWith('"'))
  )
    return JSON.stringify(value);
  return String(value);
}




// Baseline d3920a285f3755a8324998775deb131747e959f5: packages/explorEDA/src/lib/specification.ts
/** Inclusive specification limits. Either side may be absent. */
                             
                 
                 
 

                                                      

const SPEC_REGIONS                        = [
  "below",
  "within",
  "above",
  "outside",
];

/**
 * Where a value sits against the limits. Limits include equality: below is
 * x < lower and above is x > upper. Missing and non-numeric values have no
 * status.
 */
function specStatus(
  value       ,
  limits            
)                         {
  const number = finiteNumber(value);
  if (number === undefined) return undefined;
  if (limits.lower !== undefined && number < limits.lower) return "below";
  if (limits.upper !== undefined && number > limits.upper) return "above";
  return "within";
}

/** Whether a value lies in a region. Outside joins both tails. */
function inSpecRegion(
  value       ,
  region            ,
  limits                        
) {
  const status = specStatus(value, limits ?? {});
  if (!status) return false;
  return region === "outside" ? status !== "within" : status === region;
}

/** The limits a chart's histogram saves, if any. */
function chartSpec(chart        )                         {
  return (chart                                         ).histogram?.spec;
}

/** Why limits are unusable: non-finite, or lower above upper. */
function specProblem(limits            ) {
  const { lower, upper } = limits;
  if (
    (lower !== undefined && !Number.isFinite(lower)) ||
    (upper !== undefined && !Number.isFinite(upper))
  )
    return "Limits must be finite numbers.";
  if (lower !== undefined && upper !== undefined && lower > upper)
    return "The lower limit is above the upper limit.";
  return undefined;
}




// Baseline d3920a285f3755a8324998775deb131747e959f5: packages/explorEDA/src/hooks/applyFilter.ts
/**
 * Whether a value passes a filter. A spec-status filter reads the limits of
 * the chart that owns it, passed as `spec`; without limits only Within can
 * match.
 */
function applyFilter(
  value       ,
  filter        ,
  spec             
)          {
  switch (filter.type) {
    case "spec-status":
      return inSpecRegion(value, filter.region, spec);
    case "value":
      // A missing entry matches every missing value, blank text included.
      return (
        categoryIncludes(filter.values, value) ||
        (isMissingValue(value) && filter.values.some((item) => item == null))
      );
    case "range":
      if (
        typeof value === "number" ||
        (typeof value === "string" && value.trim() !== "")
      ) {
        const number = finiteNumber(value);
        if (number === undefined) {
          return false;
        }
        return (
          (filter.min === undefined ||
            (filter.minExclusive
              ? number > filter.min
              : number >= filter.min)) &&
          (filter.max === undefined ||
            (filter.maxExclusive ? number < filter.max : number <= filter.max))
        );
      }
      break;
    case "text":
      if (typeof value === "string") {
        const lower = value.toLowerCase();
        const search = filter.value.toLowerCase();

        switch (filter.operator) {
          case "contains":
            return lower.includes(search);
          case "equals":
            return lower === search;
          case "startsWith":
            return lower.startsWith(search);
          case "endsWith":
            return lower.endsWith(search);
        }
      }
      break;
    case "date-range": {
      const timestamp = timestampOf(value);
      if (timestamp === undefined) {
        return false;
      }

      const min = filter.min === undefined ? undefined : dateBound(filter.min);
      const max =
        filter.max === undefined ? undefined : dateBound(filter.max, true);

      return (
        (min === undefined || (!Number.isNaN(min) && timestamp >= min)) &&
        (max === undefined || (!Number.isNaN(max) && timestamp <= max))
      );
    }
  }

  return false;
}




// Baseline d3920a285f3755a8324998775deb131747e959f5: packages/explorEDA/src/lib/chartPopulation.ts
                                                           

/** True when the chart draws only some rows, whatever other charts select. */
function hasLocalFilters(
  chart                                         
) {
  return Boolean(chart.localFilters?.length);
}

/**
 * Tests whether a row belongs to the chart's own population. Returns
 * undefined when the chart draws every row. A filter on a field that has no
 * values matches no rows, so a broken restriction never widens the chart.
 */
function getPopulationTest(
  chart                                         ,
  fieldGetter             
)                                        {
  if (!hasLocalFilters(chart)) {
    return undefined;
  }
  const active = chart.localFilters .map((filter) => ({
    filter,
    values: fieldGetter(filter.field),
  }));
  // A spec-status restriction reads this chart's own limits.
  const spec = chartSpec(chart);
  return (id) =>
    active.every(({ filter, values }) => applyFilter(values[id], filter, spec));
}

/** Keeps the ids in the chart's population, or every id without one. */
function restrictToPopulation(
  ids          ,
  chart                                         ,
  fieldGetter             
)           {
  const test = getPopulationTest(chart, fieldGetter);
  return test ? ids.filter(test) : ids;
}




// Baseline d3920a285f3755a8324998775deb131747e959f5: packages/explorEDA/src/components/charts/DataTable/filteredRows.ts
                                                                  

function getFilteredRows(
  data                ,
  liveItems                      ,
  settings                   
)                 {
  const ids = new Set(
    liveItems?.items.filter((item) => item.value > 0).map((item) => item.key)
  );
  const rows = data.filter((row) => ids.has(row.__ID));
  const search = settings.globalSearch.toLowerCase();

  const filtered = rows.filter((row) => {
    if (
      search &&
      !Object.entries(row).some(
        ([field, value]) =>
          field !== "__ID" &&
          value !== null &&
          value !== undefined &&
          String(value).toLowerCase().includes(search)
      )
    ) {
      return false;
    }

    return settings.filters.every((filter) =>
      applyFilter(row[filter.field], filter)
    );
  });
  if (settings.sortBy) {
    const field = settings.sortBy;
    filtered.sort((a, b) => {
      const comparison = compareValues(a[field], b[field]);
      return settings.sortDirection === "desc" ? -comparison : comparison;
    });
  }
  return filtered;
}

// Helper function to compare values with natural sort
function compareValues(a       , b       )         {
  if (a == null && b == null) return 0;
  // Handle null/undefined values
  if (a === null || a === undefined) {
    return 1;
  }
  if (b === null || b === undefined) {
    return -1;
  }
  if (a === b) {
    return 0;
  }

  // Convert to strings for comparison if not numeric
  const aStr = String(a);
  const bStr = String(b);

  // If both values are numeric, compare as numbers
  const aNumber = parseNumber(a);
  const bNumber = parseNumber(b);
  if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
    return aNumber - bNumber;
  }

  // For strings, use localeCompare for natural sort
  return aStr.localeCompare(bStr, undefined, { numeric: true });
}




// Exact source predicate body: DataTable/definition.ts
function compileDataTableSelection(settings     , fieldGetter     ) {
    // If no filters are active, return true
    if (settings.filters.length === 0) {
      return () => true;
    }

    // A hidden column keeps filtering, as it does in the table's own rows.
    const filterFunctions = settings.filters.map((filter) => {
      const dataHash = fieldGetter(filter.field);

      return (d        ) => {
        const value = dataHash[d];
        return applyFilter(value, filter);
      };
    });

    // Combine all filter functions with AND logic
    return (d        ) => filterFunctions.every((fn) => fn(d));
  }

// Exact source predicate body: BarChart/definition.ts
function compileBarSelection(settings     , fieldGetter     ) {
    if (settings.seriesField) {
      const active = settings.filters.map((filter) => ({
        filter,
        data: fieldGetter(filter.field),
      }));
      return (id        ) =>
        active.every(({ filter, data }) => applyFilter(data[id], filter));
    }
    if (settings.aggregateId) {
      // A grouped bar selects groups with a value filter on its group field
      // and keeps an optional measure range from the Selection tab.
      const range = [...settings.filters]
        .reverse()
        .find((f) => f.type === "range" || f.type === "date-range");
      const active = [
        ...settings.filters.filter((f) => f.type === "value"),
        ...(range ? [range] : []),
      ].map((filter) => ({ filter, data: fieldGetter(filter.field) }));
      return (d        ) =>
        active.every(({ filter, data }) => applyFilter(data[d], filter));
    }
    // Every predicate on the measurement must hold: a bin range and a
    // specification status can both narrow it.
    const own = settings.filters.filter(
      (f)              => f.field === settings.field
    );
    const dataHash = fieldGetter(settings.field);
    const spec = settings.histogram?.spec;

    return (d        ) => {
      const value = dataHash[d];
      return own.every((filter) => applyFilter(value, filter, spec));
    };
  }

// ---- Original test-only population/candidate oracle -----------------------

const filename = process.argv[2] && !process.argv[2].startsWith('--')
  ? path.resolve(process.argv[2])
  : fileURLToPath(new URL('./empty-selection-fixtures.json', import.meta.url));
const outputIndex = process.argv.indexOf('--output');
const outputFilename = outputIndex < 0 ? undefined : process.argv[outputIndex + 1];
if (outputIndex >= 0 && !outputFilename) throw new Error('--output requires a path');

function decode(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(decode);
  if (Object.keys(value).length === 1 && '$fixtureValue' in value) {
    switch (value.$fixtureValue) {
      case 'undefined': return undefined;
      case 'NaN': return NaN;
      case 'Infinity': return Infinity;
      case '-Infinity': return -Infinity;
      case '-0': return -0;
      default: throw new Error(`Unknown fixture datum ${value.$fixtureValue}`);
    }
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decode(item)]));
}

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function compileSelection(chart, column) {
  if (chart.type === 'data-table') return compileDataTableSelection(chart, column);
  if (chart.type === 'bar') return compileBarSelection(chart, column);
  throw new Error(`Unsupported fixture chart type ${chart.type}; add an exact source adapter`);
}

function makeEvaluation(snapshot) {
  const ids = snapshot.rows.map((_, index) => index);
  const resolvedRows = snapshot.rows.map((row, index) => ({
    ...row,
    ...Object.fromEntries(Object.entries(snapshot.derivedColumns ?? {}).map(([field, values]) => [field, values[index]])),
    __ID: index,
  }));
  const cache = new Map();
  const column = field => {
    if (cache.has(field)) return cache.get(field);
    const values = Object.fromEntries(resolvedRows.map(row => [row.__ID, row[field]]));
    cache.set(field, values);
    return values;
  };
  const chartById = new Map(snapshot.charts.map(chart => [chart.id, chart]));
  const selection = new Map(snapshot.charts.map(chart => [chart.id, compileSelection(chart, column)]));
  const local = new Map(snapshot.charts.map(chart => [chart.id, getPopulationTest(chart, column) ?? (() => true)]));
  // The real wrapper stores workspace dimensions by field; last occurrence wins.
  const workspaceFilters = [...new Map(snapshot.workspaceFilters.map(filter => [filter.field, filter])).values()];
  const tests = workspaceFilters.map(filter => ({filter, values: column(filter.field)}));
  const inWorkspace = id => tests.every(({filter,values}) => applyFilter(values[id], filter));
  const linked = (id, excludedChart) => snapshot.localSelections || snapshot.charts.every(chart => chart.id === excludedChart || selection.get(chart.id)(id));
  const workspace = ids.filter(id => inWorkspace(id) && linked(id));
  const populations = new Map([['workspace', workspace]]);
  for (const chart of snapshot.charts) {
    const context = ids.filter(id => inWorkspace(id) && linked(id, chart.id) && local.get(chart.id)(id));
    populations.set(`context:${chart.id}`, context);
    populations.set(`selected:${chart.id}`, context.filter(selection.get(chart.id)));
    if (chart.type === 'data-table') {
      const live = {items: context.map(key => ({key,value:1})),nonce:0};
      populations.set(`table:${chart.id}`, getFilteredRows(resolvedRows, live, chart).map(row => row.__ID));
    }
  }
  const live = {items:workspace.map(key => ({key,value:1})),nonce:0};
  const rowSettings = {sortDirection:'asc',...snapshot.rowsSettings};
  populations.set('rows', getFilteredRows(resolvedRows, live, rowSettings).map(row => row.__ID));
  const external = list => list.map(id => snapshot.rows[id].recordId);
  const get = target => {
    if (!populations.has(target)) throw new Error(`Unknown fixture target ${target}`);
    return populations.get(target);
  };
  return {ids,resolvedRows,column,selection,local,chartById,populations,get,external};
}

function removeFromSnapshot(snapshot, operations) {
  const supported = new Set(['workspace-filter','chart-selection','chart-filter-clause','chart-local-filter','rows-filter','rows-search','table-search']);
  for (const operation of operations) {
    if (!supported.has(operation.kind)) throw new Error(`Unknown removal ${operation.kind}`);
  }
  const next = structuredClone(snapshot);
  next.workspaceFilters = next.workspaceFilters.filter(filter => !operations.some(op => op.kind === 'workspace-filter' && op.field === filter.field));
  next.charts = next.charts.map(chart => {
    const removeSelection = operations.some(op => op.kind === 'chart-selection' && op.chartId === chart.id);
    chart.filters = removeSelection ? [] : chart.filters.filter((_, index) => !operations.some(op => op.kind === 'chart-filter-clause' && op.chartId === chart.id && op.index === index));
    if (chart.localFilters) chart.localFilters = chart.localFilters.filter((_, index) => !operations.some(op => op.kind === 'chart-local-filter' && op.chartId === chart.id && op.index === index));
    if (operations.some(op => op.kind === 'table-search' && op.chartId === chart.id)) chart.globalSearch = '';
    return chart;
  });
  next.rowsSettings.filters = next.rowsSettings.filters.filter((_, index) => !operations.some(op => op.kind === 'rows-filter' && op.index === index));
  if (operations.some(op => op.kind === 'rows-search')) next.rowsSettings.globalSearch = '';
  return next;
}

const subset = (before, after) => {
  const present = new Set(after);
  return before.every(id => present.has(id));
};

function transitionIsMonotone(before, after) {
  // Checking only an empty target is vacuous. Check owner predicates over U.
  for (const [chartId, select] of before.selection) {
    if (!subset(before.ids.filter(select), after.ids.filter(after.selection.get(chartId)))) return false;
    if (!subset(before.ids.filter(before.local.get(chartId)), after.ids.filter(after.local.get(chartId)))) return false;
  }
  for (const [target, previous] of before.populations) {
    if (!subset(previous, after.get(target))) return false;
  }
  return true;
}

function classify(fixture, evaluation) {
  const probe = fixture.reasonProbe;
  if (!probe) return undefined;
  if (!evaluation.ids.length) return {reason:'empty-source',plottable:[]};
  if (probe.configured === false) return {reason:'setup-required',plottable:[]};
  const target = evaluation.get(fixture.target);
  if (!target.length) return {reason:'empty-selection',plottable:[]};
  if (probe.kind === 'finite-xy') {
    const plottable = target.filter(id => probe.fields.every(field => finiteNumber(evaluation.column(field)[id]) !== undefined));
    return {reason:plottable.length ? 'has-plottable-values' : 'no-plottable-values',plottable};
  }
  return {reason:'has-rows',plottable:target};
}

function findingOracle(evaluation, definition) {
  const base = definition.chart
    ? evaluation.get(`${definition.population === 'eligible' ? 'context' : 'selected'}:${definition.chart}`)
    : evaluation.ids;
  const conditions = (definition.filters ?? []).map(filter => ({filter,values:evaluation.column(filter.field)}));
  const ids = base.filter(id => conditions.every(({filter,values}) => applyFilter(values[id],filter)));
  if (definition.aggregation === 'count') return {ids,value:ids.length,contributors:ids};
  if (definition.aggregation !== 'average') throw new Error('Finding oracle intentionally supports count and average only');
  const values = evaluation.column(definition.field);
  const contributors = ids.filter(id => finiteNumber(values[id]) !== undefined);
  if (!ids.length) return {ids,unavailable:'empty',contributors};
  if (!contributors.length) return {ids,unavailable:'invalid',contributors};
  const value = contributors.reduce((sum,id) => sum + finiteNumber(values[id]),0) / contributors.length;
  return {ids,value,contributors};
}

let assertions = 0;
const check = (actual, expected, label) => {
  assert.deepStrictEqual(actual, expected, label);
  assertions++;
};
const checkMembership = (evaluation, ids, expected, label) => {
  check(evaluation.external(ids), expected.ids, `${label}: exact record IDs`);
  check(ids.length, expected.count, `${label}: exact count`);
};
const suite = decode(JSON.parse(fs.readFileSync(filename,'utf8')));
check(suite.baseline,'d3920a285f3755a8324998775deb131747e959f5','baseline identity');
const results=[];
for (const fixture of suite.fixtures) {
  const before = structuredClone(fixture.snapshot);
  freezeDeep(fixture.snapshot);
  const evaluation = makeEvaluation(fixture.snapshot);
  check(new Set(fixture.snapshot.rows.map(row => row.recordId)).size,fixture.snapshot.rows.length,`${fixture.id}: unique fixture keys`);
  checkMembership(evaluation,evaluation.get(fixture.target),fixture.expected,fixture.id);
  for (const [target,expected] of Object.entries(fixture.populationChecks ?? {})) {
    checkMembership(evaluation,evaluation.get(target),expected,`${fixture.id}/${target}`);
  }
  for (const predicate of fixture.predicateChecks ?? []) {
    const values = evaluation.column(predicate.field);
    const ids = evaluation.ids.filter(id => applyFilter(values[id],predicate.filter,predicate.spec));
    checkMembership(evaluation,ids,predicate.expected,`${fixture.id}/predicate ${JSON.stringify(predicate.filter)}`);
  }
  for (const preview of fixture.previews) {
    const next = makeEvaluation(removeFromSnapshot(fixture.snapshot,preview.remove));
    const ids = next.get(fixture.target);
    const currentIds = evaluation.get(fixture.target);
    const label = `${fixture.id}/${preview.label}`;
    checkMembership(next,ids,preview.expected,label);
    if ('expectedAdded' in preview) check(next.external(ids.filter(id => !currentIds.includes(id))),preview.expectedAdded,`${label}: gained records`);
    if ('expectedRemoved' in preview) check(evaluation.external(currentIds.filter(id => !ids.includes(id))),preview.expectedRemoved,`${label}: lost records`);
    if ('expectedMonotone' in preview) check(transitionIsMonotone(evaluation,next),preview.expectedMonotone,`${label}: full-owner and surface containment`);
    if ('expectedNoOp' in preview) check(JSON.stringify(ids) === JSON.stringify(currentIds),preview.expectedNoOp,`${label}: target-membership no-op`);
  }
  for (const variant of fixture.variants ?? []) {
    const nextSnapshot={...structuredClone(fixture.snapshot),...structuredClone(variant.replace)};
    const next = makeEvaluation(nextSnapshot);
    checkMembership(next,next.get(fixture.target),variant.expected,`${fixture.id}/${variant.label}`);
  }
  for (const finding of fixture.findingChecks ?? []) {
    const next = finding.remove ? makeEvaluation(removeFromSnapshot(fixture.snapshot,finding.remove)) : evaluation;
    const result = findingOracle(next,finding.definition);
    const label = `${fixture.id}/${finding.label}`;
    checkMembership(next,result.ids,finding.expected,label);
    check(result.value,finding.expected.value,`${label}: summary value`);
    check(result.unavailable,finding.expected.unavailable,`${label}: unavailable reason`);
    if ('expectedContributors' in finding) check(next.external(result.contributors),finding.expectedContributors,`${label}: valid numeric contributors`);
  }
  const state = classify(fixture,evaluation);
  if (state) {
    check(state.reason,fixture.expectedReason,`${fixture.id}: empty-state classification contract`);
    if (fixture.expectedPlottable) checkMembership(evaluation,state.plottable,fixture.expectedPlottable,`${fixture.id}: eligible coordinate records`);
  }
  // This verifies this companion's immutable evaluation. It does not simulate a
  // Cancel button, dialog dismissal, product callbacks, or history integration.
  check(fixture.snapshot,before,`${fixture.id}: read-only companion evaluation leaves baseline snapshot unchanged`);
  results.push({id:fixture.id,title:fixture.title,status:'passed',previewCases:fixture.previews.length});
  console.log(`[pass] ${fixture.id} ${fixture.title}`);
}
const report={
  baseline:suite.baseline,status:'passed',scenarioCount:results.length,assertionCount:assertions,
  previewCaseCount:results.reduce((sum,result)=>sum+result.previewCases,0),
  checks:'Exact baseline pure predicates, exact DataTable/Bar selection compiler bodies, and original population/candidate oracle against separately hand-authored expected records.',
  limits:'No live Crossfilter, React/browser rendering, real store callbacks, saved-data writeback, held-edit lifecycle or history integration was executed. Finding count/average and state classification checks are explicit test oracles.',
  results,
};
if (outputFilename) fs.writeFileSync(outputFilename,JSON.stringify(report,null,2)+'\n');
console.log(`[verified] ${results.length} scenarios; ${report.previewCaseCount} preview alternatives; ${assertions} assertions. Product integration remains proposed.`);
