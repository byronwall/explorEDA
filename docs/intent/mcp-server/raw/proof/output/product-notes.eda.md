# Large orders by channel

An order counts as "large" when its amount is over $100. The chart below shows the share of each sales channel's orders that are large, so channels can be compared regardless of how many orders each one takes. It supports the Large orders view of the product-mix dashboard, which shows the same split as counts and as a cumulative distribution.

```eda
eda query=order-lines
amount:num=orders.amount label="Order amount ($)"
channel:cat=orders.channel label=Channel
calc large = if amount > 100 then 1 else 0
calc one = 1
group @largeShare sum(large) by=channel denominatorField=one
bar @largeByChannel channel group=largeShare valueFormat=percent valueDecimals=0 title="Share of orders over $100 by channel"
```
