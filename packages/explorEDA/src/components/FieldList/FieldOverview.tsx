import { useId, useMemo, useRef, useState } from "react";
import { Minimize2, Search, Settings2, X } from "lucide-react";
import { typeIcons, typeLabels } from "@/components/FieldMetadata";
import { CalculatedFieldBadge } from "@/components/calculations/CalculatedFieldBadge";
import { FieldInspector } from "@/components/SummaryTable/components/FieldInspector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useFieldDistributions } from "@/hooks/useFieldDistribution";
import { categoryLabel } from "@/lib/categories";
import type {
  DistributionBin,
  FieldDistribution,
  PopulationCounts,
} from "@/lib/fieldDistribution";
import type { FieldProfile } from "@/lib/fieldProfiles";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import { AddChartMenu } from "./FieldListRow";

const TOP_CATEGORIES = 5;
const WIDTH = 240;
const HEIGHT = 56;

const count = (value: number) => value.toLocaleString();
const share = (part: number, whole: number) => {
  if (whole <= 0) return "0%";
  const value = part / whole;
  if (value > 0 && value < 0.01) return "<1%";
  if (value < 1 && value > 0.99) return ">99%";
  return `${Math.round(value * 100)}%`;
};
const isoDay = (time: number) => new Date(time).toISOString().slice(0, 10);

/** Bars for all rows behind bars for the filtered rows, on shared edges. */
function MiniHistogram({
  bins,
  filtered,
}: {
  bins: DistributionBin[];
  filtered: boolean;
}) {
  const peak = Math.max(
    1,
    ...bins.map((bin) => (filtered ? Math.max(bin.all, bin.filtered) : bin.all))
  );
  const width = WIDTH / Math.max(1, bins.length);
  const gap = bins.length > 24 ? 0.5 : 1;
  const bar = (value: number) => (value / peak) * (HEIGHT - 2);
  return (
    <svg
      className="eda-overview-histogram"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {bins.map((bin, index) => (
        <g key={index}>
          {filtered && (
            <rect
              className="eda-dist-bar-all"
              x={index * width + gap / 2}
              y={HEIGHT - bar(bin.all)}
              width={Math.max(0.5, width - gap)}
              height={bar(bin.all)}
            />
          )}
          <rect
            className="eda-dist-bar"
            x={index * width + gap / 2}
            y={HEIGHT - bar(filtered ? bin.filtered : bin.all)}
            width={Math.max(0.5, width - gap)}
            height={bar(filtered ? bin.filtered : bin.all)}
          />
        </g>
      ))}
      <line
        className="eda-dist-base"
        x1={0}
        x2={WIDTH}
        y1={HEIGHT - 0.5}
        y2={HEIGHT - 0.5}
      />
    </svg>
  );
}

function CategoryBars({
  distribution,
  population,
  filtered,
}: {
  distribution: Extract<FieldDistribution, { kind: "category" }>;
  population: PopulationCounts;
  filtered: boolean;
}) {
  const top = distribution.categories.slice(0, TOP_CATEGORIES);
  // Bars carry no shape when every value appears once.
  if ((top[0]?.[filtered ? "filtered" : "all"] ?? 0) <= 1) {
    return (
      <p className="eda-overview-empty">
        Every value appears once, such as {categoryLabel(top[0]?.value)}
      </p>
    );
  }
  const rest = distribution.categories.length - top.length;
  const value = (item: (typeof top)[number]) =>
    filtered ? item.filtered : item.all;
  return (
    <ol className="eda-overview-categories">
      {top.map((item) => (
        <li key={String(item.value)}>
          <span className="eda-overview-category-label">
            {categoryLabel(item.value)}
          </span>
          <span className="eda-overview-category-track" aria-hidden="true">
            <span
              style={{
                width: `${(value(item) / Math.max(1, population.values)) * 100}%`,
              }}
              data-empty={value(item) === 0 || undefined}
            />
          </span>
          <span className="eda-overview-category-share">
            {share(value(item), population.values)}
          </span>
        </li>
      ))}
      {rest > 0 && (
        <li className="eda-overview-category-more">
          {count(rest)} more {rest === 1 ? "value" : "values"}
        </li>
      )}
    </ol>
  );
}

function FieldCard({
  profile,
  label,
  distribution,
  onChartAdded,
}: {
  profile: FieldProfile;
  label: string;
  distribution?: FieldDistribution;
  onChartAdded: () => void;
}) {
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const [inspecting, setInspecting] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const headingId = useId();
  const TypeIcon = typeIcons[profile.dataType];
  const displayFormat = useDataLayer(
    (state) => (state.fieldSettings ?? {})[profile.name]?.format
  );
  // Dates show as days unless the field has its own date format.
  const format = (value: number) =>
    distribution?.kind === "date" &&
    displayFormat !== "date" &&
    displayFormat !== "datetime"
      ? isoDay(value)
      : formatFieldValue(profile.name, value as datum);

  const filtered = distribution?.filtered !== undefined;
  const population = distribution
    ? (distribution.filtered ?? distribution.all)
    : undefined;
  const noValues = !population || population.values === 0;
  const histogram =
    distribution && distribution.kind !== "category"
      ? distribution.kind === "numeric" && distribution.core
        ? {
            bins: distribution.core.bins,
            min: distribution.core.min,
            max: distribution.core.max,
            outliers: filtered
              ? distribution.core.below.filtered +
                distribution.core.above.filtered
              : distribution.core.below.all + distribution.core.above.all,
          }
        : {
            bins: distribution.bins,
            min: distribution.bins[0]?.start,
            max: distribution.bins.at(-1)?.end,
            outliers: 0,
          }
      : undefined;
  const summary =
    distribution?.kind === "numeric"
      ? (distribution.summary?.filtered ?? distribution.summary?.all)
      : undefined;
  const reading = noValues
    ? undefined
    : summary
      ? { label: "Median", value: format(summary.median) }
      : { label: "Distinct", value: count(population!.distinct) };
  const missing = population ? population.missing + population.excluded : 0;

  return (
    <article
      ref={cardRef}
      className="eda-overview-card"
      aria-labelledby={headingId}
    >
      <header className="eda-overview-card-head">
        <TypeIcon aria-hidden="true" />
        <h3 id={headingId}>
          <span className="sr-only">{typeLabels[profile.dataType]}: </span>
          {label}
        </h3>
        <CalculatedFieldBadge field={profile.name} />
        <div className="eda-overview-card-actions">
          <ActionTooltip content="Inspect field">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Inspect ${label}`}
              aria-pressed={inspecting}
              data-field-inspect=""
              onClick={() => setInspecting((open) => !open)}
            >
              <Settings2 />
            </Button>
          </ActionTooltip>
          <AddChartMenu
            field={profile.name}
            label={label}
            dataType={profile.dataType}
            onAdded={onChartAdded}
          />
        </div>
      </header>
      {reading && (
        <p className="eda-overview-reading">
          <span>{reading.label}</span>
          <strong>{reading.value}</strong>
        </p>
      )}
      <div className="eda-overview-chart">
        {!distribution || noValues ? (
          <p className="eda-overview-empty">
            {population?.rows === 0
              ? "No rows in the current filter"
              : "No values to chart"}
          </p>
        ) : distribution.kind === "category" ? (
          <CategoryBars
            distribution={distribution}
            population={population!}
            filtered={filtered}
          />
        ) : (
          histogram && (
            <>
              <MiniHistogram bins={histogram.bins} filtered={filtered} />
              {histogram.min !== undefined && histogram.max !== undefined && (
                <p className="eda-overview-axis">
                  <span>{format(histogram.min)}</span>
                  <span>{format(histogram.max)}</span>
                </p>
              )}
            </>
          )
        )}
      </div>
      <p className="eda-overview-foot">
        <span data-tone={missing > 0 ? "warning" : undefined}>
          {missing > 0
            ? `${count(missing)} missing · ${share(missing, population?.rows ?? 0)}`
            : "No missing values"}
        </span>
        {histogram && histogram.outliers > 0 && (
          <span>
            {count(histogram.outliers)} far{" "}
            {histogram.outliers === 1 ? "outlier" : "outliers"} not shown
          </span>
        )}
      </p>
      {inspecting && (
        <FieldInspector
          field={profile.name}
          anchor={cardRef.current}
          open
          onOpenChange={(open) => {
            if (open) return;
            setInspecting(false);
            requestAnimationFrame(() => {
              const active = document.activeElement;
              if (active && active !== document.body) return;
              cardRef.current
                ?.querySelector<HTMLElement>("[data-field-inspect]")
                ?.focus({ preventScroll: true });
            });
          }}
        />
      )}
    </article>
  );
}

/**
 * Every field's distribution at once, as a grid of small cards over the
 * whole viewport. Escape or Collapse returns to the side panel.
 */
export function FieldOverview({
  profiles,
  total,
  query,
  onQueryChange,
  scope,
  onCollapse,
  onClose,
}: {
  profiles: FieldProfile[];
  /** Fields before the search narrows them. */
  total: number;
  query: string;
  onQueryChange: (query: string) => void;
  scope: string;
  onCollapse: () => void;
  onClose: () => void;
}) {
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const fields = useMemo(
    () => profiles.map((profile) => profile.name),
    [profiles]
  );
  const distributions = useFieldDistributions(fields, true);

  return (
    <Dialog open onOpenChange={(open) => !open && onCollapse()}>
      <DialogContent
        showCloseButton={false}
        className="eda-overview"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const input = (
            event.currentTarget as HTMLElement | null
          )?.querySelector<HTMLInputElement>("input[type=search]");
          const coarse = window.matchMedia?.("(pointer: coarse)").matches;
          if (!coarse) input?.focus({ preventScroll: true });
        }}
        onEscapeKeyDown={(event) => {
          // The first Escape clears the search.
          if (query) {
            event.preventDefault();
            onQueryChange("");
          }
        }}
      >
        <header className="eda-overview-head">
          <div className="eda-overview-title">
            <DialogTitle>Fields</DialogTitle>
            <span className="eda-field-list-count" aria-live="polite">
              {profiles.length === total
                ? `${count(total)} fields`
                : `${count(profiles.length)} of ${count(total)}`}
            </span>
          </div>
          <DialogDescription className="eda-field-list-scope">
            {scope}
          </DialogDescription>
          <label className="eda-field-list-search eda-overview-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search fields</span>
            <Input
              type="search"
              value={query}
              placeholder="Search fields"
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </label>
          <div className="eda-overview-buttons">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Collapse to the field panel"
              tooltip="Collapse to the side panel (Esc)"
              data-overview-collapse=""
              onClick={onCollapse}
            >
              <Minimize2 />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close field list"
              tooltip="Close field list (F)"
              onClick={onClose}
            >
              <X />
            </Button>
          </div>
        </header>
        {profiles.length === 0 ? (
          <p className="eda-field-list-empty">
            No fields match “{query.trim()}”.
          </p>
        ) : (
          <div className="eda-overview-grid" role="list" aria-label="Fields">
            {profiles.map((profile) => (
              <div role="listitem" key={profile.name}>
                <FieldCard
                  profile={profile}
                  label={getFieldLabel(profile.name)}
                  distribution={distributions.get(profile.name)}
                  onChartAdded={onCollapse}
                />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
