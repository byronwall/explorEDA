from __future__ import annotations

import base64
import html
import json
import re
import shutil
import zipfile
from pathlib import Path

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, Image as RLImage, KeepTogether, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

HERE = Path(__file__).resolve().parent
OUT = HERE.parent
WORK = OUT.parent.parent
SHOTS = WORK / "research" / "screenshots"
ASSETS = OUT / "assets"
ORIGINALS = ASSETS / "originals"
DISPLAY = ASSETS / "screenshots"
for d in (ASSETS, ORIGINALS, DISPLAY):
    d.mkdir(parents=True, exist_ok=True)

S = json.loads((HERE / "synthesis.json").read_text())
cases = []
for name in ("penguins.json", "bratenahl.json", "forecast.json", "adventure.json", "correlation.json", "spatial.json", "date-patterns.json", "external-cases.json"):
    value = json.loads((HERE / name).read_text())
    cases.extend(value if isinstance(value, list) else [value])

ALIASES = {
    "forecast-performance": "forecast", "forecast-difference": "forecast",
    "whats-different": "forecast", "timeseries-forecast": "forecast",
    "analysis-adventure": "adventure", "what-caused-this": "adventure",
    "correlation-over-time": "correlation", "spatial-autocorrelation": "spatial",
    "local-spatial-autocorrelation": "spatial", "palmer-penguins": "obs-penguins",
    "penguins": "obs-penguins", "plot-exploration-penguins": "obs-penguins",
    "bratenahl-stops-tickets": "bratenahl",
    "seattle-cycling": "seattle", "film-dialogue": "pudding",
}
for c in cases:
    c["id"] = ALIASES.get(c["id"], c["id"])
ORDER = ["obs-penguins", "forecast", "adventure", "date-patterns", "correlation", "bratenahl", "spatial", "seattle", "silge-penguins", "owid-decoupling", "pudding"]
cases.sort(key=lambda c: ORDER.index(c["id"]) if c["id"] in ORDER else 99)
assert len(cases) == 11, [c["id"] for c in cases]
assert len({c["id"] for c in cases}) == len(cases)

# These are geometric crops of captured pages. No chart values, labels, colors,
# or page content are reconstructed or altered. Originals remain in the ZIP.
CROPS = {
    "seattle-01.jpg": (160, 250, 865, 1040),
    "seattle-02.jpg": (160, 0, 865, 713),
    "pudding-01.jpg": (0, 135, 980, 1030),
}
DISPLAY_CAPTIONS = {
    "seattle-01.jpg": "The opening data examination: Python aggregation cells, weekly directional totals and prose introducing a moving-average comparison in one reading column.",
    "seattle-02.jpg": "A later dependent step: the correction formula, residual-variability output, corrected traffic chart and interpretation introducing the next rolling calculation.",
    "pudding-01.jpg": "The Disney comparison: gender word-share bars followed by interpretation and the qualification that screenplays do not exactly transcribe the completed films.",
}
for c in cases:
    for shot in c["screenshots"]:
        name = shot.get("file") or Path(shot["path"]).name
        shot["file"] = name
        if name in DISPLAY_CAPTIONS:
            shot["caption"] = DISPLAY_CAPTIONS[name]
        source = SHOTS / name
        if not source.exists():
            source = ORIGINALS / name
        assert source.exists(), source
        if source.resolve() != (ORIGINALS / name).resolve():
            shutil.copy2(source, ORIGINALS / name)
        im = Image.open(source).convert("RGB")
        if name in CROPS:
            im = im.crop(CROPS[name])
            shot["crop_note"] = "Geometric excerpt of the captured page; the uncropped capture is included in the ZIP."
        elif im.size == (1348, 926):
            im = im.crop((128, 0, 1190, 926))
            shot["crop_note"] = "Browser side margins cropped; page content is unchanged."
        im.save(DISPLAY / name, quality=94, optimize=True)
        shot["asset"] = "assets/screenshots/" + name
        shot["original_asset"] = "assets/originals/" + name

used_images={s["file"] for c in cases for s in c["screenshots"]}
for folder in (ORIGINALS,DISPLAY):
    for p in folder.glob("*.jpg"):
        if p.name not in used_images:
            p.unlink()


def inline(text, pdf=False):
    text = str(text)
    if pdf:
        text = text.translate(str.maketrans({"–":"-", "—":" - ", "‑":"-", "’":"'", "‘":"'", "“":"\"", "”":"\"", "−":"-", "→":" > ", "•":" / "}))
    text = html.escape(text, quote=True)
    def link(m):
        label, url = m.group(1), m.group(2)
        return f'<link href="{url}" color="#176C8A">{label}</link>' if pdf else f'<a href="{url}" target="_blank" rel="noopener">{label}</a>'
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link, text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'`([^`]+)`', r'<font name="DejaVuMono">\1</font>' if pdf else r'<code>\1</code>', text)
    return text


def linktext(label, url):
    return f"[{label}]({url})"


def paragraphs(value):
    if isinstance(value, list):
        return value
    return [p.strip() for p in str(value).split("\n\n") if p.strip()]


HEADERS = ["Element", "Inputs", "Calculation or configuration", "Visible result", "Interaction", "Dependency"]
DATA_LABELS = [("origin","Original source"), ("grain","Row grain and scope"), ("fields","Fields and units")]
FIT_LABELS = [("minimum","Smallest faithful version"), ("compatible","Likely fit, subject to verification"), ("investigate","Capabilities to investigate"), ("roundtrip","Graphical edits that should update text"), ("scope","Control scope"), ("lesson","Execution and editing lesson")]

css = r"""
:root{--ink:#1d2d38;--muted:#526773;--accent:#176c8a;--rule:#d8e1e7;--paper:#fff;--pale:#f2f7fa}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#edf2f5;color:var(--ink);font:17px/1.62 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
main{max-width:1080px;margin:36px auto;background:var(--paper);padding:60px 64px;box-shadow:0 3px 24px #1837470c}
h1{font-size:46px;line-height:1.08;letter-spacing:-1.5px;max-width:790px;margin:10px 0 22px}h2{font-size:29px;line-height:1.2;margin:38px 0 15px;letter-spacing:-.4px}h3{font-size:20px;line-height:1.3;margin:28px 0 12px}h4{font-size:17px;margin:20px 0 5px}
p{margin:0 0 15px}.eyebrow{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--accent);font-weight:750}.subtitle{font-size:21px;color:var(--muted);line-height:1.4}.small{font-size:13px;color:var(--muted)}.lead{font-size:21px;line-height:1.5}
a{color:var(--accent);text-underline-offset:3px}a:hover{color:#0d455b}ul,ol{padding-left:25px;margin:12px 0 23px}li{padding-left:4px;margin:8px 0}strong,b{font-weight:680}code{font:0.9em ui-monospace,SFMono-Regular,Consolas,monospace;background:#f3f5f7;padding:1px 4px;border-radius:3px;overflow-wrap:anywhere}
.note{background:var(--pale);border-left:4px solid var(--accent);padding:20px 24px;margin:24px 0}.section-rule{border:0;border-top:1px solid var(--rule);margin:38px 0}.toc{list-style:none;padding:0}.toc li{margin:7px 0;padding:0}.toc a{text-decoration:none}.toc .n{display:inline-block;width:31px;color:#758792;font-size:13px}
.case{margin-top:60px;padding-top:30px;border-top:2px solid var(--rule)}figure{margin:0 0 30px;width:100%}figure img{display:block;width:100%;height:auto;border:1px solid var(--rule);background:white}figcaption{font-size:14px;line-height:1.5;color:var(--muted);margin-top:11px}figcaption a{font-weight:650}.case-title{margin-top:22px}.pattern{font-size:13px;font-weight:700;letter-spacing:.4px;color:var(--accent);margin:18px 0}
.table-wrap{width:100%;overflow:auto;margin:20px 0 30px}table{border-collapse:collapse;table-layout:fixed;width:100%;font-size:13px;line-height:1.45}th{text-align:left;background:#e9f1f6;color:#183e50;font-weight:700;padding:11px 9px;border:1px solid #cfdee7;vertical-align:top}td{padding:11px 9px;border:1px solid var(--rule);vertical-align:top;overflow-wrap:anywhere}tr:nth-child(even) td{background:#f8fafb}.elements th:nth-child(1){width:17%}.elements th:nth-child(2){width:15%}.elements th:nth-child(3){width:25%}.elements th:nth-child(4){width:15%}.elements th:nth-child(5){width:14%}.elements th:nth-child(6){width:14%}
.comparison{font-size:12px}.comparison th:first-child{width:20%}.recommendation{border-top:1px solid var(--rule);padding-top:18px;margin-top:27px}.recommendation h3{margin-top:10px}.foot{margin-top:60px;padding-top:25px;border-top:1px solid var(--rule);font-size:13px;color:var(--muted)}
@media(max-width:800px){main{margin:0;padding:32px 22px}h1{font-size:34px}.lead{font-size:19px}.table-wrap table{min-width:760px}.case{margin-top:40px}}
@media print{body{background:white}main{box-shadow:none;margin:0;max-width:none;padding:0}a{color:#174e66}.case{break-before:page}figure,th,td{break-inside:avoid}.toc{columns:1}h2,h3,h4{break-after:avoid}}
"""

H = ["<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>", f"<title>{html.escape(S['title'])}</title><style>{css}</style></head><body><main>"]
def hp(value, cls=""):
    for p in paragraphs(value):
        H.append(f'<p class="{cls}">{inline(p)}</p>')
def hl(items, ordered=False):
    tag="ol" if ordered else "ul"
    H.append(f"<{tag}>")
    for item in items: H.append(f"<li>{inline(item)}</li>")
    H.append(f"</{tag}>")
def ht(headers, rows, cls="elements"):
    H.append(f'<div class="table-wrap"><table class="{cls}"><thead><tr>')
    H.extend(f"<th>{inline(x)}</th>" for x in headers)
    H.append("</tr></thead><tbody>")
    for row in rows:
        H.append("<tr>"+"".join(f"<td>{inline(x)}</td>" for x in row)+"</tr>")
    H.append("</tbody></table></div>")
H.append(f"<div class='eyebrow'>Research report · {S['date']}</div><h1>{S['title']}</h1>")
hp(S["subtitle"], "subtitle"); hp(S["lead"], "lead")
H.append("<div class='note'><b>Recommended first reproductions</b>")
hl([r["role"]+": "+r["title"] for r in S["recommendations"]]); H.append("</div>")
H.append("<h2>Selection and evidence</h2>"); hl(S["selection"])
H.append("<h3>How to read the evidence</h3>"); hl(S["evidence"])
H.append("<h3>Screened out</h3>"); hl(S["excluded"])
H.append("<h3>Reading order</h3><ol class='toc'>")
for i,c in enumerate(cases,1): H.append(f'<li><a href="#{c["id"]}"><span class="n">{i:02d}</span>{html.escape(c["title"])}</a></li>')
H.append("</ol>")

for i,c in enumerate(cases,1):
    H.append(f'<section class="case" id="{c["id"]}">')
    for j,shot in enumerate(c["screenshots"],1):
        raw=(DISPLAY/shot["file"]).read_bytes()
        b64=base64.b64encode(raw).decode()
        caption=shot.get("caption",shot.get("alt","Captured analysis page."))
        H.append(f'<figure><img src="data:image/jpeg;base64,{b64}" alt="{html.escape(caption,quote=True)}" loading="lazy"><figcaption><a href="{html.escape(c["url"],quote=True)}">{i:02d}. {html.escape(c["title"])}</a> · Screenshot {j}. {inline(caption)} <span class="small">{inline(shot.get("crop_note",""))}</span></figcaption></figure>')
        if j == 1:
            H.append(f'<div class="pattern">{inline(c.get("platform",""))} · {inline(c.get("pattern",""))}</div>')
            H.append('<h2 class="case-title">What the analysis does</h2>'); hp(c["story"]); hp("**Role of prose.** "+c["prose_role"])
    H.append("<h3>Source data and calculations</h3>")
    d=c["data"]
    for key,label in DATA_LABELS:
        hp("**"+label+".** "+d[key])
    hl([linktext(l["label"],l["url"]) for l in d["links"]])
    H.append("<h4>Calculations, dependencies and stated limits</h4>"); hl(d["calculations"])
    hp("**What feeds later results.** "+d["dependencies"])
    hp("**Reproduction sufficiency.** "+d["reproducibility"])
    if d.get("caveats"): hp("**Limits and uncertainty.** "+d["caveats"])
    H.append("<h3>Elements needed to reproduce it</h3>"); hl(c["sequence"], True); ht(HEADERS,c["elements"])
    if c.get("essential_optional"): hp(c["essential_optional"])
    H.append("<h3>Fit for explorEDA</h3>")
    for key,label in FIT_LABELS: hp("**"+label+".** "+c["fit"][key])
    H.append("</section>")

COMP_HEADERS=["Example", "Analytical pattern", "Data availability", "Calculation transparency", "Interaction complexity", "Effort"]
comp=[]
for c in cases:
    x=c["comparison"]
    comp.append([c["title"],c.get("pattern",""),x["data_availability"],x["calculation_transparency"],x["interaction_complexity"],x["reproduction_effort"]])
H.append('<section class="case" id="comparison"><h2>Comparison</h2>'); ht(COMP_HEADERS,comp,"comparison"); hp(S["effort_note"],"small")
H.append("<h2>Three recommended starting examples</h2>")
for r in S["recommendations"]:
    H.append(f'<div class="recommendation"><div class="eyebrow">{r["role"]}</div><h3>{r["title"]}</h3>')
    hp("**Faithful scope.** "+r["scope"]); hp("**Distinct capability tested.** "+r["test"]); hp(r["reason"]); H.append("</div>")
H.append("<h2>Recurring notebook patterns worth supporting</h2>")
for r in S["recurring"]: hp("**"+r["pattern"]+".** "+r["meaning"])
H.append("<h2>Unusual features specific to individual examples</h2>"); hl(S["unusual"])
H.append("<div class='foot'>Prepared for explorEDA. Inspected 10 October 2026. Screenshots retain the source pages' content; accompanying reproduction judgments are analysis of the supplied product description. This HTML includes its images and works offline. The ZIP also contains uncropped captures and the structured source index.</div></section></main></body></html>")
(OUT/"exploreda-notebook-examples.html").write_text("\n".join(H),encoding="utf-8")

# PDF: one reading column with large captured figures and repeated table heads.
FONT_ROOT=Path("/usr/share/fonts/truetype/dejavu")
for name,file in [("DejaVu","DejaVuSans.ttf"),("DejaVuBold","DejaVuSans-Bold.ttf"),("DejaVuItalic","DejaVuSans.ttf"),("DejaVuMono","DejaVuSansMono.ttf")]:
    pdfmetrics.registerFont(TTFont(name,str(FONT_ROOT/file)))
pdfmetrics.registerFontFamily("DejaVu",normal="DejaVu",bold="DejaVuBold",italic="DejaVuItalic",boldItalic="DejaVuBold")
styles={}
styles["body"]=ParagraphStyle("body",fontName="DejaVu",fontSize=9.4,leading=13.6,textColor=colors.HexColor("#1d2d38"),spaceAfter=7)
styles["lead"]=ParagraphStyle("lead",parent=styles["body"],fontSize=12,leading=18,spaceAfter=14)
styles["h1"]=ParagraphStyle("h1",parent=styles["body"],fontName="DejaVuBold",fontSize=31,leading=35,spaceAfter=18)
styles["h2"]=ParagraphStyle("h2",parent=styles["body"],fontName="DejaVuBold",fontSize=17,leading=22,spaceBefore=17,spaceAfter=10,keepWithNext=True)
styles["h3"]=ParagraphStyle("h3",parent=styles["body"],fontName="DejaVuBold",fontSize=12.4,leading=17,spaceBefore=14,spaceAfter=8,keepWithNext=True)
styles["h4"]=ParagraphStyle("h4",parent=styles["body"],fontName="DejaVuBold",fontSize=10.2,leading=14,spaceBefore=9,spaceAfter=6,keepWithNext=True)
styles["small"]=ParagraphStyle("small",parent=styles["body"],fontSize=7.8,leading=11,textColor=colors.HexColor("#526773"),spaceAfter=8)
styles["caption"]=ParagraphStyle("caption",parent=styles["small"],fontSize=8.1,leading=11.5,spaceBefore=7,spaceAfter=15)
styles["eyebrow"]=ParagraphStyle("eyebrow",parent=styles["small"],fontName="DejaVuBold",fontSize=8.2,leading=12,textColor=colors.HexColor("#176c8a"),spaceAfter=9)
styles["cell"]=ParagraphStyle("cell",parent=styles["body"],fontSize=7.2,leading=9.6,spaceAfter=0)
styles["cellhead"]=ParagraphStyle("cellhead",parent=styles["cell"],fontName="DejaVuBold",textColor=colors.HexColor("#183e50"))

page_w,page_h=A4
margin=39
width=page_w-2*margin
height=page_h-82
class ReportDoc(BaseDocTemplate):
    def afterFlowable(self,flowable):
        if isinstance(flowable,Paragraph) and getattr(flowable,"_bookmarkName",None):
            self.canv.bookmarkPage(flowable._bookmarkName)
            self.canv.addOutlineEntry(getattr(flowable,"_bookmarkTitle",flowable.getPlainText()),flowable._bookmarkName,level=0,closed=False)
def footer(canvas,doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#d8e1e7"));canvas.line(margin,32,page_w-margin,32)
    canvas.setFont("DejaVu",7.2);canvas.setFillColor(colors.HexColor("#526773"))
    canvas.drawString(margin,20,"explorEDA / Notebook investigations / 10 October 2026")
    canvas.drawRightString(page_w-margin,20,str(doc.page))
    canvas.restoreState()
doc=ReportDoc(str(OUT/"exploreda-notebook-examples.pdf"),pagesize=A4,rightMargin=margin,leftMargin=margin,topMargin=36,bottomMargin=42,title=S["title"],author="Research for explorEDA",allowSplitting=1)
doc.addPageTemplates(PageTemplate(id="main",frames=[Frame(margin,42,width,height,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPage=footer))
F=[]
def pp(value,style="body"):
    for p in paragraphs(value): F.append(Paragraph(inline(p,True),styles[style]))
def ph(value,level=2,bookmark=None,bookmark_title=None):
    p=Paragraph(inline(value,True),styles["h"+str(level)])
    if bookmark:
        p._bookmarkName=bookmark
        p._bookmarkTitle=bookmark_title or value
    F.append(p)
def pl(items,ordered=False):
    for n,item in enumerate(items,1):
        prefix=(str(n)+". ") if ordered else "- "
        pp(prefix+item)
def pt(headers,rows):
    data=[[Paragraph(inline(x,True),styles["cellhead"]) for x in headers]]
    data += [[Paragraph(inline(x,True),styles["cell"]) for x in row] for row in rows]
    weights=[.17,.15,.25,.15,.14,.14]
    t=Table(data,colWidths=[width*w for w in weights],repeatRows=1,hAlign="LEFT")
    t.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"TOP"),("BACKGROUND",(0,0),(-1,0),colors.HexColor("#e9f1f6")),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,colors.HexColor("#f8fafb")]),
        ("GRID",(0,0),(-1,-1),.35,colors.HexColor("#d8e1e7")),
        ("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
    ]))
    F.append(t);F.append(Spacer(1,12))
def figure(c,i,shot,j):
    path=DISPLAY/shot["file"]
    w,h=Image.open(path).size
    scale=min(width/w,625/h)
    fig=RLImage(str(path),width=w*scale,height=h*scale)
    fig.hAlign="CENTER"
    cap=f"**{i:02d}. {c['title']}** - Screenshot {j}. {shot.get('caption',shot.get('alt','Captured analysis page.'))} "
    cap+=linktext("Direct source",c["url"])
    if shot.get("crop_note"):cap+=". "+shot["crop_note"]
    F.append(KeepTogether([fig,Paragraph(inline(cap,True),styles["caption"])]))

pp("RESEARCH REPORT / "+S["date"],"eyebrow");ph(S["title"],1)
pp(S["subtitle"],"lead");pp(S["lead"],"lead")
ph("Recommended first reproductions",3);pl([r["role"]+": "+r["title"] for r in S["recommendations"]])
ph("Selection and evidence",2);pl(S["selection"])
ph("How to read the evidence",3);pl(S["evidence"])
ph("Screened out",3);pl(S["excluded"])
ph("Reading order",3);pl([c["title"] for c in cases],True)
for i,c in enumerate(cases,1):
    F.append(PageBreak())
    tall_sequence=c['id'] in ('seattle','silge-penguins','owid-decoupling')
    for j,shot in enumerate(c["screenshots"],1):
        figure(c,i,shot,j)
        if j == 1 and not tall_sequence:
            pp(c.get("platform","")+" / "+c.get("pattern",""),"eyebrow")
            ph("What the analysis does",2,bookmark=c["id"],bookmark_title=f"{i:02d}. {c['title']}");pp(c["story"]);pp("**Role of prose.** "+c["prose_role"])
    if tall_sequence:
        pp(c.get("platform","")+" / "+c.get("pattern",""),"eyebrow")
        ph("What the analysis does",2,bookmark=c["id"],bookmark_title=f"{i:02d}. {c['title']}");pp(c["story"]);pp("**Role of prose.** "+c["prose_role"])
    ph("Source data and calculations",3);d=c["data"]
    for key,label in DATA_LABELS:pp("**"+label+".** "+d[key])
    pl([linktext(l["label"],l["url"]) for l in d["links"]])
    ph("Calculations, dependencies and stated limits",4);pl(d["calculations"])
    pp("**What feeds later results.** "+d["dependencies"])
    pp("**Reproduction sufficiency.** "+d["reproducibility"])
    if d.get("caveats"):pp("**Limits and uncertainty.** "+d["caveats"])
    ph("Elements needed to reproduce it",3);pl(c["sequence"],True);pt(HEADERS,c["elements"])
    if c.get("essential_optional"):pp(c["essential_optional"])
    ph("Fit for explorEDA",3)
    for key,label in FIT_LABELS:pp("**"+label+".** "+c["fit"][key])
F.append(PageBreak());ph("Comparison",2,bookmark="comparison");pt(COMP_HEADERS,comp);pp(S["effort_note"],"small")
ph("Three recommended starting examples",2)
for r in S["recommendations"]:
    pp(r["role"].upper(),"eyebrow");ph(r["title"],3)
    pp("**Faithful scope.** "+r["scope"]);pp("**Distinct capability tested.** "+r["test"]);pp(r["reason"])
ph("Recurring notebook patterns worth supporting",2)
for r in S["recurring"]:pp("**"+r["pattern"]+".** "+r["meaning"])
ph("Unusual features specific to individual examples",2);pl(S["unusual"])
doc.build(F)

manifest={"title":S["title"],"inspected_date":"2026-10-10","methodology":S["evidence"],"examples":cases,"recommendations":S["recommendations"]}
(OUT/"exploreda-source-index.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
readme="""Notebook investigations for explorEDA
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
"""
(OUT/"README.txt").write_text(readme,encoding="utf-8")
zip_path=OUT.parent/"exploreda-notebook-research.zip"
with zipfile.ZipFile(zip_path,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=7) as z:
    for p in sorted(OUT.rglob("*")):
        if p.is_file() and "__pycache__" not in p.parts:
            z.write(p,Path("exploreda-notebook-research")/p.relative_to(OUT))
print(json.dumps({"pdf":str(OUT/"exploreda-notebook-examples.pdf"),"html":str(OUT/"exploreda-notebook-examples.html"),"zip":str(zip_path),"cases":[c["id"] for c in cases],"images":sum(len(c["screenshots"]) for c in cases)},indent=2))
