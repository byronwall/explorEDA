import type { AnalysisProject } from "exploreda";
import { facts } from "./facts/beijing";
import { formatCount, note, type ExampleAnalysis } from "./types";

const { audit, findings } = facts;

const concentration = (id: string, name: string) => ({
  id,
  name: `${name} (µg/m³)`,
  type: "number" as const,
});

const project: AnalysisProject = {
  id: "beijing-air-2016",
  version: 1,
  sources: [
    {
      id: "days",
      name: "Station days",
      glyph: "D",
      entityKey: "station_day",
      fields: [
        { id: "station_day", name: "Station day", type: "string" },
        { id: "station", name: "Station", type: "string" },
        { id: "date", name: "Date", type: "date" },
        { id: "month", name: "Month", type: "string" },
        { id: "season", name: "Season", type: "string" },
        { id: "recorded_hours", name: "Recorded hours", type: "number" },
        concentration("pm25", "PM2.5"),
        concentration("pm10", "PM10"),
        concentration("so2", "SO₂"),
        concentration("no2", "NO₂"),
        concentration("co", "CO"),
        concentration("o3", "O₃"),
        { id: "temp", name: "Temperature (°C)", type: "number" },
        { id: "wspm", name: "Wind speed (m/s)", type: "number" },
        { id: "pm25_valid_hours", name: "Valid PM2.5 hours", type: "number" },
        { id: "pm25_coverage_pct", name: "PM2.5 coverage (%)", type: "number" },
      ],
    },
    {
      id: "stations",
      name: "Stations",
      glyph: "S",
      entityKey: "station",
      fields: [
        { id: "station", name: "Station", type: "string" },
        {
          id: "recorded_hours",
          name: "Hours recorded in 2016",
          type: "number",
        },
        {
          id: "pm25_valid_hours",
          name: "Valid PM2.5 hours in 2016",
          type: "number",
        },
        {
          id: "qualified_pm25_days",
          name: "Qualified PM2.5 days",
          type: "number",
        },
        {
          id: "annual_pm25",
          name: "Station's 2016 PM2.5 (µg/m³)",
          type: "number",
        },
      ],
    },
    {
      id: "reference",
      name: `Reference days (${audit.referenceStation})`,
      glyph: "R",
      entityKey: "date",
      fields: [
        { id: "date", name: "Date", type: "date" },
        { id: "station", name: "Reference station", type: "string" },
        { id: "pm25", name: "Reference PM2.5 (µg/m³)", type: "number" },
        {
          id: "pm25_valid_hours",
          name: "Reference valid hours",
          type: "number",
        },
      ],
    },
  ],
  relationships: [
    {
      id: "day-station",
      name: "Day's station",
      from: { sourceId: "days", fieldId: "station" },
      to: { sourceId: "stations", fieldId: "station" },
      cardinality: "many-to-one",
    },
    {
      id: "day-reference",
      name: "Same date at the reference station",
      from: { sourceId: "days", fieldId: "date" },
      to: { sourceId: "reference", fieldId: "date" },
      cardinality: "many-to-one",
    },
  ],
  queries: [
    {
      id: "station-days",
      name: "Station days with station and reference",
      glyph: "◫",
      frameLabel: "station days",
      outputStepId: "pm25-status",
      steps: [
        { id: "days", kind: "source", sourceId: "days" },
        {
          id: "station",
          kind: "lookup",
          inputStepId: "days",
          relationshipId: "day-station",
          as: "station",
        },
        {
          id: "reference",
          kind: "lookup",
          inputStepId: "station",
          relationshipId: "day-reference",
          as: "reference",
        },
        {
          id: "versus-reference",
          kind: "calculate",
          inputStepId: "reference",
          fieldId: "pm25_vs_reference",
          label: "PM2.5 above reference (µg/m³)",
          expression:
            'if ["days.pm25"] == null || ["reference.pm25"] == null then null else ["days.pm25"] - ["reference.pm25"]',
        },
        {
          id: "pm25-status",
          kind: "calculate",
          inputStepId: "versus-reference",
          fieldId: "pm25_status",
          label: "PM2.5 day",
          expression:
            'if ["days.pm25"] == null then "Under 20 valid hours" else "Qualified"',
        },
      ],
    },
  ],
};

const SEASONS = `+ mapping[]= mapping.0[]=Winter,"#3479a8" mapping.1[]=Spring,"#4b9688"
+ mapping.2[]=Summer,"#c77a45" mapping.3[]=Autumn,"#9c6eac"`;
const [winter, spring, summer, autumn] = [
  findings.tempO3.Winter,
  findings.tempO3.Spring,
  findings.tempO3.Summer,
  findings.tempO3.Autumn,
];
const worstDate = new Date(
  `${findings.worstDay.date}T12:00:00Z`
).toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const text = `dashboard name="Beijing air quality in 2016"
grid rowHeight=76 padding=0 markers=false

field days.date format=date
field reference.date format=date
field days.pm25 precision=1
field days.pm25_coverage_pct precision=1
field pm25_vs_reference precision=1

group @above-reference name="Mean PM2.5 above the reference station"
+ groupField=days.station measureField=pm25_vs_reference aggregation=average

scale @seasons field=days.season
${SEASONS}

view "A year of PM2.5"
chart calendar field=days.date @air-calendar at=0,0,8,4
+ aggregation=average measureField=days.pm25
+ title="Mean PM2.5 across stations, each day of 2016"
chart markdown @air-summary at=8,0,4,4 title="${formatCount(audit.stationDays)} station-days, 12 stations"
+ content=${note(
  "PM2.5 swings more from day to day than from season to season.",
  [
    `Median daily PM2.5: winter ${findings.medianPm25.Winter}, spring ${findings.medianPm25.Spring}, summer ${findings.medianPm25.Summer}, autumn ${findings.medianPm25.Autumn} µg/m³.`,
    `Worst station-day: ${findings.worstDay.station}, ${worstDate}, ${findings.worstDay.pm25} µg/m³.`,
    `Daily means need 20 of 24 valid hours; ${formatCount(audit.stationDays - audit.qualifiedPm25Days)} station-days fall short and stay empty.`,
  ]
)}
chart line @air-daily at=0,4,8,5 xField=days.date
+ time.interval=day time.weekStart=monday time.aggregation=average
+ time.measureField=days.pm25 time.missingPeriods=gap
+ title="Daily PM2.5, mean of qualified stations" xAxisLabel=Date
+ yAxisLabel="PM2.5 (µg/m³)"
row days.station @air-station at=8,4,4,5 title="Filter by station"
+ xAxisLabel="" minRowHeight=14 maxRowHeight=24
chart boxplot field=days.pm25 @air-season at=0,9,6,5 color=days.season
+ title="Daily PM2.5 by season" yAxisLabel="PM2.5 (µg/m³)"
+ showObservations=true violinOverlay=true
metric count @air-count at=6,9,3,2 title="Station-days"
metric avg=days.pm25 @air-mean at=9,9,3,2 title="Mean PM2.5 (µg/m³)"
row days.season @air-season-filter at=6,11,6,3 color=days.season
+ title="Filter by season" xAxisLabel="" minRowHeight=16 maxRowHeight=24
table days.date,days.station,days.season,days.pm25,days.pm10,days.no2,days.o3,days.pm25_valid_hours
+ @air-rows at=0,14,12,5 title="Station-days in this selection"

view "Coverage and stations"
chart heatmap field=days.station @air-coverage at=0,0,8,6 columnField=days.month
+ aggregation=average measureField=days.pm25_coverage_pct sortBy=label
+ title="PM2.5 hourly coverage by station and month (%)"
chart markdown @air-coverage-note at=8,0,4,3 title="Coverage before comparison"
+ content=${note(
  `${findings.pm25CoveragePct}% of expected PM2.5 hours are valid.`,
  [
    `Lowest cell: ${findings.lowestCoverage.station} in ${findings.lowestCoverage.month.slice(3)}, ${findings.lowestCoverage.pct}%.`,
    `Every station has a row for every day; none of the ${formatCount(audit.expectedHours)} expected hours is duplicated.`,
  ]
)}
row pm25_status @air-status at=8,3,4,3 title="Daily PM2.5 status"
+ xAxisLabel="" minRowHeight=20 maxRowHeight=28
chart pivot @air-stations at=0,6,6,6 title="Station summary, from the stations table"
+ rowFields[]=days.station valueFields[]=
+ valueFields.0.field=station.qualified_pm25_days valueFields.0.aggregation=singleValue
+ valueFields.0.label="Qualified days"
+ valueFields.1.field=station.annual_pm25 valueFields.1.aggregation=singleValue
+ valueFields.1.label="2016 PM2.5"
+ valueFields.2.field=days.pm25 valueFields.2.aggregation=avg
+ valueFields.2.label="Mean in selection"
hist days.station @air-reference at=6,6,6,6 aggregateId=above-reference
+ categoryOrder=label title="Mean PM2.5 above ${audit.referenceStation} on the same day"
+ xAxisLabel=Station yAxisLabel="Difference (µg/m³)"
table days.date,days.station,days.recorded_hours,days.pm25_valid_hours,days.pm25_coverage_pct,days.pm25,reference.pm25,pm25_vs_reference
+ @air-coverage-rows at=0,12,12,5 title="Coverage of each station-day"

view "Particles and NO₂"
scatter x=days.pm25 y=days.no2 @air-joint at=0,0,12,6
+ display=contour contour.bandwidth=1 contour.levels=6 summary=true
+ facet.enabled=true facet.rowVariable=days.season facet.columnCount=4
+ color=days.season title="Daily PM2.5 and NO₂ in each season"
+ xAxisLabel="PM2.5 (µg/m³)" yAxisLabel="NO₂ (µg/m³)"
chart markdown @air-joint-note at=0,6,4,4 title="${formatCount(findings.pm25No2.n)} days with both"
+ content=${note("Particles and NO₂ rise together.", [
  `Correlation across all qualified station-days: r = ${findings.pm25No2.r}.`,
  "Density shows where days cluster; it does not attribute a source.",
])}
row days.station @air-joint-station at=4,6,4,4 title="Filter by station"
+ xAxisLabel="" minRowHeight=12 maxRowHeight=20
hist days.pm25 @air-joint-hist at=8,6,4,4 bins=20 title="PM2.5 distribution"
+ xAxisLabel="PM2.5 (µg/m³)" yAxisLabel=Days

view "Ozone follows temperature"
scatter x=days.temp y=days.o3 @air-ozone at=0,0,8,7 color=days.season
+ regression.method=loess regression.span=0.6 summary=true marginals.bins=20
+ opacity=0.45 title="Daily ozone against temperature, by season"
+ xAxisLabel="Temperature (°C)" yAxisLabel="O₃ (µg/m³)"
chart markdown @air-ozone-note at=8,0,4,3 title="One curve would hide the seasons"
+ content=${note("Warmth lifts ozone except in winter.", [
  `Correlation of temperature and ozone: spring r = ${spring.r}, autumn ${autumn.r}, summer ${summer.r}, winter ${winter.r}.`,
  `Median ozone: summer ${findings.medianO3.Summer}, winter ${findings.medianO3.Winter} µg/m³.`,
])}
row days.season @air-ozone-season at=8,3,4,4 color=days.season
+ title="Filter by season" xAxisLabel="" minRowHeight=20 maxRowHeight=32
hist days.wspm @air-wind at=0,7,6,4 bins=20 title="Wind speed on these days"
+ xAxisLabel="Wind speed (m/s)" yAxisLabel=Days
row days.station @air-ozone-station at=6,7,6,4 title="Filter by station"
+ xAxisLabel="" minRowHeight=12 maxRowHeight=20

view "Six-pollutant profiles"
chart parallel-coordinates @air-profiles at=0,0,8,7 color=days.season
+ axes[]= axes.0.field=days.pm25 axes.0.inverted=false
+ axes.1.field=days.pm10 axes.1.inverted=false
+ axes.2.field=days.so2 axes.2.inverted=false
+ axes.3.field=days.no2 axes.3.inverted=false
+ axes.4.field=days.co axes.4.inverted=false
+ axes.5.field=days.o3 axes.5.inverted=false
+ title="Six pollutants, one line per station-day"
chart markdown @air-profiles-note at=8,0,4,3 title="${formatCount(findings.completeSixPollutantDays)} complete station-days"
+ content=${note("Ozone and particles do not move as one.", [
  `Across days, ozone and PM2.5 correlate weakly and negatively: r = ${findings.highOzone.r}.`,
  `Yet the top quarter of ozone days (≥ ${findings.highOzone.threshold} µg/m³) has median PM2.5 ${findings.highOzone.medianPm25}, above the ${findings.highOzone.medianPm25AllDays} of all days.`,
  `${formatCount(audit.stationDays - findings.completeSixPollutantDays)} station-days lack one pollutant and are not drawn.`,
])}
chart ecdf field=days.pm25 @air-ecdf at=8,3,4,4 color=days.season
+ direction=below showQuantiles=true title="Share of days under a PM2.5 level"
+ xAxisLabel="PM2.5 (µg/m³)"
table days.date,days.station,days.pm25,days.pm10,days.so2,days.no2,days.co,days.o3
+ @air-profile-rows at=0,7,12,5 title="Station-days in the brushed profiles"
`;

export const beijingAnalysis: ExampleAnalysis = {
  project,
  tableFiles: {
    days: "/datasets/beijing/station-days.csv",
    stations: "/datasets/beijing/stations.csv",
    reference: "/datasets/beijing/reference-days.csv",
  },
  text,
};
