Notebook investigations for explorEDA
====================================

Start with exploreda-notebook-examples.html. It contains all report text and
embedded screenshots, and works offline. The PDF contains the same report
content in a paginated reading format. Source links remain clickable.

exploreda-source-index.json contains structured research evidence and the
reproduction requirements for each example. assets/screenshots contains the
displayed captures; assets/originals preserves their original captured frames.
Only geometric cropping and JPEG encoding were used. No chart, calculation,
label, or page content was generated or redrawn.

source contains the authored report inputs and a Python report renderer.
Regeneration requires Python, Pillow, ReportLab, and DejaVu fonts. Run
python3 source/build_report.py from this directory. The renderer can use the
supplied originals, so all of its report inputs are included in this package.

Inspected 10 October 2026. Availability and current source-data vintages may
change. Compatibility with explorEDA is a hypothesis based on the product
capabilities supplied in the request; the app was not inspected.

Screenshots depict their credited source pages. Linked upstream datasets are
not repackaged here. The original source pages and data licenses govern reuse.
