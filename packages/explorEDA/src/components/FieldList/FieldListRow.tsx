import { useRef, useState, type RefObject } from "react";
import { ChevronRight, Crosshair, Plus, Settings2 } from "lucide-react";
import { FieldMetadata } from "@/components/FieldMetadata";
import { CalculatedFieldBadge } from "@/components/calculations/CalculatedFieldBadge";
import { chartOptionsForField } from "@/components/SummaryTable/components/ChartActions";
import { FieldInspector } from "@/components/SummaryTable/components/FieldInspector";
import {
  summarizeField,
  type SparkFilter,
} from "@/components/SummaryTable/components/FieldDistribution";
import { FieldValues } from "@/components/SummaryTable/components/FieldValues";
import {
  getChartFields,
  getChartTitle,
} from "@/components/charts/chartAccessibility";
import {
  focusChartInContainer,
  highlightChartInContainer as highlightChart,
} from "@/components/chartFocus";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useCreateCharts } from "@/hooks/useCreateCharts";
import { useFieldFilter } from "@/hooks/useFieldFilter";
import { useFieldDistribution } from "@/hooks/useFieldDistribution";
import type { FieldProfile } from "@/lib/fieldProfiles";
import { formatFieldValue } from "@/lib/fieldSettings";
import { cn } from "@/lib/utils";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import {
  axisRefusal,
  axisTargets,
  type AxisTarget,
  type FieldFacts,
} from "./fieldAxis";
import { useApplyAxisField, useFieldFacts } from "./useAxisField";
import { useFieldDrag } from "./FieldDragContext";
import { FieldRowReadings } from "./FieldRowReadings";

function UseOnChartMenu({ field, label }: { field: string; label: string }) {
  const charts = useDataLayer((state) => state.charts);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const getFacts = useFieldFacts();
  const apply = useApplyAxisField();
  const [facts, setFacts] = useState<FieldFacts>();
  const targets = axisTargets(charts);
  if (targets.length === 0) return null;
  const byChart = new Map<string, AxisTarget[]>();
  targets.forEach((target) =>
    byChart.set(target.chart.id, [
      ...(byChart.get(target.chart.id) ?? []),
      target,
    ])
  );

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(open) => setFacts(open ? getFacts(field) : undefined)}
    >
      <ActionTooltip content="Use on a chart axis">
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Use ${label} on a chart axis`}
          >
            <Crosshair />
          </Button>
        </DropdownMenuTrigger>
      </ActionTooltip>
      <DropdownMenuContent
        align="end"
        collisionPadding={12}
        aria-label={`Use ${label} on a chart axis`}
        className="eda-field-menu max-h-[min(420px,var(--radix-dropdown-menu-content-available-height))] w-[min(300px,calc(100vw-24px))] overflow-y-auto"
      >
        <DropdownMenuLabel>Put {label} on an axis</DropdownMenuLabel>
        {Array.from(byChart.values()).map((chartTargets, index) => (
          <DropdownMenuGroup key={chartTargets[0]!.chart.id}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="truncate text-foreground">
              {getChartTitle(chartTargets[0]!.chart, getFieldLabel)}
            </DropdownMenuLabel>
            {chartTargets.map((target) => {
              const refusal = facts ? axisRefusal(target, facts) : undefined;
              const current = target.current
                ? target.current === "__ID"
                  ? "Row sequence"
                  : getFieldLabel(target.current)
                : "None";
              return (
                <DropdownMenuItem
                  key={target.axis}
                  disabled={Boolean(refusal)}
                  className="items-start"
                  onSelect={() => facts && apply(target, facts)}
                >
                  <span className="eda-field-menu-axis">
                    {target.axis.toUpperCase()}
                  </span>
                  <span className="grid min-w-0">
                    <span className="truncate">Replace {current}</span>
                    {refusal && (
                      <span className="text-xs text-muted-foreground">
                        {refusal}
                      </span>
                    )}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AddChartMenu({
  field,
  label,
  dataType,
  onAdded,
}: {
  field: string;
  label: string;
  dataType: FieldProfile["dataType"];
  onAdded?: () => void;
}) {
  const { createChart } = useCreateCharts();
  const options = chartOptionsForField(dataType);
  return (
    <DropdownMenu modal={false}>
      <ActionTooltip content="Add a chart of this field">
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Add a chart of ${label}`}
          >
            <Plus />
          </Button>
        </DropdownMenuTrigger>
      </ActionTooltip>
      <DropdownMenuContent
        align="end"
        collisionPadding={12}
        aria-label={`Add a chart of ${label}`}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.type}
            onSelect={() => {
              createChart(option.type, field);
              onAdded?.();
            }}
          >
            <option.icon aria-hidden="true" className={option.iconClassName} />
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UsedIn({
  field,
  workspaceRef,
}: {
  field: string;
  workspaceRef: RefObject<HTMLElement | null>;
}) {
  const charts = useDataLayer((state) => state.charts);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const using = charts.filter((chart) => getChartFields(chart).includes(field));
  const clear = () => highlightChart(workspaceRef.current, undefined);

  return (
    <div className="eda-field-used">
      <h4>Used in</h4>
      {using.length === 0 ? (
        <p>No chart uses this field yet.</p>
      ) : (
        <ul>
          {using.map((chart) => (
            <li key={chart.id}>
              <button
                type="button"
                onPointerEnter={() =>
                  highlightChart(workspaceRef.current, chart.id)
                }
                onPointerLeave={clear}
                onFocus={() => highlightChart(workspaceRef.current, chart.id)}
                onBlur={clear}
                onClick={() => {
                  clear();
                  focusChartInContainer(workspaceRef.current, chart.id);
                }}
              >
                {getChartTitle(chart, getFieldLabel)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RowDetails({
  field,
  label,
  workspaceRef,
}: {
  field: string;
  label: string;
  workspaceRef: RefObject<HTMLElement | null>;
}) {
  const distribution = useFieldDistribution(field, true);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const settings = (fieldSettings ?? {})[field] ?? {};
  const format = (value: number) => {
    if (distribution?.kind !== "date") {
      return formatFieldValue(field, value as datum, settings);
    }
    if (settings.format === "date" || settings.format === "datetime") {
      return formatFieldValue(field, value, settings);
    }
    return new Date(value).toISOString().slice(0, 10);
  };
  return (
    <div className="eda-field-row-details">
      {distribution ? (
        <FieldValues
          distribution={distribution}
          fieldLabel={label}
          format={format}
          compact
        />
      ) : (
        <p className="eda-dist-note">This field has no rows.</p>
      )}
      <UsedIn field={field} workspaceRef={workspaceRef} />
    </div>
  );
}

export function FieldListRow({
  profile,
  label,
  expanded,
  onExpandedChange,
  workspaceRef,
  inspectorSide,
}: {
  profile: FieldProfile;
  label: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  workspaceRef: RefObject<HTMLElement | null>;
  inspectorSide: "left" | "top";
}) {
  const formatValue = useDataLayer((state) => state.formatFieldValue);
  const [inspecting, setInspecting] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const drag = useFieldDrag(profile.name);
  const detailsId = `eda-field-${profile.name.replace(/[^\w-]/g, "_")}-details`;
  const { filterFor, toggleFilter } = useFieldFilter();
  const active = filterFor(profile.name);
  const summary = summarizeField(
    profile,
    (value) => formatValue(profile.name, value as datum),
    label,
    (filter: SparkFilter) => toggleFilter(profile.name, filter),
    active
  );
  const missingOnly =
    active?.type === "value" &&
    active.values.length === 1 &&
    active.values[0] == null;

  return (
    <li
      className="eda-field-row"
      data-expanded={expanded || undefined}
      data-dragging={drag.dragging || undefined}
    >
      <div className="eda-field-row-line" ref={rowRef}>
        <button
          type="button"
          className="eda-field-row-main"
          aria-expanded={expanded}
          aria-controls={expanded ? detailsId : undefined}
          onClick={() => onExpandedChange(!expanded)}
          {...drag.handleProps}
        >
          <ChevronRight className="eda-field-row-chevron" aria-hidden="true" />
          <FieldMetadata
            profile={profile}
            label={label}
            compact
            showDetail={false}
            showTooltip={false}
            className="min-w-0"
          />
        </button>
        <FieldRowReadings
          profile={profile}
          label={label}
          summary={summary}
          filtered={Boolean(active)}
          missingOnly={missingOnly}
          onMissingFilter={() =>
            toggleFilter(profile.name, { type: "value", values: [null] })
          }
        />
        <CalculatedFieldBadge field={profile.name} side="left" />
        <div className="eda-field-row-actions">
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
          />
          <UseOnChartMenu field={profile.name} label={label} />
        </div>
      </div>
      {inspecting && (
        <FieldInspector
          field={profile.name}
          anchor={rowRef.current}
          side={inspectorSide}
          open
          onOpenChange={(open) => {
            if (open) return;
            setInspecting(false);
            // Return focus to Inspect unless the user moved it elsewhere.
            requestAnimationFrame(() => {
              const active = document.activeElement;
              if (active && active !== document.body) return;
              rowRef.current
                ?.querySelector<HTMLElement>("[data-field-inspect]")
                ?.focus({ preventScroll: true });
            });
          }}
        />
      )}
      {expanded && (
        <div id={detailsId} className={cn("eda-field-row-body")}>
          <RowDetails
            field={profile.name}
            label={label}
            workspaceRef={workspaceRef}
          />
        </div>
      )}
    </li>
  );
}
