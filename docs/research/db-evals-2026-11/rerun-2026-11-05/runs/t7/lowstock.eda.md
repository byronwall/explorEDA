# Which warehouses run low on stock?

This notebook starts from the full `inventory` table (188,400 weekly snapshot rows: 5 warehouses, 209 weeks, 1998-01-01 to 2002-12-26). The last quarter in the data is Q4 2002 (October to December), 13 weekly snapshots.

**Low-stock line:** an item is "low" in a week when its on-hand quantity is below 100 units. Quantities run from 0 to 1,000, so 100 is about the bottom tenth of the range.

**Left out:** rows where `inv_quantity_on_hand` is empty. Those have no count, so they cannot be called low or not low. They are dropped from every chart below. Everything outside Q4 2002 is also left out, because you asked for the last quarter.

```eda
eda query=weekly
week:date=dt.d_date label=Week
wh:cat=wlabel label=Warehouse
onhand:num=onhand label="Units on hand"
avgqty:num=avgqty label="Average units per item"
lowrows:num=lowrows label="Items below line"
```

## Weekly stock per warehouse

```eda
eda query=weekly
line @onhandline x=week y=onhand color=wh title="Units on hand by week and warehouse" y.min=0
```

## How many items are below the line

```eda
eda query=weekly
line @lowline x=week y=lowrows color=wh title="Items below 100 units, by week and warehouse"
```

## Which categories run low most often

```eda
eda query=bycat
category:cat=it.i_category label=Category
lowrows:num=lowrows label="Low item-weeks"
n:num=nrows label="Item-weeks counted"
calc lowrate = lowrows / n
```

```eda
eda query=bycat
group @lowbycat sum(lowrows) by=category
row @catrate category group=lowbycat title="Low item-weeks by category"
```

```eda
eda query=bycat
table @cattable category,n,lowrows,lowrate
```

## Which items fall below the line most often

```eda
eda query=byitem
item:cat=it.i_product_name label="Item"
itemcat:cat=it.i_category label=Category
itemlow:num=lowrows label="Weeks below line"
```

```eda
eda query=byitem
table @topitems item,itemcat,itemlow {
  sortBy=itemlow
  title="Items below 100 units in 10 or more item-weeks"
}
```
