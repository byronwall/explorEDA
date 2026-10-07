import { ExplorEda } from "exploreda";
import "exploreda/dist/ExplorEda.css";

const orders = [
  { channel: "Web", revenue: 120, cost: 70 },
  { channel: "Retail", revenue: 180, cost: 110 },
];

// Minimal integration based on the documented API; not runtime-tested here.
// A preconfigured dashboard additionally needs its real savedData preset.
export function OrdersExplorer() {
  return (
    <ExplorEda
      data={orders}
      savedData={undefined}
    />
  );
}
