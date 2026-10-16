"""Original editorial specifications. Formatting is generated; questions and chart sequences are deliberate.
Numerical prose is rendered from the two evidence expressions attached to each piece.
"""
NOTEBOOKS=[]
def F(op, field, sentence, **kw): return dict(op=op,field=field,sentence=sentence,**kw)
def S(kind,title,args,prose): return dict(kind=kind,title=title,args=args,prose=prose)
def N(family,slug,title,question,query,caveat,conclusion,findings,steps,table):
    assert len(steps)==4 and len(findings)>=2
    NOTEBOOKS.append(dict(family=family,slug=slug,title=title,question=question,query=query,caveat=caveat,conclusion=conclusion,findings=findings,steps=steps,table=table))

N('ercot','signed-error','When two demand lines hide the forecast miss','How does subtracting the forecast change the reading of the supplied ERCOT hours?','r',
 'Actual is electricity served in each supplied hour, not unconstrained demand. These observations alone cannot identify why consumption or supply changed. The UTC snapshot includes partial boundary dates.',
 'The difference chart changes the task from comparing two vertical positions to reading one signed distance from zero. The histogram then distinguishes typical errors from a few unusually large misses.',
 [F('mean','error','The mean signed error was {value:,.1f} MWh per supplied hour.'),F('mean','abs_error','The mean absolute error was {value:,.1f} MWh per supplied hour.')],
 [S('line','Actual and forecast, in the same units','x=date y=actual,forecast','Begin with the quantities being compared. Both lines use the same MWh scale; closeness is meaningful, but small differences are difficult to follow against the much larger level.'),
  S('line','Subtract the forecast; keep a zero reference','x=date y=error | rule y=0 "Actual equals forecast"','A positive value means more electricity was served than forecast; a negative value means less. The reference is a definition, not a target chosen after inspecting the data.'),
  S('hist','How often does each size of signed miss occur?','error bins=30','Remove time temporarily to inspect the distribution. Bins summarize frequency, but they cannot tell whether adjacent extreme observations belong to the same episode.'),
  S('ecdf','Absolute error without bin boundaries','abs_error direction=below','Read the cumulative share below a chosen error threshold. Every valid supplied hour has equal weight, unlike an energy-weighted summary.')],['date','actual','forecast','error','abs_error'])

N('ercot','relative-error','A large forecast miss is not always a large percentage miss','Which hours look different when forecast error is divided by the forecast level?','r',
 'Percentage errors divide by the positive forecast, not actual demand. Changing that denominator changes the statistic. Both summaries describe this historical snapshot and are not forecast-model rankings.',
 'Absolute errors retain the grid-scale quantity. Relative errors describe that miss against the size of the forecast. Keep both rather than allowing the percentage plot to erase the operational magnitude.',
 [F('median','abs_pct_error','The median absolute percentage error was {value:.2f}% of forecast.'),F('quantile','abs_pct_error','The 90th percentile of absolute percentage error was {value:.2f}% of forecast.',q=.9)],
 [S('scatter','Does absolute miss grow with the forecast?','x=forecast y=abs_error opacity=0.4','Each point is one supplied hour. A large forecast and a large absolute miss can coexist without implying that the forecast caused the error.'),
  S('scatter','The same denominator made explicit','x=forecast y=abs_pct_error opacity=0.4','Keep forecast on the horizontal axis and replace the vertical measure with an absolute percentage. The denominator is now visible instead of being hidden inside the metric.'),
  S('boxplot','Percentage-error distributions by UTC month','abs_pct_error color=month_label','Compare distributions, not just their means. The small March boundary slice is not a third complete month and must not be treated as an equally supported estimate.'),
  S('ecdf','What share stays below a percentage threshold?','abs_pct_error direction=below','A cumulative curve avoids arbitrary histogram bins. Its percentage denominator is the number of valid hourly percentage errors, not the sum of forecast MWh.')],['date','forecast','error','abs_error','pct_error','abs_pct_error'])

N('ercot','clock-coverage','The clock-hour pattern depends on which days were supplied','Do recurring UTC hours have similar signed and absolute errors within each supplied month?','clock',
 'These are means over available dates for a UTC clock hour. Partial boundary months have fewer observations, and the clock is not local Texas time. A mean of these cells is not automatically an hour-weighted monthly mean.',
 'Read the count before comparing the error. The table preserves each cell denominator so an apparently unusual hour can be distinguished from a scarcely observed boundary cell.',
 [F('max','hours','The best-supported month-hour cell contains {value:.0f} supplied hours.'),F('min','hours','The least-supported month-hour cell contains {value:.0f} supplied hour.')],
 [S('heatmap','Signed error by UTC clock hour and month','hour_label columnField=month_label aggregation=average measureField=error showValues=true','The position of each cell carries calendar structure. Signed values retain direction, while the shared unit keeps all cells comparable.'),
  S('heatmap','Absolute error asks a different question','hour_label columnField=month_label aggregation=average measureField=abs_error','Absolute errors measure miss size regardless of sign. A cell can have a small signed mean even when its positive and negative errors are both substantial.'),
  S('scatter','How much support is behind each mean?','x=hours y=abs_error color=month_label','Pair the estimated mean with the actual contributing-hour count. This makes unequal support visible rather than encoding a sparse cell as if it were a complete month.'),
  S('boxplot','Variation across clock-hour means','error color=month_label','These boxes summarize cell means, not individual hourly errors. They help compare clock patterns but should not be substituted for the raw-hour distribution.')],['month_label','hour_label','hours','error','abs_error'])

N('co2','trend-and-coverage','A CO2 trend with the missing weeks left visible','What does this historical weekly Mauna Loa snapshot show without filling gaps?','r',
 'This is the historical flask-data revision distributed with statsmodels, not the latest NOAA series. Missing weeks stay null. Weekly observations at one station are not global spatial measurements.',
 'A time series, a coverage count, and distributions by decade answer complementary questions. The rising sequence must be read alongside seasonal movement and the limits of the historical measurement calendar.',
 [F('mean','co2','The mean measured concentration in the 1960s was {value:.2f} ppmv.',where=[['decade','eq','1960s']]),F('mean','co2','The mean measured concentration in the 1990s was {value:.2f} ppmv.',where=[['decade','eq','1990s']])],
 [S('line','Measured weekly concentrations; no imputation','x=date y=co2','Follow the observations in calendar order. Gaps are not zero concentration, and no connecting value has been inserted to repair them.'),
  S('row','Measured and missing weekly slots','coverage','The coverage chart uses all supplied dates. It separates a missing measurement from the absence of a row in a newly constructed calendar.'),
  S('boxplot','The weekly distribution in each decade','co2 color=decade','Decades make the long-run shift easier to compare, but the first and final decades are partial. Each box uses observed weeks only.'),
  S('ecdf','Compare the whole distribution, not just a center','co2 color=decade direction=below','Cumulative distributions retain the tails and overlap. They are descriptive summaries of measured weeks, not estimates weighted by the length of missing intervals.')],['date','co2','coverage','decade'])

N('co2','seasonal-centering','Remove the annual level to see the CO2 calendar','Which calendar months sit above or below their own year’s measured-week mean?','r',
 'Centering by an available-week annual mean does not remove every within-year trend. Incomplete years and uneven missingness can shift the reference. Residuals are not a fitted seasonal model.',
 'The centered view makes the within-year rhythm easier to compare while explicitly surrendering the long-run concentration level. Keep the raw plot nearby whenever absolute concentration matters.',
 [F('mean','residual','The mean centered value for May weeks was {value:.2f} ppmv.',where=[['month','eq',5]]),F('mean','residual','The mean centered value for September weeks was {value:.2f} ppmv.',where=[['month','eq',9]])],
 [S('scatter','The level removed from each observation','x=annual_center y=co2 opacity=0.35','The annual center is derived from the same year’s measured weeks. Plotting it against raw concentration shows how much variation remains around that annual reference.'),
  S('line','Weekly deviations from the annual mean','x=date y=residual | rule y=0 "Annual measured-week mean"','The zero line is different for each underlying year even though the residual axis is shared. Long-run level information has intentionally been removed.'),
  S('boxplot','Centered concentration by calendar month','residual color=month_label','Order the month labels chronologically. A pooled monthly box summarizes many years and must not be read as one observed calendar year.'),
  S('heatmap','Calendar pattern within each decade','month_label columnField=decade aggregation=average measureField=residual','Cross month with decade to test whether a pooled seasonal pattern is supported across different spans. Blank cells are not zero residuals.')],['date','co2','annual_center','residual','month_label'])

N('co2','missing-runs','Missing CO2 weeks arrive in runs, not isolated blanks','How long are the consecutive missing stretches in the supplied weekly calendar?','gaps',
 'A run means consecutive missing rows in this supplied series. It is not proof that a station stopped operating. Before and after values do not reveal the unmeasured path between them.',
 'Treat missingness as a population of intervals rather than a nuisance to erase. The run-length distribution and calendar positions identify where interpolation would make the strongest assumptions.',
 [F('max','length','The longest missing run spans {value:.0f} supplied weekly slots.'),F('sum','length','All missing runs together account for {value:.0f} supplied weekly slots.')],
 [S('scatter','Place each missing run in time','x=year y=length','Each point represents an entire missing stretch, not one week. Height measures the number of adjacent null rows.'),
  S('hist','Short gaps and long gaps are different problems','length bins=12','The histogram counts runs. Its denominator is not the number of missing weeks; one long interruption still contributes only one observation here.'),
  S('scatter','Concentrations on either side of each gap','x=before y=after','These are the nearest supplied observed values on either side. They help bound the contextual question, but drawing a point does not authorize filling the intervening values.'),
  S('ecdf','Share of missing runs below each duration','length direction=below','A cumulative curve reveals whether a few long runs dominate the uncertainty in any gap-filling exercise. Every run receives equal weight.')],['date','end_date','length','before','after'])

N('elnino','season-and-anomaly','Warm water and unusual warmth are different questions','How does a Niño 1+2 sea-surface temperature differ from its calendar-month baseline?','r',
 'These are monthly temperatures for Niño 1+2, not a global ocean average or a Niño 3.4 event classification. The baseline is the supplied 1981–2010 calendar-month mean; no modern data revision is substituted.',
 'Raw temperature answers how warm the water was. Anomaly answers how different it was from the selected seasonal reference. A chart title should say which of those questions it answers.',
 [F('mean','sst','The mean February temperature across supplied years was {value:.2f} °C.',where=[['month','eq',2]]),F('mean','sst','The mean September temperature across supplied years was {value:.2f} °C.',where=[['month','eq',9]])],
 [S('line','The original monthly temperature series','x=date y=sst','Begin with the recorded Celsius values. Repeated within-year movement can conceal which months were unusual for their season.'),
  S('boxplot','The calendar has its own temperature distribution','sst color=month_label','The monthly boxes establish why one all-year temperature threshold can be misleading. These are distributions over years for each month.'),
  S('line','Anomalies against the same calendar month','x=date y=anomaly | rule y=0 "1981–2010 monthly mean"','Subtracting a month-specific reference removes the average seasonal level. Positive and negative values are deviations from a declared baseline, not from zero Celsius.'),
  S('hist','The distribution after seasonal centering','anomaly bins=30','An anomaly histogram summarizes the amplitude distribution but discards the ordering and persistence of warm or cool episodes.')],['date','sst','climatology','anomaly','month_label'])

N('elnino','two-warm-windows','Compare two warm-water windows on an aligned clock','How do the supplied 1982–1983 and 1997–1998 windows differ after seasonal centering?','episodes',
 'The two windows are illustrative, predeclared spans, not an automated event sample. Alignment begins in January of each first year and does not align peaks or event onset. No causal attribution follows.',
 'Keep a common clock and baseline rather than shifting the curves until they appear to match. Differences in duration and amplitude should remain visible rather than being normalized away.',
 [F('max','anomaly','The largest monthly anomaly in the 1982–1983 window was {value:.2f} °C.',where=[['episode','eq','1982–1983']]),F('max','anomaly','The largest monthly anomaly in the 1997–1998 window was {value:.2f} °C.',where=[['episode','eq','1997–1998']])],
 [S('scatter','An aligned month number, not aligned peaks','x=episode_month y=anomaly color=episode','Every point keeps its position in the two-year window. Use color to distinguish the windows without shifting either to maximize apparent agreement.'),
  S('scatter','The same windows in raw Celsius','x=episode_month y=sst color=episode','Return to raw temperature to see the seasonal cycle that the anomaly view removed. The difference in vertical meaning is the point of the comparison.'),
  S('ecdf','Compare the full anomaly distribution','anomaly color=episode direction=below','A higher maximum does not establish that every month was warmer. The full cumulative distribution exposes the remainder of each window.'),
  S('boxplot','Centers and spreads across the two windows','anomaly color=episode','Each summary has the same intended window length. It still loses serial ordering, so return to the aligned scatter before describing persistence.')],['episode','episode_month','date','sst','anomaly'])

N('elnino','annual-range','An annual temperature mean does not show the warmest month','Do years with high means also have unusually wide within-year temperature ranges?','annual',
 'The lower and upper bounds are observed monthly minima and maxima, not confidence intervals. Annual summaries give months equal weight and erase timing within the year.',
 'An observed-range band is useful only when it is named honestly. Pair it with the annual mean, and resist describing the band as uncertainty about that mean.',
 [F('mean','range','The average within-year observed monthly range was {value:.2f} °C.'),F('max','range','The largest within-year observed monthly range was {value:.2f} °C.')],
 [S('line','Annual mean and observed extremes','x=year y=low,mean,high','Use a shared Celsius axis for the minimum, mean, and maximum. The outer lines summarize observed months rather than a statistical interval.'),
  S('scatter','Mean temperature against seasonal range','x=mean y=range','The range adds information not encoded by the mean. A year may have a high mean without having the widest spread of monthly values.'),
  S('hist','How unusual is a wide annual range?','range bins=15','This histogram counts years equally. It is not a distribution of monthly temperatures and cannot identify when the extremes occurred.'),
  S('scatter','Check the number of observed months','x=year y=months','A min–max comparison becomes unreliable when years have different opportunities to record an extreme. The explicit month count checks that denominator.')],['year','months','low','mean','high','range'])

N('sunspots','cycles','Sunspot cycles do not all have the same height','What range of annual activity is visible in this historical sunspot-number revision?','r',
 'The historical series is preserved as supplied and is not the current revised international sunspot-number series. Annual averages obscure monthly peaks; this is not a forecast of the next cycle.',
 'A repeated rise-and-fall pattern need not repeat at the same amplitude. The time series establishes order, while the distribution separates typical activity from a few large annual values.',
 [F('max','activity','The largest supplied annual sunspot number is {value:.1f}.'),F('median','activity','The median supplied annual sunspot number is {value:.1f}.')],
 [S('line','Annual activity in calendar order','x=year y=activity','Keep the full chronology before imposing any cycle boundaries. The observations do not arrive as identical repetitions of a template.'),
  S('hist','The distribution of annual activity','activity bins=24','Count years by activity rather than smoothing the cycles into a single average. A long upper tail can pull the mean away from a typical year.'),
  S('boxplot','Compare broad historical spans','activity color=era','Half-century labels provide descriptive groups, not scientifically estimated cycle boundaries. The final span is incomplete.'),
  S('ecdf','Read low-activity thresholds without bins','activity direction=below','The curve gives the observed share of years at or below a threshold. It does not estimate the probability for an independent future year.')],['year','activity','era'])

N('sunspots','smoothing-cost','What an eleven-year smooth removes from a sunspot chart','How different is annual activity from a centered eleven-observation mean?','r',
 'A centered mean uses future observations and therefore is not a real-time forecast. The first and last five years lack complete windows and remain null rather than using shorter windows.',
 'Smoothing trades local peaks for a slower-moving reference. Display the departure and the missing edge estimates so the reader can see the cost of that trade.',
 [F('max','departure','The largest annual value above its centered mean was {value:.2f} sunspot-number units.'),F('min','departure','The largest annual value below its centered mean was {value:.2f} sunspot-number units.')],
 [S('line','Raw annual values beside the centered mean','x=year y=activity,smooth11','Both series stay on one scale. The smooth is deliberately unavailable where a complete centered window does not exist.'),
  S('line','What the smooth leaves out','x=year y=departure | rule y=0 "Equals centered mean"','Subtracting the smooth makes the remaining amplitude visible. It does not create a separately measured physical quantity.'),
  S('scatter','Large annual values versus their local reference','x=smooth11 y=activity','This compares an observation with a summary that includes that observation. Their association is partly mathematical and must not be interpreted as independent validation.'),
  S('hist','The distribution of departures','departure bins=24','Only complete-window years contribute. The edge exclusions are a consequence of the declared smoothing rule, not missing original activity measurements.')],['year','activity','smooth11','departure'])

N('nile','before-and-after','A Nile flow comparison needs a boundary, not a causal story','How do the supplied annual flow distributions compare on either side of 1898?','r',
 'The cutoff is an explicit historical comparison, not a randomized intervention. Many environmental and measurement factors could differ across eras. Annual volumes are measured at Aswan, not all reaches of the Nile.',
 'Compare both location and overlap rather than allowing a vertical reference line to imply a causal experiment. The unequal era lengths remain visible in the count chart.',
 [F('mean','volume','Mean annual volume before 1898 was {value:.2f} ×10^8 m³.',where=[['year','lt',1898]]),F('mean','volume','Mean annual volume from 1898 onward was {value:.2f} ×10^8 m³.',where=[['year','ge',1898]])],
 [S('line','Annual flow across the chosen boundary','x=year y=volume | rule x=1898 "Comparison boundary"','The line preserves individual wet and dry years. The marked year defines the comparison; it does not prove why the distribution differs.'),
  S('boxplot','Two eras, the same volume scale','volume color=era','Compare the medians and middle halves while keeping extreme annual volumes visible. Different sample lengths are not automatically comparable precision.'),
  S('ecdf','How much do the era distributions overlap?','volume color=era direction=below','Cumulative curves make it possible to compare more than their centers. Crossing curves would warn against describing one era as uniformly lower.'),
  S('row','Years contributing to each era','era','The later era contributes more observations. This count is the denominator for each era summary, not an adjustment for serial correlation.')],['year','volume','era'])

N('nile','tail-sensitivity','How much do extreme flow years move the Nile average?','Does the typical flow change when the outer volume tails are examined separately?','r',
 'Tail labels use the supplied sample’s linear 10th and 90th percentiles. They are not flood or drought standards. The middle group is a sensitivity comparison, not a corrected replacement dataset.',
 'Keep the tail years visible and explain why a robust summary differs from the ordinary mean. Removing an inconvenient extreme without a stated rule would change the population silently.',
 [F('mean','volume','The mean across every supplied year was {value:.2f} ×10^8 m³.'),F('mean','volume','The mean between the declared tail cutoffs was {value:.2f} ×10^8 m³.',where=[['tail','eq','Middle 80% cutoffs']])],
 [S('hist','Annual flow has a distribution, not one typical value','volume bins=18','Start with all years. The bins make the tails visible without classifying any annual measurement as an error.'),
  S('scatter','Locate the tail years in time','x=year y=volume color=tail','Color adds the explicit analytical grouping while leaving chronology intact. It does not label the years using an external flood or drought definition.'),
  S('ecdf','A threshold view of every annual value','volume direction=below','The cumulative curve allows direct inspection of tail boundaries. It retains every year, including values the sensitivity calculation does not average.'),
  S('boxplot','The selected middle versus the two tails','volume color=tail','This is a view of subsets chosen by the outcome itself. Their separation is built into the rule and is not an independently discovered relationship.')],['year','volume','rank','tail'])

N('macro','level-versus-growth','A rising GDP level can conceal falling quarterly growth','What changes when a historical GDP level becomes an annualized quarter-to-quarter growth rate?','r',
 'This is an old source vintage, not current revised GDP. Annualizing a quarterly change is a mathematical convention, not the year-on-year rate. The first supplied quarter has no preceding observation in this file.',
 'Levels answer how large the measured economy was in the source’s chained dollars. Growth rates answer how rapidly it changed between adjacent supplied quarters. Neither should silently replace the other.',
 [F('min','gdp_growth','The smallest derived annualized quarterly GDP growth rate was {value:.2f}%.'),F('max','gdp_growth','The largest derived annualized quarterly GDP growth rate was {value:.2f}%.')],
 [S('line','GDP in the source’s chained-dollar level','x=date y=realgdp','The level retains scale and historical size. A large vertical range can make short contractions visually subtle.'),
  S('line','Annualized quarterly growth on a zero reference','x=date y=gdp_growth | rule y=0 "No quarterly change"','Growth is computed from adjacent quarters using a compounded annualization. The zero line separates positive from negative changes without inventing recession classifications.'),
  S('hist','The distribution of quarterly growth rates','gdp_growth bins=24','The histogram counts available quarter-to-quarter comparisons. It loses chronology, so a cluster of negative observations cannot be located from this view alone.'),
  S('scatter','GDP change and unemployment change','x=gdp_change y=unemp_change','These are two first differences from the same quarterly sequence. Association is descriptive and does not identify a structural labor-market response.')],['date','realgdp','gdp_change','gdp_growth','unemp_change'])

N('macro','inflation-unemployment','One inflation–unemployment scatter hides different decades','Does the pooled historical association resemble the association within the 1970s?','r',
 'Time ordering, policy regimes, revisions, and omitted factors limit a pooled scatter. The source’s initial inflation placeholder is excluded from the pooled calculation. Correlation is not a policy trade-off or causal estimate.',
 'A colored cloud is a starting point for checking mixtures, not a stable structural curve. Examine the time series and the grouped distributions before naming an economic mechanism.',
 [F('corr','infl','The pooled inflation–unemployment correlation, excluding the initial placeholder quarter, was {value:.3f}.',other='unemp',where=[['date','ne','1959-01-01']]),F('corr','infl','Within the supplied 1970s quarters, the correlation was {value:.3f}.',other='unemp',where=[['decade','eq','1970s']])],
 [S('scatter','Color the pooled relationship by decade','x=unemp y=infl color=decade opacity=0.6','Color preserves the calendar grouping inside the pooled cloud. The first source inflation value is a placeholder, so do not give that point the status of a measured change.'),
  S('line','Inflation retains its time order','x=date y=infl','A time series reveals sequences that disappear in the scatter. Avoid treating successive quarters as independent draws.'),
  S('boxplot','Unemployment distributions within each decade','unemp color=decade','Changing group distributions can change a pooled relationship even when no single within-group slope is stable.'),
  S('ecdf','Inflation thresholds by historical span','infl color=decade direction=below','The cumulative view compares the entire distribution. It does not correct the small and unequal number of quarters in the boundary decades.')],['date','infl','unemp','decade'])

N('grunfeld','within-firm','Big firms and within-firm changes are not the same comparison','How does investment relate to market value in levels and in annual within-firm changes?','r',
 'These selected historical firms are not a random sample of all businesses. First differences remain observational and can amplify measurement noise. Source monetary units are retained without an unverified multiplier.',
 'The pooled levels cloud mixes firm size with time movement. Within-firm differences change the unit of comparison to adjacent observations and should be named as a separate question.',
 [F('corr','value','Across firm-year levels, market value and investment had correlation {value:.3f}.',other='invest'),F('corr','value_change','Across valid within-firm annual changes, the correlation was {value:.3f}.',other='invest_change')],
 [S('scatter','Firm size in the pooled levels','x=value y=invest color=firm opacity=0.6','Each point is a firm-year rather than a distinct firm. Large firms can dominate the visual range without receiving more statistical weight per point.'),
  S('scatter','Change within a firm, not between firms','x=value_change y=invest_change color=firm','The preparation resets the difference at each firm boundary. No final year from one company is subtracted from the first year of another.'),
  S('boxplot','Investment changes differ across firms','invest_change color=firm','Group summaries retain the selected firms separately. They do not turn the repeated annual observations into independent experimental units.'),
  S('ecdf','How large are the recorded investment changes?','invest_change direction=below','The cumulative distribution reveals negative and positive changes without bin choices. It weights each eligible firm-year difference equally.')],['firm','year','invest','value','invest_change','value_change'])

N('grunfeld','indexing-firms','Indexing investment changes the ranking question','How different do historical firm trajectories look after each starts at 100?','r',
 'An index erases the absolute investment level and can magnify growth from a small base. The reference is each firm’s first supplied year, not a market benchmark. The selected firms and years limit generalization.',
 'Use indexed traces for proportional movement and raw values for investment scale. A firm leading one comparison need not lead the other.',
 [F('max','invest_index','The highest first-year-normalized investment index in the panel was {value:.2f}.'),F('median','invest_index','The median firm-year investment index was {value:.2f}.')],
 [S('scatter','Raw investment over time, with firms identified','x=year y=invest color=firm','This retains monetary scale but compresses smaller firms into the lower part of the chart. The compression reflects genuine size differences.'),
  S('scatter','Normalize each firm to its own first year','x=year y=invest_index color=firm','Every firm starts at the same index by construction. Later vertical separation is proportional to its own starting value, not an absolute-dollar gap.'),
  S('boxplot','The distribution of indexed investment by firm','invest_index color=firm','These distributions summarize trajectories but lose their order. A wide box could reflect sustained growth or large reversals.'),
  S('scatter','Market-value and investment indices','x=value_index y=invest_index color=firm','Both axes use a firm-specific starting reference. That makes proportional movements visible while removing cross-firm level information.')],['firm','year','invest','invest_index','value_index'])

N('stackloss','operating-conditions','Plant operating conditions and recorded ammonia loss','Which measured operating conditions vary alongside the recorded loss?','r',
 'The observations are selected operating days, not a randomized trial. Airflow and acid concentration retain source-coded units. A fitted descriptive relationship should not be used as an operating recommendation.',
 'Read the paired measurements before reducing the process to a single predictor. The scatter and grouped distributions reveal association, while the source table keeps the measurement scale explicit.',
 [F('corr','airflow','Airflow and source-scaled stack loss had correlation {value:.3f}.',other='stackloss'),F('corr','watertemp','Cooling-water temperature and source-scaled stack loss had correlation {value:.3f}.',other='stackloss')],
 [S('scatter','Airflow and recorded loss','x=airflow y=stackloss regression=linear','A straight fit summarizes the observed cloud; it does not isolate airflow from the other operating conditions.'),
  S('scatter','Water temperature and recorded loss','x=watertemp y=stackloss','The second predictor may move with the first. Comparing two separate scatters does not establish their independent effects.'),
  S('scatter','Source-coded acid concentration','x=acidconc y=stackloss','Keep the original coding visible instead of inventing a physical concentration unit. The dictionary records that limitation.'),
  S('boxplot','Loss percentage across airflow groups','loss_pct color=air_band','This presentation converts the documented loss scaling only. The airflow split is the sample median, so it is an analytical comparison rather than a safe operating threshold.')],['sequence','airflow','watertemp','acidconc','stackloss','loss_pct'])

N('stackloss','leave-one-out','One operating day can change a small-sample fitted slope','How much does the airflow–loss slope change when each observation is omitted in turn?','r',
 'Leave-one-out fits diagnose sensitivity, not data validity. The omitted points are not automatically errors, and the single-predictor model ignores other measured process conditions.',
 'An influential point is a reason to inspect the record and the model, not a license to delete it. Preserve the original fit and every omitted-row result side by side.',
 [F('min','loo_slope','The smallest leave-one-out airflow slope was {value:.4f} loss units per airflow unit.'),F('max','loo_slope','The largest leave-one-out airflow slope was {value:.4f} loss units per airflow unit.')],
 [S('scatter','The complete-sample descriptive fit','x=airflow y=stackloss regression=linear','Start with every original observation. The sensitivity exercise must remain anchored to the model that would otherwise be reported.'),
  S('scatter','Residuals from that same fit','x=fitted y=residual','A residual is recorded minus fitted loss. Large residuals and influence are related concepts, but one is not a substitute for the other.'),
  S('scatter','The slope after omitting each source row','x=sequence y=loo_slope','The horizontal position identifies the omitted row. These are refits of almost the same small dataset, not independent slope estimates.'),
  S('scatter','Does a large residual imply a large slope shift?','x=residual y=slope_shift','Compare the two diagnostics directly. The prepared shift subtracts the complete-sample slope and preserves its sign.')],['sequence','airflow','stackloss','residual','loo_slope','slope_shift'])

N('engel','food-and-income','Food spending can rise while its income share falls','How do absolute food spending and the food budget share differ across these households?','r',
 'The historical sample covers working-class Belgian households, not contemporary consumers. Household composition and other omitted factors may affect both income and food spending. Ratios share a denominator with income.',
 'Absolute spending and budget pressure are different measurements. Show the currency amount and the share together instead of declaring one the more truthful picture.',
 [F('corr','income','Income and food expenditure had correlation {value:.3f}.',other='foodexp'),F('corr','income','Income and food share had correlation {value:.3f}.',other='food_share')],
 [S('scatter','Food expenditure in historical francs','x=income y=foodexp opacity=0.6','Both axes preserve the recorded monetary scale. More spending does not necessarily mean a larger fraction of the household budget.'),
  S('scatter','Replace the amount with its income share','x=income y=food_share opacity=0.6','The vertical denominator is the same income shown horizontally. The mathematical coupling should be acknowledged before proposing an economic explanation.'),
  S('boxplot','Budget shares across income quartiles','food_share color=income_band','Quartiles improve readability but erase within-group ordering. They are defined from this sample, not external income thresholds.'),
  S('ecdf','The observed distribution of food shares','food_share direction=below','The cumulative curve treats households equally. It answers a household question, not what fraction of all pooled francs was spent on food.')],['income','foodexp','food_share','income_band'])

N('engel','weighting','The average household is not the average franc','How much does the food-share summary change when income, rather than households, supplies the weights?','bands',
 'The grouping is based on sample income quartiles. Income-weighted ratios do not measure a typical household, while equally weighted means do not describe the allocation of all pooled income.',
 'A change of weights is a change of question. State the denominator on the chart and retain group totals so the weighted rate can be reconstructed rather than averaged incorrectly.',
 [F('ratio_sums','food_sum','Food expenditure divided by pooled income was {value:.2f}%.',other='income_sum',scale=100),F('weighted_mean','mean_share','The household-count-weighted mean of the quartile household means was {value:.2f}%.',weight='households')],
 [S('scatter','Two legitimate shares for each income group','x=mean_share y=weighted_share color=income_band','Compare an equally weighted household mean with the group’s pooled-franc ratio. Their difference is about weights, not rounding.'),
  S('line','Follow the groups from lower to higher income','x=order y=mean_share,weighted_share','The ordered line makes the comparison compact. The horizontal steps are quartile positions, not equal intervals of income.'),
  S('scatter','The denominators behind the ratio','x=income_sum y=food_sum color=income_band','The group totals explain why a pooled ratio cannot be obtained by taking an unweighted mean of the four displayed ratios.'),
  S('scatter','How many households contribute to each group?','x=order y=households','Nearly equal group sizes are a consequence of the quartile construction. Exact counts remain necessary when reconstructing the household-weighted overall mean.')],['income_band','households','income_sum','food_sum','mean_share','weighted_share'])

N('strikes','duration-tail','A typical strike and a long strike tell different stories','How far apart are the mean and median durations in this selected strike sample?','r',
 'The sample contains selected manufacturing strikes, not all labor disputes. Durations describe completed recorded events and should not be interpreted as a forecast for a current dispute.',
 'The long tail makes the average sensitive to a small number of lengthy events. Report both the central summary and the tail rather than trimming inconvenient observations without disclosure.',
 [F('mean','duration','The mean recorded duration was {value:.2f} days.'),F('median','duration','The median recorded duration was {value:.2f} days.')],
 [S('hist','Count durations on their original day scale','duration bins=20','A day-scale histogram keeps the operational meaning of an extended dispute. Its binning can make the dense short-duration region difficult to inspect.'),
  S('ecdf','Read the share ending by a chosen duration','duration direction=below','The cumulative view avoids bin choices but still describes only the observed sample. It is not a survival model for censored ongoing strikes.'),
  S('hist','A log transform spreads the shorter durations','log_duration bins=18','The prepared log10 field changes the visual spacing, not the underlying durations. Equal horizontal distances now represent multiplicative ratios.'),
  S('scatter','Keep the longest events attached to source rows','x=sequence y=duration','Sequence is only the original record position. It locates records for inspection and must not be presented as chronological trend.')],['sequence','duration','log_duration','iprod'])

N('strikes','production-context','Production context and strike length: compare, do not explain away','Do durations differ between negative and nonnegative source production deviations?','r',
 'The source production variable is contextual, not a randomized exposure. Its zero split is an analyst-defined comparison. The dataset cannot identify whether production conditions caused a strike to last longer.',
 'A group mean is only one part of the comparison. The overlap and sample support prevent a descriptive contrast from becoming an unsupported mechanism.',
 [F('median','duration','Median duration at negative production deviations was {value:.2f} days.',where=[['iprod','lt',0]]),F('median','duration','Median duration at nonnegative production deviations was {value:.2f} days.',where=[['iprod','ge',0]])],
 [S('scatter','Keep the continuous contextual variable','x=iprod y=duration','Inspect the actual indicator values before dividing them into two groups. A split can create an apparent discontinuity that the continuous cloud does not support.'),
  S('boxplot','Duration distributions across the declared split','duration color=production_band','Median and spread make the contrast legible without assuming a normally distributed duration. Outlying events remain part of the sample.'),
  S('ecdf','How much do the groups overlap?','duration color=production_band direction=below','Cumulative curves show whether the contrast concerns the center, the tails, or both. They are conditional on the selected group sample.'),
  S('row','Count the events supporting each comparison','production_band','Unequal counts matter even when both groups occupy equal chart space. Counts do not by themselves quantify statistical uncertainty.')],['sequence','iprod','production_band','duration'])

N('danish','logs-and-indices','Logs, levels, and rebased money in a historical Danish series','Does the relationship between real money and real income persist after taking quarterly log changes?','r',
 'These are source-defined logged economic series from a historical Danish model dataset. First differences do not remove all confounding or serial dependence. Indices describe changes, not absolute currency levels.',
 'A close relationship in trending levels can look different after differencing. Present the transformation as a different analytical view rather than claiming it reveals the one correct relationship.',
 [F('corr','lrm','Logged real money and logged real income had correlation {value:.3f}.',other='lry'),F('corr','dmoney','Their valid quarterly log changes had correlation {value:.3f}.',other='dincome')],
 [S('line','Rebase both series to the first supplied quarter','x=date y=money_index,income_index','Exponentiating each log difference from its initial value yields a comparable starting index. It does not put the two original series into the same currency quantity.'),
  S('scatter','The relationship in logged levels','x=lry y=lrm','Trending variables can share a strong levels association. Each point is a quarter in one connected historical sequence.'),
  S('scatter','The relationship in quarterly log changes','x=dincome y=dmoney','Differencing removes the initial level and leaves the first quarter without a valid comparison. The result still needs time-series caution.'),
  S('hist','Quarterly log changes in real money','dmoney bins=16','A distribution view exposes asymmetry and extreme changes. It discards persistence and should be read alongside the time series.')],['period','lrm','lry','money_index','income_index','dmoney','dincome'])

N('danish','rate-spread','Two interest-rate lines become one historical spread','How large is the recorded bond-rate minus deposit-rate spread?','r',
 'The displayed rates are historical source fractions, not current quoted products. A spread is not a total investment return, and the observations support no recommendation about present borrowing or investing.',
 'Subtracting the two source fractions makes their difference directly readable. Retain the original lines so a wider spread can be distinguished from movement in both rates together.',
 [F('min','spread','The smallest recorded bond-minus-deposit spread was {value:.4f} in source rate fractions.'),F('max','spread','The largest recorded spread was {value:.4f} in source rate fractions.')],
 [S('line','The two historical rate series','x=date y=ibo,ide','Use one shared fraction scale. Do not format these source fractions as percent values without explicitly multiplying by a hundred.'),
  S('line','The spread relative to equality','x=date y=spread | rule y=0 "Equal source rates"','The zero reference follows from the definition of the subtraction. A positive spread says which source rate is larger, not which asset is preferable.'),
  S('boxplot','Spread distributions across two historical spans','spread color=era','The broad split is descriptive. It is not evidence that an unmodeled regime change occurred at the boundary.'),
  S('scatter','The level of the bond rate and the spread','x=ibo y=spread','The bond rate appears on both sides of this comparison because it is part of the spread. That arithmetic coupling limits interpretation of a correlation.')],['period','ibo','ide','spread','era'])

N('fertility','trajectories','Twelve fertility trajectories, with the empty end years retained','How do selected historical country paths differ without implying a world average?','r',
 'The countries are an illustrative fixed set, not a representative sample. Total fertility rate is a period measure, not completed lifetime births for a cohort. The supplied 2012 and 2013 columns contain no published values.',
 'Keep trajectories separate and make the missing tail explicit. A pooled average would hide country paths and introduce an arbitrary weighting question that this selection cannot resolve globally.',
 [F('mean','fertility','The unweighted mean across the selected countries in 1960 was {value:.3f} births per woman.',where=[['year','eq',1960]]),F('mean','fertility','The corresponding selected-country mean in 2011 was {value:.3f} births per woman.',where=[['year','eq',2011]])],
 [S('scatter','Country-year observations with country colors','x=year y=fertility color=country','Unconnected points do not imply interpolation through null end years. Each country receives one point for each available annual value.'),
  S('boxplot','Country distributions across decades','fertility color=decade','These boxes mix countries and years and therefore answer a country-year question. They are not population-weighted distributions of people.'),
  S('heatmap','Published rates across country and decade','country columnField=decade aggregation=average measureField=fertility','The cell is an available-year mean within a country and decade. Different decade coverage must be checked before treating cells as equally supported.'),
  S('row','Rows retained for each country','country','The row counts include null-valued year cells. Equal retained counts do not mean equal numbers of measured values.')],['country','code','year','fertility'])

N('fertility','matched-endpoints','Compare fertility endpoints only when both are present','What changed between 1960 and 2011 for the same selected country cohort?','endpoints',
 'The endpoint year is 2011 because the supplied 2012–2013 columns are empty. Endpoint differences hide intervening reversals. Countries have equal weight and no claim is made about the world population.',
 'Matching endpoints keeps the country population constant. The comparison still loses the route between the two values, which is why the trajectory notebook remains a necessary companion.',
 [F('mean','change','The mean matched-country change was {value:.3f} births per woman.'),F('min','change','The largest decline in the selected cohort was {value:.3f} births per woman.')],
 [S('scatter','Each country’s starting and ending rate','x=start y=end color=country','A point keeps the paired readings together. The two axis labels identify the historical endpoints rather than implying a simultaneous relationship.'),
  S('scatter','Change against the starting rate','x=start y=change color=country','Change includes the starting value in its subtraction. A relationship with baseline can arise partly from that construction and should not be treated as policy evidence.'),
  S('hist','Distribution of paired changes','change bins=8','Every complete country contributes once. This differs from a histogram of all country-year rates, which weights longer observed paths more heavily.'),
  S('ecdf','What share of selected countries changed by this much?','change direction=below','The denominator is the matched selected cohort, not countries worldwide or people. Read a negative change as a decline in the period rate.')],['country','start','end','change','complete'])

N('fertility','pace-by-decade','Endpoint declines can arrive at different speeds','Which complete decades contain the fastest average declines among the selected countries?','decades',
 'A decade’s first and last observations are nine elapsed years apart, not ten. The annualized difference is linear, not a compound growth rate. The incomplete 2010s are deliberately excluded.',
 'Comparing pace retains more timing than one long endpoint difference, but still erases changes within each decade. Keep the elapsed-year denominator visible.',
 [F('mean','annual_change','The selected-country mean pace in the 1960s was {value:.3f} births per woman per elapsed year.',where=[['decade','eq','1960s']]),F('mean','annual_change','The corresponding pace in the 2000s was {value:.3f} births per woman per elapsed year.',where=[['decade','eq','2000s']])],
 [S('heatmap','A country-by-decade view of pace','country columnField=decade aggregation=average measureField=annual_change','Each cell is already one prepared country-decade observation. The chart’s average therefore returns that cell’s value rather than averaging several undisclosed records.'),
  S('boxplot','Pace varies within the same decade','annual_change color=decade','The distribution across countries shows what an unweighted decade mean would conceal. Equal country weights are a deliberate analytical choice.'),
  S('scatter','Starting fertility and subsequent decade change','x=start y=change color=decade','A lower starting value leaves a different numerical range for a decline. This plot describes that context without assigning a causal explanation.'),
  S('scatter','Check the annual observation count','x=year y=valid color=country','The count verifies whether a named decade has the intended annual support. It does not imply that annual observations are independent.')],['country','decade','valid','start','end','change','annual_change'])

N('iris','measurement-choice','Petals and sepals do not separate iris groups equally','Which pairs of measured dimensions make the supplied species groups easier to distinguish?','r',
 'The classic sample has a deliberately limited species population and is not a survey of all irises. The scikit-learn corrected variant is preserved. Visual separation is not an evaluated classifier accuracy.',
 'Choose measurements for the analytical question rather than assuming every two-dimensional projection is equally informative. Keep overlapping observations visible and avoid converting visual clusters into unsupported prediction claims.',
 [F('mean','petal_length','Mean petal length for setosa was {value:.3f} cm.',where=[['species','eq','setosa']]),F('mean','petal_length','Mean petal length for virginica was {value:.3f} cm.',where=[['species','eq','virginica']])],
 [S('scatter','Petal length against petal width','x=petal_length y=petal_width color=species','Each point is one flower. Consistent species colors support comparison, but points with the same measurements can overlap.'),
  S('scatter','Replace petals with sepals','x=sepal_length y=sepal_width color=species','This changes the projection while retaining the population. Any apparent loss of separation comes from the selected measurements, not a different sample.'),
  S('boxplot','Petal-length distributions by species','petal_length color=species','A one-dimensional summary sacrifices the joint relationship but makes the distribution centers and overlap easy to compare.'),
  S('parallel','Follow each flower through all four dimensions','sepal_length,sepal_width,petal_length,petal_width color=species','Each polyline is one complete flower. Axes have their own scales, so a line’s angle is not a physical geometric angle of the specimen.')],['species','sepal_length','sepal_width','petal_length','petal_width'])

N('iris','pooled-versus-grouped','A pooled iris correlation is not a within-species relationship','How does sepal length–width association change after retaining the species grouping?','r',
 'Grouping is descriptive and does not prove a biological mechanism. Correlations use complete numerical pairs. Equal class counts in this teaching dataset should not be mistaken for natural species prevalence.',
 'The pooled cloud combines within-group movement with differences between group centers. Report which population a correlation describes instead of calling one coefficient the relationship.',
 [F('corr','sepal_length','The pooled sepal length–width correlation was {value:.3f}.',other='sepal_width'),F('corr','sepal_length','Within setosa, the correlation was {value:.3f}.',other='sepal_width',where=[['species','eq','setosa']])],
 [S('scatter','One pooled cloud, no grouping','x=sepal_length y=sepal_width regression=linear','The fitted line describes every supplied flower together. It mixes between-species differences with within-species variation.'),
  S('scatter','Show the groups the pooled fit hid','x=sepal_length y=sepal_width color=species regression=linear','Grouping makes the conditional comparisons explicit. These are descriptive straight fits, not independent tests of a causal model.'),
  S('boxplot','Sepal width differs across the groups','sepal_width color=species','Group locations help explain why the pooled cloud can behave differently from each species cloud. A box still loses the paired length measurement.'),
  S('ecdf','The entire width distribution by species','sepal_width color=species direction=below','Cumulative curves expose overlap and tails without relying on a fitted equation. They preserve the equal weighting of flowers.')],['species','sepal_length','sepal_width','petal_length'])

N('wine','cultivar-chemistry','Wine chemistry is not a tasting score','How do recorded flavanoids and color intensity differ across the supplied cultivar groups?','r',
 'This is the UCI Wine recognition dataset, not the demo’s Wine Quality ratings. The publisher does not specify units for these assay fields; source units are retained. Cultivar labels are not quality rankings.',
 'The group label supplies context for chemical comparisons, not a scale from bad wine to good wine. Avoid reusing the narrative of a quality-score example on a different source population.',
 [F('mean','flavanoids','Mean flavanoids in Cultivar 1 were {value:.3f} source assay units.',where=[['cultivar','eq','Cultivar 1']]),F('mean','flavanoids','Mean flavanoids in Cultivar 3 were {value:.3f} source assay units.',where=[['cultivar','eq','Cultivar 3']])],
 [S('scatter','Flavanoids against color intensity','x=flavanoids y=color_intensity color=cultivar','The two assays describe different measurements. Their numerical values cannot be compared as though both had one common physical unit.'),
  S('boxplot','Flavanoid distributions by cultivar','flavanoids color=cultivar','Use the same field scale across groups. A difference in group center does not establish a difference in desirability or quality.'),
  S('scatter','Total phenols and flavanoids','x=total_phenols y=flavanoids color=cultivar','A second chemical pair checks whether the grouping is visible beyond the first projection. The relationship remains observational.'),
  S('ecdf','Color intensity across the same groups','color_intensity color=cultivar direction=below','The cumulative view compares all recorded intensities. It avoids inventing an assay threshold that the source did not define.')],['cultivar','flavanoids','color_intensity','total_phenols','alcohol'])

N('wine','profile-scales','Chemical profiles need separate axes, not one shared unit','Which measurements dominate a raw numerical view of the wine assays?','r',
 'The assay fields have different source units and scales. Parallel-coordinate axes are separate, so steep segments do not measure chemical relationships directly. No classifier or quality model is evaluated.',
 'A multivariable view is useful when its axes acknowledge different measurements. Standardizing would answer a relative-position question, but it would erase the original units; this piece keeps the raw values.',
 [F('max','proline','The maximum recorded proline value was {value:.1f} source units.'),F('max','hue','The maximum recorded hue value was {value:.3f} source units.')],
 [S('parallel','One wine across selected assay axes','alcohol,malic_acid,magnesium,flavanoids,color_intensity,proline color=cultivar','Separate axes stop the numerically largest field from compressing every other measure. The display does not make unlike units additive.'),
  S('scatter','Proline and alcohol remain in original units','x=proline y=alcohol color=cultivar','A conventional paired plot restores explicit two-axis interpretation. It helps test an impression formed in the denser profile view.'),
  S('boxplot','Hue has its own numerical scale','hue color=cultivar','A field with small numerical values can still separate groups. Magnitude in source units is not a measure of analytical importance.'),
  S('boxplot','Proline has a much larger raw scale','proline color=cultivar','Do not compare box heights across these two charts as if the vertical rulers were identical. Read each field’s label and unit caveat.')],['cultivar','alcohol','malic_acid','magnesium','hue','proline'])

N('longley','trending-levels','A small employment benchmark contains several rising trends','How similar are employment, population, and nominal output after rebasing their starting values?','r',
 'This is a small historical regression benchmark, not a current labor-market dataset. GNP is nominal and source units are retained. Similar trends do not establish a stable causal employment model.',
 'Indices make proportional movement comparable while hiding original scale. The paired changes offer a different test of whether the levels association is mainly a shared historical trend.',
 [F('corr','employment','Employment and nominal GNP in levels had correlation {value:.3f}.',other='gnp'),F('corr','employment_change','Their valid annual changes had correlation {value:.3f}.',other='gnp_change')],
 [S('line','Give each series the same starting index','x=year y=employment_index,gnp_index,population_index','A common start is imposed by the transformation. Different subsequent slopes describe proportional movement from that reference.'),
  S('scatter','The strong-looking levels relationship','x=gnp y=employment','Both measurements move through the same short historical span. A close cloud alone does not validate a prediction model.'),
  S('scatter','Compare changes between adjacent years','x=gnp_change y=employment_change','The first year has no prior observation and is omitted from the paired-change statistic. Differencing changes the question rather than simply improving the first chart.'),
  S('hist','The distribution of annual employment changes','employment_change bins=8','With a small number of differences, bins are only a rough descriptive device. Use the source table to inspect the individual changes.')],['year','employment','gnp','population','employment_change','gnp_change'])

N('longley','different-denominators','Employment counts and unemployment counts are not a rate','What do the raw historical count series show without inventing a labor-force denominator?','r',
 'The selected columns do not provide a verified labor-force denominator for constructing a standard unemployment rate. Population is not a substitute. These source counts belong to an old benchmark vintage.',
 'A dashboard can be useful without manufacturing a familiar metric. Keep the count series separate, name their units, and make the missing denominator an analytical limit.',
 [F('min','unemployed','The smallest recorded unemployment count was {value:,.0f} source count units.'),F('max','unemployed','The largest recorded unemployment count was {value:,.0f} source count units.')],
 [S('line','Unemployment counts across the supplied years','x=year y=unemployed','This line is a count series. Calling it an unemployment rate would silently add a denominator the analysis has not verified.'),
  S('line','Armed-forces counts provide different context','x=year y=armed','The second count has a different population meaning. Its separate panel avoids suggesting that the two series partition a complete labor force.'),
  S('scatter','Employment and unemployment can both move','x=employment y=unemployed color=era','A two-count plot makes the changing scale of the economy relevant. There is no identity requiring the two plotted numbers to sum to a constant.'),
  S('scatter','Population is context, not a rate denominator','x=population y=unemployed','Population does not establish who participates in the labor force. This view describes scale without converting the ratio into an official labor statistic.')],['year','employment','unemployed','armed','population'])

N('football','group-goals','The group stage was not forty-eight identical scorelines','How much of the 2018 group-stage scoring distribution sits in close games and high totals?','r',
 'Only the supplied group stage is included. Final scores exclude penalty shootouts and contain no playing-time, shot, or possession information. The first listed side is not treated as a home team.',
 'Match totals describe spectacle; margins describe closeness. They can move independently, so a high-scoring match should not automatically be called uncompetitive.',
 [F('mean','total_goals','The mean group-stage match total was {value:.3f} goals.'),F('share','margin','Matches with a margin no greater than one goal represented {value:.2f}% of the group stage.',condition=[['margin','le',1]])],
 [S('hist','How many goals did a match contain?','total_goals bins=8','The unit is one match, so each final score contributes once. Team-appearance rows would double the count and require a different denominator.'),
  S('scatter','A high total need not mean a wide margin','x=total_goals y=margin opacity=0.6','Each match has two derived measures from the same score. Coincident points remain separate records and should not be deduplicated.'),
  S('boxplot','Match-total distributions by group','total_goals color=group','Every group has the same intended match schedule, but a small number of games makes broad group rankings fragile.'),
  S('row','Drawn and decisive final scores','result','A draw is defined by equal final goals. This is not a claim about whether a match was tactically balanced or whether either team deserved to win.')],['date','group','team1','team2','goals1','goals2','total_goals','margin'])

N('football','points-and-goals','Goals scored and group points reward different things','How do team-level scoring, defending, and points compare over the same three matches?','teams',
 'Teams faced different opponents, and the small group-stage schedule is not a strength-adjusted experiment. No advancement ranking is inferred because all tie-break procedures are outside this analysis.',
 'The team table changes the population from matches to participants. Points and goal difference summarize different rules, so retain goals for and against instead of compressing everything into a single league table.',
 [F('max','goals_for','The largest team group-stage goal total was {value:.0f} goals.'),F('share','points','Teams earning at least seven group points represented {value:.2f}% of the selected teams.',condition=[['points','ge',7]])],
 [S('scatter','Scoring and conceding are separate axes','x=goals_for y=goals_against color=group','Each point is one team after its completed group matches. Teams are not independent because opponents contribute to one another’s goals-against totals.'),
  S('scatter','Goal difference against points','x=goal_difference y=points color=group','Points follow win/draw/loss rules rather than a direct conversion of goal difference. Equal points can conceal different scoring profiles.'),
  S('hist','The distribution of group-stage points','points bins=10','This counts teams, not matches. The schedule creates a discrete points scale and limits the sample’s possible values.'),
  S('boxplot','Scoring totals within each group','goals_for color=group','Each group’s teams share opponents within their schedule. These distributions are descriptive and not measures of an independently randomized group effect.')],['team','group','matches','goals_for','goals_against','goal_difference','points'])

N('tate','metadata-not-lifespans','A museum catalogue date span is not always a person’s lifespan','What goes wrong when birth and death fields are treated as complete biographies?','r',
 'This is the first sixty alphabetically ordered records in Tate’s October 2014 archive, not a representative artist sample. A blank death year is not evidence that someone is alive today. The explicit Alken Family entry is not one person.',
 'An implausible-looking span can expose a mismatch between the analytical unit and the catalogue entity. Preserve the record and explain the mismatch instead of silently clipping it or inventing a death date.',
 [F('max','date_span','The largest recorded date span in this prefix was {value:.0f} years; it belongs to the explicit family entity.'),F('missing_share','death_year','Blank death-year fields represent {value:.2f}% of this archive prefix.')],
 [S('hist','Birth-year coverage of the alphabetic prefix','birth_year bins=16','The prefix is selected by catalogue ordering, not time or random sampling. Its birth-year distribution cannot describe Tate’s whole collection.'),
  S('row','Recorded versus blank death-year fields','death_status','The labels describe the old metadata, not current living status. Both types remain in the full row population.'),
  S('scatter','Date span against birth year, with the family distinguished','x=birth_year y=date_span color=entity','The span is a subtraction of supplied date fields. Color identifies the explicitly named family entry without assuming that every other catalogue record is necessarily a single-person biography.'),
  S('hist','Inspect long spans rather than deleting them','date_span bins=15','Only paired dates contribute. A long interval is a prompt to inspect entity semantics; it is not automatically a bad numeric measurement.')],['catalogue_id','name','birth_year','death_year','date_span','entity','death_status'])


N('grunfeld','investment-concentration','A selected corporate panel can be dominated by a few firms','How concentrated is cumulative recorded investment among the firms in this panel?','firms',
 'The denominator is cumulative investment among the selected panel firms and years, not all corporate investment. Adding market values across years would not represent a stock of wealth, so that quantity is not used.',
 'Changing from firm-years to firm summaries makes concentration visible without giving each large firm more rows. Retain the observation counts to distinguish investment scale from a longer recorded history.',
 [F('top_share','invest_total','The largest firm accounts for {value:.2f}% of cumulative panel investment.',k=1),F('top_share','invest_total','The three largest firms together account for {value:.2f}% of cumulative panel investment.',k=3)],
 [S('scatter','Mean market value against mean investment','x=value_mean y=invest_mean','Each point now represents one firm rather than a firm-year. That changes the observational unit and removes the chronological variation inside each company.'),
  S('hist','The distribution of cumulative investment by firm','invest_total bins=8','A firm contributes one total across its supplied years. The horizontal measure is a flow accumulated over time, not an asset value measured at one date.'),
  S('scatter','Separate scale from observation count','x=years y=invest_total','A high total might reflect more years, larger annual amounts, or both. The explicit year count checks which of these explanations is available in this panel.'),
  S('ecdf','How many firms fall below a cumulative amount?','invest_total direction=below','The cumulative curve gives firms equal weight. It therefore answers a different question from the share of all investment contributed by the largest firms.')],['firm','years','invest_mean','value_mean','invest_total'])

N('fertility','empty-end-years','An empty year column is not a fertility collapse','What happens when a historical export contains year columns with no values?','r',
 'The supplied export is a historical snapshot. Empty values mean unavailable in this file, not zero births per woman and not necessarily unavailable from later source revisions. The country subset is illustrative.',
 'Data coverage is part of the result. Keeping blank end years prevents a chart from inventing a decline to zero or presenting a carried-forward value as a fresh observation.',
 [F('missing_share','fertility','In the selected 2012 rows, the missing-value share was {value:.1f}%.',where=[['year','eq',2012]]),F('missing_share','fertility','In the selected 2011 rows, the missing-value share was {value:.1f}%.',where=[['year','eq',2011]])],
 [S('scatter','Recorded rates stop before the headers do','x=year y=fertility color=country','The axis can contain dates without measured points. Do not connect a null to zero or carry the previous observation forward without declaring an imputation model.'),
  S('bar','Published and missing cells in each year','year_label seriesField=coverage seriesLayout=stacked color=coverage','Count each selected country-year once and split the count by value availability. The missing segment records null source cells; it does not replace the missing rate with zero.'),
  S('row','Published versus missing source values','coverage','Count the two availability categories across the entire fixed country-year grid. This makes the missing-rate denominator explicit without deleting the incomplete rows.'),
  S('heatmap','Coverage by country and supplied year','country columnField=year_label aggregation=average measureField=observed','Each cell has one selected country-year: one means a published rate and zero means a null rate. These are measurement-availability indicators, not imputed fertility values.')],['country','code','year','fertility','decade'])

N('football','draws-and-points','A drawn group match distributes fewer points','How does the draw rate affect the number of group-stage points available to teams?','r',
 'This is arithmetic under the declared three-points-for-a-win and one-for-a-draw rule, not a measure of match quality. It describes group-stage final scores only and says nothing about later knockout results.',
 'A decisive match supplies three total team points; a draw supplies two. Comparing groups by points without acknowledging that rule can obscure why equal schedules produce different point pools.',
 [F('share','result','Draws represent {value:.2f}% of the supplied group-stage matches.',condition=[['result','eq','Draw']]),F('sum','total_goals','The supplied group-stage matches contain {value:.0f} total goals.')],
 [S('row','First separate drawn from decisive matches','result','The result categories are defined directly from equal or unequal final goals. They do not incorporate shootouts or subjective assessments of play.'),
  S('heatmap','Result counts inside each group','group columnField=result aggregation=count showValues=true','The count cells reveal differences in group draws under the same schedule length. A missing category should not be confused with a missing match.'),
  S('boxplot','Draws can still have different goal totals','total_goals color=result','A draw may be scoreless or high-scoring. This distribution prevents the draw category from being treated as a synonym for a low-event match.'),
  S('scatter','The two final goal counts','x=goals1 y=goals2 color=result','Draws lie where the two scores are equal. First and second are listing order, not home advantage, and coincident scorelines still represent separate games.')],['date','group','team1','team2','goals1','goals2','result'])
assert len(NOTEBOOKS)==40,len(NOTEBOOKS)
