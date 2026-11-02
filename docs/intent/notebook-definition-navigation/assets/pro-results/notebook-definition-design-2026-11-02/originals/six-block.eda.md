# Results

## West summary

Net in West is **{{west-net}}**; [show records](#finding:west-net).

```eda id=metric
metric @net-total sum(net) where.Region=West title="Net in West"
finding @west-net sum net chart=@net-total digits=2
```

# Definitions

## Revenue contract

```eda id=revenue
revenue:num=Revenue
```

## Gross

```eda id=gross
calc gross = revenue - Cost
```

## Net

```eda id=net
calc net = gross * 0.5
```

## Unused

```eda id=unused
calc unused = Cost * 2
```

## Comparison

```eda id=composition
composition @net-shape width=640 height=380 {
  scale numeric @revenue-scale Revenue
  scale numeric @net-scale net
  measure @net-measure sum(net) name="Net total"
  unit @orders "Orders" at=48,48 size=480x280 {
    label value=net-measure
    point @orders-points "Orders" x=revenue-scale y=net-scale sizeField=gross
  }
}
```
