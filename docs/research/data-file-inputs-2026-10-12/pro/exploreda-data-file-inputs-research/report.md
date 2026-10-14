# Local data-file inputs for explorEDA

Research and shaping evidence • October 12, 2026 • America/Indiana/Indianapolis  
Repository: byronwall/explorEDA • baseline `c534378c052c9fbb2cb076d1df0d21eb0fa0965e`

## Executive recommendation

**GO for repository-grounded research. Keep the existing row-based React/TypeScript application and add a small demo-local reader dispatch, shared by initial import and Add source.** Start with a semantic-admission proof and TSV, follow with strict JSON Lines and bounded XLSX, and evaluate a flat single-file Parquet subset. Keep Arrow IPC/Feather V2 and Avro OCF conditional on demand and browser proofs. A general plugin system, universal Arrow model, or DuckDB-Wasm engine is disproportionate to this local-file scope.

The central constraint is what exploration and persistence can preserve. `datum` and `AnalysisSourceRow` accept scalar strings, numbers, booleans, null, and undefined. They do not accept arbitrary decoded values. Existing source inference, numeric/date interpretation, row copies, and saved-state paths impose further limits. **Decoding, admission, analysis, and restoration must agree before a format becomes a support promise.** [E10] [E11] [E12] [E13] [E15] [E16] [E18] [E25]

| Disposition | Recommended scope | Condition |
| --- | --- | --- |
| Keep/current | CSV and current raw object/array JSON; protect project and full-analysis restoration | Preserve documented compatibility; expose existing interpretation limits. |
| Add soon | TSV, then strict JSON Lines/NDJSON | One shared reader/admission route; complete data and truthful errors; no precision loss hidden by coercion. |
| Add soon, gated | XLSX; local Google Sheets XLSX/CSV/TSV export instructions | One explicitly selected sheet/rectangle/header; scalar stored results; no recalculation. |
| Evaluate first binary candidate | Flat, complete local Parquet | Schema checks precede lossy decoder conversion; only proven codecs/types ship. |
| Evaluate later | Arrow IPC file/saved stream, Feather V2, Avro OCF, ODS, XLSB, bounded gzip | Real demand plus dependency, fidelity, and deployment evidence. |
| Manual conversion | Legacy or semantically rich tables, statistical/scientific/spatial formats, schema-dependent messages | Producer exports a selected table with documented semantic choices. |
| Later integration / avoid | Database/lakehouse/service integration; executable serialization and managed caches | Outside this initiative; no automatic execution or cache interpretation. |

**Google Sheets has useful local inputs through downloaded exports.** A native hosted spreadsheet, a `.gsheet` pointer, and managed offline state are different artifacts. The proposed application accepts the exported workbook/table format; it never dereferences a document link or provides live synchronization. The detailed provider evidence and export tradeoffs appear below. [W25] [W26] [W27] [W28] [W29] [W30] [W31] [W32]

This package supplies evidence for Codex disposition and later intent/shaping work. It contains no application changes, dependency installation, implementation claim, repository commit, or review PR.

## 1. Access, evidence, and completion status

- **Selected-snapshot route:** read the attached `prompt(5).md` and `source-packet.md`. Verified the packet owner/repository/ref and all **36 selected files** against its manifest: **396,261 bytes**, with every byte count and SHA-256 matching. The selected packet is authoritative and is not a runnable checkout.
- **Supplemental exact-baseline route:** the connected GitHub reader independently corroborated `apps/demo/src/readDataFile.ts` at the stated commit and supplied three narrowly needed helper files: `lib/fieldSettings.ts`, `providers/lib/dataLayerState.ts`, and `components/SummaryTable/utils/dataTypeDetection.ts` under `packages/explorEDA/src/`. These complete the coercion and row-copy trace; they do not replace the packet. [E19] [E37] [E38] [E39]
- **Current public evidence:** primary specifications, official product documentation, and maintainer repositories were retrieved on **2026-10-12 America/Indiana/Indianapolis**, corresponding to **2026-10-13 UTC**. Mutable documentation, source-manifest versions, published releases, and executed compatibility are distinguished in the ledger. A README claim is evidence of intended support, never a passed browser test.
- **Evidence labels:** statements about the baseline are repository observations; specifications and package documentation are source facts; architecture, tiers, limits, and milestones are recommendations/inferences. Dependency packaging, local-export fidelity, and runtime behavior not exercised here are explicitly unknowns or proposed proofs.
- **Completion:** all four research priorities are answered. The remaining uncertainties are bounded implementation decisions, not missing repository access or an unanswered Google Sheets boundary.

The companion [sources.json](sources.json) has stable evidence IDs, exact URLs or paths/refs, supporting sections, retrieval dates, and limitations. Citations in this report resolve to linked references at the end. The [format catalog](format-catalog.csv) contains qualified commonality judgments, not adoption percentages. “High confidence” concerns the format classification or recommendation evidence; it does not certify browser behavior. [Recommendations](recommendations.json) record stable R IDs for later disposition, and the [proof plan](proof-plan.md) is an unrun implementation run sheet.

## 2. Repository findings that determine the design

### Current reader and restoration paths

| Observed path and symbol | Baseline behavior | Design implication |
| --- | --- | --- |
| `readDataFile.ts`: `isSupportedDataFile`, `readDataFile` | Lowercased extensions dispatch only CSV or JSON. | TSV capability in Papa does not make `.tsv` accepted. Keep one explicit supported-format list. [E19] |
| `csvParser.ts`: `parseCsvData` | Papa uses `header: true`, `skipEmptyLines: true`, `dynamicTyping: true`; rejects first parser error; no delimiter override. Result metadata is discarded. There is no Papa async `error` callback. | Separate tokenization from new-profile admission; retain header/dialect diagnostics; settle asynchronous file failures. [E20] |
| `jsonParser.ts`: `parseJsonData` and flattening | Object or array-of-objects input; nested object and indexed-array paths become field names; null becomes undefined. | Preserve legacy behavior as a named compatibility path. Never use it as the universal schema contract; collisions and prior JSON numeric loss need separate handling. [E21] |
| `CsvUpload.tsx`, `landing/PageFileDrop.tsx` | Each separately reads JSON to recognize `format: "exploreda-project"` before ordinary row parsing. | Consolidate guarded classification. Malformed reserved project envelopes must fail restoration rather than flatten into rows. [E22] [E27] |
| `LandingPage.tsx`: `handleAnalysisJson` | Full analysis is parsed/validated in a separate paste/restore path. Ordinary file input does not establish full-analysis-file restoration. | Recognize a full-analysis envelope and route to an explicit existing restore affordance or a clear unsupported-route message. Do not advertise new file restore without its own proof. [E23] |
| `SavedViewsWorkspace.tsx`: `addSourceFile` | Separate CSV-only parser and accept list; project addition or promotion from one table; saved tabs preserved through host logic. | The same admitted-table reader must reach Add source. State files are restoration inputs, not extra source rows. [E24] |

The current JSON marker access should be structurally guarded, including a null root. A raw object with a reserved state marker is ambiguous: a documented reserved-envelope rule and explicit raw-data override/repair path are preferable to silently guessing. Extension and MIME are hints; binary signatures and workbook structure must agree with the chosen supported format. Unhelpful MIME alone should not prevent a valid local file. No series of fallback decoders should keep trying until one accepts unrelated bytes.

### What the library can actually consume

- `ExplorEda` consumes row objects and optionally explicit `fieldNames`, including columns for an empty dataset. `ExplorEdaProject` consumes a map of complete source tables and maps evaluated rows into further row copies with internal `__ID`. The existing project worker is an **analysis-evaluation** worker; it is not an input decoder. Preserve these public embedding contracts. [E10] [E11] [E12]
- `sourceFromRows` samples the first **500 rows for both field inventory and type inference**. A field appearing only later can be missed. It chooses a unique key when available or generates a positional `row_number` field. Its collision search is also based on the sampled field inventory; a late same-named field can conflict. Full admission must establish all fields and check reserved names before this helper receives a new format. Retain the helper's source naming and project conversion role, but do not claim a positional key is a stable external identifier. [E16]
- `ExplorEdaProject` builds declared-type field settings only when saved/view settings exist; an early return otherwise skips that merge. Merely returning reader metadata does not enforce categorical or date semantics on an initial view. Every admitted field that needs an enforced interpretation must survive initial rendering, project evaluation, tabs, filters, and restoration. A small existing-settings/source-helper change may be necessary; its proof precedes format expansion. [E11] [E37]
- `valueParsing.ts` treats blank/whitespace strings as analytically missing, applies `Number()` to accepted numeric-looking text, and interprets supported unzoned dates as UTC with millisecond precision. `detectColumnType` can classify numeric strings as numbers. `applyFieldSettings` copies rows but converts values only when relevant settings are explicitly present; it does not indiscriminately rewrite every inferred numeric string. Nevertheless, raw string preservation alone does not prove that calculations or filters preserve an exact textual identifier. The same gate covers schema-declared text such as `"true"`, `"2026-10-12"`, `"NaN"`, and `"Infinity"`; boolean/date/numeric inference must not silently change intended text meaning. [E15] [E37] [E39]

### Persistence is part of admission

`projectFile.ts` has tagged encoding for undefined and nonfinite values and general Date handling, but its **project row validator rejects Date and other nonscalar cells**. The serializer's Date branch does not widen `AnalysisSourceRow`. By contrast, `savedViewsSession.ts: writeProjectTables` uses plain `JSON.stringify`, and JSON-based cloning appears in session/history handling. These routes need separate evidence. [E17] [E26] [E25]

Four controlled Node v24.19.0 assertions reproduced standard-language behavior: a `9007199254740993` JSON number became `9007199254740992`; undefined object members disappeared on ordinary JSON round-trip; NaN/infinities became null; bigint serialization threw; and duplicate JSON members overwrote earlier values. The undefined/nonfinite assertions are one combined check, for **four checks total**. These are language experiments, not application tests. [P10]

The implication is narrow and concrete: do not admit new values whose meaning is destroyed by the actual save/cache path. Either repair the smallest affected path and verify compatibility or reject the unsupported subtype. It is not necessary to design a general serialization layer to open TSV. Null/empty distinctions in raw data must also be separated from the library's documented analysis-level missing classification.

### Resident cost and saved layout

`DataLayerProvider` retains raw rows, applies settings into copies, initializes ID-bearing rows, constructs Crossfilter/calculation state, and caches column/calculation data. Project evaluation and provenance structures add other resident forms. CSV text or binary bytes, decoder columns, Wasm memory, row objects, caches, old/new datasets during staging, and synchronous saved-state strings may overlap. A columnar file does not turn this application into a zero-copy columnar engine. [E18] [E38] [E11]

The baseline creates summary plus a data table for appropriate fresh data; saved chart settings restore their existing layout. Initial import should carry an admitted source name and interpretation metadata instead of losing them at the row-only `handleCsvImport` callback. Add source must reuse `singleTableProject`/`addSourceFromRows` behavior so renamed fields, selection keys, tab IDs/names, and promotion remain coherent. It must also commit against current session state: a slow decoder should not overwrite tab edits captured before an `await`. [E06] [E16] [E18] [E23] [E24]

The adjacent database-adapter, query-contract, columnar-transport, and date/time intent documents are **proposals**. Their shared scalar and complete-table concerns are relevant; their server envelopes, remote query protocols, and performance adoption thresholds are not inherited requirements for a local file reader. Parquet input and Arrow transport remain separate decisions. [E31] [E32] [E33] [E34] [E35] [E36]

## 3. Format landscape and support evidence

### Representative tool support matrix

This is a primary-documentation sample, not a popularity ranking. “Built-in” means an exposed product/library reader or first-party connector; it does not imply every package artifact contains every backend. Browser support below is documented support, not an executed compatibility result.

| Tool or ecosystem | Documented file-oriented support | Dependency or scope distinction |
| --- | --- | --- |
| pandas | Public I/O table covers CSV, fixed-width, JSON, HTML/XML, workbooks, HDF5, Feather/Parquet/ORC, statistical files and pickle. [L01] | Workbook engines, PyTables, PyArrow, pyreadstat and PyIceberg are optional dependencies. The API table includes SQL/table-system methods as well as files. [L02] |
| Polars | Native reader APIs cover CSV, JSON/NDJSON, IPC/Feather v2, Parquet and Avro; workbook and lakehouse methods are also exposed. [L03] | Excel uses separately installed engines; Iceberg documents native/PyIceberg choices; Delta methods select a table/version. [L04] [L56] [L57] |
| DuckDB | SQL readers cover CSV, JSON and Parquet. [L05] | XLSX uses its Excel extension, which excludes XLS and may autoload. SQLite uses an extension; database attachment is different from a file scan. Desktop/current-engine docs do not prove Wasm parity. [L51] [L41] |
| R readr / haven | readr provides delimited, fixed-width and common/combined web-log readers; haven wraps ReadStat for Stata, SPSS and SAS. [L07] [L30] [L06] | Packages are installed into R. Statistical labels and special missing values have semantics that flat unannotated scalars do not retain. [L06] |
| Arrow / PyArrow | Dataset docs list Parquet, IPC/Feather, CSV and ORC, with partition/directory discovery. [L13] | A PyArrow/C++ Dataset capability is not evidence that Arrow JavaScript decodes every listed format. The JS IPC decision belongs in its own feasibility check. |
| Tableau | First-party connectors cover delimited text, XLS/XLSX, JSON, selected statistical files and spatial formats. [L08] [L53] [L54] [L09] [L55] | Host-specific restrictions matter. Statistical value labels are unsupported; geometry has a dedicated field; nested JSON projection includes aggregation handling. These are application semantics beyond decoding. [L09] [L55] [L54] |
| Power BI / Power Query | Connector index lists Text/CSV, Excel, JSON, XML, Parquet and Folder. [L10] | The matrix separates Excel, semantic-model and online availability. It also lists live services; that is not local format support. Google Sheets in this list is a connector, not proof of a portable Sheets file. [L10] |
| Perspective | Maintainer docs advertise Arrow, CSV and JSON with a browser Wasm analytics engine. [L11] | External-engine virtual servers are separate. This is a useful bounded-format precedent, not a reason to replace explorEDA’s analysis engine. |
| Observable Framework | Its DuckDB wrapper accepts CSV/TSV/JSON/Arrow/Parquet and can attach DuckDB database files. [L12] | Extensions and engine versions are product-specific. Its documented bigint-to-double and timestamp-to-Date defaults should not be copied into an exact-value admission policy. [L12] |

#### How commonality is qualified

The catalog’s familiarity terms are engineering judgments informed by these ecosystem documents. No adoption survey or market share was conducted. The repeated appearance of delimited tables, workbooks and analytical columnar interchange establishes broad interoperability routes, not measured demand among explorEDA users. “Established in a domain” describes a documented domain ecosystem; it does not mean the format belongs in the first release.

The catalog deliberately distinguishes three different questions:

1. Can a producer serialize the value?
2. Can a candidate reader decode it in the target browser?
3. Can explorEDA admit and analyze it without changing its meaning?

Positive evidence for one question does not answer the next. All browser feasibility text is a proposal or documented-library claim unless specifically labeled tested. No readers were run here.

### Boundaries exposed by the niche formats

#### Labels and object persistence

Statistical inputs can be rectangular yet semantically rich. Preserving a code as a number while losing its label, or collapsing a special missing category into ordinary null, changes interpretation. The correct conversion route records those choices. [L06]

RDS holds one R object, while workspace data can hold named objects. The file reader cannot assume either is a data frame. [L14] A trusted owner should extract the intended table in the source environment. This research does not recommend running arbitrary restoration code in a browser or during import.

#### Arrays and scientific containers

NetCDF variables and dimensions, Zarr chunked arrays and HDF5 datasets do not imply a single row axis. Domain projection must say which variables and slices are selected, how coordinates align, and what happens to units, missing markers and calendars. [L16] [L18] [L19] [L20] Direct support would require selection and domain semantics that are disproportionate to the present input initiative.

NPY provides one shaped typed array; NPZ packages multiple arrays. [L21] An archive of matrices does not establish a join, concatenation order or column naming scheme. MAT also needs variable selection, and v7.3 is a distinct HDF5-based route excluded by scipy.io.loadmat. [L23]

#### Spatial attributes are a narrower feature than spatial support

A properties-only GeoJSON/TopoJSON import may eventually be cheap, but it must clearly identify its projection. Geometry and topology cannot be silently dropped while advertising format-level fidelity. [L24] [L25] Shapefiles require companion handling; GeoPackage introduces a database/layer boundary; KML introduces hierarchical document semantics. [L26] [L27] [L28]

#### A data leaf is not a lakehouse snapshot

Iceberg uses metadata and manifests to describe snapshot files; Delta uses log/checkpoint state and can require deletion-vector filtering; Hudi chooses committed file slices and may merge logs with base data. [L42] [L43] [L44] Blindly reading all Parquet or Avro leaves is not a reliable export route. Ask the producing engine to export the selected logical table. This is a recommendation for user documentation, not a proposed integrated server converter.

#### Wrappers need their own limits

Gzip and zstd compress bytes. ZIP packages entries. None defines a row schema. [L45] [L47] [L48] A small future gzip wrapper can unwrap one allowed text format with declared expanded-byte and output-count budgets. Ordinary gzip does not provide the same random access as a Parquet file footer and independent row groups.

The current WHATWG CompressionFormat enum includes brotli, deflate, deflate-raw and gzip; it does not include ZIP or zstd. [L46] This is specification evidence, not a complete browser-version support matrix. Feature-detect and test actual targets. Avoid stacking full compressed bytes, expanded bytes, decoded columnar buffers and row objects without observing peak resident cost.

## 4. TSV, CSV compatibility, and strict JSON Lines

### TSV is a small feature with a real dialect decision

CSV has an informational RFC convention, while the IANA TSV registration describes a simpler fixed-width-in-fields tab-separated text model that prohibits embedded tabs. Spreadsheet-style quoted TSV is a broader dialect. The feature should say exactly which profile it accepts rather than imply one universal TSV grammar. [P06] [P07]

Papa already provides tab delimiters, quote/escape handling, BOM behavior, line-ending detection, header metadata, and worker/chunk hooks. The baseline chooses only some options and hides metadata. Current Papa documentation and inspected 5.7.0 source also show that dynamic typing can turn ISO-like text into `Date` and empty cells into null; safe-integer protection in Papa does not protect subsequent numeric inference. The demo declares `papaparse: ^5.5.2`, but the packet contains no lockfile: its exact installed version is unknown. The maintainer release page currently identifies 5.7.0; the inspected package is MIT with a UMD/browser build, not a verified native-ESM application integration. [P01] [P02] [P03] [P04] [E09] [E20]

**Proposed TSV profile:**

- Explicit delimiter `\t`; UTF-8; accept one initial UTF-8 BOM; reject unsupported encoding rather than silently replace invalid bytes. A UTF-16 export should receive conversion guidance until an explicit encoding option is proved.
- Quoted fields may contain tabs and newlines; doubled quotes escape a quote. Accept LF, CRLF, and CR record endings only after real fixture verification. Commas and semicolons remain ordinary content.
- The selected header row supplies nonempty, unique field names. Preserve original spelling; show whitespace or naming conflicts. Do not silently accept Papa's automatic duplicate-header renaming. Reject unequal field counts and unterminated quoting with record/column context.
- Preserve empty cells as empty strings at tokenization. Text tables have no intrinsic null token, type schema, or distinction between an absent trailing field and a well-formed empty field unless the dialect defines it. A missing required field is a structural error; `NULL`, `NA`, and whitespace are literal content unless a reviewed interpretation says otherwise. Fully empty records may be skipped only under the visible documented blank-record rule, with their count; partially empty records remain.
- Disable early dynamic conversion in the **new TSV profile**. Admit typed values only after lexical/header validation. Ordinary finite measurements may use the existing numeric/boolean rules after the selected interpretation is explicit; preserve numeric-looking identifiers as enforced categorical text or reject an unsafe interpretation. Never allow a Date object or rounded exact identifier to reach the scalar boundary.

CSV's existing dynamic behavior is a compatibility decision for Codex, not a silent global change in this research. Shared tokenization/error machinery can support both the legacy CSV profile and the new stricter profile. An explicit CSV delimiter option may follow; automatic delimiter guesses should be surfaced when ambiguous. TSV should never guess comma solely because a cell contains commas.

Direct Papa reuse is preferred to a new delimited parser. Add the asynchronous read-error callback and cancellation settlement, and bound errors/examples instead of presenting thousands of messages. Papa's worker hooks are useful capability evidence, but the current wrapper does not enable them. A blob-created worker can conflict with a production policy; a same-origin bundled worker is a separate build proof. No bundle-byte or speed advantage was measured. [P01] [P02] [P14]

### JSON Lines adds useful tables without inheriting legacy flattening

JSON Lines requires UTF-8, one valid JSON value per line, and no BOM; the broader format permits scalars, arrays, and null. NDJSON permits documented configurable blank-line handling. The proposed explorEDA profile is deliberately narrower: **one flat object per nonempty line**, LF/CRLF, an optional final terminator, no internal blank lines, and admitted scalar field values. Pretty multiline JSON belongs to the existing JSON route. [P05] [P08]

Keep an exact record index and byte/line context. A bad second line rejects the whole staged import, not just that row. Discover the union of field names over all records; missing fields remain missing and are tested through persistence. Reject nested objects/arrays unless a future explicit projection is designed. Preserve JSON null on decode; the legacy JSON parser's null-to-undefined behavior is not copied. A literal dot or bracket in a flat field name is not an instruction to create nested paths.

Native `JSON.parse` cannot enforce duplicate-member or numeric-lexeme policy after the information is lost. A lossless token parser is a credible small dependency for this profile. The maintainer's `lossless-json` repository documents duplicate-key rejection and custom numeric parsing; the observed package/changelog identify **4.3.1, 2026-07-31, MIT**, ESM/UMD and TypeScript. That is source/package evidence, not a verified pinned browser artifact. The library's convenience conversions can still discard numeric detail; do not use `valueOf` as the admission rule. [P09] [P10] [P11] [P12] [P13]

Evaluate that parser with strict duplicate rejection and original number lexemes retained until admission. A conventional finite JavaScript numeric column may accept values under an explicit double-precision interpretation and a tested round-trip/range rule. Fixed-scale decimals, excess significant digits, and exact integers outside the safe range must not silently become doubles. Retain them only through an explicit, demonstrably categorical text interpretation or reject. Parser wrapper objects/bigints never leave the decoder/admission stage. This is a bounded semantic gate, not a proposal to add arbitrary-precision arithmetic to explorEDA.

JSON Lines does not imply continuous ingestion. Read and validate the complete selected local file before publication. Streaming tokenization or chunked progress can control intermediate cost, while the analysis consumer still requires the complete admitted rows.

## 5. Parquet, Avro, Arrow IPC, and Feather

### Parquet

#### Format and scope facts

Parquet partitions logical rows into row groups, with a column chunk per column and encoding/compression pages within each chunk. The format can reference data outside the opened metadata file. An initial local-file feature should require that all selected data resides in the selected file; an external-file reference is a clear unsupported-dataset error. [B01][B02]

Dictionary encoding, run-length/bit packing, delta encodings and byte-stream split are decoding features separate from a compression codec. Nested values require interpreting definition/repetition levels, not merely reading one byte buffer per field. Testing only an uncompressed flat file proves little about dictionaries, nullable columns or nested rejection. [B04][B05]

The specification lists UNCOMPRESSED, SNAPPY, GZIP, LZO, BROTLI, ZSTD, LZ4_RAW and deprecated LZ4. Legacy LZ4 has different framing. GZIP pages can contain concatenated members, an interoperability corner worth testing. A reader's support promise must enumerate its actual selected codecs; “Parquet supported” is too vague. [B03]

Logical annotations distinguish signed/unsigned integers, decimals with scale/precision, date-only values and timestamps with unit and UTC-adjustment semantics. A date is a calendar date; an instant timestamp and a local wall-clock timestamp carry different meaning. Micro/nanosecond timestamps must not pass through a millisecond Date by accident. INT96 is a separate legacy case. Modern logical types, unknown annotations and geospatial/variant columns require an explicit admission rule even when a decoder returns some underlying bytes. [B06]

#### Direct reader: hyparquet

hyparquet accepts complete bytes or asynchronous slices and can materialize row objects. [B07] A local Blob-slice implementation could reuse that access model without adding remote URLs. This is a proposed optimization; the existing complete-row consumer still incurs materialization cost.

Observed package metadata is 1.31.3, MIT, ESM with a browser export condition and no runtime dependencies declared. Master resolved to 1eb9fe4607d9a53d68803b8ecfa1936720e47968 dated 2026-10-10. The changelog includes decoding and nested-alignment fixes. These are useful maintenance signals, not a guarantee that a particular npm tarball or Vite production build works. Pin and inspect the actual published artifact in the proof. [B08][B10][B44]

**Inspected conversion hazards:**

- DECIMAL values are converted to Number, including a bigint-to-Number step for byte-array decimals. Reject the schema before that path until an exact alternative is proved. A post hoc Number.isSafeInteger test cannot restore digits.
- Default micro/nanosecond timestamp parsers divide integers before constructing Date. Parser hooks can retain raw precision, but the selected reader-to-admission path still needs a proof for each temporal semantic.
- The timestamp conversion dispatcher reads unit but does not use isAdjustedToUTC to produce a distinct representation. Local timestamps must not silently become instants.
- The source explicitly throws for BSON and INTERVAL, despite broad README type claims. [B09]

Default byte-to-text and GeoParquet conversions need conservative overrides; base codecs are uncompressed/Snappy. Broader codec coverage is an add-on maintainer claim. [B07] Proposed admission rejects arbitrary binary and geometry before any convenience conversion.

hyparquet-compressors is itself ESM/MIT, observed manifest 1.1.2, with fzstd and hysnappy dependencies. Its README describes mixed JavaScript/Wasm; Snappy Wasm is embedded as base64 and instantiated synchronously. Adding the whole codec map changes the delivery/CSP surface even though base hyparquet is plain JavaScript. Check selected transitive licenses and exact codec initialization. Do not turn maintainer README size figures into an explorEDA bundle measurement. [B11][B12]

**Recommended initial promise:** one complete local file; flat named primitive fields; nullability; dictionaries and necessary page encodings; tested uncompressed/Snappy plus whichever Gzip/Zstd route meets deployment proof. Reject decimal, unsupported temporal precision/semantics, binary, nested, unknown semantic annotations, external-column references and encryption before admission. This is a suggested starting subset, not a claim the library cannot decode other values. If a common real producer's file fails the subset, use that evidence to decide expansion, reader replacement or manual conversion.

#### Alternative: parquet-wasm

The v0.9.0 docs expose a direct decoder backed by Rust Arrow/Parquet. Its synchronous API takes complete bytes; ParquetFile.fromFile accepts local Blob/File and exposes schema, metadata, selected row groups/columns, offset/limit and batch streaming. ESM requires explicit Wasm initialization; a bundler entry has separate setup. Objects occupy Wasm memory and have documented free/ownership rules. IPC export to Arrow JS and final row objects can create additional resident forms. [B13][B15]

The v0.9.0 release was published 2026-09-25. Its Cargo manifest uses MIT OR Apache-2.0 and default reader/writer/async features. Its “all_compressions” feature expands to Brotli/Gzip/Snappy/Zstd/Lz4 feature flags, **not evidence for every legal codec**; LZO and legacy framing must be checked separately. Do not copy a generic “all codecs” promise. A custom read-only build may shrink scope, but maintaining a custom Rust build is a real personal-maintainer cost. [B14][B16]

ParquetFile.fromFile warns against a multithreaded environment because of the underlying Blob handle. A single dedicated JavaScript worker is not automatically equivalent to threaded Wasm; the chosen placement must be proved. [B15]

**Selection rule:** start the Parquet proof with hyparquet and reject decimal/temporal conversions early. Compare parquet-wasm only if real producer fidelity or exact-value access fails the direct path. Do not introduce Arrow tables, Wasm ownership and its optional packages solely because columnar input sounds more efficient; the existing consumer still needs resident rows.

### Avro

#### Precisely define the local input

Avro OCF embeds a writer schema and block framing. Its required codecs are null/raw deflate; optional bzip2, Snappy, xz and Zstandard need separate support. Snappy adds CRC32. Types include 64-bit longs, unions, collections and logical annotations. Raw and single-object encodings require external schema knowledge. [B17]

**Admission recommendation:** OCF only, with an embedded top-level record schema and a bounded codec list. A schema file alone, a raw datum or a fingerprinted Kafka-style message is not a standalone table import. Reject those with an “export an OCF or convert locally” diagnostic. Do not add schema registries, user-provided JavaScript logical-type handlers, remote resolution or API calls.

Unions deserve more than null handling. A nullable scalar union can fit a scalar column. Multiple competing numeric branches or record/map branches can require retaining branch identity. Records nested in fields, arrays and maps cannot be made analyzable by blindly applying the existing JSON flattener. An explicit extraction/conversion feature can come later.

#### Reader status and browser reality

avsc is a credible JavaScript research candidate, with intended browser distributions and an OCF Blob decoder. Its inspected package is MIT-licensed, CommonJS with browser shims, and its Blob path uses FileReader and Node-style stream interfaces. Browserify-era documentation is not proof of modern Vite/ESM delivery; required shims and the exact browser entry need a small production build. [B19][B20][B24]

Its API supplies BlockDecoder codec overrides and a parseHook for writer-schema options. Default codec docs list null/deflate. The Snappy example uses Node dependencies and validates the Avro checksum; it must not be pasted into a browser adapter. Wrapped unions preserve branch identity, whereas convenience unwrapped values cannot distinguish every union. [B21]

avsc documents custom logical-type/long handlers and default overflow rejection for large longs. That is better than silent rounding, but unknown logical annotations must not be treated as ordinary numbers merely because the physical long decodes. Implement only built-in, reviewed conversions at the admission boundary; reject decimals or dates whose representation would lose source meaning. [B22]

A concrete CSP risk exists: the inspected RecordType constructor and reader generation use new Function. W3C CSP distinguishes permission for JavaScript string compilation from permission for Wasm. Therefore, moving code into a worker or adding Wasm permission does not by itself fix a no-eval policy. The proof should fail cleanly under the actual host policy; broadening policy just to ship Avro is not the recommended design. [B23][B38]

Maintenance evidence is mixed: inspected master commit 91d653f72906102448a059cb81692177bb678f52 is dated 2025-04-10; its manifest is 6.0.0-rc.1. A stable published artifact and support status remain unverified by this research; the source manifest is not an npm dist-tag verification. This warrants evaluate status, not an assertion of abandonment. [B19][B25]

The official Apache avro-js 1.12.2 release provides another maintained candidate and announced JavaScript dependency updates. Do not attribute Java/Python allocation fixes in that release to avsc. Current Apache avro-js source is Apache-2.0-licensed and has a CommonJS/browser mapping; its browser entry exposes parsing/types/validators but no exposed OCF decoder. Its development manifest is 1.13.0-SNAPSHOT, not the published version. Official provenance alone does not prove a convenient browser OCF route. [B18][B42][B43]

**Decision:** keep Avro OCF at evaluate until a verified stable package, acceptable browser build, codec route, exact scalar handling and CSP compatibility pass. If this needs a custom container parser, many shims or weakening CSP, manual Parquet/CSV conversion is the smaller product.

### Arrow IPC and Feather

#### File variants and semantic boundary

Arrow IPC file is seekable; stream framing is sequential, with distinct dictionary rules. Body compression uses LZ4 frame or Zstd, and extension metadata may carry additional meaning. [B26] The proposed feature accepts saved local artifacts only and does not authorize a streaming service.

Feather V2 is the Arrow IPC file format and can be compressed. Feather V1 is a distinct older, restricted, uncompressed format. Current PyArrow documentation deprecates V1 read/write from Arrow 25.0.0. Support for IPC must not be described as support for all .feather files. Use byte-level format recognition and clearly direct V1 users to rewrite as V2/Parquet. [B27]

#### JavaScript route

Current Arrow JS documentation and release list show 21.2.0, TypeScript sources, ESM/CommonJS builds, modern-browser targets and Apache-2.0 licensing. tableFromIPC is a plausible byte-to-table entry. Browser support is documented, not executed here. [B28][B29]

Older claims that Arrow JS cannot read compressed IPC are outdated for this observed version: source has a compression registry and reader dispatch for compressed record and dictionary batches. The registry starts empty; an application must supply the codec, and missing decoders produce errors. Do not promise that a default PyArrow Feather export opens merely because uncompressed IPC opens. Select and test LZ4-frame and Zstd decoder packages separately. [B30][B31]

Schema-aware conversion is still essential. The inspected getter code treats 64-bit integers, decimal values, date-only and timestamps differently; timestamp accessors produce millisecond-based values. A plain table iteration must not silently erase temporal resolution, timezone metadata, dictionary semantics or decimal scale. Retaining Arrow columns internally does not make bigint/decimal/collection values valid explorEDA scalar cells. [B32]

**Recommendation:** evaluate flat IPC file and saved IPC stream together, with Feather V2 named as the file alias only. Uncompressed fixtures can establish the base route, but compressed V2 must pass before claiming useful generic Feather support. Keep V1 as manual conversion. Reuse an Arrow decoder only if independently needed by this feature or a selected Parquet route; do not impose a universal Arrow intermediate model.

### Direct readers versus DuckDB-Wasm

DuckDB-Wasm can register local files/byte buffers and read Parquet with SQL. It also uses Arrow as a principal exchange type, and its current import guide cautions that Arrow major versions must match its dependency. This is credible capability evidence, not a reason to make SQL or a database mandatory for a local-file opener. [B34]

Deployment entails a library, JavaScript workers, matching Wasm modules and any loaded extensions. Its threaded coi variant requires cross-origin isolation; single-thread variants avoid that prerequisite. Optional extension availability must be checked for Wasm separately from desktop DuckDB. [B35]

The package source supplies browser ESM/CommonJS exports, Wasm/worker assets and an Arrow ^17 dependency, under MIT. Version evidence is not reconciled: current docs label client 1.5.6; retrieved GitHub latest release was v1.33.0 dated 2025-12-16; checked source manifest says 1.11.0. Treat the actual published artifact and embedded engine version as a future proof, not a current verified pin. [B33][B36][B37]

**Reasoned rejection for this initiative:** an engine adds query lifecycle, virtual filesystem names, resources, Arrow conversion, optional extensions and a second type system. It becomes justified if a later requirement keeps filtering/projection/aggregation inside the engine so full rows need not be materialized. Simply converting every file to rows preserves most existing memory cost while paying engine startup and integration cost.

## 6. Workbooks and Google Sheets local exports

### What XLSX actually contains

XLSX is a package of related document parts, with individual worksheet grids and potentially Excel tables, charts, pivot tables, and caches. A worksheet and a named Excel table are different boundaries. A saved workbook can contain multiple unrelated data regions, presentation rows, formulas, and stored values. The application's source boundary should be an explicitly chosen rectangular table region, with a documented header row. [W01] [W02]

A table-selection UI would be useful only if the chosen reader reliably exposes table definitions. SheetJS CE's checked public data model covers worksheets, A1 ranges, and defined names; it does not establish complete named Excel-table discovery. Do not promise a table picker on that evidence. First use sheet + bounded A1 range + header row; named-table discovery can become a separate proof. A defined name can be scoped or relative, and must not be evaluated as a formula or assumed to identify one simple rectangle. [W20]

### Bounded workbook interpretation

All policies below are proposals. Workbook structure informs them; the application must enforce them.

1. **Identify the input before decoding.** Allow an advertised subtype only after extension/content agreement. ZIP magic alone cannot distinguish XLSX, XLSB, ODS, or an arbitrary archive. Check the recognized workbook package structure. Do not inherit SheetJS's permissive “unknown content can be text” fallback as admission.
2. **Discover choices.** Present sheet name, visibility, and a preview of the chosen region. Default suggestion: first visible nonempty worksheet, never silently “first sheet.” Expose the actual selected sheet in the import confirmation. A chart-only sheet is not a table source.
3. **Require one region.** Suggest the meaningful used range, allow an explicit bounded A1 region, and distinguish actual populated cells from a formatting-inflated/self-reported range. Reject an excessive rectangle before filling millions of blank cells. Do not claim metadata discovery or sheetRows avoids all container decompression.
4. **Choose a header.** A preview may suggest a first row, but titles and multirow headers require a selection. Empty or duplicate labels cannot silently become new names. Require user repair or an explicit reviewed mapping; preserve original labels/coordinates in the import diagnostics. Treat no-header mode with positional field names as an explicit option, not an automatic fallback.
5. **Handle blanks deliberately.** Keep missing cells distinct from literal empty strings during decoding. Preserve row positions in diagnostics. For an explicitly selected rectangle, retain fully empty interior rows by default and show their count; an explicit later drop-empty-rows option must disclose the changed count. Do not silently remove partially blank rows.
6. **Handle merged cells deliberately.** Reject a selected region intersecting merged headers or merged data by default, with the offending ranges. Let the user choose an unmerged region or manually convert. Do not fill down or propagate the top-left value: that fabricates repeated observations. Covered cells may hold data, so blindly keeping the top-left is also not a universal preservation policy. [W14]
7. **Handle visibility deliberately.** Mark hidden/very-hidden sheets and require explicit selection of them. Within a selected region, include hidden rows/columns by default and disclose the count; a future visible-only option must be explicit. Imported analysis filters are not Excel filter state. Parse required row metadata and prove filtered and manually hidden cases independently. [W15] [W16]
8. **Admit stored scalar values.** Ordinary text/number/boolean cells are candidates. Spreadsheet error cells in the selected table are not missing values or numeric error codes for analysis: reject by cell address unless the user chooses a separately documented conversion. Rich text can become its plain text only through an explicit extraction rule; hyperlinks remain inert displayed text or underlying scalar, with no link following. Preserve raw numeric values; presentation formats such as percentages/currency are metadata, not extra numeric precision. [W12]
9. **Use formula caches only.** Import a cached scalar result with a workbook-level warning that results were not recalculated and may be stale. An absent cache is a fatal error for the selected region, not blank/zero/formula text. Ask for a value-only export or a recalculated and saved workbook from the producer. Do not compute formulas, refresh links, load add-ins, or execute VBA/Apps Script. An external-reference formula follows the same cache-only rule; no remote resource is fetched. [W03] [W17]
10. **Reject encrypted input.** Request an unencrypted local export prepared by the user. Do not ask for a workbook password, execute macros, or bypass encryption. Worksheet editing protection is distinct from file encryption and does not itself make readable stored values unusable.
11. **Publish atomically.** Build and validate the chosen source off to the side. Only after complete admission should the source enter initial exploration or Add source. Cancellation, failure, and preview never replace existing rows or saved layouts.

Reader facts supporting these choices: SheetJS exposes byte-oriented read, metadata-only workbook discovery, selected-sheet parsing, optional dense storage, self-reported ranges, and error-control options. Its defaults can suppress worksheet parse errors; implementation should use strict failure handling for the selected source. Browser readFile is unsupported. CE supports only limited legacy XLS encryption, so generic password support is not a credible first-release promise. These options require real-file proof. [W10]

Using sheet_to_json with defaults is insufficient: it can rename duplicate headers, skip blanks, choose raw versus display values, and omit null/undefined entries without field validation. Traverse original cell records or use arrays while retaining type/address metadata until admission, then make rows. TypeScript generics on the helper do not validate runtime values. [W13]

### Dates, numeric fidelity, and the repository's actual boundary

Excel serial dates use a workbook-wide epoch selection. The same date's serial differs by 1,462 between the 1900 and 1904 systems. Verify the flag, not a filename or producer guess. Include 1900 serial 60 (the fictitious leap day) as an explicit rejection/conversion case. [W04] [W11] [W18]

Date-only, local civil date-time, time-only, elapsed duration, and an absolute timestamp are distinct meanings. Number formats can suggest an intended display but do not supply a trustworthy timezone. Neither current computer timezone nor an unconditional toISOString() is an honest default for every worksheet value. [W18]

Repository observations from the supplied baseline:

- packages/explorEDA/src/types/ChartTypes.ts: datum is string | number | boolean | null | undefined. Date objects, workbook cell objects, arrays, and error values are not that declared scalar contract.
- packages/explorEDA/src/lib/valueParsing.ts: parseDateText reads timezone-free supported text as UTC; timeOfDay rounds fractional seconds to milliseconds. timestampOf accepts Date through its own wider signature, but that does not change the public datum type.
- The same file's parseNumber applies Number to numeric-looking strings. Therefore changing exact integers/decimals into text does not alone prove safe categorical preservation; downstream inference can make them numeric again.
- isMissingValue treats blank/whitespace-only strings as missing for analysis, even if the decoder can distinguish an empty string from absent cell.
- docs/intent/date-time-handling/intent-brief.md is a draft preserving existing behavior pending a coherent date rework; it is not an implemented civil-time type contract.

Proposed admission:

- Admit plain finite doubles while disclosing that producer rounding cannot be reversed. Reject unsupported exact-integer/decimal semantics unless a field can be explicitly kept as text throughout inference, filters, and persistence; do not coerce an arbitrary integer to Number.
- Canonical date-only strings can be considered after a proof of epoch conversion, invalid-date rejection, filter bounds, and save/restore. This is an explicit conversion from workbook serial/format semantics, not raw-value preservation.
- Preserve timezone-free date-time text only if it can remain explicitly categorical, or require a reviewed interpretation before it participates in date analysis. If neither can be guaranteed by the existing consumers, reject that subtype. Avoid introducing a universal timestamp model here.
- Keep raw serial numbers as numeric measurements only when the user explicitly chooses that conversion and the result is labeled as such.
- Reject time-only, duration, or precision beyond the established analysis capability until there is a defined conversion. Allow data files to decode yet fail semantic admission with cell/field diagnostics.

### Browser reader comparison

| Choice | Evidence and benefit | Material limits / required proof |
| --- | --- | --- |
| SheetJS CE 0.20.3 | Official docs identify 0.20.3; Apache-2.0. Official CDN tarball supports pnpm, ESM, and dynamic wrapper loading. Full build covers workbook variants; a mini build drops some legacy/binary formats. [W06] [W07] [W09] | Do not install stale npm xlsx 0.18.5 by accident. Pin artifact integrity and license notices. Source repository maintenance in 2026 does not mean every fix reached the 0.20.3 distribution. [W08] Test actual Vite build, browser content handling, needed variants, and resident cost. |
| ExcelJS 4.4.0 | GitHub latest release is 4.4.0, published 2023-10-19; MIT. It has XLSX buffer loading, typed workbook access, table concepts, and stored formula results. [W22] [W23] [W24] | Browser build uses document workbooks only; Node streaming APIs do not carry over. Package uses CommonJS main plus browser bundle, not a checked native ESM entry. Vite/browser interop and worker use are proofs. Read XLSX/CSV scope does not establish XLS/XLSB/ODS support. |

Both checked routes are JavaScript browser routes without a documented requirement for a Wasm engine. A worker is an optional execution placement, not a different format model. SheetJS supplies worker examples. A production proof should bundle a same-origin worker and parser asset, then run under the application's strict CSP without adding unsafe-eval, external CDN fetch, or cross-origin-isolation requirements by assumption. Record any actual exception before choosing a dependency. [W19] [W22] [W23]

Neither library earns “lightweight” through name alone. Measure incremental compressed app chunks, parser initialization, bytes decoding, row conversion, main-thread responsiveness, transfer/clone cost, and peak memory. Do not quote guessed package sizes. Lazy-load only after workbook detection; a CSV-only route should not pull the workbook reader. The already resident rows, indexes, filters, and saved data can dominate decoder cost.

Do not add DuckDB-Wasm solely to read XLSX. A direct workbook decoder offers the needed cell semantics without adopting a query engine. An engine becomes justified only by a separately proven workload, and still would not supply a product policy for formulas, headers, dates, or sheet selection.

### Google Sheets: precise local-file boundary

| Artifact | Contains independently useful local table data? | Proposed handling |
| --- | --- | --- |
| Native Google Workspace spreadsheet | The provider treats it as a native document distinct from downloadable binary/text blobs. Export is the route to another file format. [W29] | No native reader. |
| .gsheet desktop pointer / shortcut-like file | Historical Chromium primary code labels .gsheet as hosted spreadsheet metadata and writes hosted-document pointers with URL/resource_id, not cells. Current Drive help says Sheets items open in the web browser. [W30] [W31] [W32] | Reject with “Open in Sheets and download XLSX, CSV, or TSV.” Do not dereference a URL or treat its JSON keys as a data row. |
| Managed offline state | Google documents browser/account/profile/extension-managed offline access and site data, not a portable import file. Data can exist locally while remaining managed application state. [W28] | No cache scraping, reverse engineering, or portability promise. |
| XLSX or ODS export | A downloaded workbook is a local data-bearing artifact, retaining workbook structure within the target format's capabilities. [W25] [W26] [W33] | XLSX candidate reader; ODS gated separately. Select sheets/ranges locally. |
| CSV or TSV export | A standalone text table, one worksheet at a time. Official manual TSV help explicitly identifies the current sheet. [W27] | Existing CSV path or proposed TSV path; verify headers, text/date formatting, and selected tab. |
| PDF or zipped HTML export | Provider-listed presentation/export artifacts, not the preferred structured dataset boundary. [W26] | Manual conversion / not a first-release data reader. |

Important evidence distinction: Google's API export-format matrix labels CSV and TSV “first-sheet only.” That is evidence for the service API context, not a reason to claim the manual File > Download UI always exports the first tab. Manual TSV documentation says current sheet. For CSV, treat the exact current-tab menu behavior as a small producer-fixture check; the single-table limitation and manual-local export path are already resolved. Reading export documentation is not an API proposal.

The official instructions use File > Download and a chosen file type. The independent artifact is a snapshot at export time; it does not sync later edits, carry document permissions/history as application behavior, or recreate Apps Script execution. [W25] [W29]

Fidelity recommendation: use XLSX when multiple sheet choices or typed cells matter; use CSV/TSV when one already rectangular table is sufficient and textual value interpretation is understood. Workbook export may translate formulas, cached values, date formats, and product-specific features; do not claim Google and Excel semantics are perfectly equivalent. Recalculation/fidelity is a fixture question. Preserve the user's original export as the provenance artifact during future proof.

## 7. Smallest useful reader boundary

### Compare the three credible options

| Option | Benefit and cost | Decision / next justification |
| --- | --- | --- |
| Direct demo dispatch around `readDataFile.ts` | Small internal functions, existing local File UI, explicit switches, easy lazy imports; interpretation can be tested at the actual host boundary. | **Choose now.** Share admission and result handling across initial import and Add source. |
| Narrow reusable module / optional `exploreda/inputs` entry | Reuses byte decoders and policies in another embedding host; creates a public API/versioning and bundle-isolation obligation. | Extract only when a real second host needs this same behavior. The entry is a proposal; it does not exist in the baseline. |
| General engine / plugin framework | Useful for local SQL, repeated projection/filtering without full row materialization, or many proven independent extensions; adds engine/worker/resource/type lifecycles. | Defer. Reconsider only for a measured workload or product requirement that uses those capabilities. |

The library already exports separate core/analysis/chart entry points, so an optional entry is structurally plausible later. That is not a reason to add it preemptively or import every decoder through the root package. Keep the existing React/TypeScript/pnpm stack. [E03] [E04] [E08]

### Proposed TypeScript sketch, not implemented code

The useful public-to-the-demo result is **one admitted source table**. Workbook inspection is a separate small helper because a user must choose before the final read. The decoder can keep richer private schema/cell representations until admission; there is no need for a universal serialized intermediate model.

```ts
// Proposal for demo-local types. Import existing scalar/field types by the
// repository's supported entry when implemented; do not widen the row type.
type LocalFormat = "csv" | "tsv" | "json" | "jsonl" | "xlsx" | "parquet";

type ImportOptions = {
  format?: LocalFormat;                 // explicit override, still validated
  delimiter?: string;                    // CSV only; TSV is always a tab
  fieldTypes?: Record<string, "string" | "number" | "boolean" | "date">;
  // Explicit reviewed interpretation; admission still rejects unsafe conversions.
  workbook?: { sheet: string; range: string; headerRow: number };
  // range includes header; headerRow is a one-based worksheet row coordinate.
  signal?: AbortSignal;
};

type ImportedField = {
  name: string;
  type?: FieldDefinition["type"];        // established library vocabulary
  sourceType?: string;                   // diagnostic provenance, not authority
  nullable?: boolean;
};

type ImportIssue = {
  code: string;
  message: string;
  location?: { record?: number; field?: string; sheet?: string; cell?: string };
};

type ImportedTable = {
  sourceName: string;
  rows: AnalysisSourceRow[];              // fully decoded AND admitted
  fields: ImportedField[];               // complete field inventory
  warnings: ImportIssue[];                // bounded, with aggregate counts
};

declare function readDataFile(
  file: File, options?: ImportOptions
): Promise<ImportedTable>;                // fatal errors reject; no partial table

declare function inspectWorkbook(file: File, signal?: AbortSignal): Promise<{
  sheets: Array<{ name: string; hidden: boolean; suggestedRange?: string }>;
}>;
```

Only implemented/promoted formats belong in the actual union or accept list. Arrow/Avro options would be added only with their proofs. The sketch intentionally omits a registry, plugin negotiation, server snapshot IDs, remote endpoints, and a mandatory `tables[]` envelope. Range/header controls require validation against actual cells and budgets; a metadata range is a suggestion, not an allocation instruction. Discovery may read/decompress substantial workbook content and may require a second decode; measure it.

`fieldTypes` is the smallest optional route for a reviewed field interpretation, using the existing field vocabulary. It does not authorize arbitrary transforms: unsafe requests still reject, and source metadata constrains admissible choices. First-slice duplicate/blank headers require a corrected source or a different workbook header selection. A custom header mapping or no-header mode is a later explicit option, not a capability of the sketch.

`fields` is not a magical type-enforcement API. The host must translate required interpretations into existing source definitions and field settings, including the initial view, or reject what it cannot preserve. Source ID creation, key choice, relationships, and saved view changes remain host/library responsibilities. Source names derive from filename and selected sheet with visible disambiguation; decoders do not invent business keys.

### Ownership and flow through both entry points

1. **UI owns choice:** initial upload/drop and Add source accept the same supported table formats. The existing restore UI owns project/full-analysis state. A workbook choice panel shows the selected sheet/region/header, sample size versus full count, warnings, and a clear import action. It must fit the existing compact accessible UI; previews never create charts or move saved panels. [E06] [E22] [E24] [E27]
2. **Reader owns local I/O and dispatch:** inspect bounded leading/trailing bytes where useful, validate content, then read text/bytes or local Blob slices. Do not add remote range fetching. Use literal lazy imports for JSONL/workbook/binary code so existing CSV users do not fetch all optional readers.
3. **Decoder plus admission owns meaning:** inspect source schema/cell tags/number lexemes **before** a conversion can lose them. Validate full field inventory and every selected record, then return only accepted scalars and diagnostic metadata. Do not wait until `parquetReadObjects` has rounded a decimal to ask if it was exact.
4. **Host owns publication:** initial import carries source name/fields through `LandingPage`; Add source calls the shared reader before existing project-add/promotion logic. Prepare a complete result, validate against the latest session, and publish once. Do not clear saved session state before success. [E16] [E23] [E24]
5. **Library owns exploration:** preserve the raw-row embedding API, existing source/key/settings helpers, and layout rules. A new source starts with summary and rows where appropriate; restoring a saved layout preserves its chart arrangement. [E10] [E11] [E18]

Errors should distinguish unsupported format/version, unsupported codec/type, unsafe conversion, invalid header, unreadable file, malformed content, resource budget, reader-load/CSP failure, and cancellation. Include a filename and bounded location examples with corrective action. An unsupported decimal is not “corrupt Parquet,” and a missing Wasm asset is not bad data. A warning cannot legalize an otherwise lossy conversion.

## 8. Admission policy and operational limits

### Scalar policy for proposed new readers

| Value class | Proposed admission | Decisive proof |
| --- | --- | --- |
| Ordinary text, booleans, finite doubles | Preserve source value under a declared interpretation; no automatic normalization of identifiers. | Raw value, effective field type, equality/filter result, and restored value agree. |
| Exact integers / scaled decimals | Admit safe integers only with proven source precision. Keep richer numeric representation private; reject unapproved exact semantics or use an explicit enforced categorical conversion. | Boundary digits remain identical before decode conversion and after all consumers. |
| Null, empty string, absent/undefined | Preserve distinctions supplied by the format; do not invent a TSV null token. State that analysis classifies blank text as missing. | Raw/analytical missing counts and cache/project round-trips are separately asserted. |
| NaN and infinities | Reject in newly added profiles until both meaningful analysis behavior and every used persistence path are proven. | Never silently become null or disappear in a successful restore. |
| Dates and times | Distinguish calendar date, UTC instant, civil time, duration, and precision. Only explicit tested conversion into existing scalar/date rules is admitted. | Epoch, timezone, unit, boundaries, filtering, and restoration match expectations. |
| Binary, nested records/maps/lists, extension values | Reject with field/type context until an explicit projection is designed. | No silent base64/stringify, flattening, geometry loss, or dropped rows. |
| Conflicting/reserved field names | Reject or require a reviewed mapping, retaining original labels/coordinates in diagnostics. | All fields survive, including late fields; internal IDs/prototype-sensitive names cannot overwrite data. |

The policies above are proposed restrictions, not claims that the libraries cannot decode richer values. They deliberately avoid extending explorEDA into a decimal engine, geometry system, workbook calculator, or schema registry. Existing raw-row users retain their established API; changes to shared inference or persistence require compatibility proof rather than silently imposing file-import rules on all hosts. [E10] [E13] [E15] [E17] [E37]

### Cancellation, previews, and atomic publication

Use one operation identity per import. Cancelling or starting a newer operation invalidates older completion. A worker can be terminated when supported; an uninterruptible main-thread decoder may only permit publication cancellation until it yields. Be honest about that limitation. Dispose of staged bytes/rows/worker/Wasm handles after failure or cancel. A preview is a labeled temporary sample, never the complete dataset or a saved layout.

Progress may use stages such as reading, decoding, validating, and preparing exploration. Show a percentage only when the decoder supplies a trustworthy denominator. For a small initial implementation, stage indicators and cancellation are sufficient; do not add a universal stream protocol solely to draw a progress bar.

Prepare before changing the existing workspace. On Add source, commit against current state so tab edits made while reading are preserved. In-memory publication and persistent saving are distinct: storage quota failure should report that persistence failed and retain usable current state. The current separate session/table keys are not a transactional store. Do not claim crash-atomic persistence without a tested minimal remedy. [E23] [E24] [E25] [E26]

### Resource limits proportionate to a personal project

Use declared budgets for selected file bytes, sheet rectangle/cell count, record/field count, string length, nesting/schema size, expanded bytes, and decoder allocations where observable. Validate counts and bounds before allocating when possible. A small ZIP or compressed column can expand enormously; compressed `File.size` alone is not sufficient protection. If a reader cannot enforce an expansion bound, that is a documented deployment/proof limitation and may keep the feature gated.

Do not build an archive browser to read XLSX. Recognized workbook ZIP handling belongs to that reader; generic ZIP selection, directory companions, and zstd/gzip wrappers require separate rules. No external workbook relationship, formula, hyperlink, Avro schema reference, or dataset leaf should cause a network request. Reader assets should be locally bundled and selected by the application.

Start with direct execution on modest fixtures, then add a dedicated worker when observed responsiveness or cancellation requires it. Move decode plus admission together if that prevents copying rich intermediate forms twice. A worker does not remove total memory cost; transferred buffers, cloned rows, Wasm ownership, and old/new data overlap must be observed. No byte-size, browser performance, or universal row-capacity claim was measured in this research.

## 9. Staged proofs, documentation, and examples

The complete [proof-plan.md](proof-plan.md) defines fixtures, outcomes, browser flow, and the unrun command sheet. Its sequence can reject the proposed design rather than merely confirm that a parser returns an array.

| Milestone | Feature and decisive check | Documentation/example in the same slice |
| --- | --- | --- |
| M0 | Adversarial TSV through real inference, filters, trace records, promotion, and persistence; late fields and exact identifiers can invalidate admission. | “Import interpretation and limits” in existing `apps/demo/src/docs/pages/load-data.mdx`; proposed small TSV/expectation files under `apps/demo/public/datasets/`. |
| M1 | TSV in initial import and Add source, then strict JSON Lines; identical diagnostics and atomic behavior. | Format profiles and line/header errors in `load-data.mdx`; proposed examples registered through existing demo/docs example paths. |
| M2 | XLSX from Excel, LibreOffice, and manually exported Sheets; selected second sheet/region, caches, date epochs, and errors. | Workbook selection/limits and “From Google Sheets” instructions; real workbook plus expected-value sidecar. |
| M3 | Flat Parquet from independent producers/Apache fixtures; schema-before-conversion and codec proof. | Advertise only admitted types/codecs; include representative Parquet example and limitations. |
| M4 | Arrow/Feather V2 or Avro OCF when demand warrants; exact released artifact and production browser/CSP gates first. | Each promoted format gets an example and precise limitations; no advertised support from unrun research. |

Repository guidance references `apps/demo/src/demos/examples.ts`, `apps/demo/src/demos/coverage.ts`, `apps/demo/src/docs/live/examples.ts`, `apps/demo/src/docs/catalogue.ts`, `targets.ts`, and `coverage.ts`. Those registration paths are documented pointers, not all inspected files. New fixture filenames and test modules are **proposals**, not existing assets. [E05] [E30]

Use real browser imports at **1280, 783, and 390 CSS pixels**. Verify chosen sheets, effective field types, exact values, row counts, known filter membership, trace records, saved tabs/layout, reload, error/cancel behavior, and responsive controls. Mocked `SavedViewsWorkspace` tests cannot establish real decoder/analysis fidelity. [E06] [E28] [E29]

Performance experiments use **10,000 × 12**, **100,000 × 12**, **10,000 × 100**, and **10,000 × 20 with four 1,024-character ASCII fields per row**. Record actual encoded bytes, device/browser, load/decode/admission/ready/save times, long tasks, cancellation, and observable heap/Wasm memory. These are declared experimental shapes, not measured limits or promised capacities. The detailed plan labels its provisional responsiveness targets as proposals.

## 10. Unknowns, cut line, and handoff

### Bounded unresolved decisions

- Whether the smallest host/settings/source-inference adjustment can enforce categorical exact values on first render and in saved projects, while preserving raw-row embedding compatibility. Failure narrows supported values before adding dependencies.
- Whether all intended null/undefined/nonfinite cases survive the actual cache/session/history paths; the richer project codec alone is insufficient evidence. New profiles can reject unproven cases.
- The exact dependency artifacts, integrity pins, transitive licenses, production chunks, browser versions, and CSP accepted by the eventual application. Mutable package manifests are not lockfile verification.
- SheetJS CE versus ExcelJS on the independent workbook corpus; formula cache completeness, date interpretation, and named-table discovery remain concrete proof questions.
- Useful Parquet coverage with conservative hyparquet conversions and a bounded codec set; compare parquet-wasm only for a concrete failure.
- A released, maintained browser OCF path compatible with actual CSP, and selected Arrow IPC codec packages. These uncertainties justify evaluate status.
- Manual Google Sheets CSV active-tab behavior and workbook export fidelity need a small producer check. This does not undermine the resolved conclusion that downloaded exports contain local data.

### Explicit exclusions

Live Sheets/API/OAuth/public-link fetching; other live connectors; remote file URLs; database execution; server queries/streaming; arbitrary lakehouse/folder discovery; general archive browsing; export/write/recalculation features; formula/macros/Apps Script execution; password collection; new chart/query engines; application implementation in this research turn; commits, deployment, and PR creation.

### Checks actually completed

- Read both attachments; verified owner/ref, required-path coverage, and 36/36 manifest byte counts and SHA-256 hashes.
- Read all 36 selected files and the three exact-baseline supplemental helpers; independently corroborated the existing dispatcher through GitHub.
- Reviewed current primary sources and exact source-code branches for material dependency claims; did not confuse documentation with browser verification.
- Ran four Node language-semantics assertions, described above. Independent review also checked the proposed date-serial pair and fixture sums arithmetically; these are expectation checks only. No package reader, workbook/binary decode, producer export, browser import, performance benchmark, macro, formula, database, or application test was executed.
- Validated the completed artifact structures, evidence references, catalog quoting, recommendation dependencies, manifest hashes, and ZIP membership. The manifest records the specific checks and file identities.

The pnpm commands in the assignment and proof plan are **unrun**; the packet cannot execute them. There is no research-access blocker. The adoption gates above remain implementation work for Codex, which owns reconciliation, preservation, intent/shaping documents, commits, and the review PR.

## Appendix A. Exact files inspected

The following 36 paths were read from the byte-verified selected packet. The three supplemental paths follow separately.

| Evidence | Exact repository path | Inspected purpose |
| --- | --- | --- |
| [E01] | `AGENTS.md` | Project rules |
| [E02] | `README.md` | Project overview |
| [E03] | `package.json` | Root package manifest |
| [E04] | `pnpm-workspace.yaml` | Workspace manifest |
| [E05] | `docs/agent-guide.md` | Agent guide |
| [E06] | `docs/ui-defaults.md` | UI defaults |
| [E07] | `packages/explorEDA/README.md` | Library README |
| [E08] | `packages/explorEDA/package.json` | Library package manifest |
| [E09] | `apps/demo/package.json` | Demo package manifest |
| [E10] | `packages/explorEDA/src/components/ExplorEda.tsx` | ExplorEda component |
| [E11] | `packages/explorEDA/src/components/ExplorEdaProject.tsx` | ExplorEdaProject component |
| [E12] | `packages/explorEDA/src/types/AnalysisProject.ts` | Analysis project types |
| [E13] | `packages/explorEDA/src/types/ChartTypes.ts` | Chart types |
| [E14] | `packages/explorEDA/src/types/SavedDataStructure.ts` | Saved structure types |
| [E15] | `packages/explorEDA/src/lib/valueParsing.ts` | Value parsing |
| [E16] | `packages/explorEDA/src/lib/analysis/sources.ts` | Analysis source helpers |
| [E17] | `packages/explorEDA/src/lib/analysis/projectFile.ts` | Project file codec |
| [E18] | `packages/explorEDA/src/providers/DataLayerProvider.tsx` | Data layer provider |
| [E19] | `apps/demo/src/readDataFile.ts` | Local file dispatcher |
| [E20] | `apps/demo/src/csvParser.ts` | CSV parser |
| [E21] | `apps/demo/src/jsonParser.ts` | Raw JSON parser |
| [E22] | `apps/demo/src/CsvUpload.tsx` | Upload UI |
| [E23] | `apps/demo/src/LandingPage.tsx` | Landing page |
| [E24] | `apps/demo/src/SavedViewsWorkspace.tsx` | Saved views workspace |
| [E25] | `apps/demo/src/savedViewsSession.ts` | Saved views session |
| [E26] | `apps/demo/src/savedViewsHistory.ts` | Saved views history |
| [E27] | `apps/demo/src/landing/PageFileDrop.tsx` | Page file drop |
| [E28] | `apps/demo/src/parsers.test.ts` | Parser tests |
| [E29] | `apps/demo/src/SavedViewsWorkspace.test.tsx` | Workspace tests |
| [E30] | `apps/demo/src/docs/pages/load-data.mdx` | Load data documentation |
| [E31] | `docs/intent/database-adapters/intent-brief.md` | Database adapters intent |
| [E32] | `docs/intent/database-adapters/shape-brief.md` | Database adapters shape |
| [E33] | `docs/intent/columnar-data-transport/intent-brief.md` | Columnar transport intent |
| [E34] | `docs/intent/columnar-data-transport/shape-brief.md` | Columnar transport shape |
| [E35] | `docs/intent/database-query-contract/intent-brief.md` | Database query contract intent |
| [E36] | `docs/intent/date-time-handling/intent-brief.md` | Date/time intent |

Supplemental files, read through GitHub at the same commit:

- [E37] `packages/explorEDA/src/lib/fieldSettings.ts` — Field settings and conversion.
- [E38] `packages/explorEDA/src/providers/lib/dataLayerState.ts` — Data layer initialization.
- [E39] `packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts` — Column type detection.

Only these selected repository files and necessary exact-ref supplements were inspected. References to other guide-listed registration paths do not claim those files were read.

## Appendix B. Primary-source reference links

Stable IDs below resolve to exact source paths or primary URLs. The fuller sections, supported claims, retrieval dates, and verification limits are in [sources.json](sources.json). Source inclusion is evidence, not an endorsement or proof of untested capabilities.

- [E01] Project rules — byronwall / explorEDA.
- [E02] Project overview — byronwall / explorEDA.
- [E03] Root package manifest — byronwall / explorEDA.
- [E04] Workspace manifest — byronwall / explorEDA.
- [E05] Agent guide — byronwall / explorEDA.
- [E06] UI defaults — byronwall / explorEDA.
- [E07] Library README — byronwall / explorEDA.
- [E08] Library package manifest — byronwall / explorEDA.
- [E09] Demo package manifest — byronwall / explorEDA.
- [E10] ExplorEda component — byronwall / explorEDA.
- [E11] ExplorEdaProject component — byronwall / explorEDA.
- [E12] Analysis project types — byronwall / explorEDA.
- [E13] Chart types — byronwall / explorEDA.
- [E14] Saved structure types — byronwall / explorEDA.
- [E15] Value parsing — byronwall / explorEDA.
- [E16] Analysis source helpers — byronwall / explorEDA.
- [E17] Project file codec — byronwall / explorEDA.
- [E18] Data layer provider — byronwall / explorEDA.
- [E19] Local file dispatcher — byronwall / explorEDA.
- [E20] CSV parser — byronwall / explorEDA.
- [E21] Raw JSON parser — byronwall / explorEDA.
- [E22] Upload UI — byronwall / explorEDA.
- [E23] Landing page — byronwall / explorEDA.
- [E24] Saved views workspace — byronwall / explorEDA.
- [E25] Saved views session — byronwall / explorEDA.
- [E26] Saved views history — byronwall / explorEDA.
- [E27] Page file drop — byronwall / explorEDA.
- [E28] Parser tests — byronwall / explorEDA.
- [E29] Workspace tests — byronwall / explorEDA.
- [E30] Load data documentation — byronwall / explorEDA.
- [E31] Database adapters intent — byronwall / explorEDA.
- [E32] Database adapters shape — byronwall / explorEDA.
- [E33] Columnar transport intent — byronwall / explorEDA.
- [E34] Columnar transport shape — byronwall / explorEDA.
- [E35] Database query contract intent — byronwall / explorEDA.
- [E36] Date/time intent — byronwall / explorEDA.
- [E37] Field settings and conversion — byronwall / explorEDA.
- [E38] Data layer initialization — byronwall / explorEDA.
- [E39] Column type detection — byronwall / explorEDA.
- [P01] Papa Parse documentation — Papa Parse maintainers.
- [P02] Papa Parse 5.7.0 source — Papa Parse maintainers.
- [P03] Papa Parse package metadata and releases — Papa Parse maintainers.
- [P04] Papa Parse releases — Papa Parse maintainers.
- [P05] JSON Lines format — Ian Ward / JSON Lines.
- [P06] RFC 4180: Common Format and MIME Type for CSV Files — IETF / RFC Editor.
- [P07] IANA text/tab-separated-values registration — IANA / University of Minnesota Internet Gopher Team.
- [P08] NDJSON specification 1.0.0 — NDJSON specification authors.
- [P09] RFC 8259: The JSON Data Interchange Format — IETF / RFC Editor.
- [P10] ECMAScript JSON parse and stringify algorithms — Ecma TC39.
- [P11] lossless-json maintainers' documentation — Jos de Jong / lossless-json maintainers.
- [P12] lossless-json package metadata — Jos de Jong / lossless-json maintainers.
- [P13] lossless-json changelog — Jos de Jong / lossless-json maintainers.
- [P14] Papa Parse FAQ — Papa Parse maintainers.
- [B01] Parquet File Format — Apache Software Foundation.
- [B02] Parquet Concepts — Apache Software Foundation.
- [B03] Parquet compression definitions — Apache Software Foundation.
- [B04] Parquet Encodings — Apache Software Foundation.
- [B05] Parquet Nested Encoding — Apache Software Foundation.
- [B06] Parquet Logical Type Definitions — Apache Software Foundation.
- [B07] hyparquet README — Hyperparam maintainers.
- [B08] hyparquet package manifest at observed commit — Hyperparam maintainers.
- [B09] hyparquet value conversion source at observed commit — Hyperparam maintainers.
- [B10] hyparquet changelog — Hyperparam maintainers.
- [B11] hyparquet-compressors README — Hyperparam maintainers.
- [B12] hyparquet-compressors package manifest — Hyperparam maintainers.
- [B13] parquet-wasm v0.9.0 documentation — Kyle Barron and parquet-wasm contributors.
- [B14] parquet-wasm v0.9.0 Cargo manifest — Kyle Barron and parquet-wasm contributors.
- [B15] ParquetFile API — Kyle Barron and parquet-wasm contributors.
- [B16] parquet-wasm v0.9.0 release — Kyle Barron and parquet-wasm contributors.
- [B17] Apache Avro 1.12.0 specification — Apache Software Foundation.
- [B18] Avro 1.12.2 release announcement — Apache Software Foundation.
- [B19] avsc package manifest at observed master commit — Matthieu Monsch and avsc contributors.
- [B20] avsc wiki browser support — avsc maintainers.
- [B21] avsc API — avsc maintainers.
- [B22] avsc Advanced usage — avsc maintainers.
- [B23] avsc generated record source at observed commit — avsc maintainers.
- [B24] avsc browser Blob entry point — avsc maintainers.
- [B25] avsc observed master commit metadata — GitHub metadata for avsc.
- [B26] Arrow Columnar Format — Apache Software Foundation.
- [B27] Feather File Format — Apache Software Foundation.
- [B28] Apache Arrow JavaScript current documentation — Apache Software Foundation.
- [B29] Apache Arrow JS release list — Apache Software Foundation.
- [B30] Arrow JS 21.2.0 compression registry source — Apache Software Foundation.
- [B31] Arrow JS 21.2.0 IPC reader source — Apache Software Foundation.
- [B32] Arrow JS 21.2.0 value getter source — Apache Software Foundation.
- [B33] DuckDB Wasm Client overview — DuckDB Foundation.
- [B34] DuckDB-Wasm Import Data — DuckDB Foundation.
- [B35] Deploy DuckDB-Wasm — DuckDB Foundation.
- [B36] DuckDB-Wasm package manifest — DuckDB maintainers.
- [B37] DuckDB-Wasm observed GitHub release metadata — DuckDB maintainers.
- [B38] Content Security Policy Level 3 — W3C Web Application Security Working Group.
- [B42] Apache avro-js package manifest — Apache Software Foundation.
- [B43] Apache avro-js browser entry point — Apache Software Foundation.
- [B44] hyparquet observed master commit metadata — GitHub metadata for Hyperparam.
- [W01] ECMA-376: Office Open XML file formats — Ecma International.
- [W02] Structure of a SpreadsheetML document — Microsoft.
- [W03] Working with formulas — Microsoft.
- [W04] Date systems in Excel — Microsoft.
- [W06] Frameworks and Bundlers — SheetJS LLC.
- [W07] Standalone Browser Scripts — SheetJS LLC.
- [W08] SheetJS Community Edition official source repository — SheetJS LLC.
- [W09] SheetJS Community Edition license — SheetJS LLC.
- [W10] Reading Files — SheetJS LLC.
- [W11] Workbook Object — SheetJS LLC.
- [W12] Cell Objects — SheetJS LLC.
- [W13] Arrays of Data — SheetJS LLC.
- [W14] Merged Cells — SheetJS LLC.
- [W15] Sheet Visibility — SheetJS LLC.
- [W16] Row Properties — SheetJS LLC.
- [W17] Formulae — SheetJS LLC.
- [W18] Dates and Times — SheetJS LLC.
- [W19] Web Workers — SheetJS LLC.
- [W20] Defined Names — SheetJS LLC.
- [W22] ExcelJS README at v4.4.0 — ExcelJS maintainers.
- [W23] ExcelJS package.json at v4.4.0 — ExcelJS maintainers.
- [W24] ExcelJS latest release metadata and v4.4.0 release — ExcelJS maintainers / GitHub.
- [W25] Create, view, or download a file — Google.
- [W26] Export MIME types for Google Workspace documents — Google.
- [W27] Supported file formats: Google Sheets TSV export — Google.
- [W28] Work on Google Docs, Sheets, & Slides offline — Google.
- [W29] Files and folders overview — Google.
- [W30] Use Google Drive for desktop — Google.
- [W31] Chromium hosted-document pointer serialization — The Chromium Authors / Google-hosted source.
- [W32] Chromium hosted-spreadsheet extension metadata — The Chromium Authors / Google-hosted source.
- [W33] Export spreadsheets — Google.
- [L01] IO tools (text, CSV, HDF5, …) — pandas maintainers.
- [L02] Installation: optional dependencies — pandas maintainers.
- [L03] Input/output — Polars maintainers.
- [L04] Excel — Polars maintainers.
- [L05] Importing Data — DuckDB Foundation.
- [L06] Import and Export SPSS, Stata and SAS Files — haven/tidyverse maintainers.
- [L07] Read Rectangular Text Data — readr/tidyverse maintainers.
- [L08] Text File — Tableau / Salesforce.
- [L09] Statistical File — Tableau / Salesforce.
- [L10] Power Query connectors — Microsoft.
- [L11] Perspective README — Perspective maintainers / OpenJS Foundation.
- [L12] DuckDB | Observable Framework — Observable.
- [L13] Tabular Datasets — Apache Software Foundation.
- [L14] Serialization Interface for Single Objects — R Core Team.
- [L16] Datasets — h5py maintainers.
- [L18] The NetCDF Data Model — NSF Unidata / UCAR.
- [L19] Reading and writing files — xarray maintainers.
- [L20] Zarr core specification — Zarr core development team.
- [L21] numpy.lib.format — NumPy maintainers.
- [L23] scipy.io.loadmat — SciPy maintainers.
- [L24] RFC 7946: The GeoJSON Format — IETF / RFC Editor.
- [L25] TopoJSON Format Specification — TopoJSON maintainers.
- [L26] ESRI Shapefile / DBF — GDAL / OSGeo.
- [L27] GPKG — GeoPackage vector — GDAL / OSGeo.
- [L28] KML — Keyhole Markup Language — GDAL / OSGeo.
- [L30] Read common/combined log file into a tibble — readr/tidyverse maintainers.
- [L41] ATTACH and DETACH Statements — DuckDB Foundation.
- [L42] Apache Iceberg Table Spec — Apache Software Foundation.
- [L43] Delta Transaction Log Protocol — Delta Lake maintainers.
- [L44] Table & Query Types — Apache Software Foundation.
- [L45] RFC 1952: GZIP file format specification version 4.3 — IETF / RFC Editor.
- [L46] Compression Standard — WHATWG.
- [L47] APPNOTE.TXT: ZIP File Format Specification — PKWARE.
- [L48] RFC 8878: Zstandard Compression and application/zstd — IETF / RFC Editor.
- [L51] Excel Extension — DuckDB Foundation.
- [L53] Excel — Tableau / Salesforce.
- [L54] JSON File — Tableau / Salesforce.
- [L55] Create Tableau Maps from Spatial Files — Tableau / Salesforce.
- [L56] polars.read_delta — Polars maintainers.
- [L57] polars.scan_iceberg — Polars maintainers.

[E01]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/AGENTS.md "Project rules"
[E02]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/README.md "Project overview"
[E03]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/package.json "Root package manifest"
[E04]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/pnpm-workspace.yaml "Workspace manifest"
[E05]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/agent-guide.md "Agent guide"
[E06]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/ui-defaults.md "UI defaults"
[E07]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/README.md "Library README"
[E08]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/package.json "Library package manifest"
[E09]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/package.json "Demo package manifest"
[E10]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ExplorEda.tsx "ExplorEda component"
[E11]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ExplorEdaProject.tsx "ExplorEdaProject component"
[E12]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/types/AnalysisProject.ts "Analysis project types"
[E13]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/types/ChartTypes.ts "Chart types"
[E14]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/types/SavedDataStructure.ts "Saved structure types"
[E15]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/lib/valueParsing.ts "Value parsing"
[E16]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/lib/analysis/sources.ts "Analysis source helpers"
[E17]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/lib/analysis/projectFile.ts "Project file codec"
[E18]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/providers/DataLayerProvider.tsx "Data layer provider"
[E19]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/readDataFile.ts "Local file dispatcher"
[E20]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/csvParser.ts "CSV parser"
[E21]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/jsonParser.ts "Raw JSON parser"
[E22]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/CsvUpload.tsx "Upload UI"
[E23]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/LandingPage.tsx "Landing page"
[E24]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/SavedViewsWorkspace.tsx "Saved views workspace"
[E25]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/savedViewsSession.ts "Saved views session"
[E26]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/savedViewsHistory.ts "Saved views history"
[E27]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/landing/PageFileDrop.tsx "Page file drop"
[E28]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/parsers.test.ts "Parser tests"
[E29]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/SavedViewsWorkspace.test.tsx "Workspace tests"
[E30]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/docs/pages/load-data.mdx "Load data documentation"
[E31]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/database-adapters/intent-brief.md "Database adapters intent"
[E32]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/database-adapters/shape-brief.md "Database adapters shape"
[E33]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/columnar-data-transport/intent-brief.md "Columnar transport intent"
[E34]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/columnar-data-transport/shape-brief.md "Columnar transport shape"
[E35]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/database-query-contract/intent-brief.md "Database query contract intent"
[E36]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/docs/intent/date-time-handling/intent-brief.md "Date/time intent"
[E37]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/lib/fieldSettings.ts "Field settings and conversion"
[E38]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/providers/lib/dataLayerState.ts "Data layer initialization"
[E39]: https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts "Column type detection"
[P01]: https://www.papaparse.com/docs "Papa Parse documentation"
[P02]: https://github.com/mholt/PapaParse/blob/5.7.0/papaparse.js "Papa Parse 5.7.0 source"
[P03]: https://github.com/mholt/PapaParse/blob/5.7.0/package.json "Papa Parse package metadata and releases"
[P04]: https://github.com/mholt/PapaParse/releases "Papa Parse releases"
[P05]: https://jsonlines.org/ "JSON Lines format"
[P06]: https://www.rfc-editor.org/info/rfc4180/ "RFC 4180: Common Format and MIME Type for CSV Files"
[P07]: https://www.iana.org/assignments/media-types/text/tab-separated-values "IANA text/tab-separated-values registration"
[P08]: https://github.com/ndjson/ndjson-spec "NDJSON specification 1.0.0"
[P09]: https://www.rfc-editor.org/info/rfc8259/ "RFC 8259: The JSON Data Interchange Format"
[P10]: https://tc39.es/ecma262/multipage/structured-data.html#sec-json.stringify "ECMAScript JSON parse and stringify algorithms"
[P11]: https://github.com/josdejong/lossless-json "lossless-json maintainers' documentation"
[P12]: https://github.com/josdejong/lossless-json/blob/main/package.json "lossless-json package metadata"
[P13]: https://github.com/josdejong/lossless-json/blob/main/CHANGELOG.md "lossless-json changelog"
[P14]: https://www.papaparse.com/faq "Papa Parse FAQ"
[B01]: https://parquet.apache.org/docs/file-format/ "Parquet File Format"
[B02]: https://parquet.apache.org/docs/concepts/ "Parquet Concepts"
[B03]: https://parquet.apache.org/docs/file-format/data-pages/compression/ "Parquet compression definitions"
[B04]: https://parquet.apache.org/docs/file-format/data-pages/encodings/ "Parquet Encodings"
[B05]: https://parquet.apache.org/docs/file-format/nestedencoding/ "Parquet Nested Encoding"
[B06]: https://github.com/apache/parquet-format/blob/master/LogicalTypes.md "Parquet Logical Type Definitions"
[B07]: https://github.com/hyparam/hyparquet "hyparquet README"
[B08]: https://github.com/hyparam/hyparquet/blob/1eb9fe4607d9a53d68803b8ecfa1936720e47968/package.json "hyparquet package manifest at observed commit"
[B09]: https://github.com/hyparam/hyparquet/blob/1eb9fe4607d9a53d68803b8ecfa1936720e47968/src/convert.js "hyparquet value conversion source at observed commit"
[B10]: https://github.com/hyparam/hyparquet/blob/master/CHANGELOG.md "hyparquet changelog"
[B11]: https://github.com/hyparam/hyparquet-compressors "hyparquet-compressors README"
[B12]: https://github.com/hyparam/hyparquet-compressors/blob/master/package.json "hyparquet-compressors package manifest"
[B13]: https://kylebarron.dev/parquet-wasm/ "parquet-wasm v0.9.0 documentation"
[B14]: https://github.com/kylebarron/parquet-wasm/blob/v0.9.0/Cargo.toml "parquet-wasm v0.9.0 Cargo manifest"
[B15]: https://kylebarron.dev/parquet-wasm/classes/esm_parquet_wasm.ParquetFile.html "ParquetFile API"
[B16]: https://github.com/kylebarron/parquet-wasm/releases/tag/v0.9.0 "parquet-wasm v0.9.0 release"
[B17]: https://avro.apache.org/docs/1.12.0/specification/ "Apache Avro 1.12.0 specification"
[B18]: https://avro.apache.org/blog/2026/08/12/avro-1.12.2/ "Avro 1.12.2 release announcement"
[B19]: https://github.com/mtth/avsc/blob/91d653f72906102448a059cb81692177bb678f52/package.json "avsc package manifest at observed master commit"
[B20]: https://github.com/mtth/avsc/wiki "avsc wiki browser support"
[B21]: https://github.com/mtth/avsc/wiki/API "avsc API"
[B22]: https://github.com/mtth/avsc/wiki/Advanced-usage "avsc Advanced usage"
[B23]: https://github.com/mtth/avsc/blob/91d653f72906102448a059cb81692177bb678f52/lib/types.js "avsc generated record source at observed commit"
[B24]: https://github.com/mtth/avsc/blob/91d653f72906102448a059cb81692177bb678f52/etc/browser/avsc.js "avsc browser Blob entry point"
[B25]: https://api.github.com/repos/mtth/avsc/commits/91d653f72906102448a059cb81692177bb678f52 "avsc observed master commit metadata"
[B26]: https://arrow.apache.org/docs/format/Columnar.html "Arrow Columnar Format"
[B27]: https://arrow.apache.org/docs/python/feather.html "Feather File Format"
[B28]: https://arrow.apache.org/js/current/ "Apache Arrow JavaScript current documentation"
[B29]: https://github.com/apache/arrow-js/releases "Apache Arrow JS release list"
[B30]: https://github.com/apache/arrow-js/blob/v21.2.0/src/ipc/compression/registry.ts "Arrow JS 21.2.0 compression registry source"
[B31]: https://github.com/apache/arrow-js/blob/v21.2.0/src/ipc/reader.ts "Arrow JS 21.2.0 IPC reader source"
[B32]: https://github.com/apache/arrow-js/blob/v21.2.0/src/visitor/get.ts "Arrow JS 21.2.0 value getter source"
[B33]: https://duckdb.org/docs/current/clients/wasm/overview "DuckDB Wasm Client overview"
[B34]: https://duckdb.org/docs/current/clients/wasm/data_ingestion "DuckDB-Wasm Import Data"
[B35]: https://duckdb.org/docs/current/clients/wasm/deploying_duckdb_wasm "Deploy DuckDB-Wasm"
[B36]: https://github.com/duckdb/duckdb-wasm/blob/main/packages/duckdb-wasm/package.json "DuckDB-Wasm package manifest"
[B37]: https://github.com/duckdb/duckdb-wasm/releases/tag/v1.33.0 "DuckDB-Wasm observed GitHub release metadata"
[B38]: https://www.w3.org/TR/CSP3/ "Content Security Policy Level 3"
[B39]: https://github.com/apache/parquet-testing/blob/master/data/README.md "Apache Parquet compatibility test data"
[B40]: https://github.com/apache/avro/tree/main/share/test/data "Apache Avro shared test-data inventory"
[B41]: https://github.com/apache/arrow-testing/tree/master/data "Apache Arrow test-data inventory"
[B42]: https://github.com/apache/avro/blob/main/lang/js/package.json "Apache avro-js package manifest"
[B43]: https://github.com/apache/avro/blob/main/lang/js/etc/browser/avro.js "Apache avro-js browser entry point"
[B44]: https://api.github.com/repos/hyparam/hyparquet/commits/1eb9fe4607d9a53d68803b8ecfa1936720e47968 "hyparquet observed master commit metadata"
[B45]: https://duckdb.org/docs/current/data/parquet/tips "Parquet Tips"
[W01]: https://ecma-international.org/publications-and-standards/standards/ecma-376/ "ECMA-376: Office Open XML file formats"
[W02]: https://learn.microsoft.com/en-us/office/open-xml/spreadsheet/structure-of-a-spreadsheetml-document "Structure of a SpreadsheetML document"
[W03]: https://learn.microsoft.com/en-us/office/open-xml/spreadsheet/working-with-formulas "Working with formulas"
[W04]: https://support.microsoft.com/en-us/excel/date-systems-in-excel "Date systems in Excel"
[W05]: https://docs.sheetjs.com/docs/miscellany/formats/ "File Formats"
[W06]: https://docs.sheetjs.com/docs/getting-started/installation/frameworks/ "Frameworks and Bundlers"
[W07]: https://docs.sheetjs.com/docs/getting-started/installation/standalone/ "Standalone Browser Scripts"
[W08]: https://git.sheetjs.com/sheetjs/sheetjs "SheetJS Community Edition official source repository"
[W09]: https://docs.sheetjs.com/docs/miscellany/license/ "SheetJS Community Edition license"
[W10]: https://docs.sheetjs.com/docs/api/parse-options/ "Reading Files"
[W11]: https://docs.sheetjs.com/docs/csf/book/ "Workbook Object"
[W12]: https://docs.sheetjs.com/docs/csf/cell/ "Cell Objects"
[W13]: https://docs.sheetjs.com/docs/api/utilities/array/ "Arrays of Data"
[W14]: https://docs.sheetjs.com/docs/csf/features/merges/ "Merged Cells"
[W15]: https://docs.sheetjs.com/docs/csf/features/visibility/ "Sheet Visibility"
[W16]: https://docs.sheetjs.com/docs/csf/features/rowprops/ "Row Properties"
[W17]: https://docs.sheetjs.com/docs/csf/features/formulae/ "Formulae"
[W18]: https://docs.sheetjs.com/docs/csf/features/dates/ "Dates and Times"
[W19]: https://docs.sheetjs.com/docs/demos/bigdata/worker/ "Web Workers"
[W20]: https://docs.sheetjs.com/docs/csf/features/names/ "Defined Names"
[W21]: https://docs.sheetjs.com/docs/csf/features/vba/ "VBA and Macros"
[W22]: https://github.com/exceljs/exceljs/blob/v4.4.0/README.md "ExcelJS README at v4.4.0"
[W23]: https://github.com/exceljs/exceljs/blob/v4.4.0/package.json "ExcelJS package.json at v4.4.0"
[W24]: https://api.github.com/repos/exceljs/exceljs/releases/latest "ExcelJS latest release metadata and v4.4.0 release"
[W25]: https://support.google.com/docs/answer/49114?hl=en "Create, view, or download a file"
[W26]: https://developers.google.com/workspace/drive/api/guides/ref-export-formats "Export MIME types for Google Workspace documents"
[W27]: https://support.google.com/manufacturers/answer/6124098?hl=en "Supported file formats: Google Sheets TSV export"
[W28]: https://support.google.com/docs/answer/6388102?hl=en "Work on Google Docs, Sheets, & Slides offline"
[W29]: https://developers.google.com/workspace/drive/api/guides/about-files "Files and folders overview"
[W30]: https://support.google.com/drive/answer/10838124?hl=en "Use Google Drive for desktop"
[W31]: https://chromium.googlesource.com/chromium/src/+/9d94097261b83d3fe2af86de8b22a81da603c0ea/components/drive/file_system_core_util.cc "Chromium hosted-document pointer serialization"
[W32]: https://chromium.googlesource.com/chromium/src/+/1b93c87e38de8f82e35efd150d6db17dcccfaa17/components/drive/drive.proto "Chromium hosted-spreadsheet extension metadata"
[W33]: https://support.google.com/a/users/answer/9330963?hl=en&ref_topic=9296611 "Export spreadsheets"
[L01]: https://pandas.pydata.org/docs/user_guide/io.html "IO tools (text, CSV, HDF5, …)"
[L02]: https://pandas.pydata.org/docs/getting_started/install.html "Installation: optional dependencies"
[L03]: https://docs.pola.rs/api/python/stable/reference/io.html "Input/output"
[L04]: https://docs.pola.rs/user-guide/io/excel/ "Excel"
[L05]: https://duckdb.org/docs/current/data/overview "Importing Data"
[L06]: https://haven.tidyverse.org/ "Import and Export SPSS, Stata and SAS Files"
[L07]: https://readr.tidyverse.org/ "Read Rectangular Text Data"
[L08]: https://help.tableau.com/current/pro/desktop/en-us/examples_text.htm "Text File"
[L09]: https://help.tableau.com/current/pro/desktop/en-us/examples_statfile.htm "Statistical File"
[L10]: https://learn.microsoft.com/en-us/power-query/connectors/ "Power Query connectors"
[L11]: https://github.com/perspective-dev/perspective "Perspective README"
[L12]: https://observablehq.github.io/framework/lib/duckdb "DuckDB | Observable Framework"
[L13]: https://arrow.apache.org/docs/python/dataset.html "Tabular Datasets"
[L14]: https://stat.ethz.ch/R-manual/R-devel/library/base/html/readRDS.html "Serialization Interface for Single Objects"
[L15]: https://docs.python.org/3/library/pickle.html "pickle — Python object serialization"
[L16]: https://docs.h5py.org/en/stable/high/dataset.html "Datasets"
[L17]: https://pandas.pydata.org/docs/reference/api/pandas.read_hdf.html "pandas.read_hdf"
[L18]: https://docs.unidata.ucar.edu/netcdf-c/current/netcdf_data_model.html "The NetCDF Data Model"
[L19]: https://docs.xarray.dev/en/stable/user-guide/io.html "Reading and writing files"
[L20]: https://zarr-specs.readthedocs.io/en/latest/v3/core/index.html "Zarr core specification"
[L21]: https://numpy.org/doc/stable/reference/generated/numpy.lib.format.html "numpy.lib.format"
[L22]: https://numpy.org/doc/stable/reference/generated/numpy.load.html "numpy.load"
[L23]: https://docs.scipy.org/doc/scipy/reference/generated/scipy.io.loadmat.html "scipy.io.loadmat"
[L24]: https://www.rfc-editor.org/info/rfc7946/ "RFC 7946: The GeoJSON Format"
[L25]: https://github.com/topojson/topojson-specification "TopoJSON Format Specification"
[L26]: https://gdal.org/en/stable/drivers/vector/shapefile.html "ESRI Shapefile / DBF"
[L27]: https://gdal.org/en/stable/drivers/vector/gpkg.html "GPKG — GeoPackage vector"
[L28]: https://gdal.org/en/stable/drivers/vector/kml.html "KML — Keyhole Markup Language"
[L29]: https://docs.astropy.org/en/stable/io/fits/index.html "FITS File Handling (astropy.io.fits)"
[L30]: https://readr.tidyverse.org/reference/read_log.html "Read common/combined log file into a tibble"
[L31]: https://orc.apache.org/specification/ORCv1/ "ORC Specification v1"
[L32]: https://arrow.apache.org/docs/python/orc.html "Reading and Writing the Apache ORC Format"
[L33]: https://github.com/msgpack/msgpack/blob/master/spec.md "MessagePack specification"
[L34]: https://github.com/msgpack/msgpack-javascript "MessagePack for JavaScript and TypeScript"
[L35]: https://bsonspec.org/spec.html "BSON Specification"
[L36]: https://github.com/mongodb/js-bson "BSON Parser for node and browser"
[L37]: https://protobuf.dev/programming-guides/encoding/ "Encoding | Protocol Buffers Documentation"
[L38]: https://github.com/protobufjs/protobuf.js "protobuf.js README"
[L39]: https://www.sqlite.org/fileformat.html "Database File Format"
[L40]: https://sqlite.org/wasm/doc/trunk/index.md "sqlite3 WebAssembly & JavaScript Documentation Index"
[L41]: https://duckdb.org/docs/current/sql/statements/attach "ATTACH and DETACH Statements"
[L42]: https://iceberg.apache.org/spec/ "Apache Iceberg Table Spec"
[L43]: https://github.com/delta-io/delta/blob/master/PROTOCOL.md "Delta Transaction Log Protocol"
[L44]: https://hudi.apache.org/docs/table_types/ "Table & Query Types"
[L45]: https://www.rfc-editor.org/rfc/rfc1952.html "RFC 1952: GZIP file format specification version 4.3"
[L46]: https://compression.spec.whatwg.org/ "Compression Standard"
[L47]: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT "APPNOTE.TXT: ZIP File Format Specification"
[L48]: https://www.rfc-editor.org/rfc/rfc8878.html "RFC 8878: Zstandard Compression and application/zstd"
[L49]: https://pandas.pydata.org/docs/reference/api/pandas.read_xml.html "pandas.read_xml"
[L50]: https://pandas.pydata.org/docs/reference/api/pandas.read_html.html "pandas.read_html"
[L51]: https://duckdb.org/docs/current/core_extensions/excel "Excel Extension"
[L52]: https://pandas.pydata.org/docs/reference/api/pandas.read_spss.html "pandas.read_spss"
[L53]: https://help.tableau.com/current/pro/desktop/en-us/examples_excel.htm "Excel"
[L54]: https://help.tableau.com/current/pro/desktop/en-us/examples_json.htm "JSON File"
[L55]: https://help.tableau.com/current/pro/desktop/en-us/maps_shapefiles.htm "Create Tableau Maps from Spatial Files"
[L56]: https://docs.pola.rs/api/python/stable/reference/api/polars.read_delta.html "polars.read_delta"
[L57]: https://docs.pola.rs/api/python/stable/reference/api/polars.scan_iceberg.html "polars.scan_iceberg"
