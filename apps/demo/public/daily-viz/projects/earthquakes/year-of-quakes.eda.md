# 7,643 strong earthquakes, and where they cluster

**Where and when did 2023's strong earthquakes strike?** Each row is one earthquake of magnitude 4.5 or more in the USGS catalogue for 2023.

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

No coastline is needed to see the Pacific's Ring of Fire; the earthquakes trace it. Dots are sized by magnitude and colored by depth.

```eda
map @nb-earthquakes-year-of-quakes-1 color=band title="Earthquakes of magnitude 4.5 or more, 2023" {
  latitudeField=latitude longitudeField=longitude sizeField=mag pointOpacity=0.5
}
```

**Finding.** The year's largest earthquake was magnitude 7.8.

That was the first shock of the February 6 sequence in southern Türkiye and Syria.

## Most days are ordinary; a few are not

Each cell is one day, colored by how many events the catalogue recorded. A large earthquake brings dozens of aftershocks above magnitude 4.5 within days.

```eda
calendar @nb-earthquakes-year-of-quakes-2 date aggregation=count title="Earthquakes per day, 2023"
```

The two darkest days are December 2 and 3, after a magnitude 7.6 earthquake off Mindanao in the Philippines.

## Small quakes vastly outnumber large ones

The count falls by roughly ten for each step of one in magnitude. The cumulative curve shows how few events reach the top of the scale.

```eda
ecdf @nb-earthquakes-year-of-quakes-3 mag direction=below title="Share of earthquakes at or below each magnitude" x.title="Magnitude"
```

**Finding.** 1.9% of the year's earthquakes reached magnitude 6 or more.

## Takeaway

Strong earthquakes are common, about twenty a day, and concentrated on a few plate boundaries. The dangerous ones are rare, and each one brings its own swarm of aftershocks that a daily count turns into a visible spike.

## Limits

Magnitudes come in several types (mb, mww, and others) that are not exactly comparable. The catalogue keeps revising events after the fact.
