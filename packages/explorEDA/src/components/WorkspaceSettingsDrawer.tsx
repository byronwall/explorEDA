import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import {
  Calculator,
  ChartNoAxesColumnIncreasing,
  Grid,
  Maximize2,
  Minimize2,
  Palette,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CalculationManager } from "./calculations/CalculationManager";
import { ColorScalePanel } from "./ColorScaleManager";
import { usePanelBox } from "./FieldList/FieldList";
import { GridSettingsPanel } from "./settings/GridSettingsPanel";
import { ChartSpecPanel } from "./ChartSpecPanel";

export type WorkspaceSettingsTab = "calculations" | "colors" | "grid" | "spec";

const TABS = [
  { value: "calculations", label: "Calculations", icon: Calculator },
  { value: "colors", label: "Colors", icon: Palette },
  { value: "grid", label: "Grid", icon: Grid },
  { value: "spec", label: "Chart spec", icon: ChartNoAxesColumnIncreasing },
] as const;

/**
 * Settings that apply to the whole workspace, in one panel that floats over
 * the right edge without resizing the chart grid. Every tab stays mounted so
 * unsaved edits survive a switch between them.
 */
export function WorkspaceSettingsDrawer({
  id,
  tab,
  onTabChange,
  wide,
  onWideChange,
  onClose,
  workspaceRef,
}: {
  id: string;
  tab: WorkspaceSettingsTab;
  onTabChange: (tab: WorkspaceSettingsTab) => void;
  /** The wide layout gives tables such as the calculation list more room. */
  wide: boolean;
  onWideChange: (wide: boolean) => void;
  onClose: () => void;
  workspaceRef: RefObject<HTMLElement | null>;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const box = usePanelBox(workspaceRef);

  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <aside
      id={id}
      ref={panelRef}
      tabIndex={-1}
      className="eda-settings-drawer"
      aria-label="Workspace settings"
      data-wide={wide || undefined}
      style={
        box
          ? ({
              "--eda-field-list-top": `${box.top}px`,
              "--eda-field-list-right": `${box.right}px`,
              "--eda-field-list-height": `${box.height}px`,
            } as CSSProperties)
          : {}
      }
      onKeyDown={(event) => {
        // Nested menus, pickers, and dialogs handle their own Escape first.
        if (
          event.key !== "Escape" ||
          event.defaultPrevented ||
          !(event.target instanceof Node) ||
          !panelRef.current?.contains(event.target)
        ) {
          return;
        }
        event.preventDefault();
        onClose();
      }}
    >
      <Tabs
        value={tab}
        onValueChange={(value) => onTabChange(value as WorkspaceSettingsTab)}
        className="eda-settings-drawer-tabs"
      >
        <div className="eda-settings-drawer-head">
          <TabsList aria-label="Workspace settings">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value}>
                <Icon aria-hidden="true" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant="ghost"
            size="icon"
            className="eda-settings-drawer-wide"
            aria-label={
              wide ? "Narrow the settings panel" : "Widen the settings panel"
            }
            aria-pressed={wide}
            tooltip={
              wide
                ? "Narrow the panel to show more of the charts"
                : "Widen the panel for more room to edit"
            }
            onClick={() => onWideChange(!wide)}
          >
            {wide ? <Minimize2 /> : <Maximize2 />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close workspace settings"
            tooltip="Close settings (Esc)"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>
        <TabsContent value="calculations" forceMount>
          <CalculationManager />
        </TabsContent>
        <TabsContent value="colors" forceMount>
          <ColorScalePanel />
        </TabsContent>
        <TabsContent value="grid" forceMount>
          <GridSettingsPanel />
        </TabsContent>
        <TabsContent value="spec" forceMount>
          <ChartSpecPanel />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
