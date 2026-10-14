# Dashboard text v2 — draft reference (v0)

Dashboard text describes a whole explorEDA dashboard. Anything you leave out uses the app's default.

## Syntax

- **Lines.** Each line is one node: `kind [@name] [subject] key=value … ["text"] [{`.
- **Values.** Quote any value that contains spaces or commas: `title="Net sales"`. Field names with spaces are quoted too: `x="Order Date"`.
- **Bodies.** A node with children or long properties opens `{` at the end of its head line and closes with `}` on its own line.
  - Inside a body, a line that starts with `key=` sets more properties on the enclosing node.
  - A line that starts with a word is a child node.
- **Whitespace** never matters; the formatter re-indents. `#` starts a comment.
- **Names.** `@name` names a node so other lines can refer to it. When there's no `@name`, the node is named after its subject, such as the field. Use `@name` when two nodes would share a name.
- **Value forms:**
  - lists: `a,b,c`
  - ranges: `0..100`, `2024-06-01..2024-08-31`, `5..`
  - colors: `#3479a8`
  - dates: ISO
  - aggregates: `count`, `sum(F)`, `avg(F)`, `min(F)`, `max(F)`, `last(F by Order)`
- **Escape hatch.** `set some.saved.path=value` reaches any setting that has no word yet.

## Dashboard, fields, calculations, scales

```text
dashboard "Shop overview"
grid rowHeight=76 padding=0 markers=false
theme newsprint
field Revenue label="Revenue ($)" format=currency currency=USD precision=0
calc "Net sales" = Units * ["Unit Price"] - Discount      # native formula syntax
scale species Adelie=#3479a8 Chinstrap=#c77a45 Gentoo=#4b9688   # color per value
filter Region=West,East                                    # workspace filter
group @by-region sum(Revenue) by=Region name="Revenue by region"
```

Axis titles default to the field's `label`.

## Charts

| Head                                                                  | Chart                                                                                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `scatter x=F y=F`                                                     | Scatter plot. Takes `color=F`, `size=F`, `opacity=`, and `regression=linear\|polynomial\|loess`                                |
| `hist F`                                                              | Histogram. Takes `bins=`                                                                                                       |
| `bar F`                                                               | Bars by category                                                                                                               |
| `row F`                                                               | Horizontal category bars                                                                                                       |
| `line x=F y=F[,F]`                                                    | Line chart. Takes `series=F`, `interval=day\|week\|month`, `display=line\|area\|stacked-area`, `facet=F`, and `facet.columns=` |
| `boxplot F`                                                           | Box plot. Takes `by=F`                                                                                                         |
| `metric AGG`                                                          | Single value, such as `metric sum(Revenue)`                                                                                    |
| `table F,F,…`                                                         | Data table                                                                                                                     |
| `pivot rows=F values=AGG,AGG`                                         | Pivot table. Takes `columns=F`                                                                                                 |
| `parallel F,F,…`                                                      | Parallel coordinates                                                                                                           |
| `heatmap`, `calendar F`, `map`, `ecdf F`, `sankey`, `markdown "html"` | Other types; check reports their keys                                                                                          |

Every chart takes:

- `title=`, `subtitle=`, `note=`, `color=F`
- `x.title=`, `x.scale=linear|log|symlog`, `x.min=`, `x.max=`, `x.grid=`, and the same keys for `y.`
- `legend=`
- `where.F=values|range` filters this chart only
- `select.F=` sets a linked filter that also narrows other charts

### Annotations (chart children)

```text
callout "Day 31" at=Day:31 offset=-24,-28     # attach to the record whose Day is 31
rule y=4 "Target"   rule x=mean "Mean"        # reference line, fixed or computed
band x=2024-06-01..2024-08-31 "Sale"          # shaded span
region ellipse x=275..345 y=4.1..5.15 "Fast days"
```

## Placement

Place each chart once, using one of the two forms below.

```text
layout {
  5: size size species island     # each line splits 12 columns evenly: 6/3/3
  4: bill mass flipper            # 4/4/4. Repeat a name to widen it, or put it
  5: records                      #   in the same cells on the next line to make it taller
}
```

Or give a chart its own `at=x,y,w,h` in 12 columns and grid rows. It's always exact.

## Views

Define charts once at the top level. Each view places them and may override settings.

```text
view "Gentoo on Biscoe" theme=newsprint {
  layout { 5: species island size size }
  species select=Gentoo
  size title="Heavier birds"
}
```

## Composition (a designed graphic in one chart)

```text
composition @name height=704 {
  title "…"  subtitle "…"  footnote "…" at=x,y      # text from the theme; size= and color= override
  scale FIELD zero=false nice=false ticks=auto|ends|none max= label= per=shared|instance
  scale @v diverging=#a,#b center=#c max=100        # value-to-color scale; use it as color=v("Field")
  unit @u at=x,y size=WxH axis {                    # one small chart, repeated
    repeat FIELD columns=5 gap=46 limit=10 order=label|max("F")
    label value=AGG positive="+{} jobs" negative="−{} jobs"
    window FIELD=2022-07-04..                       # clip the frame to a range
    inset @i at=x,y size=WxH background=#f6f7f9     # a mini frame; marks use frame=i
    path  @m x=F y=F series=F color=#hex|v("F") width=1.5 labels=none|start|end|both
    point @m x=F y=F radius=2.5 show=all|first|last
    band  @m x=F y=LOW..HIGH fill=#hex opacity=.2
    span  @m x=START..END label=F
    strip @m x=F value=AGG shape=rect|circle
    stack @m category=F value=AGG normalize
    rule  x=VALUE|y=VALUE "label" color=#hex shade=after only="Repeat value"
  }
  legend u.m at=x,y row|column { m "label" … }      # optional per-mark labels
  note "text" on=u[RepeatValue] at=fx,fy offset=dx,dy leader
}
```
