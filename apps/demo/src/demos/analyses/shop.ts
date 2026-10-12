// The order book: one synthetic shop table, four focused tabs. It replaces
// the separate shop, calendar, bar, area, and calculation examples.

export const shopText = `dashboard "Inside the order book"
grid rowHeight=76 padding=0 markers=false

field Revenue format=currency currency=USD precision=2
field Margin format=currency currency=USD precision=2

calc "Discount rate" = min(0.25, max(0, if Discount == null then 0 else Discount))
calc "Gross sales" = Units * ["Unit Price"]
calc "Discount amount" = ["Gross sales"] * ["Discount rate"]
calc "Net sales" = ["Gross sales"] - ["Discount amount"]
calc Contribution = ["Net sales"] - Cost
calc "Contribution rate" = if ["Net sales"] > 0 then ["Contribution"] / ["Net sales"] * 100 else 0
calc "Order band" = if ["Net sales"] >= 500 then "Large" else if ["Net sales"] >= 100 then "Standard" else "Small"
calc "Risk points" = sum(if Returned then 10 else 0, if !Fulfilled then 5 else 0, if ["Delivery Days"] != null && ["Delivery Days"] > 7 then 2 else 0)
calc "Needs review" = ["Risk points"] >= 5 || ["Contribution"] < 0
calc "Order month" = formatDate(["Order Date"], "%Y-%m")
field "Net sales" format=currency currency=USD precision=2
field Contribution format=currency currency=USD precision=2
field "Contribution rate" precision=1

scale @category-colors field=Category map=Home:#3479a8,Outdoors:#c77a45,Electronics:#4b9688,Kitchen:#9c6eac {
  palette=#2a78d6,#eb6834,#1baf7a,#eda100,#e87ba4,#008300,#4a3aa7,#e34948
  paletteId=theme order=frequency overflow=other
}
scale @channels field=Channel map=Web:#3479a8,Store:#c77a45,Wholesale:#4b9688 {
  palette=#2a78d6,#eb6834,#1baf7a,#eda100,#e87ba4,#008300,#4a3aa7,#e34948
  paletteId=theme order=frequency overflow=other
}
scale @color-order-band field="Order band" map=Standard:#2a78d6,Small:#eb6834,Large:#1baf7a {
  palette=#2a78d6,#eb6834,#1baf7a,#eda100,#e87ba4,#008300,#4a3aa7,#e34948
  paletteId=theme order=frequency overflow=other
}
group @revenue-by-region sum(Revenue) by=Region name="Revenue by region"
group @revenue-by-product sum(Revenue) by=Product name="Revenue by product"

view "Order book" {
  metric @shop-count count title="Matching orders"
  metric @shop-revenue sum(Revenue) title="Revenue in this selection"
  metric @shop-average avg(Revenue) title="Average order value"
  scatter @shop-margin x=Revenue y=Margin color=Category {
    title="Revenue and margin per order" x.scale=symlog y.scale=symlog
    x.title="Revenue ($)" y.title="Margin ($)"
  }
  row @shop-category Category color=Category title="Orders by category" x.title=Orders
  row @shop-channel Channel color=Channel title="Sales channels" x.title=Orders
  hist @shop-delivery "Delivery Days" title="How long does delivery take?" {
    x.title="Delivery time (days)" y.title=Orders
  }
  boxplot @shop-order Revenue color=Category title="Order value by category" {
    y.scale=symlog y.title="Revenue ($)"
  }
  hist @shop-region Revenue title="Revenue by region" x.title=Region {
    y.title="Revenue ($)" group=revenue-by-region
  }
  heatmap @shop-category-region Category title="Where does revenue come from?" {
    columnField=Region aggregation=sum measureField=Revenue
  }
  sankey @shop-flow title="Which channels and categories lead to returns?" {
    stages=Channel,Category,Returned
  }
  table @shop-orders "Order Date",Region,Channel,Category,Product,Revenue,Margin,"Delivery Days",Returned {
    title="Orders in this selection"
  }
  layout {
    2: shop-count shop-revenue shop-average
    5: shop-margin shop-margin shop-category shop-channel
    4: shop-delivery shop-order shop-region
    6: shop-category-region shop-flow
    5: shop-orders
  }
}

view "Sales mix" {
  bar @mix-grouped Region color=Channel title="Revenue by region and channel" {
    y.title="Revenue ($)" group=revenue-by-region seriesField=Channel
  }
  bar @mix-share Region color=Channel title="Channel share of each region's orders" {
    y.title="Share of orders (%)" seriesField=Channel seriesLayout=percent
  }
  line @mix-layers color=Channel title="Monthly revenue layers by channel" {
    x.title="Order month" y.title="Revenue ($)" x="Order Date" time.interval=month
    time.weekStart=monday time.aggregation=sum time.measureField=Revenue
    time.splitField=Channel time.missingPeriods=zero time.display=stacked-area
  }
  row @mix-category Category color=Category title="Filter by category" x.title=Orders
  pivot @mix-pivot title="Revenue by region and channel" rows=Region columns=Channel {
    value sum(Revenue) label=Revenue
  }
  row @mix-products Product title="Which products bring in the revenue?" {
    x.title="Revenue ($)" group=revenue-by-product topN=4
  }
  hierarchy @mix-hierarchy {
    title="How does revenue divide across regions and categories?"
    levels=Region,Category aggregation=sum measureField=Revenue
  }
  layout {
    6: mix-grouped mix-share
    5: mix-layers mix-layers mix-category
    5: mix-pivot mix-pivot mix-products
    6: mix-hierarchy
  }
}

view Calendar {
  calendar @cal-daily "Order Date" title="Daily revenue through 2024" aggregation=sum {
    measureField=Revenue
  }
  line @cal-monthly color=Channel title="Monthly revenue by channel" {
    x.title="Order month" y.title="Revenue ($)" x="Order Date" time.interval=month
    time.weekStart=monday time.aggregation=sum time.measureField=Revenue
    time.splitField=Channel time.missingPeriods=gap
  }
  row @cal-channel Channel color=Channel title="Sales channels" x.title=Orders
  metric @cal-count count title="Matching orders"
  line @cal-weekly title="Weekly order count" x.title=Week y.title=Orders x="Order Date" {
    time.interval=week time.weekStart=monday time.aggregation=count
    time.missingPeriods=zero
  }
  table @cal-rows "Order Date",Channel,Region,Revenue title="Orders on the selected dates"
  layout {
    4: cal-daily
    3: cal-monthly cal-monthly cal-channel
    2: cal-monthly cal-monthly cal-count
    4: cal-weekly
    5: cal-rows
  }
}

view "Contribution and delivery" {
  scatter @calc-scatter x="Net sales" y=Contribution color="Order band" {
    title="How much of each order remains?" x.scale=symlog y.scale=symlog
    x.title="Net sales ($)" y.title="Contribution ($)"
  }
  row @calc-band "Order band" color="Order band" title="Orders by size" x.title=Orders
  row @calc-review "Needs review" title="Which orders need review?" x.title=Orders
  hist @calc-rate "Contribution rate" title="Contribution as a share of sales" {
    x.title="Contribution (%)" y.title=Orders
  }
  hist @calc-delivery "Delivery Days" title="Delivery time" {
    x.title="Delivery time (days)" y.title=Orders
  }
  pivot @calc-monthly title="Monthly sales and contribution" rows="Order month" {
    value sum("Net sales") label="Net sales"
    value sum(Contribution) label=Contribution
  }
  table @calc-chain Units,"Unit Price","Gross sales","Discount rate","Discount amount","Net sales",Cost,Contribution,"Contribution rate","Risk points" {
    title="Follow each order's calculation"
  }
  layout {
    5: calc-scatter calc-scatter calc-band calc-review
    4: calc-rate calc-delivery calc-monthly
    5: calc-chain
  }
}
`;
