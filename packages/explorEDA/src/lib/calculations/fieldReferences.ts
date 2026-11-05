import { shortFieldName } from "@/lib/fieldRanking";

export interface FieldName {
  id: string;
  label: string;
}

const REFERENCE = /\[\s*("(?:[^"\\]|\\.)*")\s*\]/g;

/** The fields a typed name can mean: exact id, then a label, then a short id. */
export function matchField(name: string, fields: FieldName[]) {
  if (fields.some((field) => field.id === name)) return [name];
  const lower = name.trim().toLowerCase();
  const byLabel = fields.filter((field) => field.label.toLowerCase() === lower);
  if (byLabel.length) return byLabel.map((field) => field.id);
  return fields
    .filter((field) => shortFieldName(field.id).toLowerCase() === lower)
    .map((field) => field.id);
}

/**
 * The formula with each `["name"]` written as a field id, so `["Sack"]` reads
 * `["qb_dropbacks.sack"]`. A name that fits several fields is an error; a name
 * that fits none stays for validation to report.
 */
export function resolveFieldReferences(input: string, fields: FieldName[]) {
  return input.replace(REFERENCE, (whole, quoted: string) => {
    const name = JSON.parse(quoted) as string;
    const ids = matchField(name, fields);
    if (ids.length > 1) {
      throw new Error(
        `Field "${name}" matches ${ids.length} fields: ${ids.join(", ")}. Use one of these ids.`
      );
    }
    return ids.length && ids[0] !== name
      ? `[${JSON.stringify(ids[0])}]`
      : whole;
  });
}
