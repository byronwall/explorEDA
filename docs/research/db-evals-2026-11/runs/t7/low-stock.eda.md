# Which warehouses run low on stock?

This notebook reads every row of the `inventory` table (188,400 weekly snapshots: 5 warehouses, 360 items in total with about 120 stocked at each warehouse, 105 Thursdays from 1998-01-01 to 2002-12-26) and joins in the warehouse, item and date names. The last quarter in the data is Q4 2002, 2002-10-03 to 2002-12-26, which is 13 weekly snapshots.

**Low-stock line:** an item is "low" when a snapshot shows fewer than 100 units on hand. That is about the 10th percentile of all readings (median is 499). It is my choice, not a rule from the data.

**Left out:** snapshots with a missing quantity (about 5% of rows) are kept in the data but cannot be counted as low or as on hand, so they drop out of the sums and of the low counts. Warehouse 5 has no name in the `warehouse` table, so it shows as "Unnamed warehouse 5". Earlier quarters are filtered out of the charts below, not removed from the data.

```eda
eda source=inventory
dashboard "Low stock Q4 2002"
qty:num=inventory.qty
wk=inventory.snapshot_date
wh=inventory.warehouse
cat=inventory.i_category
prod=inventory.i_product_name
calc low = qty == null ? null : (qty < 100 ? 1 : 0)
filter wk=2002-10-03..2002-12-26

line @onhand x=wk y=qty {
  title="Units on hand per week, by warehouse"
  time.interval=week
  time.aggregation=sum
  time.measureField=qty
  time.splitField=wh
  time.display=line
}
```

Each line is the total quantity on hand across all items at one warehouse, per weekly snapshot. The five warehouses move together and stay within about 6% of each other: totals for the quarter run from 715k (warehouse 2) to 761k (warehouse 3) summed over the weeks.

```eda
line @lowcount x=wk y=low {
  title="Items below 100 units, by warehouse and week"
  time.interval=week
  time.aggregation=sum
  time.measureField=low
  time.splitField=wh
  time.display=line
}
```

This counts how many of the 360 items sit under the line at each warehouse each week. Low counts are similar everywhere: 149 to 173 low snapshots over the quarter. Warehouse 2 is highest at 173 and warehouse 1 lowest at 149, a small gap. Across all warehouses the count peaks in late October (75 on 2002-10-24) and dips at the end of November (47 on 2002-11-28).

```eda
group @lowByCat sum(low) by=cat
row cat @bycat group=lowByCat {
  title="Low-stock snapshots by category, Q4 2002"
}
group @lowByItem sum(low) by=prod
row prod @byitem group=lowByItem {
  title="Items most often below 100 units"
}
```

In raw counts, Jewelry and Women lead with 120 low snapshots each, then Home (106) and Children (104). Raw counts favor big categories. As a share of snapshots, Home (11.6%), Books (11.2%) and Electronics (11.2%) are highest, and Sports (7.9%) is lowest. No category stands far apart. The item chart shows the few individual items that dipped under the line most often, the worst has 15 low readings (item "barbarpriantiought") across the quarter.

**Answer:** no warehouse runs clearly low. About 10% of item readings fall under 100 units everywhere, with a small edge to warehouse 2. Watch late October.
