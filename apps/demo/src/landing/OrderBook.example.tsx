import { stringifySavedData } from "exploreda";
import { useEffect, useState } from "react";
import { parseCsvData } from "../csvParser";
import { shopDashboard } from "../demos/dashboardSettings";
import { OrdersExplorer } from "./OrdersExplorer.example";

type Order = Parameters<typeof OrdersExplorer>[0]["orders"][number];

// The featured order book: the example CSV as data, and its typed
// dashboard settings as savedData.
export function OrderBook() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetch("/datasets/shop-operations.csv")
      .then((response) => response.text())
      .then(parseCsvData)
      .then((rows) => setOrders(rows as Order[]));
  }, []);

  if (!orders) {
    return <p>Loading orders…</p>;
  }

  return (
    <OrdersExplorer
      orders={orders}
      savedSettings={shopDashboard}
      // Replace with your app's own storage.
      onSettingsChange={(settings) =>
        localStorage.setItem("order-book", stringifySavedData(settings))
      }
    />
  );
}
