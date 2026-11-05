import { describe, expect, it } from "vitest";
import { buildFieldProfile } from "@/lib/fieldProfiles";
import { rankGroupFields, rankMeasureFields } from "@/lib/fieldRanking";
import type { datum } from "@/types/ChartTypes";

const rows = 200;
const column = (value: (index: number) => datum) =>
  Object.fromEntries(Array.from({ length: rows }, (_, i) => [i, value(i)]));

// A TPC-DS style fact table: surrogate keys first, measures later.
const profiles = [
  buildFieldProfile(
    "store_sales.ss_customer_sk",
    column((i) => i * 7)
  ),
  buildFieldProfile(
    "store_sales.ss_ticket_number",
    column((i) => i % 120)
  ),
  buildFieldProfile(
    "store_sales.row_index",
    column((i) => i)
  ),
  buildFieldProfile(
    "store_sales.ss_quantity",
    column((i) => (i % 9) + 1)
  ),
  buildFieldProfile(
    "store_sales.ss_net_paid",
    column((i) => i * 1.37)
  ),
  buildFieldProfile(
    "store_sales.ss_order_id",
    column((i) => `O-${i}`)
  ),
  buildFieldProfile(
    "store_sales.ss_ticket_code",
    column((i) => `T${i}`)
  ),
  buildFieldProfile(
    "store_sales.channel",
    column((i) => ["web", "store"][i % 2])
  ),
];
const names = (type: "numeric" | "other") =>
  profiles
    .filter((p) => (p.dataType === "numeric") === (type === "numeric"))
    .map((p) => p.name);

describe("field ranking", () => {
  it("puts money and quantity measures first and keys last", () => {
    expect(rankMeasureFields(names("numeric"), profiles)).toEqual([
      "store_sales.ss_quantity",
      "store_sales.ss_net_paid",
      "store_sales.ss_customer_sk",
      "store_sales.ss_ticket_number",
      "store_sales.row_index",
    ]);
  });

  it("puts few-valued text first and ids last", () => {
    expect(rankGroupFields(names("other"), profiles)[0]).toBe(
      "store_sales.channel"
    );
    expect(rankGroupFields(names("other"), profiles).at(-1)).not.toBe(
      "store_sales.channel"
    );
  });

  it("keeps the original order when nothing looks like a key", () => {
    const plain = [
      buildFieldProfile(
        "rating",
        column((i) => i % 5)
      ),
      buildFieldProfile(
        "age",
        column((i) => 20 + (i % 40))
      ),
    ];
    expect(rankMeasureFields(["rating", "age"], plain)).toEqual([
      "rating",
      "age",
    ]);
  });
});
