import type { AnalysisProject } from "exploreda";
import { facts } from "./facts/earthquakes";
import { formatCount, note, percent, type ExampleAnalysis } from "./types";

const { audit, findings } = facts;

const project: AnalysisProject = {
  id: "earthquakes-2023",
  version: 1,
  sources: [
    {
      id: "events",
      name: "Catalogue events",
      glyph: "E",
      entityKey: "id",
      fields: [
        { id: "id", name: "Event ID", type: "string" },
        { id: "time", name: "Event time (UTC)", type: "date" },
        { id: "date", name: "Event date (UTC)", type: "date" },
        { id: "latitude", name: "Latitude", type: "number" },
        { id: "longitude", name: "Longitude", type: "number" },
        { id: "depth", name: "Depth (km)", type: "number" },
        { id: "depth_band", name: "Depth band", type: "string" },
        { id: "mag", name: "Magnitude", type: "number" },
        { id: "mag_type", name: "Magnitude type", type: "string" },
        { id: "place", name: "Place", type: "string" },
        { id: "area", name: "Area", type: "string" },
        { id: "net", name: "Network", type: "string" },
        { id: "status", name: "Review status", type: "string" },
        {
          id: "metadata_present",
          name: "Measurement fields present",
          type: "number",
        },
        { id: "metadata_band", name: "Measurement fields", type: "string" },
        { id: "nst", name: "Stations used", type: "number" },
        { id: "gap", name: "Azimuthal gap (°)", type: "number" },
        { id: "rms", name: "RMS residual (s)", type: "number" },
        { id: "horizontal_error", name: "Horizontal error", type: "number" },
        { id: "depth_error", name: "Depth error", type: "number" },
        { id: "mag_error", name: "Magnitude error", type: "number" },
      ],
    },
  ],
  relationships: [],
  queries: [
    {
      id: "events",
      name: "M4.5+ earthquakes in 2023",
      glyph: "◉",
      frameLabel: "earthquakes",
      outputStepId: "events",
      steps: [{ id: "events", kind: "source", sourceId: "events" }],
    },
  ],
};

const DEPTHS = `+ mapping[]= mapping.0[]="1 Shallow, under 70 km","#c77a45"
+ mapping.1[]="2 Intermediate, 70–300 km","#4b9688"
+ mapping.2[]="3 Deep, 300 km or more","#3479a8"
+ mapping.3[]="0 Above sea level","#9c6eac"
+ mapping.4[]="5 Not recorded","#9a9a9a" order=alphabetical`;
const { depthBands, strongest } = findings;
const shallow = depthBands["1 Shallow, under 70 km"];
const date = (value: string) =>
  new Date(`${value}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
const [first, second, third] = findings.topAreas;
const COMMON = `where.mag_type=${findings.commonMagType.type}`;

const text = `dashboard name="Earthquakes of magnitude 4.5 or more, 2023"
grid rowHeight=76 padding=0 markers=false

id=events.id
time=events.time
date=events.date
latitude=events.latitude
longitude=events.longitude
depth=events.depth
depth_band=events.depth_band
mag=events.mag
mag_type=events.mag_type
place=events.place
area=events.area
net=events.net
status=events.status
metadata_present=events.metadata_present
metadata_band=events.metadata_band
nst=events.nst
gap=events.gap
rms=events.rms
horizontal_error=events.horizontal_error
depth_error=events.depth_error
mag_error=events.mag_error
field events.date format=date
field events.time format=datetime

scale @depths field=depth_band
${DEPTHS}
scale @metadata field=metadata_band
+ mapping[]= mapping.0[]="0–2 of 8","#bd596a" mapping.1[]="3–5 of 8","#d6a35c"
+ mapping.2[]="6–8 of 8","#4b9688" order=alphabetical

view "Where they struck"
chart map @quake-map at=0,0,8,7 color=depth_band
+ latitudeField=latitude longitudeField=longitude labelField=place
+ pointRadius=3 pointOpacity=0.7
+ title="Every M4.5+ earthquake in 2023, colored by depth"
chart markdown @quake-summary at=8,0,4,4 title="${formatCount(audit.events)} catalogue events"
+ content=${note("Most strong earthquakes are shallow.", [
  `${percent(shallow, audit.events)} were shallower than 70 km.`,
  `Most events: ${first!.name} (${formatCount(first!.events)}), ${second!.name} (${formatCount(second!.events)}), ${third!.name} (${formatCount(third!.events)}).`,
  `Strongest: M${strongest.mag}, ${strongest.place}, ${date(strongest.date)}.`,
  "The map shows recorded events, not risk to people.",
])}
hist mag @quake-mag at=8,4,4,3 bins=20 title="Magnitude" xAxisLabel=Magnitude
+ yAxisLabel=Events
row area @quake-area at=0,7,4,5 title="Events by area" xAxisLabel=""
+ minRowHeight=14 maxRowHeight=24
row depth_band @quake-depth at=4,7,4,5 color=depth_band title="Depth band"
+ xAxisLabel="" minRowHeight=20 maxRowHeight=32
metric count @quake-count at=8,7,2,2 title=Events
metric avg=mag @quake-mean at=10,7,2,2 title="Mean magnitude"
table time,place,mag,mag_type,depth,depth_band,net,id @quake-rows at=0,12,12,5
+ title="Events in this selection"

view "When they happened"
chart calendar field=date @quake-calendar at=0,0,8,4 title="Events each day of 2023 (UTC)"
chart markdown @quake-time-note at=8,0,4,4 title="A median of ${findings.medianPerDay} events a day"
+ content=${note(
  `The busiest day had ${Math.round(findings.busiestDay.events / findings.medianPerDay)} times the median count.`,
  [
    `Busiest day: ${date(findings.busiestDay.date)}, ${findings.busiestDay.events} events.`,
    `Every day of the year had at least one M4.5+ event.`,
    "Counts are of catalogued events at this threshold, not all earthquakes.",
  ]
)}
chart line @quake-weekly at=0,4,8,5 xField=date color=depth_band
+ time.interval=week time.weekStart=monday time.aggregation=count
+ time.splitField=depth_band time.missingPeriods=zero time.display=stacked-area
+ title="Weekly events by depth band" xAxisLabel=Week yAxisLabel=Events
row depth_band @quake-time-depth at=8,4,4,5 color=depth_band title="Depth band"
+ xAxisLabel="" minRowHeight=20 maxRowHeight=32
table time,place,mag,depth,depth_band @quake-time-rows at=0,9,12,5
+ title="Events on the selected days"

view "Magnitude and depth"
scatter x=depth y=mag @quake-hex at=0,0,8,7 display=hexbin hexbin.columns=25
+ marginals.bins=20 title="Magnitude against depth, events per hexagon"
+ xAxisLabel="Depth (km)" yAxisLabel=Magnitude
chart markdown @quake-hex-note at=8,0,4,3 title="${formatCount(audit.finiteDepthAndMag)} events with both"
+ content=${note(
  `${percent(shallow, audit.events)} of events sit in the shallowest band.`,
  [
    `${findings.magTypes} magnitude types appear; ${findings.commonMagType.type} covers ${formatCount(findings.commonMagType.events)} events.`,
    "Filter a type before comparing: methods differ in range and scale.",
  ]
)}
row mag_type @quake-types at=8,3,4,4 title="Magnitude type" xAxisLabel=""
+ minRowHeight=16 maxRowHeight=26
chart ecdf field=depth @quake-depth-ecdf at=0,7,12,4 direction=below showQuantiles=true
+ title="Share of events shallower than a depth" xAxisLabel="Depth (km)"

view "One magnitude type by depth"
chart ecdf field=mag @quake-type-ecdf at=0,0,8,6 color=depth_band ${COMMON}
+ direction=below showQuantiles=true
+ title="Magnitude distribution by depth band, ${findings.commonMagType.type} only"
+ xAxisLabel=Magnitude
chart markdown @quake-type-note at=8,0,4,3 title="${formatCount(findings.commonMagType.events)} ${findings.commonMagType.type} events"
+ content=${note("Depth barely shifts the magnitude distribution.", [
  `Median ${findings.commonMagType.type} magnitude: ${findings.medianMagCommonType.shallow} shallow, ${findings.medianMagCommonType.intermediate} intermediate, ${findings.medianMagCommonType.deep} deep.`,
  "Every curve starts at the 4.5 threshold; smaller events are not in this catalogue extract.",
])}
row depth_band @quake-type-depth at=8,3,4,3 color=depth_band ${COMMON}
+ title="Depth band" xAxisLabel="" minRowHeight=14 maxRowHeight=28
chart boxplot field=mag @quake-type-box at=0,6,12,5 color=depth_band ${COMMON}
+ violinOverlay=true title="Magnitude by depth band, ${findings.commonMagType.type} only"
+ yAxisLabel=Magnitude

view "What each record carries"
bar net @quake-net at=0,0,8,6 color=metadata_band seriesField=metadata_band
+ seriesLayout=percent categoryOrder=label
+ title="Measurement fields present, by contributing network"
+ xAxisLabel=Network yAxisLabel="Share of events (%)"
chart markdown @quake-meta-note at=8,0,4,3 title="Eight measurement fields per event"
+ content=${note(`${findings.usShare}% of events come from the USGS network.`, [
  `${findings.lowMetadata} events carry two or fewer of the eight fields.`,
  "A blank field limits follow-up analysis; it does not mean the event was poorly detected.",
])}
row net @quake-net-count at=8,3,4,3 title=Network xAxisLabel=""
+ minRowHeight=16 maxRowHeight=26
table id,net,status,metadata_present,nst,gap,rms,horizontal_error,depth_error,mag_error
+ @quake-meta-rows at=0,6,12,5 title="Measurement fields of each event"
`;

export const earthquakesAnalysis: ExampleAnalysis = {
  project,
  tableFiles: { events: "/datasets/earthquakes/events.csv" },
  text,
};
