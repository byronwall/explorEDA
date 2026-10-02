import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExplorEda,
  type ExplorEdaHandle,
  type SavedDataStructure,
} from "exploreda";
import "exploreda/dist/ExplorEda.css";

type Order = Record<string, string | number | boolean | null>;

export function OrdersExplorer({
  orders,
  savedSettings,
  onSettingsChange,
}: {
  // Your app supplies the rows.
  orders: Order[];
  // Optional settings to restore charts, calculations, and layout.
  savedSettings?: SavedDataStructure;
  // Called after meaningful edits. Store it wherever your app keeps state.
  onSettingsChange: (settings: SavedDataStructure) => void;
}) {
  const workspace = useRef<ExplorEdaHandle>(null);
  const [chartCount, setChartCount] = useState<number>();

  const readSettings = useCallback(() => {
    const settings = workspace.current?.getSettings();
    if (settings) {
      setChartCount(settings.charts.length);
    }
  }, []);

  useEffect(() => {
    readSettings();
  }, [readSettings]);

  return (
    <>
      <button type="button" onClick={readSettings}>
        Read current settings
      </button>
      {chartCount !== undefined && (
        <p aria-live="polite">Current charts: {chartCount}</p>
      )}
      <ExplorEda
        ref={workspace}
        data={orders}
        savedData={savedSettings}
        onStateChange={onSettingsChange}
      />
    </>
  );
}
