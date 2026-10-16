// Builds examples/database/data/shop.db from the shop example's CSV files,
// plus a returns table, so the database example holds the same shop.
// Run it after changing the shop data: node scripts/example-database.mjs
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = fileURLToPath(new URL("..", import.meta.url));
const shop = resolve(root, "examples/shop/data");
const target = resolve(root, "examples/database/data/shop.db");

function rows(file) {
  const [header, ...lines] = readFileSync(resolve(shop, file), "utf8")
    .trim()
    .split(/\r?\n/);
  const names = header.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(names.map((name, i) => [name, values[i]]));
  });
}

rmSync(target, { force: true });
const db = new DatabaseSync(target);
db.exec(`
create table customers (
  customerId text primary key,
  name text not null,
  region text,
  joinedAt date
);
create table products (
  productId text primary key,
  name text not null,
  category text,
  price numeric
);
create table orders (
  orderId text primary key,
  customerId text references customers,
  channel text,
  orderedAt date,
  amount numeric
);
create table items (
  itemId text primary key,
  orderId text references orders,
  productId text references products,
  quantity integer,
  revenue numeric
);
create table returns (
  returnId integer primary key,
  orderId text references orders,
  reason text,
  refunded boolean,
  returnedAt date
);
`);

const insert = (table, list) => {
  const names = Object.keys(list[0]);
  const statement = db.prepare(
    `insert into ${table} (${names.join(", ")}) values (${names.map(() => "?").join(", ")})`
  );
  for (const row of list) {
    statement.run(
      ...names.map((name) => {
        const value = row[name];
        return value !== "" && /^-?\d+(\.\d+)?$/.test(value)
          ? Number(value)
          : value;
      })
    );
  }
};

insert("customers", rows("customers.csv"));
insert("products", rows("products.csv"));
const orders = rows("orders.csv");
insert("orders", orders);
insert("items", rows("items.csv"));

// Every seventh order comes back, for one of a few reasons.
const reasons = ["Damaged", "Wrong size", "Changed mind", "Late"];
const returns = orders
  .filter((_, index) => index % 7 === 3)
  .map((order, index) => {
    const day = new Date(`${order.orderedAt}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + 5 + (index % 9));
    return {
      returnId: index + 1,
      orderId: order.orderId,
      reason: reasons[index % reasons.length],
      refunded: index % 3 === 0 ? 0 : 1,
      returnedAt: day.toISOString().slice(0, 10),
    };
  });
insert("returns", returns);
db.exec("vacuum");
db.close();
console.log(`Wrote ${target}`);
