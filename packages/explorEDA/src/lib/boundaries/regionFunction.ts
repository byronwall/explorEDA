import {
  calculationFunctions,
  numericValue,
} from "@/lib/calculations/functions/registry";
import type { CalculationValue } from "@/lib/calculations/types";
import { getLocator, REGION_LEVELS } from "./locate";
import { findBoundarySet } from "./registry";

// Registered from the main thread only: the analysis worker cannot load
// boundaries, which arrive as separate chunks.
calculationFunctions.region = {
  description:
    'Name the region containing a point: "country" (ISO alpha-3), "us-state" (postal code), or "us-county" (FIPS). Add a property such as "name" to return it instead.',
  syntax: 'region(latitude, longitude, "country")',
  minArgs: 3,
  maxArgs: 4,
  evaluate: (latitude, longitude, level, property) => {
    if (
      latitude == null ||
      latitude === "" ||
      longitude == null ||
      longitude === ""
    )
      return null;
    const setId = REGION_LEVELS[String(level)] ?? String(level);
    const set = findBoundarySet(setId);
    if (!set)
      throw new Error(
        `Unknown region level: ${String(level)}. Use ${Object.keys(REGION_LEVELS).join(", ")}`
      );
    const locator = getLocator(setId);
    // Rows stay empty while the boundaries load; the workspace reruns
    // calculations once they arrive.
    if (!locator) return null;
    const lat = numericValue(latitude),
      lon = numericValue(longitude);
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180)
      throw new Error("Coordinates are outside WGS 84 degrees");
    const properties = locator.locate(lon, lat);
    const key = property == null ? set.keys[0]?.property : String(property);
    const value = properties && key ? properties[key] : undefined;
    return value == null ? null : (value as CalculationValue);
  },
};
