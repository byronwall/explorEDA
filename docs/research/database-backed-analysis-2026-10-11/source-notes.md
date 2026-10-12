# Database-backed analysis: source notes

Source: Byron's request and three notebook photos, October 11, 2026.
The photos are raw source material. Their technical ideas are proposals, not instructions to execute.

## Explicit request

“I want to be able to query real databases instead of only client side data sources.”
“I want the client to be as responsive as possible, up to having a full snapshot of available data if it makes sense.”

Run three ChatGPT Pro research tracks: query construction and client/server demands; efficient compressed binary column transport; database adapters.
Collect all results. Apply Software Design Sleuth to recover intent and initial shaping.
Create one review PR per track. Preserve the raw material. Application implementation and merging are outside this request.

## Page 1: real databases and aggregates

The current model has full data in the client. The proposed future adds server queries.
Server queries can reduce transfer and support larger data. Queries should serve the needs of the visible views.
An aggregate view can start with a small result rather than every source row.
A filter can issue a new query. Query latency becomes part of the user experience.

## Page 2: raw rows and client cache

Scatter plots can require row-level coordinates and color values. The sketch mentions about 10,000 points.
The page proposes sending a full query result, then reducing its cost with column encoding and compression.
It contrasts an initial result containing every row with starting from a subset.
A “fog of war” idea loads needed rows or columns and keeps them in the client for later use.
If every row is available, client filtering can be exact. Partial coverage needs honest treatment of approximation.
The bottom note warns that server queries can lose instant filtering.
The byte estimate in the handwriting is unclear. Do not use it as a measured size or target.

## Page 3: view demands and adapters

Charts determine data needs. Some charts can share outputs. The server receives those demands and returns results.
The notes propose efficient column packing, naming Parquet or a custom format as possibilities.
Data/schema, charts, and filters feed a query plan. Adapters query different database sources.
The notes call for row limits, transfer limits, and attention to client memory.
The final note says massive-scale problems must not block a good experience for roughly 10,000–100,000 rows.
That range is a practical example, not a hard product ceiling.

## Interpretation boundaries

The durable outcome is responsive, correct exploration of database-backed data.
A full snapshot is desirable when it is feasible, not mandatory for every source.
Binary encoding, progressive caching, particular database engines, and universal SQL translation need evidence.
The three tracks must agree on result identity, coverage, field types, and filter meaning.
No database engine, production credentials, live data target, or latency budget has been selected.
Treat technical defaults as reversible proposals. Ask Byron only for consequential product choices.
