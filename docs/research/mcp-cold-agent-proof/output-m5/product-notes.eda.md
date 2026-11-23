# Product mix notes

The shop's revenue comes from 200 item lines on 80 orders, spread across four product categories: Kitchen, Office, Home, and Travel. The chart below totals item revenue by category, which is the first thing to read before the monthly and customer breakdowns in the product-mix dashboard: it shows which categories carry the business and which are small enough that a month-to-month swing in them matters little.

```eda
eda query=item-lines
revenue:num=items.revenue label=Revenue
category:cat=product.category label=Category
group @byCategory sum(revenue) by=category
row @categories category group=byCategory title="Revenue by category"
```
