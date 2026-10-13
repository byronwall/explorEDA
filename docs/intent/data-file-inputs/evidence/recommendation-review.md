# Research review

Reviewed October 12, 2026, America/Indiana/Indianapolis; collection and external checks occurred October 13 UTC.

The [Pro conversation](https://chatgpt.com/c/6acd88a1-24ec-83e9-a30b-b65230c75c0f) produced the [report](../raw/2026-10-12-pro/exploreda-data-file-inputs-research/report.md), [catalog](../raw/2026-10-12-pro/exploreda-data-file-inputs-research/format-catalog.csv), [recommendations](../raw/2026-10-12-pro/exploreda-data-file-inputs-research/recommendations.json), [sources](../raw/2026-10-12-pro/exploreda-data-file-inputs-research/sources.json), and [proof plan](../raw/2026-10-12-pro/exploreda-data-file-inputs-research/proof-plan.md).

All substantive artifacts were read. The source ledger has 188 records; these are not 188 independently repeated checks. The checks below cover claims that determine the proposed design. Remaining landscape claims retain Pro's source anchors and limitations.

## Collection integrity

The [collection manifest](../raw/2026-10-12-pro/collection-manifest.json) records names, origin controls, timestamps, sizes, and SHA-256 hashes. The ZIP contains exactly six expected files. Paths contain no traversal or unsafe links. CRC checks passed. Extracted bytes match the archive. All five content files match Pro's manifest hashes. The standalone report also matches. The archive supplied the complete catalog when its separate browser download failed.

The catalog parses as 70 rows with 17 fields. Recommendations parse as 19 records, with unique identifiers. Sources parse as 188 unique records. Every recommendation source reference resolves. No artifact recovery or research follow-up was needed.

## Repository checks

Source baseline: `c534378c052c9fbb2cb076d1df0d21eb0fa0965e`. Current application code, package manifests, and lockfile match that baseline. Preparation and synthesis only change this initiative's documents.

| Claim | Direct evidence and implication |
| --- | --- |
| Initial import accepts CSV and JSON | `apps/demo/src/readDataFile.ts`, `isSupportedDataFile` and `readDataFile`. Add a shared dispatch here before changing several accept lists independently. |
| Add source uses its own CSV parser | `apps/demo/src/SavedViewsWorkspace.tsx`, `parseCsvData` import and source-file handler. Share the new route while preserving session state. |
| CSV parsing already changes values | `apps/demo/src/csvParser.ts`, `baseConfig.dynamicTyping`. The installed package is **Papa 5.5.2**, confirmed from the lockfile and package metadata. |
| Source discovery samples fields and types | `packages/explorEDA/src/lib/analysis/sources.ts`, `TYPE_SAMPLE`, `fieldIds`, `sourceFromRows`. Only the first 500 rows supply inferred fields and types. New readers must prove complete field coverage. |
| Declared types do not guarantee initial enforcement | `packages/explorEDA/src/components/ExplorEdaProject.tsx`, `renderedSettings`: it returns before merging declarations when settings are absent. Test the real consumer path. |
| Internal row IDs can replace an imported name | `packages/explorEDA/src/providers/lib/dataLayerState.ts` and `ExplorEdaProject.tsx` assign `__ID`. Preserve or reject source collisions explicitly. |
| Value meaning can change after decoding | `packages/explorEDA/src/lib/fieldSettings.ts`, `applyFieldSettings`; `lib/valueParsing.ts`; `components/SummaryTable/utils/dataTypeDetection.ts`. Preserved numeric/date-like text needs an enforced interpretation. |
| Session and history persistence use plain JSON | `apps/demo/src/savedViewsSession.ts`, `writeProjectTables`, `clone`, `readSavedViewsSessionResult`; `savedViewsHistory.ts`, `clone`. Project-file codec checks alone are insufficient. |
| Public rows use scalar values | `packages/explorEDA/src/types/ChartTypes.ts`, `datum`. Rich binary objects, bigint, and nested collections do not fit directly. |

A small Node probe used the installed Papa package with an explicit tab delimiter and the current dynamic typing option. It produced `12` from `0012`, a `Date` from ISO text, and text for `9007199254740993`. This confirms decoder behavior only. It does not prove new TSV imports, browser behavior, or save fidelity. Pro's Papa 5.7.0 source observations must not be treated as the installed version.

## Decisive external checks

| Check | Primary evidence | Result and limit |
| --- | --- | --- |
| Explicit TSV parsing | [Papa documentation](https://www.papaparse.com/docs), delimiter, header, typing, and error options | Reuse is justified. Exact application behavior still needs the first proof. |
| JSON Lines scope | [JSON Lines](https://jsonlines.org/), three requirements | UTF-8, one JSON value per line, and no blank records. Flat objects are our narrower table policy. |
| XLSX data selection | [SheetJS parse options](https://docs.sheetjs.com/docs/api/parse-options/), sheet/range and workbook options | Sheet discovery and bounded row parsing exist. These options do not prove a hard decompression or memory limit. |
| Formula results | [Microsoft formula model](https://learn.microsoft.com/en-us/office/open-xml/spreadsheet/working-with-formulas) and [SheetJS formula docs](https://docs.sheetjs.com/docs/csf/features/formulae/) | Formula text and cached values differ. SheetJS CE does not calculate results. No cache freshness guarantee follows. |
| Workbook package source | [SheetJS framework installation](https://docs.sheetjs.com/docs/getting-started/installation/frameworks/) | The official page names its 0.20.3 artifact and describes npm `xlsx` 0.18.5 as stale. Verify the chosen artifact when implementing; no dependency was installed here. |
| Parquet browser candidate | [hyparquet README](https://github.com/hyparam/hyparquet) | Browser and local-byte routes justify evaluation. Broad support claims do not establish exact application fidelity. |
| Parquet conversion risk | [Pinned conversion source](https://github.com/hyparam/hyparquet/blob/1eb9fe4607d9a53d68803b8ecfa1936720e47968/src/convert.js), lines 14–24, 87–97, 115–119 | Independently fetched through GitHub API. Defaults reduce timestamp resolution and convert decimals to numbers. Inspect schema before conversion. BSON and INTERVAL explicitly throw. |
| Avro local scope | [Avro 1.12.0 specification](https://avro.apache.org/docs/1.12.0/specification/), Object Container Files | OCF embeds schema. Required codecs include null and deflate. Raw messages and fingerprint-only records are a different integration. |
| Avro browser constraint | [Pinned avsc source](https://github.com/mtth/avsc/blob/91d653f72906102448a059cb81692177bb678f52/lib/types.js), generated constructors/readers | Independently fetched through GitHub API. It uses `new Function`. This is a feasibility concern, not proof of a deployed failure. Do not relax browser policy to make it pass. |
| Manual Sheets snapshots | [Google download help](https://support.google.com/docs/answer/49114?hl=en) and [export matrix](https://developers.google.com/workspace/drive/api/guides/ref-export-formats) | Download is supported. The matrix lists XLSX, ODS, CSV, and TSV. The matrix's first-sheet wording belongs to API exports. |
| Manual TSV selection | [Google's supported-format instructions](https://support.google.com/manufacturers/answer/6124098?hl=en) | The manual TSV instruction names the current sheet. Do not infer identical CSV behavior from the API matrix. |
| Offline Sheets | [Google offline help](https://support.google.com/docs/answer/6388102?hl=en) | Offline use depends on browser/profile and managed site state. The source supplies no portable cache interchange contract. Excluding cache import is a design conclusion, not proof that cells never exist on disk. |

Web retrieval could not render the two pinned decoder files. Read-only `gh api` fetches verified both files instead. The historical `.gsheet` pointer evidence remains qualified as historical. No current native pointer layout or user cache was inspected. Manual export fixtures remain unrun.

## Recommendation dispositions

“Adopt” means include in the proposed shape. It does not mean approved or implemented. IDs refer to the unchanged Pro recommendation file.

| ID | Disposition | Reason and destination |
| --- | --- | --- |
| R01 | Adopt | Share a small demo-local dispatcher. Keep a public input package and plugin registry below the cut line. Shape: appetite. |
| R02 | Adopt, bounded | Validate fields and source values before irreversible conversion. Add only metadata the consumers use. Shape: behavior and first proof. |
| R03 | Adopt | Unify initial import and Add source; keep project restore distinct. Shape: planned additions. |
| R04 | Adopt | Verify session, history, and file round trips. Repair only a demonstrated path; no universal serializer. Shape: first proof. |
| R05 | Adopt | Explicit quoted TSV through Papa, with deliberate value rules. Preserve existing CSV behavior without a second version platform. Shape: planned additions. |
| R06 | Adopt; investigate parser | Add strict flat JSON Lines. Evaluate a small lossless parser before accepting unsafe numeric tokens. Do not write a JSON parser. Map: JSON dependency. |
| R07 | Adopt; investigate reader | One selected XLSX region, stored formula values, explicit date and hidden-content policy. SheetJS is a candidate. Shape: workbook flow. |
| R08 | Adopt | Manual Sheets exports use their underlying readers. No native-cache or live integration. Intent: boundaries. |
| R09 | Investigate | Prove flat local Parquet with hyparquet first. Compare parquet-wasm only for a required failing case. Shape: evaluation. |
| R10 | Investigate; reject demand deferral | Byron already requested Avro. Schedule an OCF feasibility proof. Keep browser, codec, and value gates. Shape: evaluation. |
| R11 | Defer | Arrow IPC and Feather V2 can follow a demonstrated need. Do not make Arrow universal. Shape: later possibilities. |
| R12 | Adopt | Load optional readers on demand; verify exact artifacts and production builds. No eager library-root reader bundle. Shape: reader choices. |
| R13 | Adopt, narrowed | Commit complete imports and handle failure/cancel without lost state. Measure limits. Defer a general quota or worker framework. Shape: behavior. |
| R14 | Adopt | XLSX support does not enable XLS, XLSM, XLSB, or ODS automatically. Each needs its own proof. Shape: cut line. |
| R15 | Adopt | Keep niche formats in the catalog with source-tool conversion routes. Broader implementation requires useful fixtures. Intent: landscape. |
| R16 | Adopt | Databases, remote protocols, and lakehouse snapshots remain separate work. Do not read arbitrary Parquet leaves as a lakehouse table. Intent: boundaries. |
| R17 | Adopt | Exclude executable serialization, macro execution, and browser-cache decoding. Shape: cut line. |
| R18 | Adopt, scaled | Keep independent fixtures, real UI checks, and docs/examples in each slice. Choose a few behavior tests; do not copy the entire suggested test matrix. Map: proof sequence. |
| R19 | Defer | A gzip wrapper follows demonstrated need and an expansion-limit proof. Arbitrary archives remain separate. Shape: later possibilities. |

## Proof status

Pro verified its source packet and artifacts and ran four language-level assertions. Codex repeated archive integrity and structured reference checks, inspected baseline code, and ran the installed Papa probe. Those checks support this proposal; they do not establish new reader support.

The first-turn parser tests passed: four tests in `apps/demo/src/parsers.test.ts`. UI source checks passed. Full repository and Sleuth results are recorded in [run.md](../run.md).

Real workbook/binary imports, Sheets exports, reader package builds, browser/CSP checks, responsiveness measurements, and the proposed end-to-end TSV proof remain **unrun**. They are implementation gates. No application behavior changed in this PR.
