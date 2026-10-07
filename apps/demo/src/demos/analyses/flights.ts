import type { AnalysisProject } from "exploreda";
import { facts } from "./facts/flights";
import { formatCount, note, percent, type ExampleAnalysis } from "./types";

const { audit, findings } = facts;

const project: AnalysisProject = {
  id: "january-flights",
  version: 1,
  sources: [
    {
      id: "flights",
      name: "Flights",
      glyph: "F",
      entityKey: "flight_id",
      fields: [
        { id: "flight_id", name: "Flight ID", type: "string" },
        { id: "flight_date", name: "Flight date", type: "date" },
        { id: "sched_dep_hour", name: "Scheduled hour", type: "number" },
        { id: "dep_delay", name: "Departure delay (min)", type: "number" },
        { id: "arr_delay", name: "Arrival delay (min)", type: "number" },
        { id: "carrier", name: "Carrier code", type: "string" },
        { id: "flight", name: "Flight", type: "string" },
        { id: "tailnum", name: "Tail number", type: "string" },
        { id: "origin", name: "Origin", type: "string" },
        { id: "dest", name: "Destination", type: "string" },
        { id: "air_time", name: "Air time (min)", type: "number" },
        { id: "distance", name: "Distance (mi)", type: "number" },
        { id: "weather_key", name: "Weather hour", type: "string" },
      ],
    },
    {
      id: "airlines",
      name: "Airlines",
      glyph: "A",
      entityKey: "carrier",
      fields: [
        { id: "carrier", name: "Carrier code", type: "string" },
        { id: "name", name: "Airline", type: "string" },
      ],
    },
    {
      id: "planes",
      name: "Aircraft",
      glyph: "P",
      entityKey: "tailnum",
      fields: [
        { id: "tailnum", name: "Tail number", type: "string" },
        { id: "plane_year", name: "Year built", type: "number" },
        { id: "manufacturer", name: "Manufacturer", type: "string" },
        { id: "model", name: "Model", type: "string" },
        { id: "engines", name: "Engines", type: "number" },
        { id: "seats", name: "Seats", type: "number" },
        { id: "engine", name: "Engine type", type: "string" },
      ],
    },
    {
      id: "weather",
      name: "Weather hours",
      glyph: "W",
      entityKey: "weather_key",
      fields: [
        { id: "weather_key", name: "Weather hour", type: "string" },
        { id: "origin", name: "Station", type: "string" },
        { id: "observed_hour", name: "Observed hour", type: "string" },
        { id: "temp", name: "Temperature (°F)", type: "number" },
        { id: "humid", name: "Humidity (%)", type: "number" },
        { id: "wind_speed", name: "Wind speed (mph)", type: "number" },
        { id: "precip", name: "Precipitation (in)", type: "number" },
        { id: "visib", name: "Visibility (mi)", type: "number" },
      ],
    },
  ],
  relationships: [
    {
      id: "flight-airline",
      name: "Flight airline",
      from: { sourceId: "flights", fieldId: "carrier" },
      to: { sourceId: "airlines", fieldId: "carrier" },
      cardinality: "many-to-one",
    },
    {
      id: "flight-plane",
      name: "Flight aircraft",
      from: { sourceId: "flights", fieldId: "tailnum" },
      to: { sourceId: "planes", fieldId: "tailnum" },
      cardinality: "many-to-one",
    },
    {
      id: "flight-weather",
      name: "Weather at the scheduled hour",
      from: { sourceId: "flights", fieldId: "weather_key" },
      to: { sourceId: "weather", fieldId: "weather_key" },
      cardinality: "many-to-one",
    },
  ],
  queries: [
    {
      id: "flights-in-context",
      name: "Flights with airline, aircraft, and weather",
      glyph: "✈",
      frameLabel: "flights",
      outputStepId: "visibility-band",
      steps: [
        { id: "flights", kind: "source", sourceId: "flights" },
        {
          id: "airline",
          kind: "lookup",
          inputStepId: "flights",
          relationshipId: "flight-airline",
          as: "airline",
        },
        {
          id: "plane",
          kind: "lookup",
          inputStepId: "airline",
          relationshipId: "flight-plane",
          as: "plane",
        },
        {
          id: "weather",
          kind: "lookup",
          inputStepId: "plane",
          relationshipId: "flight-weather",
          as: "weather",
        },
        {
          id: "dep-band",
          kind: "calculate",
          inputStepId: "weather",
          fieldId: "dep_band",
          label: "Departure status",
          expression:
            'if ["flights.dep_delay"] == null then "5 Not recorded" else if ["flights.dep_delay"] <= 0 then "1 On time or early" else if ["flights.dep_delay"] <= 15 then "2 Up to 15 min late" else if ["flights.dep_delay"] <= 60 then "3 15–60 min late" else "4 Over 60 min late"',
        },
        {
          id: "arr-band",
          kind: "calculate",
          inputStepId: "dep-band",
          fieldId: "arr_band",
          label: "Arrival status",
          expression:
            'if ["flights.arr_delay"] == null then "5 Not recorded" else if ["flights.arr_delay"] <= 0 then "1 On time or early" else if ["flights.arr_delay"] <= 15 then "2 Up to 15 min late" else if ["flights.arr_delay"] <= 60 then "3 15–60 min late" else "4 Over 60 min late"',
        },
        {
          id: "aircraft-age",
          kind: "calculate",
          inputStepId: "arr-band",
          fieldId: "aircraft_age",
          label: "Aircraft age (years)",
          expression:
            'if ["plane.plane_year"] == null then null else 2013 - ["plane.plane_year"]',
        },
        {
          id: "aircraft-status",
          kind: "calculate",
          inputStepId: "aircraft-age",
          fieldId: "aircraft_match",
          label: "Aircraft record",
          expression:
            'if ["flights.tailnum"] == null then "No tail number" else if ["plane.tailnum"] == null then "Not in aircraft table" else "Matched"',
        },
        {
          id: "weather-status",
          kind: "calculate",
          inputStepId: "aircraft-status",
          fieldId: "weather_match",
          label: "Weather record",
          expression:
            'if ["weather.weather_key"] == null then "No weather hour" else "Matched"',
        },
        {
          id: "visibility-band",
          kind: "calculate",
          inputStepId: "weather-status",
          fieldId: "visibility_band",
          label: "Visibility",
          expression:
            'if ["weather.visib"] == null then "6 No reading" else if ["weather.visib"] < 1 then "1 Under 1 mi" else if ["weather.visib"] < 3 then "2 1–3 mi" else if ["weather.visib"] < 6 then "3 3–6 mi" else if ["weather.visib"] < 10 then "4 6–10 mi" else "5 10 mi"',
        },
      ],
    },
  ],
};

const late = findings.lateDeparturesArrivingOnTime;
const worst = findings.worstDays[0]!;
const dayLabel = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const STATUS = `+ mapping[]= mapping.0[]="1 On time or early","#4b9688"
+ mapping.1[]="2 Up to 15 min late","#9fb7a0"
+ mapping.2[]="3 15–60 min late","#d6a35c"
+ mapping.3[]="4 Over 60 min late","#bd596a"
+ mapping.4[]="5 Not recorded","#9a9a9a" order=alphabetical`;

const text = `dashboard name="January flights from New York"
grid rowHeight=76 padding=0 markers=false

field flights.flight_date format=date
field flights.dep_delay precision=1
field flights.arr_delay precision=1

scale @arrival field=arr_band
${STATUS}
scale @departure field=dep_band
${STATUS}
scale @origins field=flights.origin
+ mapping[]= mapping.0[]=EWR,"#3479a8" mapping.1[]=JFK,"#c77a45"
+ mapping.2[]=LGA,"#9c6eac"
scale @makers field=plane.manufacturer
+ mapping[]= mapping.0[]=BOEING,"#3479a8" mapping.1[]=EMBRAER,"#c77a45"
+ mapping.2[]=AIRBUS,"#4b9688" mapping.3[]="AIRBUS INDUSTRIE","#7fb8ad"
+ mapping.4[]="BOMBARDIER INC","#9c6eac" overflow=other

group @delay-by-visibility name="Mean departure delay by visibility"
+ groupField=visibility_band measureField=flights.dep_delay aggregation=average

view "Delays carry through"
chart markdown @flights-summary at=0,0,4,5 title="All ${formatCount(audit.flights)} January flights"
+ content=${note("Most flights leave on time; late ones mostly stay late.", [
  `${percent(findings.bandCounts["On time or early"], audit.flights)} left on time or early. The median departure was ${Math.abs(findings.medianDepDelay)} minutes early.`,
  `Of ${formatCount(findings.overHourDepartures)} flights that left over an hour late, ${percent(findings.overHourStillOverHour, findings.overHourDepartures)} still arrived over an hour late.`,
  `${formatCount(late)} of ${formatCount(findings.lateDeparturesWithArrival)} late departures (${percent(late, findings.lateDeparturesWithArrival)}) made up the time and arrived on time.`,
  `${formatCount(findings.bandCounts["Not recorded"])} flights have no departure time; they stay in every count.`,
])}
chart sankey @flights-flow at=4,0,8,7 title="Departure status to arrival status"
+ stages[]=dep_band,arr_band nodeOrder=label flowColor=first
metric count @flights-count at=0,5,2,2 title="Flights"
metric avg=flights.dep_delay @flights-mean at=2,5,2,2 title="Mean departure delay"
bar flights.origin @flights-origin at=0,7,6,5 color=arr_band
+ seriesField=arr_band seriesLayout=percent
+ title="Arrival status at each origin" yAxisLabel="Share of flights (%)"
row airline.name @flights-airline at=6,7,6,5 title="Flights by airline"
+ xAxisLabel="" minRowHeight=14 maxRowHeight=26
table flights.flight_date,flights.flight,flights.origin,flights.dest,flights.dep_delay,flights.arr_delay,dep_band,arr_band,airline.name
+ @flights-rows at=0,12,12,5 title="Flights in this selection"

view "Departure predicts arrival"
scatter x=flights.dep_delay y=flights.arr_delay @flights-pair at=0,0,8,7
+ display=hexbin hexbin.columns=25 regression.method=linear summary=true
+ marginals.bins=20 xAxis.scaleType=symlog yAxis.scaleType=symlog
+ title="Arrival delay against departure delay"
+ xAxisLabel="Departure delay (min, symlog)" yAxisLabel="Arrival delay (min, symlog)"
chart markdown @flights-pair-note at=8,0,4,3 title="${formatCount(audit.pairedDelays)} flights with both delays"
+ content=${note("Departure delay sets most of the arrival delay.", [
  `Correlation across all January flights: r = ${findings.delayCorrelation}.`,
  `${formatCount(audit.flights - audit.pairedDelays)} flights lack one of the two delays and sit outside the fit.`,
])}
row airline.name @flights-pair-airline at=8,3,4,4 title="Filter by airline"
+ xAxisLabel="" minRowHeight=12 maxRowHeight=22
scatter x=flights.dep_delay y=flights.arr_delay @flights-pair-origin at=0,7,12,5
+ display=hexbin hexbin.columns=18 regression.method=linear
+ xAxis.scaleType=symlog yAxis.scaleType=symlog
+ facet.enabled=true facet.rowVariable=flights.origin facet.columnCount=3
+ title="The same fit at each origin" xAxisLabel="Departure delay (min, symlog)"
+ yAxisLabel="Arrival delay (min, symlog)"
chart ecdf field=flights.arr_delay @flights-pair-ecdf at=0,12,12,4 color=flights.origin
+ direction=below showQuantiles=true
+ title="Share of flights arriving within a delay" xAxisLabel="Arrival delay (min)"

view "Weather at the scheduled hour"
bar visibility_band @flights-visibility at=0,0,8,6 color=dep_band
+ seriesField=dep_band seriesLayout=percent categoryOrder=label
+ title="Departure status by visibility in the scheduled hour"
+ xAxisLabel="Visibility" yAxisLabel="Share of flights (%)"
chart markdown @flights-weather-note at=8,0,4,3 title="Each flight carries its hour's weather"
+ content=${note("Low visibility comes with longer delays.", [
  `Under 3 miles: ${formatCount(findings.lowVisibility.flights)} flights, mean departure delay ${findings.lowVisibility.meanDepDelay} min.`,
  `At 10 miles: ${formatCount(findings.clearVisibility.flights)} flights, ${findings.clearVisibility.meanDepDelay} min.`,
  `Busy hours count once per flight. ${audit.lookups.weather.unmatched} flights have no weather hour.`,
])}
row weather_match @flights-weather-match at=8,3,4,3 title="Weather lookup"
+ xAxisLabel="" minRowHeight=20 maxRowHeight=28
hist visibility_band @flights-visibility-mean at=0,6,6,5 aggregateId=delay-by-visibility
+ categoryOrder=label
+ title="Mean departure delay by visibility" xAxisLabel="Visibility"
+ yAxisLabel="Mean departure delay (min)"
row flights.origin @flights-weather-origin at=6,6,3,5 color=flights.origin
+ title="Filter by origin" xAxisLabel="" minRowHeight=20 maxRowHeight=32
scatter x=weather.wind_speed y=flights.dep_delay @flights-wind at=9,6,3,5
+ display=hexbin hexbin.columns=14 yAxis.scaleType=symlog
+ title="Wind and departure delay" xAxisLabel="Wind speed (mph)"
+ yAxisLabel="Departure delay (min)"
table flights.flight_date,flights.flight,flights.weather_key,weather.visib,weather.precip,weather.wind_speed,weather.temp,flights.dep_delay
+ @flights-weather-rows at=0,11,12,5 title="Flights with their weather hour"

view "When delays happened"
chart line @flights-daily at=0,0,8,6 xField=flights.flight_date color=flights.origin
+ time.interval=day time.weekStart=monday time.aggregation=average
+ time.measureField=flights.dep_delay time.splitField=flights.origin
+ time.missingPeriods=gap showLegend=true
+ title="Daily mean departure delay" xAxisLabel="Flight date"
+ yAxisLabel="Mean departure delay (min)"
chart markdown @flights-days-note at=8,0,4,4 title="Daily and hourly means"
+ content=${note(
  `${dayLabel(worst.date)} was the worst day; evenings run late.`,
  [
    `Worst days: ${findings.worstDays.map((item) => `${dayLabel(item.date)} (${item.mean} min)`).join(", ")}. Best: ${dayLabel(findings.bestDay.date)} (${findings.bestDay.mean} min).`,
    `Scheduled ${findings.morning.hours} h: ${findings.morning.meanDepDelay} min mean delay. ${findings.evening.hours} h: ${findings.evening.meanDepDelay} min.`,
    "Each mean uses only flights with a recorded departure.",
  ]
)}
metric count @flights-days-count at=8,4,2,2 title="Flights"
metric avg=flights.dep_delay @flights-days-mean at=10,4,2,2 title="Mean delay"
chart heatmap field=flights.sched_dep_hour @flights-hours at=0,6,6,6
+ columnField=flights.origin aggregation=average measureField=flights.dep_delay
+ sortBy=label
+ title="Mean departure delay by scheduled hour"
row dep_band @flights-days-band at=6,6,6,6 color=dep_band
+ title="Departure status" xAxisLabel="" minRowHeight=20 maxRowHeight=32
table flights.flight_date,flights.flight,flights.origin,flights.sched_dep_hour,flights.dep_delay,dep_band
+ @flights-days-rows at=0,12,12,5 title="Flights on the selected days"

view "Routes and aircraft"
chart parallel-coordinates @flights-fleet at=0,0,8,7 color=plane.manufacturer
+ axes[]= axes.0.field=flights.distance axes.0.inverted=false
+ axes.1.field=flights.air_time axes.1.inverted=false
+ axes.2.field=plane.seats axes.2.inverted=false
+ axes.3.field=aircraft_age axes.3.inverted=false
+ title="Route and aircraft profiles, one line per flight"
chart markdown @flights-fleet-note at=8,0,4,3 title="Aircraft come from a lookup"
+ content=${note("Not every tail number has an aircraft record.", [
  `${formatCount(audit.lookups.planes.matched)} flights match an aircraft.`,
  `${formatCount(audit.lookups.planes.unmatched)} carry a tail number the aircraft table lacks, mostly fleet numbers; ${audit.lookups.planes.missingTailnum} have none.`,
  "Profiles mix route and fleet; they do not rank aircraft.",
])}
row aircraft_match @flights-fleet-match at=8,3,4,4 title="Aircraft lookup"
+ xAxisLabel="" minRowHeight=20 maxRowHeight=28
chart ecdf field=flights.air_time @flights-fleet-airtime at=0,7,6,4
+ direction=below showQuantiles=true title="Share of flights within an air time"
+ xAxisLabel="Air time (min)"
row plane.manufacturer @flights-fleet-maker at=6,7,6,4 color=plane.manufacturer
+ title="Manufacturer" xAxisLabel="" minRowHeight=14 maxRowHeight=24
table flights.flight,flights.tailnum,plane.manufacturer,plane.model,plane.seats,aircraft_age,flights.dest,flights.distance,flights.air_time
+ @flights-fleet-rows at=0,11,12,5 title="Flights and their aircraft"
`;

export const flightsAnalysis: ExampleAnalysis = {
  project,
  tableFiles: {
    flights: "/datasets/flights/flights.csv",
    airlines: "/datasets/flights/airlines.csv",
    planes: "/datasets/flights/planes.csv",
    weather: "/datasets/flights/weather.csv",
  },
  text,
};
