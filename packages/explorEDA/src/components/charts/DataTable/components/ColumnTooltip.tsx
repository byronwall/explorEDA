import { useEffect, useRef, useState, type ReactElement } from "react";
import { fieldMetadata, typeIcons } from "@/components/FieldMetadata";
import {
  SparkHoverContext,
  SparkHoverDetails,
  type SparkHover,
} from "@/components/SummaryTable/components/FieldDistribution";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FieldProfile } from "@/lib/fieldProfiles";
import { useDataLayer } from "@/providers/DataLayerProvider";

/** Pointer handlers for the element whose hover shows the field summary. */
export type ColumnTooltipTarget = {
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

const HOVER_DELAY = 140;

/**
 * One tooltip per column header. Hovering the name shows the field's
 * summary; hovering a distribution mark adds that mark's rows. It sits above
 * the header cell so it never covers other headers or the rows, and it stays
 * hidden when there is no room above.
 */
export function ColumnTooltip({
  profile,
  label,
  align,
  disabled = false,
  children,
}: {
  profile: FieldProfile;
  label: string;
  /** Lines the tooltip up with the header's text edge. */
  align: "start" | "end";
  disabled?: boolean;
  /** Renders the header cell, given the handlers for its name. */
  children: (target: ColumnTooltipTarget) => ReactElement;
}) {
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const [named, setNamed] = useState(false);
  const [mark, setMark] = useState<SparkHover>();
  const timer = useRef<number>(undefined);
  const cancel = () => window.clearTimeout(timer.current);
  useEffect(() => cancel, []);
  const target: ColumnTooltipTarget = {
    onPointerEnter: () => {
      cancel();
      timer.current = window.setTimeout(() => setNamed(true), HOVER_DELAY);
    },
    onPointerLeave: () => {
      cancel();
      setNamed(false);
    },
  };
  const open = !disabled && (named || mark !== undefined);
  const metadata = fieldMetadata(profile, (value) =>
    value == null || value === ""
      ? "—"
      : formatFieldValue
        ? formatFieldValue(profile.name, value)
        : String(value)
  );
  const TypeIcon = typeIcons[profile.dataType];
  const facts = [
    metadata.type,
    metadata.detail,
    metadata.nulls,
    metadata.excluded,
    `${profile.uniqueCount.toLocaleString()} distinct`,
  ].filter(Boolean);

  return (
    <SparkHoverContext.Provider value={setMark}>
      <TooltipProvider>
        <Tooltip
          open={open}
          onOpenChange={(next) => {
            // A click on the header closes the name's summary. A mark keeps
            // its details while the pointer stays on it.
            if (!next) {
              cancel();
              setNamed(false);
            }
          }}
        >
          <TooltipTrigger asChild>{children(target)}</TooltipTrigger>
          <TooltipContent
            side="top"
            align={align}
            collisionPadding={8}
            className="eda-column-tooltip"
          >
            <p className="eda-column-tooltip-name">
              <TypeIcon aria-hidden="true" />
              <span>{label}</span>
            </p>
            <p className="text-muted-foreground">{facts.join(" · ")}</p>
            {mark && (
              <div className="eda-column-tooltip-mark">
                <SparkHoverDetails hover={mark} />
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SparkHoverContext.Provider>
  );
}
