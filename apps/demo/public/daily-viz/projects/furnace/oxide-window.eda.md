# Every wafer met spec; the furnace run decided where it landed

**Does the oxide furnace hold 560 ± 100 Å, and what moves the thickness?** A semiconductor fab grows a thin oxide film on silicon wafers in a furnace, and the case study sets the goal at 560 Å, give or take 100. Each row is one wafer: 21 furnace runs, four zones in the furnace, two wafers per zone. Every wafer passed. The spread inside the window comes mostly from run to run, not from where a wafer sat in the furnace.

```eda
eda query=furnace
thick:num="furnace.Thickness (Å)" label="Oxide thickness (Å)"
zone:cat=furnace.Zone label="Furnace zone"
run:num=furnace.Run label="Furnace run"
```

## Every wafer sits inside the window, with room to spare

The bins are 10 Å wide and start at the lower limit, so the plot spans the whole specification and nothing else. The dashed lines are the limits; the tinted space past them is empty. 100.0% of the 168 wafers fell inside 460 to 660 Å. The thinnest wafer measured 487 Å and the thickest 634 Å, so the closest call was 26 Å from the upper limit. The median wafer measured 562.5 Å, close to the 560 Å target.

```eda
bar @nb-furnace-oxide-window-1 thick bins.mode=width bins.width=10 bins.origin=0 bins.first=46 bins.last=66 spec.lower=460 spec.upper=660 title="Oxide thickness of 168 wafers in 10 Å bins, against 560 ± 100 Å" x.title="Oxide thickness (Å)" y.title="Wafers"
```

## Runs move the thickness more than zones do

Each column of points is one furnace run, colored by zone. Within a run the four zones land close together, but whole runs shift up or down. Run 3 averaged 517.1 Å and run 7 averaged 594.4 Å, a gap of 77 Å between two runs of the same process.

```eda
scatter @nb-furnace-oxide-window-2 x=run y=thick color=zone title="Oxide thickness by furnace run and zone, 168 wafers" x.title="Furnace run" y.title="Oxide thickness (Å)" {
  rule y=560 "Target 560 Å"
}
```

## The four zones have nearly the same center

Pooled over all 21 runs, the zones barely differ. Zone 1 averaged 561.4 Å and Zone 2 averaged 566.6 Å, about 5 Å apart, while the runs above span 77 Å. Zone 3 has the widest range, because it holds both the thinnest and the thickest wafer.

```eda
boxplot @nb-furnace-oxide-window-3 thick color=zone title="Oxide thickness by furnace zone, 42 wafers each" y.title="Oxide thickness (Å)"
```

## Takeaway

The furnace met its specification on every wafer, so a pass rate says nothing more here. To center the process tighter, the place to look is what changes between runs, not the layout of the zones.

## Limits

This is one study of 168 wafers from 21 runs, with no dates or run conditions, so it cannot say why runs differ. The ± 100 Å window is the goal stated in the case study, not a customer specification. Two wafers per zone is a small sample for comparing zones within one run.
