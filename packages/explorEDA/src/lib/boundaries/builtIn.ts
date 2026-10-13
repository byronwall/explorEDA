import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { RegionGeometry } from "@/lib/geometryAssets";
import { COUNTRY_CODES, UNCODED_COUNTRIES } from "./countryCodes";
import type { BoundarySet } from "./registry";

/** USPS codes by state FIPS code, including DC and the territories. */
// prettier-ignore
export const STATE_CODES: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
  "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
  "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
  "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY", "60": "AS", "66": "GU", "69": "MP",
  "72": "PR", "78": "VI",
};

type Named = GeometryCollection<{ name: string }>;
function features(
  topology: unknown,
  object: string,
  properties: (id: string, name: string) => Record<string, unknown>
): RegionGeometry {
  const typed = topology as Topology<Record<string, Named>>;
  const collection = feature(typed, typed.objects[object]!);
  return {
    type: "FeatureCollection",
    features: collection.features.map((item) => ({
      type: "Feature",
      ...(item.id === undefined ? {} : { id: String(item.id) }),
      properties: properties(
        item.id === undefined ? "" : String(item.id),
        item.properties?.name ?? ""
      ),
      geometry: item.geometry as RegionGeometry["features"][number]["geometry"],
    })),
  };
}

const json = <T>(module: { default: T } | T) =>
  (module as { default?: T }).default ?? (module as T);

export const BUILT_IN_BOUNDARIES: BoundarySet[] = [
  {
    id: "world-countries",
    name: "World countries",
    source:
      "Natural Earth 1:110m via World Atlas 2.0.2 (public domain); ISO codes from i18n-iso-countries",
    level: "country",
    coverage: "world",
    keys: [
      { property: "iso_a3", label: "ISO alpha-3 code, such as USA" },
      { property: "iso_a2", label: "ISO alpha-2 code, such as US" },
      { property: "iso_n3", label: "ISO numeric code, such as 840" },
      { property: "name", label: "Country name" },
    ],
    load: async () =>
      features(
        json(await import("world-atlas/countries-110m.json")),
        "countries",
        (id, name) => {
          const [iso_a2, iso_a3] = COUNTRY_CODES[id] ??
            UNCODED_COUNTRIES[name] ?? [null, null];
          return { name, iso_a2, iso_a3, iso_n3: id || null };
        }
      ),
  },
  {
    id: "us-states",
    name: "US states",
    source:
      "US Census Bureau cartographic boundaries 1:10m via US Atlas 3.0.1 (ISC)",
    level: "state",
    coverage: "USA",
    keys: [
      { property: "usps", label: "Postal code, such as CA" },
      { property: "fips", label: "FIPS code, such as 06" },
      { property: "name", label: "State name" },
    ],
    load: async () =>
      features(
        json(await import("us-atlas/states-10m.json")),
        "states",
        (fips, name) => ({ name, fips, usps: STATE_CODES[fips] ?? null })
      ),
  },
  {
    id: "us-counties",
    name: "US counties",
    source:
      "US Census Bureau cartographic boundaries 1:10m via US Atlas 3.0.1 (ISC)",
    level: "county",
    coverage: "USA",
    keys: [
      { property: "fips", label: "FIPS code, such as 06037" },
      { property: "label", label: "County and state, such as Los Angeles, CA" },
      { property: "name", label: "County name" },
    ],
    load: async () =>
      features(
        json(await import("us-atlas/counties-10m.json")),
        "counties",
        (fips, name) => {
          const state = STATE_CODES[fips.slice(0, 2)] ?? null;
          return {
            name,
            fips,
            state_fips: fips.slice(0, 2),
            state,
            label: state ? `${name}, ${state}` : name,
          };
        }
      ),
  },
];
