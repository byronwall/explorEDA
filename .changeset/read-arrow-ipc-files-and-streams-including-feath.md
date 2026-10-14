---
"exploreda": minor
---

Read Arrow IPC files and streams, including Feather V2 (`.arrow`, `.arrows`, `.feather`, `.ipc`), with `readTableFile`. Columns follow the same exact rules as Parquet, LZ4 and zstd buffers are read, and the Arrow reader loads only when such a file is read.
