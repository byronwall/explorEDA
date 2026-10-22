# A decade on, Microsoft was still 28% below its 2000 price; Apple was up ninefold

**How did five technology stocks come through the dot-com crash and the 2008 crisis?** Each row is one company's closing share price in one month, January 2000 to March 2010, for Apple, Amazon, IBM, and Microsoft, and from its August 2004 listing for Google. The decade opened at the top of the dot-com bubble and closed a year after the financial crisis bottomed, so it holds two crashes. The five stocks went into them together and came out in very different places. The first month's close is a constant read from the data, so each company's path starts at 100.

```eda
eda query=prices
company:cat=prices.Company label="Company"
month:date=prices.Month label="Month"
price:num=prices.Price label="Closing price ($)"
indexed:num=indexed label="Price (first month = 100)"
```

## From the same start, the paths end a factor of twelve apart

Indexed to each company's first month, the five lines share a starting point. By March 2010 Apple stood at 860, Google at 547, Amazon at 200, IBM at 125, and Microsoft at 72. On a log axis equal vertical distances are equal multiples, so Apple's climb from 2003 and Microsoft's flat decade read at their true size.

```eda
line @nb-stocks-two-crashes-1 x=month y=indexed title="Closing price indexed to each company's first month, log scale" x.title="Month" y.title="Indexed price (log)" y.scale=log {
  time.interval=month time.aggregation=average time.measureField=indexed time.splitField=prices.Company
  band x=2000-03-01..2002-10-31 "Dot-com crash"
  band x=2007-10-01..2009-03-31 "Financial crisis"
  rule y=100 "Starting price"
}
```

## The dot-com crash cost Amazon 91% and Apple 72%

Amazon closed at $64.56 in January 2000 and at $5.97 in September 2001, its low. Apple fell from $25.94 to $7.07 in March 2003. Microsoft fell from $39.81 to $17.65 by December 2000. IBM, the old-economy stock of the five, fell least, to $53.01 in September 2002.

```eda
line @nb-stocks-two-crashes-2 x=month y=indexed title="Indexed price through the dot-com crash, log scale" x.title="Month" y.title="Indexed price (log)" y.scale=log where.month=..2003-12-01 {
  time.interval=month time.aggregation=average time.measureField=indexed time.splitField=prices.Company
  band x=2000-03-01..2002-10-31 "Dot-com crash"
  rule y=100 "Starting price"
  callout "Amazon's low, $5.97" at=2001-09-01,9.25 offset=40,30
}
```

## 2008 halved Google and Apple, and the recovery took a year

Google peaked at $707.00 in October 2007 and closed at $348.06 in March 2009. Apple fell from $189.95 to $105.12 over the same months and Microsoft from $35.03 to $17.99. Amazon and IBM lost less than a fifth. Twelve months later Apple had made a new high at $223.02 and Google was back above $560, while Microsoft, at $28.80, was still below its October 2007 price.

```eda
line @nb-stocks-two-crashes-3 x=month y=indexed title="Indexed price through the financial crisis, log scale" x.title="Month" y.title="Indexed price (log)" y.scale=log where.month=2007-01-01.. {
  time.interval=month time.aggregation=average time.measureField=indexed time.splitField=prices.Company
  band x=2007-10-01..2009-03-31 "Financial crisis"
  rule y=100 "Starting price"
}
```

## Takeaway

Two crashes in one decade sorted five similar-looking stocks into winners and a loser. Apple and Google multiplied; Amazon and IBM roughly held their ground after a lost half-decade; Microsoft, the largest of the five in 2000, ended the decade worth less per share than it began. The crash that mattered was the first one: the 2008 losses were made back within a year, the 2000 losses took Amazon seven years.

## Limits

Monthly closes, not adjusted for dividends or for splits made after the file was prepared, so total return is understated, most for Microsoft and IBM. Five companies chosen for a chart, not a sample of the sector. Google's index starts at its listing in August 2004, so its 100 is not comparable in time with the others'.
