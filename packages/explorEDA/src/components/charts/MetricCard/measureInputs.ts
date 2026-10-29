import { convertFieldValue, type FieldSettingsMap } from "@/lib/fieldSettings";
import type { FieldProfile } from "@/lib/fieldProfiles";
import type { datum } from "@/types/ChartTypes";

export interface MeasureSource {
  rawData: unknown[];
  fieldSettings: FieldSettingsMap;
  profiles: FieldProfile[];
  calculations: { resultColumnName: string }[];
}

/**
 * Each row's raw measure value and why its conversion failed, so a trace
 * can show what the source held. A calculation has no raw value.
 */
export function measureInputs(
  field: string | undefined,
  ids: readonly number[],
  source: MeasureSource
) {
  const rawInputs: Record<number, datum> = {};
  const exclusionReasons: Record<number, string> = {};
  if (
    !field ||
    source.calculations.some((calc) => calc.resultColumnName === field)
  )
    return { rawInputs, exclusionReasons };
  const format = source.fieldSettings[field] ?? {};
  const type =
    format.type ??
    source.profiles.find((profile) => profile.name === field)?.dataType ??
    "categorical";
  for (const id of ids) {
    const raw = (source.rawData[id] as Record<string, datum> | undefined)?.[
      field
    ];
    rawInputs[id] = raw;
    const converted = convertFieldValue(raw, type, format);
    if (converted.error)
      exclusionReasons[id] = `Conversion failed: ${converted.error}`;
  }
  return { rawInputs, exclusionReasons };
}
