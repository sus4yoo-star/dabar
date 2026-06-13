#!/usr/bin/env python3
"""
복음 전하기 도구 인용 구절(18절)의 다국어 본문(VERSES_EXT)을 생성한다.

각 언어의 공인/표준 역본에서 "절 번호"로 직접 추출한다(위치 인덱스 아님 →
역본별 절 합본/분할로 인한 어긋남이 없다). 모든 원본은 GitHub raw 로 접근.

출처(역본 / 저장소):
  ar Van Dyke                thiagobodruk/bible  json/ar_svd.json     (위치색인 JSON)
  hi Hindi 공개역 / bn Bengali / id Indonesian(TB계열)
                             godlytalias/Bible-Database  <Lang>/bible.json  (위치색인 JSON)
  es Reina-Valera 1909       seven1m/open-bibles  spa-rv1909.usfx.xml  (USFX)
  pt Almeida                 seven1m/open-bibles  por-almeida.usfx.xml (USFX)
  zh 和合本(CUV)             seven1m/open-bibles  chi-cuv.usfx.xml     (USFX)
  ru Synodal 1876            seven1m/open-bibles  rus-synodal.zefania.xml (Zefania)
  fr Ostervald               seven1m/open-bibles  fra-ostervald.osis.xml  (OSIS)
  ja 口語訳(1955)           seven1m/open-bibles  jpn-kougo.osis.xml      (OSIS)
  vi 1934(Cadman)            seven1m/open-bibles  vie-cadman.osis.xml     (OSIS)
  my Judson 1835 / ms Alkitab Berita Baik 1996 / sw Union(SUV)
                             Beblia/Holy-Bible-XML-Format  <Name>Bible.xml (Beblia XML)
  fa Persian Contemporary(Biblica) / ur Urdu Geo Version
                             wldeh/bible-api  <id>/books/<현지책명>/chapters/<c>/verses/<v>.json

검증: 같은 절에서 다른 언어 대비 20% 미만으로 짧으면 '잘림'으로 보고 누락(→영어 폴백).
사용: python3 scripts/build-verses-ext.py  → VERSES_EXT TS 블록을 표준출력으로.
"""
import json, re, sys, subprocess, urllib.request, urllib.parse

RAW = "https://raw.githubusercontent.com"
REFS = ["GEN 1:31","ISA 1:18","ISA 59:2","MRK 1:15","JHN 1:12","JHN 3:16","JHN 5:24",
 "JHN 10:10","JHN 14:6","ROM 3:23","ROM 5:8","ROM 6:23","ROM 10:9","ROM 10:13",
 "REV 3:20","2CO 5:17","1PE 3:18","2PE 3:18"]
# (osisBook, usfxBook, bnumber, tbIdx0, chap, verse)
META = {
 "GEN 1:31":("Gen","GEN",1,0,1,31),"ISA 1:18":("Isa","ISA",23,22,1,18),"ISA 59:2":("Isa","ISA",23,22,59,2),
 "MRK 1:15":("Mark","MRK",41,40,1,15),"JHN 1:12":("John","JHN",43,42,1,12),"JHN 3:16":("John","JHN",43,42,3,16),
 "JHN 5:24":("John","JHN",43,42,5,24),"JHN 10:10":("John","JHN",43,42,10,10),"JHN 14:6":("John","JHN",43,42,14,6),
 "ROM 3:23":("Rom","ROM",45,44,3,23),"ROM 5:8":("Rom","ROM",45,44,5,8),"ROM 6:23":("Rom","ROM",45,44,6,23),
 "ROM 10:9":("Rom","ROM",45,44,10,9),"ROM 10:13":("Rom","ROM",45,44,10,13),"REV 3:20":("Rev","REV",66,65,3,20),
 "2CO 5:17":("2Cor","2CO",47,46,5,17),"1PE 3:18":("1Pet","1PE",60,59,3,18),"2PE 3:18":("2Pet","2PE",61,60,3,18),
}
LANGS = ["ar","es","pt","ru","vi","zh","hi","bn","id","fr","ja","sw","fa","ur","my","ms"]

def fetch(url):
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read().decode("utf-8")

PUNCT_AFTER = re.compile(r"\s+([,.;:!?»…、。])")
PUNCT_BEFORE = re.compile(r"([«¿¡(])\s+")
def ws(s):
    s = re.sub(r"<[^>]+>", " ", s); s = re.sub(r"\s+", " ", s).strip()
    s = PUNCT_AFTER.sub(r"\1", s); s = PUNCT_BEFORE.sub(r"\1", s)
    return s

def osis(text):
    def get(m):
        oid = f"{m[0]}.{m[4]}.{m[5]}"
        for q in ('"', "'"):
            i = text.find(f"osisID={q}{oid}{q}")
            if i < 0: continue
            j = text.find(">", i)
            cands = [x for x in [text.find("<verse", j+1), text.find("</verse>", j+1)] if x > 0]
            return ws(text[j+1:min(cands)])
        raise KeyError(oid)
    return get

def usfx(text):
    def get(m):
        bk, c, v = m[1], str(m[4]), str(m[5])
        bi = text.find(f'<book id="{bk}">'); be = text.find("<book ", bi+1); be = be if be > 0 else len(text)
        seg = text[bi:be]
        cm = re.search(rf'<c id="{c}"\s*/>', seg); cstart = cm.end()
        cn = re.search(r'<c id="\d+"\s*/>', seg[cstart:]); cend = cstart + cn.start() if cn else len(seg)
        cseg = seg[cstart:cend]
        vm = re.search(rf'<v id="{v}"\s*/>', cseg); vstart = vm.end()
        vn = re.search(r'<v id="[^"]+"\s*/>|<ve\s*/>', cseg[vstart:])
        return ws(cseg[vstart:vstart + vn.start()] if vn else cseg[vstart:])
    return get

def zefania(text):
    def get(m):
        bn, c, v = m[2], m[4], m[5]
        bi = text.find(f'<BIBLEBOOK bnumber="{bn}"'); be = text.find("<BIBLEBOOK ", bi+1); be = be if be > 0 else len(text)
        seg = text[bi:be]
        ci = seg.find(f'<CHAPTER cnumber="{c}">'); ce = seg.find("<CHAPTER ", ci+1); ce = ce if ce > 0 else len(seg)
        mt = re.search(rf'<VERS vnumber="{v}">(.*?)</VERS>', seg[ci:ce], re.S)
        return ws(mt.group(1))
    return get

def beblia(text):  # <book number><chapter number><verse number>
    def get(m):
        bn, c, v = m[2], m[4], m[5]
        bi = text.find(f'<book number="{bn}">'); be = text.find('<book number="', bi+1); be = be if be > 0 else len(text)
        seg = text[bi:be]
        ci = seg.find(f'<chapter number="{c}">'); ce = seg.find('<chapter number="', ci+1); ce = ce if ce > 0 else len(seg)
        mt = re.search(rf'<verse number="{v}">(.*?)</verse>', seg[ci:ce], re.S)
        return ws(mt.group(1))
    return get

def tb(text):
    b = json.loads(text.lstrip("﻿"))
    return lambda m: ws(b[m[3]]["chapters"][m[4]-1][m[5]-1])
def gt(text):
    b = json.loads(text.lstrip("﻿"))["Book"]
    return lambda m: ws(b[m[3]]["Chapter"][m[4]-1]["Verse"][m[5]-1]["Verse"])

# --- wldeh(현지 책명 폴더) : fa, ur ---
_DIAC = re.compile(r"[ً-ْـٰ]")
def _norm(s): return _DIAC.sub("", s).replace("‌", "")
WLDEH_BOOKS = {
 "fa": {"Gen":"پیدایش","Isa":"اشعیا","Mark":"مرقس","John":"یوحنا","Rom":"رومیان",
        "Rev":"مکاشفه","2Cor":"دومقرنتیان","1Pet":"اولپطرس","2Pet":"دومپطرس"},
 "ur": {"Gen":"پیدایش","Isa":"یسعیاہ","Mark":"مرقس","John":"یوحنا","Rom":"رومیوں",
        "Rev":"مکاشفہ","2Cor":"۲-کرنتھیوں","1Pet":"۱-پطرس","2Pet":"۲-پطرس"},
}
def wldeh(ed, targets, clone="/tmp/wldeh"):
    out = subprocess.check_output(
        ["git", "-c", "core.quotepath=false", "ls-tree", "--name-only", "HEAD", "--", f"bibles/{ed}/books/"],
        cwd=clone).decode()
    folders = [l.split("/")[-1] for l in out.strip().split("\n") if l.strip()]
    nf = {_norm(f): f for f in folders}
    resolved = {}
    for bk, name in targets.items():
        n = _norm(name)
        resolved[bk] = nf.get(n) or next((f for k, f in nf.items() if n in k or k in n), None)
    def get(m):
        folder = resolved[m[0]]
        u = f"{RAW}/wldeh/bible-api/main/bibles/{ed}/books/{urllib.parse.quote(folder, safe='')}/chapters/{m[4]}/verses/{m[5]}.json"
        return ws(json.loads(fetch(u))["text"])
    return get

def build():
    g = {}
    g["ar"] = tb(fetch(f"{RAW}/thiagobodruk/bible/master/json/ar_svd.json"))
    g["hi"] = gt(fetch(f"{RAW}/godlytalias/Bible-Database/master/Hindi/bible.json"))
    g["bn"] = gt(fetch(f"{RAW}/godlytalias/Bible-Database/master/Bengali/bible.json"))
    g["id"] = gt(fetch(f"{RAW}/godlytalias/Bible-Database/master/Indonesian/bible.json"))
    g["es"] = usfx(fetch(f"{RAW}/seven1m/open-bibles/master/spa-rv1909.usfx.xml"))
    g["pt"] = usfx(fetch(f"{RAW}/seven1m/open-bibles/master/por-almeida.usfx.xml"))
    g["zh"] = usfx(fetch(f"{RAW}/seven1m/open-bibles/master/chi-cuv.usfx.xml"))
    g["ru"] = zefania(fetch(f"{RAW}/seven1m/open-bibles/master/rus-synodal.zefania.xml"))
    g["fr"] = osis(fetch(f"{RAW}/seven1m/open-bibles/master/fra-ostervald.osis.xml"))
    g["ja"] = osis(fetch(f"{RAW}/seven1m/open-bibles/master/jpn-kougo.osis.xml"))
    g["vi"] = osis(fetch(f"{RAW}/seven1m/open-bibles/master/vie-cadman.osis.xml"))
    B = "Beblia/Holy-Bible-XML-Format/master"
    g["my"] = beblia(fetch(f"{RAW}/{B}/BurmeseBible.xml"))        # Judson 1835
    g["ms"] = beblia(fetch(f"{RAW}/{B}/Malaysian1996Bible.xml"))  # Alkitab Berita Baik
    g["sw"] = beblia(fetch(f"{RAW}/{B}/SwahiliSUVBible.xml"))     # Union Version
    # fa/ur 는 wldeh 부분클론(/tmp/wldeh)이 있어야 함:
    #   git clone --filter=blob:none --no-checkout --depth 1 https://github.com/wldeh/bible-api /tmp/wldeh
    g["fa"] = wldeh("pes-opcb", WLDEH_BOOKS["fa"])
    g["ur"] = wldeh("ur-Aran-urdgvu", WLDEH_BOOKS["ur"])

    out = {}
    for key in REFS:
        m = META[key]; out[key] = {}
        for l in LANGS:
            t = g[l](m)
            if l in ("zh", "ja"): t = re.sub(r"\s+", "", t)
            out[key][l] = t
    for key in REFS:  # 잘림 방어
        lens = {l: len(out[key][l]) for l in out[key]}; mx = max(lens.values())
        for l in list(out[key]):
            if l not in ("zh", "ja") and mx > 40 and lens[l] < 0.20 * mx:
                print(f"  drop(trunc) {key}/{l}", file=sys.stderr); del out[key][l]
    return out

def emit(out):
    esc = lambda s: s.replace("\\", "\\\\").replace('"', '\\"')
    print("const VERSES_EXT: Record<string, Record<string, string>> = {")
    for key in REFS:
        parts = ", ".join(f'{l}: "{esc(out[key][l])}"' for l in LANGS if l in out[key])
        print(f'  "{key}": {{ {parts} }},')
    print("};")

if __name__ == "__main__":
    emit(build())
