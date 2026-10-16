"""Original composition designs and linked dashboard investigations.
Only primitives/settings inspected in the authorized baseline are used.
Native rendering and compilation are intentionally not claimed here.
"""
from copy import deepcopy
import json,html
import build as B
from editorial import NOTEBOOKS,S
ROOT=B.ROOT
BY={(n['family'],n['slug']):n for n in NOTEBOOKS}
CREDIT={
'ercot':'EIA / ERCOT; authorized repository snapshot; U.S. public-domain data.',
'co2':'Keeling and Whorf / CDIAC; statsmodels historical snapshot; public domain.',
'elnino':'NOAA CPC, ERSST v3b Niño 1+2; historical snapshot; public domain.',
'sunspots':'NOAA historical sunspot series via statsmodels; public domain.',
'nile':'Aswan historical Nile observations via statsmodels; public domain.',
'macro':'U.S. macroeconomic sources via statsmodels; historical vintage; public domain.',
'grunfeld':'Grunfeld investment panel, Kleiber and Zeileis / statsmodels; public domain.',
'stackloss':'Brownlee plant observations via statsmodels; public domain.',
'engel':'Engel household data via statsmodels; historical Belgian sample; public domain.',
'strikes':'BLS / Kennan strike-duration sample via statsmodels; public domain.',
'danish':'Johansen and Juselius Danish data via statsmodels; public domain.',
'fertility':'World Bank, UN and national statistical sources; historical snapshot; CC BY 4.0.',
'iris':'Fisher / UCI Iris, scikit-learn corrected variant; CC BY 4.0.',
'wine':'Aeberhard and Forina / UCI Wine recognition; CC BY 4.0; source assay units.',
'longley':'Longley historical employment benchmark via statsmodels; public domain.',
'football':'OpenFootball World Cup 2018 group-stage final scores; public-domain dedication.',
'tate':'Tate collection metadata, October 2014 archive; first 60 records; CC0 1.0.'}

COMPOSITIONS=[]
def C(family,ref,slug,title,query,body,encoding,order,baseline,scale,loss,height=640,width=960):
    COMPOSITIONS.append(dict(family=family,reference=ref,slug=slug,title=title,query=query,body=body.strip(),encoding=encoding,order=order,baseline=baseline,scale=scale,information_loss=loss,height=height,width=width))

C('ercot','signed-error','error-zero','One zero line makes the forecast miss readable','r',r'''
scale numeric r.date nice=false
scale numeric r.error zero=true
unit Hours at=92,148 size=820x350 axisTitles.x="UTC supplied hour" axisTitles.y="Actual minus forecast (MWh)" {
  label show=false
  path Error x=r.date y=r.error orderField=r.date strokeWidth=1.3
}
rule "On forecast" at=6,0 unit=Hours axis=y value.value=0
''','A chronological path encodes the signed MWh difference. A constant horizontal rule marks equality.','Ascending supplied UTC timestamp; no smoothing.','Zero is actual equals forecast.','Shared linear MWh scale includes zero. The x scale uses real timestamps.','The original served-demand and forecast levels disappear. The source notebook preserves both.')

C('ercot','clock-coverage','clock-error-cells','Clock-hour error cells need their coverage context','clock',r'''
scale position clock.hour_label
scale value Miss transform=linear
unit Months at=40,165 size=740x42 {
  repeat clock.month_label arrangement=rows gap=75 order=label
  label width=155 fontSize=13
  strip Error position=clock.hour_label valueScale=Miss aggregation=average measureField=clock.abs_error encoding=color
}
legend "Mean absolute error (MWh)" at=200,115 unit=Months mark=Error scale=Miss
''','Each cell encodes the mean absolute miss for one supplied month and UTC clock hour.','Months and padded clock labels follow calendar order.','Absolute error starts at zero; an empty cell is not zero.','One shared linear color ramp; native value ramps may rescale under filtering.','Cell means hide individual hours. The accompanying clock notebook exposes hours per cell.',height=540)

C('co2','trend-and-coverage','annual-concentration','A historical CO2 rise, one available-week mean per year','annual',r'''
scale numeric annual.year nice=false
scale numeric annual.mean zero=false
unit Years at=88,150 size=820x345 axisTitles.x="Supplied year" axisTitles.y="Annual mean CO2 (ppmv)" {
  label show=false
  path Mean x=annual.year y=annual.mean orderField=annual.year
  point Annual x=annual.year y=annual.mean radius=2
}
''','A thin path and dots show the available-week annual means. Dots retain the annual sampling unit.','Chronological years; no endpoint extension.','The concentration axis is not forced to zero because position, not bar length, encodes value.','One linear concentration scale; partial endpoint years remain included and documented.','Seasonality and week-level coverage disappear in the annual mean; they remain in the linked source material.')

C('co2','seasonal-centering','month-middle-half','The middle half of centered CO2 weeks, month by month','r',r'''
scale numeric r.residual zero=true
unit Calendar at=90,155 size=820x330 axisTitles.y="CO2 minus annual measured-week mean (ppmv)" {
  label show=false
  summary Weeks groupField=r.month_label measureField=r.residual y=r.residual
}
rule "Annual reference" at=5,0 unit=Calendar axis=y value.value=0
legend "Reading the summary" at=100,545 unit=Calendar mark=Weeks {
  item "Middle half of measured weeks" mark=Weeks part=band
  item "Median" mark=Weeks part=median
}
''','Native unweighted quartiles form a band and medians are connected across ordered months.','Padded month labels preserve January-to-December order.','Zero is each underlying year’s measured-week mean, not a universal absolute concentration.','Shared linear residual scale; the summary is recomputed from eligible live rows.','This representation hides the absolute concentration trend and each individual week. Means quoted in the companion are distinct from the drawn medians.',height=680)

C('elnino','two-warm-windows','aligned-windows','Two warm-water windows on one unshifted clock','episodes',r'''
scale numeric episodes.episode_month nice=false min=1 max=24
scale numeric episodes.anomaly zero=true
unit Windows at=90,155 size=820x330 axisTitles.x="Month since January of first year" axisTitles.y="Niño 1+2 anomaly (degrees C)" {
  label show=false
  path Anomalies x=episodes.episode_month y=episodes.anomaly orderField=episodes.episode_month seriesField=episodes.episode colorField=episodes.episode
  point Months x=episodes.episode_month y=episodes.anomaly radius=2 colorField=episodes.episode
}
rule "1981–2010 monthly reference" at=5,0 unit=Windows axis=y value.value=0
legend Windows at=110,535 unit=Windows mark=Anomalies
''','Two colored paths retain the monthly anomalies in the predeclared two-year windows.','Each path runs from January of its first year; peaks are not shifted into alignment.','Zero is the selected calendar-month climatology.','Shared linear Celsius anomaly scale and identical 1–24 month index.','A two-window comparison cannot establish the distribution of all events or a causal explanation.',height=690)

C('elnino','annual-range','observed-range','A temperature range is not a confidence interval','annual',r'''
scale numeric annual.year nice=false
scale numeric annual.mean zero=false
unit Years at=90,155 size=820x330 axisTitles.x=Year axisTitles.y="Niño 1+2 temperature (degrees C)" {
  label show=false
  band Range x=annual.year y=annual.mean orderField=annual.year lowerField=annual.low upperField=annual.high opacity=0.18
  path Mean x=annual.year y=annual.mean orderField=annual.year strokeWidth=1.8
}
legend "Observed, not modeled" at=95,535 unit=Years mark=Mean {
  item "Observed monthly minimum to maximum" mark=Range
  item "Annual monthly mean" mark=Mean
}
''','A supplied min–max band surrounds an annual mean path. The band uses measured monthly extremes.','Calendar-year order, with no smooth curves or forecast extension.','No artificial zero baseline for a position-encoded Celsius series.','One shared linear temperature scale spans the mean and both supplied bounds.','The month that produced an extreme is lost. The band is not sampling uncertainty, a prediction interval, or a native forecast.',height=690)

C('sunspots','cycles','activity-ridges','Annual sunspot activity has different distributions across eras','r',r'''
scale numeric r.activity zero=true
unit Eras at=42,155 size=745x42 axisTitles.x="Historical annual sunspot number" {
  repeat r.era arrangement=rows gap=25 order=label
  label width=150 fontSize=12
  density Activity x=r.activity height=shared opacity=0.6
}
''','One native kernel-density trace summarizes annual sunspot numbers in each broad historical span.','Half-century labels in ascending order; the final span is incomplete.','The horizontal scale includes zero; ridge height is a shared density peak, not an observation count.','A shared activity domain allows horizontal comparison. Density peaks may rescale with active filters in this baseline.','Smoothing hides individual years and depends on bandwidth. Unequal era counts remain in the source notebook.',height=800)

C('nile','before-and-after','flow-boundary','A comparison boundary does not make a causal experiment','r',r'''
scale numeric r.year nice=false
scale numeric r.volume zero=false
unit Years at=90,155 size=820x335 axisTitles.x=Year axisTitles.y="Annual flow at Aswan (10^8 m3)" {
  label show=false
  path Flow x=r.year y=r.volume orderField=r.year
  point Annual x=r.year y=r.volume radius=2
}
rule "1898 comparison boundary" at=6,-335 unit=Years value.value=1898
''','An annual-volume path keeps wet and dry years visible, with a fixed vertical comparison boundary.','Chronological source years.','The boundary defines a descriptive split; the volume axis is a position scale, not a bar-length baseline.','One shared linear annual-volume scale.','A single path cannot adjust for climate, gauge changes, or other confounders. The line is not an estimated intervention effect.')

C('macro','level-versus-growth','growth-horizon','GDP growth folded around zero, not the GDP level','r',r'''
scale numeric r.date nice=false
unit Growth at=95,170 size=805x230 axisTitles.x="Historical quarter" {
  label show=false
  horizon Changes x=r.date field=r.gdp_growth orderField=r.date baseline=zero relative=false bands=3 domain=shared
}
note "Blue is positive growth; red is negative. Bands fold magnitude. Return to the line chart for exact signed height." at=95,465 leader=false
''','A native horizon mark folds positive and negative annualized quarterly growth into compact bands.','Quarter order, with the initial unavailable change left null.','Zero means no quarterly GDP change; the horizon is not rebased to its first observation.','Shared growth magnitude; three bands are a display choice, not economic categories.','Folding reduces direct vertical reading and can obscure the size of extremes. The original growth line is the necessary companion.',height=630)

C('macro','inflation-unemployment','decade-clouds','Decade clouds complicate a pooled economic relationship','r',r'''
scale numeric r.unemp zero=false
scale numeric r.infl zero=true
unit Quarters at=90,155 size=790x325 axisTitles.x="Unemployment rate (%)" axisTitles.y="Source annualized inflation (%)" {
  label show=false
  point Observations x=r.unemp y=r.infl colorField=r.decade radius=3
}
legend Decades at=110,535 unit=Quarters mark=Observations
''','Individual quarterly observations are positioned by unemployment and inflation and colored by decade.','No connecting path: file order is not a trajectory through this two-variable space.','Inflation includes a zero reference in the domain; source initial placeholder remains identifiable in the table.','Shared linear percentage scales for every decade.','The graphic discards temporal adjacency. Pooled or grouped proximity is not a causal policy relationship.',height=690)

C('grunfeld','within-firm','shared-firm-paths','Firm investment paths on one absolute scale','r',r'''
scale numeric r.year nice=false ticks=ends
scale numeric r.invest zero=true
unit Firms at=34,145 size=715x42 axisTitles.x=Year {
  repeat r.firm arrangement=rows gap=27 order=label
  label width=195 fontSize=12
  path Investment x=r.year y=r.invest orderField=r.year
}
''','A repeated path for each firm shows recorded investment using the same vertical scale.','Firm names alphabetically; years ascend inside each row.','A shared zero baseline makes absolute investment heights comparable.','Shared linear source 1947-dollar units; no unverified multiplier added.','Smaller firms become compressed. That is an honest consequence of absolute comparison, not a reason to secretly rescale each row.',height=1030)

C('grunfeld','indexing-firms','firm-shapes','An indexed sparkline grid trades magnitude for shape','r',r'''
scale numeric r.year nice=false ticks=ends
scale numeric r.invest_index domain=instance zero=false
unit Firms at=65,160 size=250x120 axisTitles.x=Year {
  repeat r.firm arrangement=grid columns=3 gap=68 order=label
  label fontSize=12
  path Indexed x=r.year y=r.invest_index orderField=r.year
  point Latest x=r.year y=r.invest_index orderField=r.year show=last radius=3
}
''','A grid of indexed investment paths gives each firm room to show its own trajectory, with the latest observation marked.','Alphabetic firm order, chronological years within each path.','Each index begins at 100 by construction; per-panel vertical domains are explicitly allowed to differ.','Common time scale, intentionally separate value scales. Heights must not be compared between panels.','Absolute investment and directly comparable growth amplitude are lost. This is an explicit shape-reading alternative, not an improvement for every task.',height=1010,width=1080)

C('stackloss','leave-one-out','influence-pair','An influential plant observation is not automatically an error','r',r'''
scale numeric r.airflow zero=false
scale numeric r.stackloss zero=true
scale numeric r.sequence nice=false
scale numeric r.loo_slope zero=false
unit Observed at=90,165 size=345x300 axisTitles.x="Airflow (source units)" axisTitles.y="Recorded loss (source ×10 scale)" {
  label show=false
  point Days x=r.airflow y=r.stackloss radius=4
}
unit Sensitivity at=580,165 size=345x300 axisTitles.x="Omitted source-row sequence" axisTitles.y="Leave-one-out slope" {
  label show=false
  point Slopes x=r.sequence y=r.loo_slope radius=4
}
''','The left panel shows original observed pairs; the right panel shows one refitted slope per omitted observation.','Original row sequence identifies omitted points; it is not a verified date sequence.','Loss includes zero; the slope panel uses a position scale centered on the observed range, not zero.','Separate labeled scales reflect different quantities. The panels are not dual axes on one plot.','The paired display does not show multivariable controls or prediction uncertainty. No row is removed from the reference data.',height=670,width=1040)

C('engel','food-and-income','household-share-swarm','Each household remains a dot in the food-share comparison','r',r'''
scale numeric r.food_share zero=true
unit Quartiles at=42,165 size=710x68 axisTitles.x="Food expenditure / household income (%)" {
  repeat r.income_band arrangement=rows gap=30 order=label
  label width=200 fontSize=12
  point Households x=r.food_share spread=swarm radius=3
}
''','One dot per household is spread into a swarm along its food-share value within its income quartile.','Quartiles ascend from lower to higher income. Vertical dot displacement prevents overlap and has no measured meaning.','Zero is no food expenditure as a share of income.','One shared linear percentage scale across the quartiles.','The original income and franc expenditure disappear, and swarm displacement is not an extra variable.',height=730)

C('strikes','duration-tail','duration-dot-rows','Long strikes without crushing the short ones','r',r'''
scale numeric r.duration transform=log zero=false
unit Context at=42,185 size=710x105 axisTitles.x="Recorded strike duration (days; log scale)" {
  repeat r.production_band arrangement=rows gap=70 order=label
  label width=205 fontSize=11
  point Strikes x=r.duration spread=swarm radius=4
}
''','Each strike is one swarmed dot on a logarithmic duration scale, separated by the declared production-context split.','Context labels alphabetically; within-row vertical displacement has no data meaning.','A log scale has no zero. Every supplied duration is positive and retained.','Shared log day scale, so equal horizontal distances represent ratios rather than day differences.','The spacing no longer communicates additive days. Group separation is descriptive, not an estimate of a production effect.',height=670)

C('danish','rate-spread','spread-path','A source-rate spread, with the subtraction made explicit','r',r'''
scale numeric r.date nice=false
scale numeric r.spread zero=true
unit Quarters at=92,165 size=810x325 axisTitles.x="Historical Danish quarter" axisTitles.y="Bond minus deposit (source rate fractions)" {
  label show=false
  path Spread x=r.date y=r.spread orderField=r.date
  point Observed x=r.date y=r.spread radius=2.5
}
rule Equality at=6,0 unit=Quarters axis=y value.value=0
''','A single path encodes bond rate minus deposit rate, with each supplied quarter marked.','Calendar-quarter order.','Zero means equal source rates.','Linear source fractions, not silently formatted as percentages or currency.','The two source levels are removed by subtraction. The companion notebook retains them and explains the historical scope.')

C('fertility','matched-endpoints','matched-slope-grid','Two fertility endpoints, the same country cohort','paired',r'''
scale numeric paired.year nice=false ticks=ends
scale numeric paired.fertility zero=true
unit Countries at=68,175 size=240x130 axisTitles.y="Births per woman" {
  repeat paired.country arrangement=grid columns=3 gap=75 order=label
  label fontSize=12
  path Change x=paired.year y=paired.fertility orderField=paired.year
  point Endpoints x=paired.year y=paired.fertility radius=3
}
''','A small paired slope chart for each country preserves its two endpoint observations.','Country labels alphabetically; 1960 precedes 2011 on every panel.','Shared zero on the fertility-rate scale; no country-specific rescaling.','Common linear births-per-woman and endpoint-year scales.','The connecting segment is an endpoint comparison, not interpolation of the intervening annual path.',height=1100,width=1080)

C('fertility','pace-by-decade','pace-strips','The pace of fertility change is not uniform across decades','decades',r'''
scale position decades.decade
scale value Pace center=#f7f7f7 colors=#2166ac,#b2182b transform=linear
unit Countries at=34,185 size=675x30 {
  repeat decades.country arrangement=rows gap=15 order=label
  label width=240 fontSize=12
  strip Pace position=decades.decade valueScale=Pace aggregation=average measureField=decades.annual_change encoding=color
}
legend "Births per woman per elapsed year" at=300,118 unit=Countries mark=Pace scale=Pace
''','Color encodes the first-to-last annualized change for each country-decade.','Country labels alphabetically; decade categories chronologically.','Zero is no first-to-last change. Each decade difference divides by nine elapsed years.','Shared signed linear ramp; live strip scales may rescale under active filters.','Within-decade reversals and endpoint levels are lost. Color is less precise than position for comparing close values.',height=850,width=1030)

C('iris','measurement-choice','petal-swarm','Petal lengths, one measured flower at a time','r',r'''
scale numeric r.petal_length zero=true
unit Species at=40,180 size=720x85 axisTitles.x="Petal length (cm)" {
  repeat r.species arrangement=rows gap=38 order=label
  label width=165 fontSize=13
  point Flowers x=r.petal_length spread=swarm radius=4
}
''','A common-scale swarm preserves each measured petal length within its supplied species group.','Alphabetic species order; vertical displacement is overlap avoidance, not another measurement.','Zero is included because centimetres have a meaningful origin.','Shared linear length scale across all species.','Petal width and the sepal measurements disappear, so separation here is not a validated classification result.',height=740)

C('wine','profile-scales','assay-summary-grid','Thirteen assays cannot share one raw value ruler','profiles',r'''
scale numeric profiles.value domain=instance zero=false
unit Assays at=72,180 size=230x125 {
  repeat profiles.measure arrangement=grid columns=3 gap=83 order=label
  label fontSize=11
  summary Cultivars groupField=profiles.cultivar measureField=profiles.value y=profiles.value
}
''','Each assay panel shows native unweighted quartiles and medians across the three cultivar groups.','Assay field names alphabetically; cultivar labels in their supplied order.','No universal zero or raw-unit baseline is imposed across unlike assays.','Each assay intentionally has its own linear value domain. Axis heights must not be compared across assays.','The individual wine identity and cross-assay covariance disappear in grouped summaries. Source assay units are not fully specified by the publisher.',height=1330,width=1080)

C('longley','trending-levels','three-indices','A common starting index is an analytical choice','indexed',r'''
scale numeric indexed.year nice=false
scale numeric indexed.value zero=false
unit Years at=90,165 size=800x315 axisTitles.x=Year axisTitles.y="First supplied year = 100" {
  label show=false
  path Indices x=indexed.year y=indexed.value orderField=indexed.year seriesField=indexed.series colorField=indexed.series
}
rule "Initial index" at=6,0 unit=Years axis=y value.value=100
legend Series at=110,535 unit=Years mark=Indices
''','Three colored paths compare proportional movement after each series is rebased to its first value.','Chronological source years, without smoothing.','The reference 100 is imposed by rebasing; it is not an independently observed economic equality.','One shared linear index scale for all three series.','Original counts and nominal-output units are erased. Nominal GNP growth still includes price-level change.',height=690)

C('longley','different-denominators','counts-not-rates','Separate historical counts instead of inventing a rate','r',r'''
scale numeric r.year nice=false ticks=ends
scale numeric r.unemployed zero=true
scale numeric r.armed zero=true
unit Unemployed at=100,165 size=350x300 axisTitles.x=Year axisTitles.y="Unemployed (source count units)" {
  label show=false
  path Count x=r.year y=r.unemployed orderField=r.year
}
unit Armed at=610,165 size=350x300 axisTitles.x=Year axisTitles.y="Armed forces (source count units)" {
  label show=false
  path Count x=r.year y=r.armed orderField=r.year
}
''','Two independently labeled historical count paths keep distinct populations separate.','Calendar years in both panels.','Both value scales include zero; these are counts, not a computed labor-force share.','Shared time domain with separate count domains, explicitly not a stacked total or dual-axis overlay.','Comparing panel heights without reading the scales is invalid. No denominator for an official unemployment rate is supplied.',height=660,width=1090)

C('football','points-and-goals','team-score-cloud','Scoring and conceding form different group-stage profiles','teams',r'''
scale numeric teams.goals_for zero=true
scale numeric teams.goals_against zero=true
unit Teams at=95,165 size=785x320 axisTitles.x="Group-stage goals scored" axisTitles.y="Group-stage goals conceded" {
  label show=false
  point Profiles x=teams.goals_for y=teams.goals_against colorField=teams.group radius=5
}
legend Groups at=110,535 unit=Teams mark=Profiles
''','One team is one point positioned by goals for and against, with group membership encoded by color.','No line connects teams; listing order has no measured meaning.','Both goal counts use zero baselines.','Shared linear goal-count scales. Equal scores can overlap and remain separate source records.','Opponent strength, match sequence, and advancement tie-break rules are not encoded. Points are not independent because teams share matches.',height=690)

C('football','draws-and-points','group-match-waffles','One cell is one match, not one goal','r',r'''
unit Groups at=100,205 size=150x110 {
  repeat r.group arrangement=grid columns=4 gap=70 order=label
  label fontSize=15
  waffle Matches categoryField=r.result each=1 normalize=false columns=3 gap=4 from=top order=label
}
legend "Final-score result" at=110,130 unit=Groups mark=Matches
''','A waffle cell represents one group match and its color distinguishes a draw from a decisive score.','Groups alphabetically; category order remains consistent across repeats.','Counts start with no cells; the graphic is not normalized to a synthetic hundred-cell population.','Equal-size cells preserve equal match weights across groups.','Goal totals and the closeness of decisive matches are lost. The cells encode match counts rather than goals or team appearances.',height=680,width=1010)

C('tate','metadata-not-lifespans','catalogue-span','Two catalogue dates do not necessarily make a lifespan','r',r'''
scale numeric r.date_span zero=true
unit Entities at=40,200 size=705x90 axisTitles.x="Recorded date span (years; not necessarily lifespan)" {
  repeat r.entity arrangement=rows gap=80 order=label
  label width=210 fontSize=12
  point Records x=r.date_span spread=swarm radius=4
}
note "Blank death dates remain missing. This is an alphabetic prefix of an old archive, not current biographies." at=75,540 leader=false
''','A swarmed dot row compares recorded date spans while separating the explicitly named family entity.','Entity labels alphabetically; source records are not ranked as human lifespans.','Zero is no difference between the supplied dates, not an inferred age at death.','Shared linear year-span scale. Missing spans do not become zero-valued dots.','The prefix is not representative. A blank death field supplies no current living-status information, and catalogue entities are not necessarily individuals.',height=730,width=1010)
assert len(COMPOSITIONS)==25,len(COMPOSITIONS)

DASHBOARDS=[]
def D(family,ref,slug,title,question,query,steps,table,interactions,lookup=False):
    DASHBOARDS.append(dict(family=family,reference=ref,slug=slug,title=title,question=question,query=query,steps=steps,table=table,interactions=interactions,lookup=lookup))

D('ercot','signed-error','forecast-investigation','Investigate the supplied ERCOT forecast hours','Which hours combine large errors, unusual forecast levels, and a particular clock-hour context?','r',[
S('scatter','Forecast level and signed error','x=forecast y=error color=direction',''),S('row','Select an error direction','direction',''),S('hist','Brush an absolute-error range','abs_error bins=30',''),S('boxplot','Error distribution by UTC month','error color=month_label',''),S('heatmap','Clock hour and month','hour_label columnField=month_label aggregation=average measureField=abs_error',''),S('metric','Supplied hours matching the filters','count','')],['date','actual','forecast','error','abs_error','hour_label'],['Select Below forecast, then brush a high absolute-error range. The table should retain only the intersection.','Clear the error-direction chart and verify that the same error-range selection remains.','Alt-click an error point and reconcile actual minus forecast against the source row.'])
D('co2','trend-and-coverage','measurement-investigation','Investigate CO2 measurements and their coverage','Which concentrations and missing dates belong to a selected decade and calendar month?','r',[
S('line','Historical weekly concentrations','x=date y=co2',''),S('row','Select a decade','decade',''),S('row','Measured or missing','coverage',''),S('boxplot','Centered values by month','residual color=month_label',''),S('hist','Concentration distribution','co2 bins=28',''),S('metric','Supplied weekly slots in selection','count','')],['date','co2','coverage','annual_center','residual'],['Select the 1990s in the decade chart, then one month in the box plot; all peer views should reflect their intersection.','Select Missing in coverage. The table should retain null CO2 records while numerical concentration marks disappear.','Clear all selections and compare the source-row count with the full snapshot.'])
D('elnino','season-and-anomaly','season-investigation','Investigate warm months against their own season','Are extreme Niño 1+2 anomalies concentrated in particular months or decades?','r',[
S('scatter','Temperature and seasonal anomaly','x=sst y=anomaly color=decade',''),S('row','Select a decade','decade',''),S('boxplot','Anomalies by calendar month','anomaly color=month_label',''),S('hist','Brush an anomaly range','anomaly bins=30',''),S('line','Monthly anomalies in time','x=date y=anomaly',''),S('metric','Calendar months matching the filters','count','')],['date','sst','climatology','anomaly','month_label'],['Select a decade, then brush positive anomalies in the histogram; the line should narrow to the same months.','Alt-click a point and subtract its climatology from its Celsius temperature.','Clear the decade selection without clearing the anomaly brush and compare the broader population.'])
D('macro','level-versus-growth','quarter-investigation','Investigate a historical quarter, not today’s economy','Which quarters combine GDP contraction, unemployment change, and a particular inflation context?','r',[
S('scatter','GDP change and unemployment change','x=gdp_change y=unemp_change color=decade',''),S('row','Select a historical decade','decade',''),S('hist','Brush annualized GDP growth','gdp_growth bins=26',''),S('scatter','Inflation and unemployment levels','x=unemp y=infl color=decade',''),S('line','GDP level through the supplied quarters','x=date y=realgdp',''),S('metric','Quarter rows matching the filters','count','')],['date','realgdp','gdp_growth','unemp','unemp_change','infl'],['Brush negative GDP growth and inspect the remaining quarters in the record table.','Select a decade and verify the intersection, including the first-quarter missing-change behavior.','Clear all filters before comparing the fixed narrative extrema with live charts.'])
D('grunfeld','within-firm','firm-investigation','Trace a firm-year through an explicit company lookup','How do a selected firm’s annual changes compare with its own panel summary?','r',[
S('scatter','Market value and investment','x=value y=invest color=firm',''),S('row','Select a firm','firm',''),S('scatter','Within-firm annual changes','x=value_change y=invest_change',''),S('hist','Investment-index distribution','invest_index bins=24',''),S('line','Recorded investment through time','x=year y=invest',''),S('metric','Firm-years in the selection','count','')],['firm','year','invest','value','invest_change','company_mean'],['Select one firm before reading the annual line, then trace a row into its company summary lookup.','Brush negative investment changes and inspect the intersection with the selected firm.','Clear the firm selector and confirm that base firm-year count is preserved, not multiplied by the lookup.'],lookup=True)
D('fertility','trajectories','country-investigation','Investigate selected fertility paths and empty year cells','Which selected country-years support a comparison, and which year cells are null?','r',[
S('scatter','Recorded country-year rates','x=year y=fertility color=country',''),S('row','Select a country','country',''),S('hist','Brush a year range','year bins=54',''),S('boxplot','Available values by decade','fertility color=decade',''),S('ecdf','Distribution of selected period rates','fertility direction=below',''),S('metric','Retained country-year cells','count','')],['country','code','year','fertility','decade'],['Select a country, then a year range ending in 2013; null end-year rows remain in the table but not the numerical scatter.','Clear the country selection and compare the same year range across the illustrative cohort.','Inspect a 2011 rate and a 2012 null without converting the latter to zero.'])
D('iris','measurement-choice','flower-investigation','Follow the same flowers across several measurements','Which flowers remain when a species selection and a petal-length range intersect?','r',[
S('scatter','Petal dimensions','x=petal_length y=petal_width color=species',''),S('row','Select species','species',''),S('scatter','Sepal dimensions of the same flowers','x=sepal_length y=sepal_width color=species',''),S('hist','Brush petal length','petal_length bins=20',''),S('parallel','Four measurements per flower','sepal_length,sepal_width,petal_length,petal_width color=species',''),S('metric','Flowers matching the filters','count','')],['species','sepal_length','sepal_width','petal_length','petal_width'],['Select versicolor, then brush petal length; the sepal plot and table should retain the identical flower IDs.','Alt-click a scatter point to inspect its original four measurements.','Clear the species chart while preserving the length brush and compare overlap with other species.'])
D('wine','cultivar-chemistry','assay-investigation','Investigate cultivar chemistry without quality labels','Which assay profiles remain after selecting a cultivar and a chemical range?','r',[
S('scatter','Flavanoids and color intensity','x=flavanoids y=color_intensity color=cultivar',''),S('row','Select a supplied cultivar','cultivar',''),S('hist','Brush flavanoid values','flavanoids bins=24',''),S('scatter','Alcohol and proline','x=alcohol y=proline color=cultivar',''),S('parallel','Selected chemical axes','alcohol,magnesium,flavanoids,color_intensity,proline color=cultivar',''),S('metric','Wine analyses matching the filters','count','')],['cultivar','alcohol','flavanoids','color_intensity','hue','proline'],['Select Cultivar 3 and brush a flavanoid range; verify identical source wines in the profile and table.','Trace a value without assigning an invented physical unit or tasting quality.','Clear the cultivar selection and inspect overlap in the same numerical range.'])
D('longley','trending-levels','employment-investigation','Investigate a small historical employment benchmark','Which annual observations drive the difference between the levels and changes views?','r',[
S('scatter','Nominal output and employment levels','x=gnp y=employment color=era',''),S('row','Select a broad historical span','era',''),S('scatter','Output and employment changes','x=gnp_change y=employment_change',''),S('line','Unemployment counts over time','x=year y=unemployed',''),S('hist','Brush annual employment change','employment_change bins=10',''),S('metric','Annual source rows in selection','count','')],['year','employment','gnp','employment_change','gnp_change','unemployed'],['Brush negative employment changes and inspect the corresponding annual count records.','Select an era and check the combined subset rather than interpreting either filter separately.','Clear all selections and verify that the initial row remains even though its change values are null.'])
D('football','points-and-goals','team-match-investigation','Follow a team’s group profile back to its matches','Which individual match appearances produced a team’s group-stage scoring and points?','appearances',[
S('scatter','Goals scored and conceded in one appearance','x=goals_for y=goals_against color=result',''),S('row','Select a team','team',''),S('row','Select a match result','result',''),S('boxplot','Goals scored by group','goals_for color=group',''),S('scatter','Appearance points and full group points','x=points y=group_points color=group',''),S('metric','Team appearances, not distinct matches','count','')],['date','team','opponent','goals_for','goals_against','points','group_points','match_total'],['Select a team: its three appearances should remain, with each row linked to the team summary and the original match.','Then select Win; this narrows appearances, while the repeated full-group points lookup remains the team’s fixed whole-group total.','Do not sum the repeated group_points field across appearances. Clear selections to recover 96 appearances from 48 matches.'],lookup=True)
assert len(DASHBOARDS)==10,len(DASHBOARDS)


def build_compositions(catalog):
    for c in COMPOSITIONS:
        original=BY[(c['family'],c['reference'])]
        n=deepcopy(original);n.update(title=c['title'],slug=c['slug'],question=c['encoding'])
        id_=f'cp-{c["family"]}-{c["slug"]}'; fs,ep=B.evidence_for(original,id_)
        path=f'projects/{c["family"]}/{c["slug"]}.eda'
        # Composition bindings are deliberately qualified. The baseline composition lowerer does not rewrite aliases.
        head=[f'eda query={c["query"]}',f'dashboard {B.quote(c["title"])}','grid columns=12 rowHeight=76',
              f'composition @{id_} width={c["width"]} height={c["height"]} at=0,0,12,9 {{',
              f'  title {B.quote(c["title"])} at=32,28 fontSize=24',
              f'  subtitle {B.quote(c["encoding"])} at=32,78 fontSize=13']
        body=['  '+x for x in c['body'].splitlines()]
        foot=[f'  footnote {B.quote(CREDIT[c["family"]])} at=32,{c["height"]-54} fontSize=10',
              f'  footnote {B.quote("Units, denominator, transformation and evidence: companion design note; snapshot findings do not change with filters.")} at=32,{c["height"]-32} fontSize=10','}','']
        (ROOT/path).write_text('\n'.join(head+body+foot))
        notes=f'projects/{c["family"]}/{c["slug"]}.design.md'
        text=[f'# {c["title"]} — design and analytical contract','',f'**Question.** {original["question"]}','',
              f'**Encoding.** {c["encoding"]}',f'**Ordering.** {c["order"]}',f'**Baseline.** {c["baseline"]}',f'**Scale.** {c["scale"]}','',
              '## Fixed-snapshot findings','']+[f'{f["statement"]} Eligible rows: {f["eligible_rows"]:,}; full expression, denominator, and contributing IDs are in the [evidence](../../{ep}).\n' for f in fs]+[
              '## What this design gives up','',c['information_loss'],'',original['caveat'],'',
              '## Interactions and tracing','',
              'In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.','',
              '## Credit','',CREDIT[c['family']],f'Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/{c["family"]}.json).','']
        (ROOT/notes).write_text('\n'.join(text))
        n['query']=c['query'];r=B.base_record(n,id_,'composition',path,fs,ep);r['companion_path']=notes
        marks=sorted(set(__import__('re').findall(r'^\s*(path|point|band|summary|density|strip|horizon|waffle) ',c['body'],__import__('re').M)))
        r['capability_tags']=['composition','qualified-bindings','source-tracing']+['mark:'+x for x in marks]
        r['design']={k:c[k] for k in ['encoding','order','baseline','scale','information_loss']};r['chart_steps']=1
        catalog.append(r);print('AUTHORED',id_)
    B.dump(ROOT/'evidence/composition-specifications.json',COMPOSITIONS)
    B.dump(ROOT/'catalog.json',catalog)


def build_dashboards(catalog):
    for d in DASHBOARDS:
        original=BY[(d['family'],d['reference'])];n=deepcopy(original);n.update(title=d['title'],slug=d['slug'],question=d['question'],query=d['query'])
        id_=f'db-{d["family"]}-{d["slug"]}';fs,ep=B.evidence_for(original,id_);path=f'projects/{d["family"]}/{d["slug"]}.eda'
        query='linked' if d['lookup'] else d['query']
        intro='<p>Select a category or range to filter the other views. Written findings describe the full snapshot.</p>'
        lines=[f'eda query={query}',f'dashboard {B.quote(d["title"])}','grid columns=12 rowHeight=76',B.aliases(d['family'],d['query'])]
        if d['family']=='grunfeld':lines += ['company_mean:num=company.invest_mean label="Firm full-panel mean investment"']
        if d['family']=='football':lines += ['group_points:num=squad.points label="Team full group-stage points"','match_total:num=match.total_goals label="Original match total goals"']
        lines += [f'markdown @{id_}-guide content={B.quote(intro)} title="Explore the linked views" at=0,0,12,2']
        pos=['0,2,8,5','8,2,4,5','0,7,6,4','6,7,6,4','0,11,8,5','8,11,4,2']
        for i,step in enumerate(d['steps']):
            # Multiple firms share years: use a scatter until a firm is selected, never an inter-firm connecting line.
            if d['family']=='grunfeld' and i==4:step=S('scatter',step['title'],'x=year y=invest color=firm','')
            lines.append(B.chart(step,f'{id_}-view-{i+1}',pos[i],CREDIT[d['family']],family=d['family'],query=d['query']))
        lines += [f'table @{id_}-records '+','.join(B.alias_name(f) for f in d['table'])+' title="Matching source records and lookup values" at=0,16,12,5','']
        (ROOT/path).write_text('\n'.join(lines))
        notes=f'projects/{d["family"]}/{d["slug"]}.guide.md'
        (ROOT/notes).write_text('\n'.join([f'# {d["title"]}','',d['question'],'','## Investigation sequence','']+[f'{i+1}. {text}' for i,text in enumerate(d['interactions'])]+['','## Fixed-snapshot findings','']+[f'{f["statement"]} [Evidence](../../{ep}).' for f in fs]+['','## Limits','',original['caveat'],'','Eight panels contain an instruction note, six analytical/selector/metric views, and a source table. Runtime cross-filtering and trace behavior are pending local verification. The query uses one base population; related lookup totals are not additive repeated measures.','','## Source credit','',CREDIT[d['family']],f'[Full provenance](../../datasets.json); [field dictionary](../../evidence/fields/{d["family"]}.json).','']))
        n['query']=query;r=B.base_record(n,id_,'dashboard',path,fs,ep);r['companion_path']=notes;r['suggested_interactions']=d['interactions'];r['chart_steps']=8
        r['capability_tags']=sorted({s['kind'] for s in d['steps']}|{'linked-filtering','source-table','metric-card'}|({'related-tables','explicit-lookups'} if d['lookup'] else set()))
        catalog.append(r);print('AUTHORED',id_)
    B.dump(ROOT/'evidence/dashboard-specifications.json',DASHBOARDS)
    B.dump(ROOT/'catalog.json',catalog)
