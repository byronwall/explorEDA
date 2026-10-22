**Where, when, how deep, and how big were 2023's strong earthquakes?** Each row is one earthquake of magnitude 4.5 or more in the USGS catalogue for 2023: 7,643 of them, about twenty a day. One year of them answers four questions, each on its own sheet. Where: a narrow ring around the Pacific. When: evenly through the year, except for the days after the biggest shocks. How deep: four in five start in the top 70 km of the crust. How big: a magnitude 6 is rare, a 7 rarer still, and the year's largest, a 7.8, killed more than fifty thousand people in Türkiye and Syria.

```eda
eda query=events
date:date=events.date label="Date"
latitude:num=events.latitude label="Latitude"
longitude:num=events.longitude label="Longitude"
mag:num=events.mag label="Magnitude"
depth:num=events.depth label="Depth (km)"
band:cat=events.depth_band label="Depth band"
area:cat=events.area label="Area"
place:cat=events.place label="Place"
calc deep_longitude = depth >= 300 ? longitude : null
```

# Where

## The Pacific rim draws itself

No coastline is drawn, yet the map shows the Ring of Fire from New Zealand up through Tonga, Japan, and the Aleutians and down the Americas. Dots are sized by magnitude and colored by depth; the deep ones sit where one plate dives under another.

```eda
map @nb-earthquakes-four-questions-1 color=band title="Earthquakes of magnitude 4.5 or more, 2023, sized by magnitude" {
  latitudeField=latitude longitudeField=longitude sizeField=mag pointOpacity=0.5
}
```

## Two archipelagos take a fifth

The Philippines and Indonesia head the list. The Philippines alone recorded 793 earthquakes, 10.4% of the year's catalogue, and the twelve busiest areas are all on the western or southern Pacific.

```eda
row @nb-earthquakes-four-questions-2 area topN=12 title="The twelve busiest areas, by count of earthquakes" x.title="Earthquakes"
```

# When

## A big shock brings its own swarm

Each cell is one day, colored by how many earthquakes the catalogue recorded. Most days hold their twenty; the dark cells are aftershock sequences. The darkest run, December 2 and 3, follows the magnitude 7.6 earthquake off Mindanao in the Philippines.

```eda
calendar @nb-earthquakes-four-questions-3 date aggregation=count title="Earthquakes per day, 2023"
```

## Two days carried a tenth of a month

On December 2 the catalogue recorded 164 earthquakes, eight times a normal day, and December as a whole holds 1,117, the busiest month by a third. February 6, the day of the Kahramanmaraş shocks, recorded 127.

```eda
line @nb-earthquakes-four-questions-4 x=date title="Earthquakes per day" y.title="Earthquakes" {
  time.interval=day time.aggregation=count
  callout "Dec 2: Mindanao M7.6" at=2023-12-02,164 offset=-120,16
  callout "Feb 6: Kahramanmaraş M7.8" at=2023-02-06,127 offset=60,-14
}
```

# How deep

## Four in five start in the crust

79.3% of the year's earthquakes began shallower than 70 km, and the median depth was 13 km. The histogram falls off a cliff past the crust; the long tail to 650 km is a different kind of earthquake.

```eda
hist @nb-earthquakes-four-questions-5 depth bins=70 title="Earthquakes by depth, 2023" x.title="Depth (km)" y.title="Earthquakes" x.max=700 {
  rule x=70 "Intermediate"
  rule x=300 "Deep"
}
```

## The deep ones live under Fiji and Tonga

Earthquakes 300 km or deeper numbered 334, and three in four started within ten degrees of the date line, where old Pacific floor sinks far into the mantle before it breaks: the share east of 170°E was 18.0%, and the share west of 170°W was 56.6%. A smaller cluster sits under the Banda Sea. The deepest of the year started 653.5 km down.

```eda
hist @nb-earthquakes-four-questions-6 deep_longitude bins=72 title="Earthquakes 300 km or deeper, by longitude" x.title="Longitude (degrees east)" y.title="Earthquakes" {
  rule x=-176 "Fiji and Tonga"
  rule x=125 "Banda Sea"
}
```

# How big

## Each step of magnitude cuts the count tenfold

The median earthquake in this catalogue is a magnitude 4.7. Only 1.9% reached magnitude 6, and 19 reached 7. Each tenth of magnitude to the right holds fewer earthquakes than the last; the bars past 6 are a sliver of the whole.

```eda
hist @nb-earthquakes-four-questions-7 mag bins=34 title="Earthquakes by magnitude, 2023" x.title="Magnitude" y.title="Earthquakes" {
  rule x=6 "Magnitude 6"
  rule x=7 "Magnitude 7"
}
```

## The nineteen that reached magnitude 7

The year's largest earthquake was magnitude 7.8, the first of the two Kahramanmaraş shocks on February 6, and the only one of the nineteen that struck a densely populated area at shallow depth. Most of the others were deep or offshore.

```eda
table @nb-earthquakes-four-questions-8 date,place,mag,depth where.mag=7.. title="Earthquakes of magnitude 7 or more, 2023"
```

## Takeaway

Strong earthquakes are ordinary, about twenty a day, and they happen in the same narrow belts year after year. What varies is the handful of large ones: each brings a swarm that can double a month's count, and whether it kills depends less on magnitude than on depth and on who lives above it.

## Limits

Magnitudes come in several types (mb, mww, and others) that are not exactly comparable, and the catalogue keeps revising events. "Area" is the USGS place name, so "Japan" and "Japan region" count separately. Counts are of catalogued earthquakes, not of shaking felt.
