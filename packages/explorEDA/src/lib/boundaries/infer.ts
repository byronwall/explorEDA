import { COUNTRY_CODES, UNCODED_COUNTRIES } from "./countryCodes";
import { STATE_CODES } from "./builtIn";

/** A field whose values look like keys of a supplied boundary set. */
export interface RegionMatch {
  field: string;
  setId: string;
  featureKey: string;
  /** Share of the field's distinct values that are valid keys. */
  share: number;
}

const codes = [
  ...Object.values(COUNTRY_CODES),
  ...Object.values(UNCODED_COUNTRIES),
];
const KINDS: {
  setId: string;
  featureKey: string;
  test: (value: string) => boolean;
}[] = [
  {
    setId: "us-counties",
    featureKey: "fips",
    test: (value) => /^\d{5}$/.test(value) && value.slice(0, 2) in STATE_CODES,
  },
  {
    setId: "us-states",
    featureKey: "fips",
    test: (value) => /^\d{2}$/.test(value) && value in STATE_CODES,
  },
  {
    setId: "us-states",
    featureKey: "usps",
    test: (value) => Object.values(STATE_CODES).includes(value),
  },
  {
    setId: "world-countries",
    featureKey: "iso_a3",
    test: (value) => codes.some(([, alpha3]) => alpha3 === value),
  },
  {
    setId: "world-countries",
    featureKey: "iso_a2",
    test: (value) => codes.some(([alpha2]) => alpha2 === value),
  },
];

/**
 * Picks the field and boundary set that most of a field's text values
 * join to. Only text keys qualify: joins are exact, and a number such as
 * 6037 has lost the leading zero its FIPS key needs.
 */
export function inferRegionField(
  fields: { field: string; values: unknown[] }[],
  /** Only consider these boundary sets. */
  setIds?: string[]
): RegionMatch | undefined {
  let best: RegionMatch | undefined;
  for (const { field, values } of fields) {
    const distinct = [
      ...new Set(values.filter((value) => typeof value === "string")),
    ] as string[];
    if (distinct.length < 2) continue;
    for (const kind of KINDS) {
      if (setIds && !setIds.includes(kind.setId)) continue;
      const share = distinct.filter(kind.test).length / distinct.length;
      if (share >= 0.8 && share > (best?.share ?? 0))
        best = { field, setId: kind.setId, featureKey: kind.featureKey, share };
    }
  }
  return best;
}
