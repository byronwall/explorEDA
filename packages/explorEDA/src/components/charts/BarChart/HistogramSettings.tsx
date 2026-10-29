import { useEffect, useState } from "react";
import { tickStep } from "d3-array";
import { useHeldTyping } from "@/components/settings/annotations/annotationInputs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Choice } from "@/components/settings/annotations/annotationInputs";
import { finiteNumbers, parseNumber } from "@/lib/valueParsing";
import { useGetColumnDataForIds } from "../useGetColumnData";
import type { BarChartSettings, HistogramSettings } from "./definition";
import {
  edgeAt,
  fitIndices,
  indexAtOrAbove,
  indexAtOrBelow,
  widthEdges,
  widthProblem,
  type WidthBinning,
} from "./histogramBins";

/**
 * A number typed in place: valid text applies at once, and the whole edit
 * is one undo step. Invalid text stays in the field, marked, and changes
 * nothing.
 */
function NumberField({
  label,
  value,
  onCommit,
  valid = (number) => Number.isFinite(number),
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
  valid?: (value: number) => boolean;
}) {
  const typing = useHeldTyping();
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);
  const number = parseNumber(text);
  return (
    <Input
      aria-label={label}
      inputMode="decimal"
      value={text}
      aria-invalid={!valid(number)}
      className="h-7 min-w-0 aria-[invalid=true]:border-destructive"
      onFocus={() => {
        setFocused(true);
        typing.onFocus();
      }}
      onBlur={() => {
        setFocused(false);
        typing.onBlur();
      }}
      onChange={(event) => {
        setText(event.target.value);
        const next = parseNumber(event.target.value);
        if (valid(next)) onCommit(next);
      }}
    />
  );
}

/** A round width that gives about `count` bins over the values. */
function startingWidth(values: number[], count: number) {
  if (!values.length) return 1;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const step = tickStep(low, high === low ? low + 1 : high, count);
  return step > 0 && Number.isFinite(step) ? step : 1;
}

/** The Bins section of a histogram's settings: auto count or a saved grid. */
export function HistogramSettingsSection({
  settings,
  onSettingsChange,
}: {
  settings: BarChartSettings;
  onSettingsChange: (settings: BarChartSettings) => void;
}) {
  const source = finiteNumbers(useGetColumnDataForIds(settings.field));
  const binning = settings.histogram?.binning;
  const width = binning?.mode === "width" ? binning : undefined;
  const setHistogram = (histogram: HistogramSettings | undefined) =>
    onSettingsChange({ ...settings, histogram });
  const setBinning = (next: WidthBinning) =>
    setHistogram({ ...settings.histogram, binning: next });
  const fit = (next: Pick<WidthBinning, "width" | "origin">) =>
    setBinning({
      mode: "width",
      ...next,
      ...fitIndices(source, next.width, next.origin),
    });
  const result = width ? widthEdges(width) : undefined;
  const problem = result && "problem" in result ? result.problem : undefined;

  return (
    <section aria-label="Bins" className="eda-setting-section">
      <h5>Bins</h5>
      <div className="eda-setting-grid">
        <span className="eda-setting-label">Edges</span>
        <Choice
          label="Bin edges"
          value={width ? "width" : "auto"}
          options={[
            {
              value: "auto",
              label: "Auto",
              help: "Picks edges from the data for about the bin count you set. Edges move when the data changes.",
            },
            {
              value: "width",
              label: "Width",
              help: "Saves equal bins of a width you choose, lined up with an origin. Edges and selections stay put when the data changes.",
            },
          ]}
          onChange={(mode) => {
            if (mode === "auto") setHistogram(undefined);
            else
              fit({
                width: startingWidth(source, settings.binCount ?? 20),
                origin: 0,
              });
          }}
        />
        {!width && (
          <>
            <span className="eda-setting-label">
              Count · {settings.binCount ?? 20}
            </span>
            <Slider
              aria-label="Histogram bin count"
              value={[settings.binCount ?? 20]}
              min={2}
              max={50}
              step={1}
              onValueChange={([value]) =>
                onSettingsChange({ ...settings, binCount: value })
              }
            />
          </>
        )}
        {width && (
          <>
            <span className="eda-setting-label">Width</span>
            <NumberField
              label="Bin width"
              value={width.width}
              valid={(value) => !widthProblem(value, width.origin)}
              onCommit={(value) => setBinning({ ...width, width: value })}
            />
            <span className="eda-setting-label">Origin</span>
            <NumberField
              label="Bin origin"
              value={width.origin}
              onCommit={(value) => setBinning({ ...width, origin: value })}
            />
            <span className="eda-setting-label">Range</span>
            <div className="flex min-w-0 items-center gap-1">
              <NumberField
                label="First edge"
                value={edgeAt(width.origin, width.width, width.firstIndex)}
                onCommit={(value) => {
                  const firstIndex = indexAtOrBelow(
                    value,
                    width.origin,
                    width.width
                  );
                  if (firstIndex < width.lastIndex)
                    setBinning({ ...width, firstIndex });
                }}
              />
              <span className="text-xs text-muted-foreground">to</span>
              <NumberField
                label="Last edge"
                value={edgeAt(width.origin, width.width, width.lastIndex)}
                onCommit={(value) => {
                  const lastIndex = indexAtOrAbove(
                    value,
                    width.origin,
                    width.width
                  );
                  if (lastIndex > width.firstIndex)
                    setBinning({ ...width, lastIndex });
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 shrink-0 px-2"
                tooltip="Sets the range to the smallest run of bins that covers every value, keeping width and origin."
                onClick={() => fit(width)}
              >
                Fit
              </Button>
            </div>
            <p
              className={`col-start-2 text-xs ${problem ? "text-destructive" : "text-muted-foreground"}`}
              role={problem ? "alert" : undefined}
            >
              {problem ??
                `${(width.lastIndex - width.firstIndex).toLocaleString()} bins. Values past the range count in the tails.`}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
