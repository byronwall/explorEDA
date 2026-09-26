import { ExplorEda, type SavedDataStructure } from "exploreda";
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
  return (
    <ExplorEda
      data={orders}
      savedData={savedSettings}
      onStateChange={onSettingsChange}
    />
  );
}
