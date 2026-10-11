import { chartSettingsReference } from "exploreda/docs-kit";
import { labelClass } from "../components/chrome";
import { describeSetting } from "./settingDescriptions";

/** A default as short text; settings with structure name their kind. */
export function formatDefault(value: unknown): string {
  if (value === undefined || value === "") {
    return "—";
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? "none" : `${value.length} items`;
  }
  if (typeof value === "object" && value !== null) {
    return "object";
  }
  return String(value);
}

/**
 * Every saved setting of a chart type, its line, and its value in a new chart.
 * The keys and defaults come from the library, so the table never drifts.
 */
export function SettingsReference({ type }: { type: string }) {
  const settings = chartSettingsReference(type);
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-border">
      <table
        aria-label={`Saved settings of a ${type} chart`}
        className="w-full min-w-[34rem] border-collapse text-sm"
      >
        <thead className="bg-muted/50 text-left">
          <tr>
            <th scope="col" className={`px-3 py-2 ${labelClass}`}>
              Setting
            </th>
            <th scope="col" className={`px-3 py-2 ${labelClass}`}>
              What it does
            </th>
            <th scope="col" className={`px-3 py-2 ${labelClass}`}>
              New chart
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {settings.map(({ key, defaultValue }) => (
            <tr key={key} data-setting={key}>
              <th scope="row" className="px-3 py-2 text-left align-top">
                <code className="font-mono text-[0.85rem] text-foreground">
                  {key}
                </code>
              </th>
              <td className="px-3 py-2 align-top leading-6 text-muted-foreground">
                {describeSetting(type, key)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 align-top font-mono text-[0.85rem] tabular-nums text-muted-foreground">
                {formatDefault(defaultValue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
