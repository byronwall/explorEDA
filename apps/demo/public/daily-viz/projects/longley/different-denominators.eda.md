# Unemployment swung 2.6-fold while employment rose 17%

**How did American joblessness move in the fifteen years after the war?** Each row is one year from 1947 to 1962 in the Longley benchmark, with the number of people employed, unemployed, and in the armed forces, all in thousands. There is no labor-force total, so none of these can become a rate. The counts still tell a story: employment crept up while unemployment lurched.

```eda
eda query=r
employment:num=r.employment label="Employed (thousands)"
unemployed:num=r.unemployed label="Unemployed (thousands)"
armed:num=r.armed label="Armed forces (thousands)"
year:num=r.year label="Year"
era:cat=r.era label="Era"
employment_index:num=r.employment_index label="Employed (1947 = 100)"
calc unemployed_index = unemployed / 2356 * 100
calc armed_index = armed / 1590 * 100
field unemployed_index label="Unemployed (1947 = 100)"
field armed_index label="Armed forces (1947 = 100)"
```

## Set all three counts to 100 in 1947

On a shared index, employment is nearly a flat line: it was 60,323 thousand in 1947 and 70,551 thousand in 1962. Unemployment and the armed forces swing around it. The armed forces more than doubled during the Korean War, reaching 3,594 thousand in 1952, and never fell back to the 1948 low of 1,456 thousand.

```eda
line @nb-longley-different-denominators-chart-1 x=year y=employment_index,unemployed_index,armed_index title="Employed, unemployed, and armed forces, indexed to 1947" x.title="Year" y.title="Index (1947 = 100)" {
  rule y=100 "1947 level"
}
```

## Unemployment jumped in four recessions

The raw count shows where the swings come from. Unemployment fell to 1,870 thousand in 1953 and reached 4,806 thousand in 1961, 2.6 times as many people. Each jump lines up with an NBER recession: 1949, 1954, 1958, and 1961. The 1958 jump was the sharpest, and the count never returned to its 1950s lows.

```eda
line @nb-longley-different-denominators-chart-2 x=year y=unemployed title="Unemployed, thousands, 1947 to 1962" x.title="Year" y.title="Unemployed (thousands)" {
  band x=1948.83..1949.75 "1949"
  band x=1953.5..1954.33 "1954"
  band x=1957.58..1958.25 "1958"
  band x=1960.25..1961.08
  callout "1961: 4,806 thousand" pick=max offset=-150,24
  callout "1953: 1,870 thousand" pick=min
}
```

## Both counts rose, so neither is a rate

Each point is one year, placed by its employed and unemployed counts and colored by era. The later years sit up and to the right: mean unemployment was 2,649 thousand from 1947 to 1954 and 3,738 thousand from 1955 to 1962, while employment rose through both eras. More people working and more people looking for work are not in tension; the population was growing.

```eda
scatter @nb-longley-different-denominators-chart-3 x=employment y=unemployed color=era title="Unemployed against employed, one point per year" x.title="Employed (thousands)" y.title="Unemployed (thousands)"
```

## Takeaway

Between 1947 and 1962 the number of Americans employed grew by a sixth, and the number unemployed in the worst year was two and a half times the best. Read the second number against the first, not alone: a bigger workforce has more of everyone in it.

## Limits

Sixteen annual rows from a 1967 regression benchmark, in the vintage Longley used. The file has no labor-force total, so no unemployment rate can be built from it, and the population column counts everyone aged 14 and over, not participants.
