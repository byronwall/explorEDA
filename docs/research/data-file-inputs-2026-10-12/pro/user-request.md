# Original request

Source: Byron's message in the Codex chat on October 12, 2026.

> Do the full process for me.  Specifically, I wnat to investigate the topic of what data formats are available and could we add support for?  Speciifcally, we have CSV.  We should add support for TSV, Parquet, Avro, and any other common formats in play.  My goal is to understand the full sutie of "common" and niche formats that are suppported in data analysis tools.  we should also consider what it takes to support XLSX ang Google Sheets.  We do not want to integrate Google Sheets via APIs so if it has an "on disk" format, that might work.  If not, we will do Sheets integration later when we add support for databases and server based integrations.
>
> So prompt Pro to do all this research on formats.  It shoudl then go into details about how best to add this support and integrate "input adapters" or something.
>
> Once the research is done, software-design-sleuth against all the source material, store the raw files, and then create a PR with the intent and shaping docs for review.

Invoked skills: `prepare-chatgpt-pro-repo-prompt` and `software-design-sleuth-full`, both from `/Users/byronwall/.agents/skills/`.
