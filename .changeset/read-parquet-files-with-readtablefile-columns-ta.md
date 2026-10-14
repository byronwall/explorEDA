---
"exploreda": minor
---

Read Parquet files with `readTableFile`. Columns take the types the file's schema declares; timestamps keep their stored precision, decimals keep their exact digits, int64 values past 2^53 stay text, and lists, maps, and structs become JSON text. Snappy, gzip, zstd, Brotli, and LZ4 pages are read, and the reader loads only when a Parquet file is read. The summary table now shows date-time ranges to the minute and truncates long range labels instead of overlapping them.
