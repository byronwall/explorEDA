import type { AnalysisProject } from "exploreda";
import { facts } from "./facts/worldbank";
import { formatCount, note, type ExampleAnalysis } from "./types";

const { audit, findings } = facts;

const yearKey = (
  id: string,
  name: string,
  fields: AnalysisProject["sources"][number]["fields"]
) => ({
  id,
  name,
  glyph: name[0]!,
  entityKey: "country_year",
  fields: [
    { id: "country_year", name: "Country-year", type: "string" as const },
    ...fields,
  ],
});

const lookupByYear = (id: string, name: string) => ({
  id: `year-${id}`,
  name,
  from: { sourceId: "years", fieldId: "country_year" },
  to: { sourceId: id, fieldId: "country_year" },
  cardinality: "many-to-one" as const,
});

const project: AnalysisProject = {
  id: "development-indicators",
  version: 1,
  sources: [
    yearKey("years", "Country-years", [
      { id: "country_code", name: "Country code", type: "string" },
      { id: "year", name: "Year", type: "number" },
      { id: "year_start", name: "Year (as a date)", type: "date" },
      { id: "population", name: "Population", type: "number" },
    ]),
    yearKey("gdp", "GDP per capita", [
      { id: "gdp_pc", name: "GDP per capita (PPP, 2021 $)", type: "number" },
      {
        id: "log10_gdp_pc",
        name: "log₁₀ GDP per capita (PPP, 2021 $)",
        type: "number",
      },
    ]),
    yearKey("life", "Life expectancy", [
      {
        id: "life_expectancy",
        name: "Life expectancy (years)",
        type: "number",
      },
    ]),
    yearKey("electricity", "Electricity access", [
      { id: "electricity_pct", name: "Electricity access (%)", type: "number" },
    ]),
    {
      id: "countries",
      name: "Countries",
      glyph: "C",
      entityKey: "country_code",
      fields: [
        { id: "country_code", name: "Country code", type: "string" },
        { id: "name", name: "Country", type: "string" },
        { id: "region", name: "Region", type: "string" },
        { id: "income", name: "Income group", type: "string" },
        { id: "capital", name: "Capital", type: "string" },
        { id: "latitude", name: "Capital latitude", type: "number" },
        { id: "longitude", name: "Capital longitude", type: "number" },
      ],
    },
    {
      id: "endpoints",
      name: "Access endpoints",
      glyph: "E",
      entityKey: "country_code",
      fields: [
        { id: "country_code", name: "Country code", type: "string" },
        { id: "electricity_2000", name: "Access in 2000 (%)", type: "number" },
        { id: "electricity_2023", name: "Access in 2023 (%)", type: "number" },
        { id: "access_gain_pp", name: "Access gain (points)", type: "number" },
        { id: "cohort", name: "Endpoint cohort", type: "string" },
      ],
    },
  ],
  relationships: [
    lookupByYear("gdp", "Same country-year GDP"),
    lookupByYear("life", "Same country-year life expectancy"),
    lookupByYear("electricity", "Same country-year electricity access"),
    {
      id: "year-country",
      name: "Country",
      from: { sourceId: "years", fieldId: "country_code" },
      to: { sourceId: "countries", fieldId: "country_code" },
      cardinality: "many-to-one",
    },
    {
      id: "year-endpoints",
      name: "Country's access endpoints",
      from: { sourceId: "years", fieldId: "country_code" },
      to: { sourceId: "endpoints", fieldId: "country_code" },
      cardinality: "many-to-one",
    },
  ],
  queries: [
    {
      id: "country-years",
      name: "Country-years with indicators",
      glyph: "◎",
      frameLabel: "country-years",
      outputStepId: "endpoint-year",
      steps: [
        { id: "years", kind: "source", sourceId: "years" },
        {
          id: "country",
          kind: "lookup",
          inputStepId: "years",
          relationshipId: "year-country",
          as: "country",
        },
        {
          id: "gdp",
          kind: "lookup",
          inputStepId: "country",
          relationshipId: "year-gdp",
          as: "gdp",
        },
        {
          id: "life",
          kind: "lookup",
          inputStepId: "gdp",
          relationshipId: "year-life",
          as: "life",
        },
        {
          id: "power",
          kind: "lookup",
          inputStepId: "life",
          relationshipId: "year-electricity",
          as: "power",
        },
        {
          id: "endpoint",
          kind: "lookup",
          inputStepId: "power",
          relationshipId: "year-endpoints",
          as: "endpoint",
        },
        {
          id: "without-power",
          kind: "calculate",
          inputStepId: "endpoint",
          fieldId: "without_electricity",
          label: "People without electricity",
          expression:
            'if ["years.population"] == null || ["power.electricity_pct"] == null then null else ["years.population"] * (1 - ["power.electricity_pct"] / 100)',
        },
        {
          id: "endpoint-year",
          kind: "calculate",
          inputStepId: "without-power",
          fieldId: "endpoint_year",
          label: "Endpoint year",
          expression:
            'if ["years.year"] == 2000 then "In 2000" else if ["years.year"] == 2023 then "In 2023" else null',
        },
      ],
    },
  ],
};

const REGIONS = `+ mapping[]= mapping.0[]="East Asia & Pacific","#3479a8"
+ mapping.1[]="Europe & Central Asia","#9c6eac"
+ mapping.2[]="Latin America & Caribbean","#4b9688"
+ mapping.3[]="Middle East, North Africa, Afghanistan & Pakistan","#c77a45"
+ mapping.4[]="North America","#6b7a8f"
+ mapping.5[]="South Asia","#d6a35c"
+ mapping.6[]="Sub-Saharan Africa","#bd596a"`;
const IN_2023 = 'where."years.year"=2023';
const COHORT = 'where."endpoint.cohort"="Both endpoints"';
const [first, second, third] = findings.withoutElectricity.topCountries;

const text = `dashboard name="Development indicators, 2000–2023"
grid rowHeight=76 padding=0 markers=false

field years.population format=number precision=0
field without_electricity format=number precision=0
field power.electricity_pct precision=1
field life.life_expectancy precision=1

scale @regions field=country.region
${REGIONS}
scale @six field=country.name
+ mapping[]= mapping.0[]=Brazil,"#4b9688" mapping.1[]=China,"#3479a8"
+ mapping.2[]=India,"#d6a35c" mapping.3[]=Nigeria,"#bd596a"
+ mapping.4[]="United States","#6b7a8f" mapping.5[]="South Africa","#9c6eac"
+ overflow=other

view "Income and longevity"
scatter x=gdp.log10_gdp_pc y=life.life_expectancy @wb-income at=0,0,8,7
+ size=years.population color=country.region regression.method=linear
+ regression.overall=true summary=true ${IN_2023}
+ title="Life expectancy against income, 2023 · bubble area is population"
+ xAxisLabel="log₁₀ GDP per capita, PPP, constant 2021 $" yAxisLabel="Life expectancy (years)"
chart markdown @wb-income-note at=8,0,4,3 title="${findings.incomeLongevity.countries} economies in 2023"
+ content=${note("Richer countries live longer.", [
  `Across economies, log income and life expectancy correlate at r = ${findings.incomeLongevity.r}.`,
  "Each country is one point in the fits; bubble size shows population, not weight.",
])}
row country.region @wb-region at=8,3,4,4 color=country.region ${IN_2023}
+ title="Filter by region" xAxisLabel="" minRowHeight=16 maxRowHeight=26
table country.name,country.region,country.income,years.population,gdp.gdp_pc,life.life_expectancy
+ @wb-income-rows at=0,7,12,5 ${IN_2023} title="Economies in 2023"

view "Electricity, 2000 and 2023"
chart ecdf field=power.electricity_pct @wb-access at=0,0,8,7 color=endpoint_year
+ direction=below showQuantiles=true ${COHORT} where.endpoint_year="In 2000","In 2023"
+ title="Electricity access in 2000 and 2023, the same ${audit.endpointCohort} economies"
+ xAxisLabel="Share of population with electricity (%)"
chart markdown @wb-access-note at=8,0,4,3 title="Matched economies at both endpoints"
+ content=${note("Most economies reached universal access.", [
  `Median access rose from ${findings.medianAccess.start}% to ${findings.medianAccess.end}%.`,
  `Economies at 99.5% or more: ${findings.universalAccess.start} in 2000, ${findings.universalAccess.end} in 2023.`,
  "Each economy counts once, whatever its population.",
])}
row country.region @wb-access-region at=8,3,4,4 color=country.region ${COHORT} where.endpoint_year="In 2023"
+ title="Filter by region" xAxisLabel="" minRowHeight=16 maxRowHeight=26
table country.name,country.region,endpoint.electricity_2000,endpoint.electricity_2023,endpoint.access_gain_pp
+ @wb-access-rows at=0,7,12,5 ${COHORT} where.endpoint_year="In 2023" title="Each economy's endpoints"

view "Different paths"
chart line @wb-paths at=0,0,12,6 xField=years.year_start color=country.name
+ where."years.country_code"=BRA,CHN,IND,NGA,USA,ZAF
+ time.interval=year time.weekStart=monday time.aggregation=average
+ time.measureField=life.life_expectancy time.splitField=country.name
+ time.missingPeriods=gap showLegend=true
+ title="Life expectancy each year, six large economies"
+ xAxisLabel=Year yAxisLabel="Life expectancy (years)"
chart heatmap field=country.region @wb-paths-heat at=0,6,8,6 columnField=years.year
+ aggregation=average measureField=life.life_expectancy sortBy=label maxCategories=24 showValues=false
+ title="Mean life expectancy by region and year (countries equally weighted)"
chart markdown @wb-paths-note at=8,6,4,3 title="Annual records, 2000–2023"
+ content=${note("Each economy took its own route.", [
  "Each point is one published year; a missing year leaves a gap.",
  `${formatCount(audit.baseRows)} country-years from ${audit.economies} economies; data vintage ${audit.vintage}.`,
])}
row country.income @wb-paths-income at=8,9,4,3
+ title="Filter by income group" xAxisLabel="" minRowHeight=16 maxRowHeight=24

view "Where people lack power"
chart map @wb-map at=0,0,8,7 ${IN_2023} color=country.region
+ latitudeField=country.latitude longitudeField=country.longitude
+ sizeField=without_electricity labelField=country.name pointRadius=30 pointOpacity=0.7
+ title="People without electricity in 2023, at each capital"
chart markdown @wb-map-note at=8,0,4,4 title="${findings.withoutElectricity.millions} million people without power"
+ content=${note(
  `${findings.withoutElectricity.topRegion.region} holds ${findings.withoutElectricity.topRegion.millions} million.`,
  [
    `Largest gaps: ${first!.name} (${first!.millions} M, ${first!.pct}% access), ${second!.name} (${second!.millions} M), ${third!.name} (${third!.millions} M).`,
    `Weighted by people, access is ${findings.withoutElectricity.weightedAccessPct}%; the plain mean of countries is ${findings.withoutElectricity.meanCountryAccessPct}%.`,
  ]
)}
group @without-by-region name="People without electricity by region"
+ groupField=country.region measureField=without_electricity aggregation=sum
hist country.region @wb-map-region at=8,4,4,5 aggregateId=without-by-region
+ ${IN_2023} color=country.region categoryOrder=label
+ title="People without electricity by region" yAxisLabel="People"
table country.name,country.region,years.population,power.electricity_pct,without_electricity
+ @wb-map-rows at=0,9,12,5 ${IN_2023} title="Economies in 2023"

view "Room to improve"
scatter x=endpoint.electricity_2000 y=endpoint.access_gain_pp @wb-gain at=0,0,8,7
+ color=country.region ${COHORT} ${IN_2023}
+ title="Access gain against access in 2000"
+ xAxisLabel="Access in 2000 (%)" yAxisLabel="Gain to 2023 (percentage points)"
chart markdown @wb-gain-note at=8,0,4,3 title="${audit.endpointCohort} economies with both endpoints"
+ content=${note("The biggest gains came from the lowest starts.", [
  `${findings.gains.lowStartCountries} economies started below 50%; their median gain was ${findings.gains.lowStartMedianGain} points.`,
  `Economies starting at 50% or more gained a median ${findings.gains.highStartMedianGain} points; most had little room left.`,
])}
chart boxplot field=endpoint.access_gain_pp @wb-gain-region at=8,3,4,4 color=country.region
+ ${COHORT} ${IN_2023} title="Gain by region" yAxisLabel="Points"
table country.name,country.region,endpoint.electricity_2000,endpoint.electricity_2023,endpoint.access_gain_pp
+ @wb-gain-rows at=0,7,12,5 ${COHORT} ${IN_2023} title="Economies and their gains"
`;

export const worldBankAnalysis: ExampleAnalysis = {
  project,
  tableFiles: {
    years: "/datasets/worldbank/country-years.csv",
    gdp: "/datasets/worldbank/gdp.csv",
    life: "/datasets/worldbank/life-expectancy.csv",
    electricity: "/datasets/worldbank/electricity.csv",
    countries: "/datasets/worldbank/countries.csv",
    endpoints: "/datasets/worldbank/endpoints.csv",
  },
  text,
};
