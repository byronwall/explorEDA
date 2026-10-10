import { facts } from "./facts/wine";
import { formatCount, note } from "./types";

const [ordinary, good, excellent] = [
  "Ordinary (3–5)",
  "Good (6)",
  "Excellent (7–8)",
] as const;

const BANDS = `+ mapping[]= mapping.0[]="Ordinary (3–5)","#3479a8"
+ mapping.1[]="Good (6)","#c77a45" mapping.2[]="Excellent (7–8)","#4b9688"`;

/** What separates a good red wine: the scatter study and a balance tab. */
export const wineText = `dashboard name="What separates a good red wine"
grid rowHeight=76 padding=0 markers=false

calc "Quality band"=if quality <= 5 then "${ordinary}" else if quality == 6 then "${good}" else "${excellent}"

scale @wine-bands field="Quality band"
${BANDS}

view "What separates a good red wine"
chart markdown @wine-note at=0,0,12,2 title="All ${formatCount(facts.wines)} wines"
+ content=${note("Better wines carry more alcohol and less volatile acid.", [
  `Median alcohol: ${facts.medianAlcohol[ordinary]}% ordinary, ${facts.medianAlcohol[good]}% good, ${facts.medianAlcohol[excellent]}% excellent. Alcohol and density correlate at r = ${facts.alcoholDensityR}.`,
])}
scatter x=alcohol y=density @wine-density at=0,2,7,7 color="Quality band"
+ display=contour contour.bandwidth=0.8 contour.levels=6
+ regression.method=loess regression.span=0.7 summary=true marginals.bins=24
+ title="Density falls as alcohol rises"
+ xAxisLabel="Alcohol (% vol)" yAxisLabel="Density (g/cm³)"
scatter x="fixed acidity" y=pH @wine-acid at=7,2,5,7
+ display=hexbin hexbin.columns=18 regression.method=linear summary=true
+ title="More fixed acid, lower pH" xAxisLabel="Fixed acidity (g/L)" yAxisLabel=pH
scatter x="volatile acidity" y=alcohol @wine-volatile at=0,9,8,5 color="Quality band"
+ facet.enabled=true facet.rowVariable="Quality band" facet.columnCount=3
+ regression.method=linear
+ title="Volatile acidity and alcohol in each quality band"
+ xAxisLabel="Volatile acidity (g/L)" yAxisLabel="Alcohol (% vol)"
row "Quality band" @wine-quality at=8,9,4,5 color="Quality band"
+ title="Filter by quality band" xAxisLabel=Wines minRowHeight=28 maxRowHeight=40
table "Quality band",quality,alcohol,density,"volatile acidity","fixed acidity",pH
+ @wine-records at=0,14,12,4 title="Wines in view"

view "Acidity and balance"
chart boxplot field="volatile acidity" @wine-volatile-box at=0,0,6,5 color="Quality band"
+ violinOverlay=true title="Volatile acidity by quality band"
+ yAxisLabel="Volatile acidity (g/L)"
chart boxplot field=sulphates @wine-sulphates at=6,0,6,5 color="Quality band"
+ violinOverlay=true title="Sulphates by quality band" yAxisLabel="Sulphates (g/L)"
chart parallel-coordinates @wine-profile at=0,5,8,6 color="Quality band"
+ axes[]= axes.0.field=alcohol axes.0.inverted=false
+ axes.1.field="volatile acidity" axes.1.inverted=false
+ axes.2.field=sulphates axes.2.inverted=false
+ axes.3.field="citric acid" axes.3.inverted=false
+ axes.4.field=density axes.4.inverted=false
+ title="Five measurements, one line per wine"
chart markdown @wine-balance-note at=8,5,4,3 title="Quality and chemistry"
+ content=${note("Volatile acid falls and sulphates rise with quality.", [
  `Median volatile acidity: ${facts.medianVolatileAcidity[ordinary]}, ${facts.medianVolatileAcidity[good]}, ${facts.medianVolatileAcidity[excellent]} g/L from ordinary to excellent.`,
  `Median sulphates: ${facts.medianSulphates[ordinary]}, ${facts.medianSulphates[good]}, ${facts.medianSulphates[excellent]} g/L.`,
  `Correlation with the tasting score: alcohol r = ${facts.alcoholQualityR}, volatile acidity r = ${facts.volatileQualityR}.`,
])}
row "Quality band" @wine-balance-band at=8,8,4,3 color="Quality band"
+ title="Filter by quality band" xAxisLabel="" minRowHeight=16 maxRowHeight=30
`;
