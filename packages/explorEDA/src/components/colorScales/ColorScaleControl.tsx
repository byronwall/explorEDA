import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { ActionTooltip } from "@/components/ui/tooltip";
import { useColorScales } from "@/hooks/useColorScales";
import type { VisionMode } from "@/lib/colorPalettes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import { useScaleUsage, VisionSelect } from "../ColorScaleManager";
import {
  ColorScaleEditor,
  ScaleSwatch,
  paletteLabel,
} from "./ColorScaleEditor";
import { VisionProvider } from "./vision";

/** Nested pickers and menus inside the editor handle their own Escape. */
const NESTED_LAYERS =
  ".eda-category-color-popover, [role='listbox'], [data-slot='select-content']";

/**
 * Shows a chart's color scale under its color field. Opening it slides the
 * scale's editor over the chart settings, so the chart itself stays in view;
 * outside chart settings it opens in a popover.
 */
export function ColorScaleControl({
  scaleId,
}: {
  scaleId: string | undefined;
}) {
  const { getScaleById } = useColorScales();
  const usage = useScaleUsage();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const scale = scaleId ? getScaleById(scaleId) : undefined;

  useEffect(() => {
    setHost(triggerRef.current?.closest<HTMLElement>(".eda-settings") ?? null);
  }, []);

  if (!scale) {
    return null;
  }
  const shared = usage.get(scale.id) ?? 0;
  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const trigger = (
    <ActionTooltip
      content={
        shared > 1
          ? `Edit the colors. ${shared} charts share this scale and change with it.`
          : "Edit the colors for this field"
      }
    >
      <button
        ref={triggerRef}
        type="button"
        className="eda-scale-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <ScaleSwatch scale={scale} className="eda-scale-trigger-swatch" />
        <span className="eda-scale-trigger-label">{paletteLabel(scale)}</span>
        <ChevronRight aria-hidden="true" />
      </button>
    </ActionTooltip>
  );

  if (host) {
    return (
      <>
        {trigger}
        {open &&
          createPortal(
            <ScaleDrillIn scale={scale} shared={shared} onClose={close} />,
            host
          )}
      </>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close())}
    >
      <PopoverAnchor asChild>{trigger}</PopoverAnchor>
      <PopoverContent
        side="left"
        align="start"
        collisionPadding={12}
        className="eda-scale-popover"
        aria-label={`${scale.name} colors`}
      >
        <ScaleEditorFrame scale={scale} shared={shared} />
      </PopoverContent>
    </Popover>
  );
}

function ScaleEditorFrame({
  scale,
  shared,
  leading,
}: {
  scale: ColorScaleType;
  shared: number;
  leading?: ReactNode;
}) {
  const [vision, setVision] = useState<VisionMode>("normal");
  return (
    <VisionProvider value={vision}>
      <div className="eda-scale-popover-head">
        {leading}
        <div className="min-w-0 flex-1">
          <h2>{scale.name} colors</h2>
          {shared > 1 && (
            <p className="eda-color-muted">Shared by {shared} charts</p>
          )}
        </div>
      </div>
      <ColorScaleEditor
        scale={scale}
        showName={false}
        paletteActions={<VisionSelect value={vision} onChange={setVision} />}
      />
    </VisionProvider>
  );
}

/** The scale editor laid over the chart settings it was opened from. */
function ScaleDrillIn({
  scale,
  shared,
  onClose,
}: {
  scale: ColorScaleType;
  shared: number;
  onClose: () => void;
}) {
  const backRef = useRef<HTMLButtonElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
    // Runs before the settings popover's own Escape handling, so Escape
    // returns to chart settings instead of closing them.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) {
        return;
      }
      const target = event.target as Element | null;
      if (target?.closest?.(NESTED_LAYERS)) {
        return;
      }
      if (!layerRef.current?.isConnected) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      closeRef.current();
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, []);

  return (
    <div
      ref={layerRef}
      className="eda-scale-drill"
      role="dialog"
      aria-label={`${scale.name} colors`}
    >
      <ScaleEditorFrame
        scale={scale}
        shared={shared}
        leading={
          <Button
            ref={backRef}
            type="button"
            variant="ghost"
            size="icon"
            className="eda-scale-drill-back"
            aria-label="Back to chart settings"
            tooltip="Back to chart settings (Esc)"
            onClick={onClose}
          >
            <ArrowLeft />
          </Button>
        }
      />
    </div>
  );
}
