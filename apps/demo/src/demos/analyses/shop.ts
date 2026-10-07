// The order book: one synthetic shop table, four focused tabs. It replaces
// the separate shop, calendar, bar, area, and calculation examples.

const CHANNELS = `+ mapping[]= mapping.0[]=Web,"#3479a8" mapping.1[]=Store,"#c77a45"
+ mapping.2[]=Wholesale,"#4b9688"`;

export const shopText = `dashboard name="Inside the order book"
grid rowHeight=76 padding=0 markers=false

field Revenue format=currency currency=USD precision=2
field Margin format=currency currency=USD precision=2

calc "Discount rate"=min(0.25, max(0, if Discount == null then 0 else Discount))
calc "Gross sales"=Units * ["Unit Price"]
calc "Discount amount"=["Gross sales"] * ["Discount rate"]
calc "Net sales"=["Gross sales"] - ["Discount amount"]
+ format=currency currency=USD precision=2
calc Contribution=["Net sales"] - Cost
+ format=currency currency=USD precision=2
calc "Contribution rate"=if ["Net sales"] > 0 then ["Contribution"] / ["Net sales"] * 100 else 0
+ precision=1
calc "Order band"=if ["Net sales"] >= 500 then "Large" else if ["Net sales"] >= 100 then "Standard" else "Small"
calc "Risk points"=sum(if Returned then 10 else 0, if !Fulfilled then 5 else 0, if ["Delivery Days"] != null && ["Delivery Days"] > 7 then 2 else 0)
calc "Needs review"=["Risk points"] >= 5 || ["Contribution"] < 0
calc "Order month"=formatDate(["Order Date"], "%Y-%m")

scale @category-colors field=Category
+ mapping[]= mapping.0[]=Home,"#3479a8" mapping.1[]=Outdoors,"#c77a45"
+ mapping.2[]=Electronics,"#4b9688" mapping.3[]=Kitchen,"#9c6eac"
scale @channels field=Channel
${CHANNELS}
group @revenue-by-region name="Revenue by region"
+ groupField=Region measureField=Revenue aggregation=sum

view "Order book"
metric count @shop-count at=0,0,4,2 title="Matching orders"
metric sum=Revenue @shop-revenue at=4,0,4,2 title="Revenue in this selection"
metric avg=Revenue @shop-average at=8,0,4,2 title="Average order value"
scatter x=Revenue y=Margin @shop-margin at=0,2,6,5 color=Category
+ xAxis.scaleType=symlog yAxis.scaleType=symlog title="Revenue and margin per order"
+ xAxisLabel="Revenue ($)" yAxisLabel="Margin ($)"
row Category @shop-category at=6,2,3,5 color=Category title="Orders by category"
+ xAxisLabel=Orders minRowHeight=22 maxRowHeight=36
row Channel @shop-channel at=9,2,3,5 color=Channel title="Sales channels"
+ xAxisLabel=Orders minRowHeight=22 maxRowHeight=36
hist "Delivery Days" @shop-delivery at=0,7,4,4 binCount=20
+ title="How long does delivery take?" xAxisLabel="Delivery time (days)" yAxisLabel=Orders
chart boxplot field=Revenue @shop-order at=4,7,4,4 color=Category
+ yAxis.scaleType=symlog title="Order value by category" yAxisLabel="Revenue ($)"
hist Revenue @shop-region at=8,7,4,4 aggregateId=revenue-by-region
+ title="Revenue by region" xAxisLabel=Region yAxisLabel="Revenue ($)"
chart heatmap field=Category @shop-category-region at=0,11,6,6
+ columnField=Region aggregation=sum measureField=Revenue
+ title="Where does revenue come from?"
chart sankey @shop-flow at=6,11,6,6 stages[]=Channel,Category,Returned
+ title="Which channels and categories lead to returns?"
table "Order Date",Region,Channel,Category,Product,Revenue,Margin,"Delivery Days",Returned
+ @shop-orders at=0,17,12,5 title="Orders in this selection"

view "Sales mix"
bar Region @mix-grouped at=0,0,6,6 aggregateId=revenue-by-region
+ seriesField=Channel color=Channel title="Revenue by region and channel"
+ yAxisLabel="Revenue ($)"
bar Region @mix-share at=6,0,6,6 seriesField=Channel color=Channel
+ seriesLayout=percent title="Channel share of each region's orders"
+ yAxisLabel="Share of orders (%)"
chart line @mix-layers at=0,6,8,5 xField="Order Date" color=Channel
+ time.interval=month time.weekStart=monday time.aggregation=sum
+ time.measureField=Revenue time.splitField=Channel time.missingPeriods=zero
+ time.display=stacked-area title="Monthly revenue layers by channel"
+ xAxisLabel="Order month" yAxisLabel="Revenue ($)"
row Category @mix-category at=8,6,4,5 color=Category title="Filter by category"
+ xAxisLabel=Orders minRowHeight=22 maxRowHeight=36
chart pivot @mix-pivot at=0,11,12,5 title="Revenue by region and channel"
+ rowFields[]=Region columnField=Channel valueFields[]=
+ valueFields.0.field=Revenue valueFields.0.aggregation=sum valueFields.0.label=Revenue

view "Calendar"
chart calendar field="Order Date" @cal-daily at=0,0,12,4
+ aggregation=sum measureField=Revenue title="Daily revenue through 2024"
chart line @cal-monthly at=0,4,8,5 xField="Order Date" color=Channel
+ time.interval=month time.weekStart=monday time.aggregation=sum
+ time.measureField=Revenue time.splitField=Channel time.missingPeriods=gap
+ title="Monthly revenue by channel" xAxisLabel="Order month" yAxisLabel="Revenue ($)"
row Channel @cal-channel at=8,4,4,3 color=Channel title="Sales channels"
+ xAxisLabel=Orders minRowHeight=22 maxRowHeight=36
metric count @cal-count at=8,7,4,2 title="Matching orders"
chart line @cal-weekly at=0,9,12,4 xField="Order Date"
+ time.interval=week time.weekStart=monday time.aggregation=count
+ time.missingPeriods=zero title="Weekly order count" xAxisLabel=Week yAxisLabel=Orders
table "Order Date",Channel,Region,Revenue @cal-rows at=0,13,12,5
+ title="Orders on the selected dates"

view "Contribution and delivery"
scatter x="Net sales" y=Contribution @calc-scatter at=0,0,6,5
+ xAxis.scaleType=symlog yAxis.scaleType=symlog color="Order band"
+ title="How much of each order remains?" xAxisLabel="Net sales ($)"
+ yAxisLabel="Contribution ($)"
row "Order band" @calc-band at=6,0,3,5 color="Order band" title="Orders by size"
+ xAxisLabel=Orders minRowHeight=22 maxRowHeight=36
row "Needs review" @calc-review at=9,0,3,5 title="Which orders need review?"
+ xAxisLabel=Orders minRowHeight=22 maxRowHeight=36
hist "Contribution rate" @calc-rate at=0,5,4,4 binCount=20
+ title="Contribution as a share of sales" xAxisLabel="Contribution (%)" yAxisLabel=Orders
hist "Delivery Days" @calc-delivery at=4,5,4,4 binCount=20
+ title="Delivery time" xAxisLabel="Delivery time (days)" yAxisLabel=Orders
chart pivot @calc-monthly at=8,5,4,4 title="Monthly sales and contribution"
+ rowFields[]="Order month" valueFields[]=
+ valueFields.0.field="Net sales" valueFields.0.aggregation=sum valueFields.0.label="Net sales"
+ valueFields.1.field=Contribution valueFields.1.aggregation=sum valueFields.1.label=Contribution
table Units,"Unit Price","Gross sales","Discount rate","Discount amount","Net sales",Cost,Contribution,"Contribution rate","Risk points"
+ @calc-chain at=0,9,12,5 title="Follow each order's calculation"
`;
