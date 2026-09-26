import { parseCsvData } from "./csvParser";
import { parseJsonData } from "./jsonParser";
import type { DatumObject } from "./LandingPage";

export function isSupportedDataFile(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".csv") || name.endsWith(".json");
}

/** Parses a user's CSV or JSON file into rows, or throws with a reason. */
export async function readDataFile(file: File): Promise<DatumObject[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    return parseCsvData(file);
  }
  if (name.endsWith(".json")) {
    return parseJsonData(file);
  }
  throw new Error("Unsupported file type");
}
