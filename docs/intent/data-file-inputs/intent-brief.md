---
title: "Local data file inputs — intent brief"
slug: "data-file-inputs"
phase: intent
status: draft
last_updated: "2026-10-12"
---

# Local data file inputs

## My read

Byron wants explorEDA to open more of the files people use for data analysis. CSV is the starting point. TSV, Parquet, Avro, and XLSX are explicit targets. The research must also show the wider range of common and specialist formats. It must explain which formats fit this application and what each addition would require.

The immediate outcome is a reviewed direction, supported by preserved research. This initiative does not implement readers yet. The proposed capability serves someone who has a local file and wants to inspect its records, filter values, and save an analysis. They should not need a database connection or a separate conversion tool for every routine input.

“Input adapters” is a possible design, not a requirement for a plugin system. The important result is a clear path from file selection to trustworthy table data. The same supported files should work at initial import and when adding a source to an existing analysis.

## What matters most

The landscape needs more detail than file extensions. A format can contain tables, nested records, workbook sheets, multidimensional arrays, or a complete database. A tool listing a reader does not prove that a browser can load every variant. Compression, field types, optional libraries, and producer conventions can change the answer.

The [70-entry catalog](raw/2026-10-12-pro/exploreda-data-file-inputs-research/format-catalog.csv) covers these families:

- Text tables: CSV, TSV, other delimiters, fixed-width files, JSON, JSON Lines, XML, HTML tables, and logs.
- Workbooks: XLSX, XLS, XLSB, XLSM, ODS, and related spreadsheet exports.
- Analytical formats: Parquet, Avro, Arrow IPC, Feather, and ORC.
- Statistical and scientific formats: SAS, SPSS, Stata, R objects, HDF5, NetCDF, Zarr, NumPy, MATLAB, and FITS.
- Spatial and structured data: GeoJSON, Shapefile, GeoPackage, KML, MessagePack, BSON, and Protobuf.
- Containers and services: SQLite, DuckDB files, lakehouse tables, compression wrappers, archives, and Google Sheets.

These entries form a decision catalog, not a promise to implement all 70. “Common” means established support across relevant analysis tools and workflows. The research does not measure market share. Specialist formats remain useful to understand even when conversion is the right route.

Correct values matter more than opening the largest number of extensions. A successful import must preserve records, field names, missing values, and supported value meaning. It must not silently round identifiers, collapse time precision, or multiply rows when flattening nested data. An unsupported value needs a clear explanation or a deliberate, documented conversion.

Workbook support requires a choice of data. A sheet can contain titles, several tables, merged cells, formulas, and hidden content. The proposed flow selects one worksheet, one rectangular range, and a header row. It imports stored values. It does not turn explorEDA into a spreadsheet editor or formula engine.

## Boundaries

Google Sheets fits through manually downloaded snapshots. Google documents file downloads and lists XLSX, ODS, CSV, and TSV exports. There is no verified portable native Sheets cell format in this research. A desktop pointer and browser-managed offline state are not supported table inputs. The recommendation is therefore to import exported files. Live Sheets access, OAuth, APIs, public-link fetching, and refresh belong to later connector work.

Local import remains distinct from the [database adapter](../database-adapters/shape-brief.md) and [columnar transport](../columnar-data-transport/shape-brief.md) proposals. Those proposals do not require a local file reader to introduce SQL, network transport, or a new resident data model. A local database file still needs database semantics; its presence on disk does not make it a simple table file.

Fresh imports should retain the current summary and rows starting view. Existing analyses should retain their tabs, filters, and saved layouts. Failed or cancelled reads should leave the current analysis intact. Reader libraries should load only when needed.

## What seems settled

Start with a small shared reader path in the demo. Keep the library's existing row and source-table interfaces. Reuse Papa Parse for explicit TSV. Add a narrow JSON Lines option. Shape XLSX around one selected table. Prove flat, complete Parquet files and Avro object container files before promising their supported types and codecs.

Avro remains a planned feasibility proof because Byron explicitly named it. New evidence of demand is unnecessary. Arrow/Feather, ODS, XLSB, and gzip can follow if their value justifies another reader or format branch. The wider catalog should explain conversion routes and limits without making those formats active scope.

## Next step after confirmation

Review the [shape](shape-brief.md), then authorize an implementation plan if the direction fits. Its first proof must carry TSV through real exploration and save/reload. Reader choice alone cannot establish value fidelity. The [recommendation review](evidence/recommendation-review.md) records the research checks and retained uncertainties. The initiative remains planned.
