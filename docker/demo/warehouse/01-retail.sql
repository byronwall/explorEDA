-- A small retail business to explore: customers, products, two years of
-- orders and their lines, and a monthly summary view. The data is made up
-- and the same on every start (setseed). It runs once, when the demo's
-- Postgres volume is new.

select setseed(0.42);

create table customers (
  customer_id text primary key,
  name text not null,
  region text not null,
  segment text not null,
  signed_up date not null
);

insert into customers
select
  'C' || lpad(g::text, 4, '0'),
  (array['Avery','Blake','Casey','Devon','Emery','Finley','Harper','Jordan','Kai','Logan','Morgan','Parker','Quinn','Reese','Riley','Rowan','Sage','Skyler','Taylor','Wren'])[1 + floor(random() * 20)::int]
    || ' ' ||
  (array['Ahmed','Brooks','Chen','Diaz','Evans','Garcia','Hughes','Ito','Jones','Kim','Lopez','Moore','Nguyen','Okafor','Patel','Rossi','Silva','Tanaka','Walsh','Young'])[1 + floor(random() * 20)::int],
  (array['North','South','East','West'])[1 + floor(random() * 4)::int],
  case when random() < 0.62 then 'Consumer' when random() < 0.75 then 'Small business' else 'Enterprise' end,
  date '2023-01-01' + floor(random() * 640)::int
from generate_series(1, 2500) as g;

create table products (
  product_id text primary key,
  name text not null,
  category text not null,
  unit_price numeric(10, 2) not null
);

insert into products
select
  'P' || lpad(row_number() over ()::text, 3, '0'),
  item.name,
  item.category,
  item.price
from (values
  ('Desk lamp', 'Home', 34.00), ('Throw blanket', 'Home', 48.00), ('Ceramic vase', 'Home', 26.50),
  ('Wall clock', 'Home', 39.00), ('Linen pillow', 'Home', 22.00), ('Candle set', 'Home', 18.00),
  ('Chef knife', 'Kitchen', 79.00), ('Cast iron pan', 'Kitchen', 54.00), ('Coffee grinder', 'Kitchen', 64.00),
  ('Mixing bowls', 'Kitchen', 29.00), ('Tea kettle', 'Kitchen', 42.00), ('Cutting board', 'Kitchen', 24.00),
  ('Notebook', 'Office', 9.50), ('Fountain pen', 'Office', 36.00), ('Desk organizer', 'Office', 27.00),
  ('Monitor stand', 'Office', 58.00), ('Planner', 'Office', 16.00), ('Desk chair', 'Office', 249.00),
  ('Trail shoes', 'Outdoor', 119.00), ('Water bottle', 'Outdoor', 21.00), ('Day pack', 'Outdoor', 74.00),
  ('Camp stove', 'Outdoor', 89.00), ('Headlamp', 'Outdoor', 32.00), ('Tent', 'Outdoor', 329.00),
  ('Yoga mat', 'Fitness', 38.00), ('Dumbbells', 'Fitness', 69.00), ('Jump rope', 'Fitness', 12.00),
  ('Foam roller', 'Fitness', 25.00), ('Kettlebell', 'Fitness', 49.00), ('Fitness band', 'Fitness', 99.00)
) as item(name, category, price);

create table orders (
  order_id text primary key,
  customer_id text not null references customers,
  ordered_at timestamptz not null,
  channel text not null,
  status text not null
);

-- More orders near the end of each year, and a little growth over time.
insert into orders
select
  'O' || lpad(g::text, 6, '0'),
  'C' || lpad((1 + floor(random() * 2500))::int::text, 4, '0'),
  ts,
  case when random() < 0.55 then 'Web' when random() < 0.7 then 'Store' else 'Phone' end,
  case when random() < 0.93 then 'Delivered' when random() < 0.6 then 'Returned' else 'Cancelled' end
from (
  select g,
    timestamptz '2024-01-01 00:00:00+00'
      + make_interval(days => floor(power(random(), 0.85) * 730)::int)
      + make_interval(mins => floor(random() * 1440)::int) as ts
  from generate_series(1, 32000) as g
) as days
where extract(month from ts) in (11, 12) or random() < 0.82;

create table order_lines (
  line_id integer primary key generated always as identity,
  order_id text not null references orders,
  product_id text not null references products,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  discount numeric(4, 2) not null
);

-- One to four lines an order. The picks are materialized first, so each
-- random() is drawn once per line rather than again inside the join.
insert into order_lines (order_id, product_id, quantity, unit_price, discount)
with pick as materialized (
  select o.order_id, line,
    1 + floor(random() * 30)::int as product_number,
    random() as r_quantity,
    random() as r_discount,
    random() as r_extra
  from orders o
  cross join generate_series(1, 4) as line
)
select
  pick.order_id,
  p.product_id,
  1 + floor(pick.r_quantity * pick.r_quantity * 4)::int,
  p.unit_price,
  case when pick.r_discount < 0.8 then 0 else round((pick.r_discount - 0.8)::numeric, 2) end
from pick
join products p on p.product_id = 'P' || lpad(pick.product_number::text, 3, '0')
where pick.line = 1 or pick.r_extra < 0.45
order by pick.order_id, pick.line;

create view monthly_sales as
select
  date_trunc('month', o.ordered_at)::date as month,
  c.region,
  p.category,
  count(distinct o.order_id) as orders,
  round(sum(l.quantity * l.unit_price * (1 - l.discount)), 2) as revenue
from orders o
join customers c using (customer_id)
join order_lines l using (order_id)
join products p using (product_id)
where o.status <> 'Cancelled'
group by 1, 2, 3;

-- explorEDA signs in as a user that can only read.
create role exploreda_reader login password 'exploreda-demo';
grant usage on schema public to exploreda_reader;
grant select on all tables in schema public to exploreda_reader;
