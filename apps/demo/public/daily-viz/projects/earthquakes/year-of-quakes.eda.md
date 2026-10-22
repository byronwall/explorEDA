# 7,643 strong earthquakes, and where they cluster

**Where and when did 2023's strong earthquakes strike?** Each row is one earthquake of magnitude 4.5 or more in the USGS catalogue for 2023. They arrive about twenty a day, almost all of them on a few plate boundaries, and a big one brings its own swarm: the two busiest days of the year were aftershock days.

```eda
eda query=events
date:date=events.date label="Date"
latitude:num=events.latitude label="Latitude"
longitude:num=events.longitude label="Longitude"
mag:num=events.mag label="Magnitude"
depth:num=events.depth label="Depth (km)"
band:cat=events.depth_band label="Depth band"
area:cat=events.area label="Area"
```

## The map draws the plate boundaries

No coastline is needed to see the Pacific's Ring of Fire; the earthquakes trace it. Dots are sized by magnitude and colored by depth. The year's largest earthquake was magnitude 7.8, the first shock of the February 6 sequence in southern Türkiye and Syria.

```eda
map @nb-earthquakes-year-of-quakes-1 color=band title="Earthquakes of magnitude 4.5 or more, 2023" {
  latitudeField=latitude longitudeField=longitude sizeField=mag pointOpacity=0.5
}
```

## Most days are ordinary; a few are not

Each cell is one day, colored by how many events the catalogue recorded. A large earthquake brings dozens of aftershocks above magnitude 4.5 within days. The two darkest days are December 2 and 3, after a magnitude 7.6 earthquake off Mindanao in the Philippines; February 6 is the third.

```eda
calendar @nb-earthquakes-year-of-quakes-2 date aggregation=count title="Earthquakes per day, 2023"
```

## Two swarms carry the year's spikes

The same days as a line. The catalogue recorded 127 earthquakes on February 6, the day of the Kahramanmaraş doublet, and 164 on December 2, the Mindanao aftershock day, against about twenty on an ordinary day. Both spikes decay within a week.

```eda
line @nb-earthquakes-year-of-quakes-4 x=date time.interval=day time.aggregation=count title="Earthquakes of magnitude 4.5 or more per day, 2023" x.title="Date" y.title="Earthquakes" {
  band x=2023-02-06..2023-02-12 "Kahramanmaraş sequence"
  rule x=2023-12-02 "Mindanao M7.6"
}
```

## Small quakes vastly outnumber large ones

The count falls by roughly ten for each step of one in magnitude. 76.7% of the year's earthquakes were below magnitude 5, and 1.9% reached magnitude 6 or more; 19 reached magnitude 7.

```eda
hist @nb-earthquakes-year-of-quakes-3 mag bins=34 title="Earthquakes by magnitude, 2023" x.title="Magnitude" y.title="Earthquakes" {
  rule x=6 "Magnitude 6"
}
```

## Takeaway

Strong earthquakes are common, about twenty a day, and concentrated on a few plate boundaries. The dangerous ones are rare, and each one brings its own swarm of aftershocks that a daily count turns into a visible spike.

## Limits

Magnitudes come in several types (mb, mww, and others) that are not exactly comparable. The catalogue keeps revising events after the fact.
