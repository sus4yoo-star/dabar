#!/usr/bin/env python3
"""
복음 전하기 도구 인용 구절(18절)의 다국어 본문(VERSES_EXT)을 생성한다.

각 언어의 공인/표준 공개(public-domain) 역본에서 "절 번호"로 직접 추출한다.
(위치 인덱스가 아니라 절 번호 기반이라 역본별 절 합본/분할로 인한 어긋남이 없다.)

출처(모두 GitHub raw, 공개 도메인/자유 라이선스):
  ar  Smith & Van Dyke           thiagobodruk/bible  json/ar_svd.json   (위치색인)
  hi  Hindi(공개역)              godlytalias/Bible-Database Hindi/bible.json (위치색인)
  bn  Bengali(공개역)            godlytalias/Bible-Database Bengali/bible.json
  id  Indonesian(TB계열)         godlytalias/Bible-Database Indonesian/bible.json
  es  Reina-Valera 1909          seven1m/open-bibles spa-rv1909.usfx.xml
  pt  Almeida                    seven1m/open-bibles por-almeida.usfx.xml
  zh  和合本(CUV)                seven1m/open-bibles chi-cuv.usfx.xml
  ru  Synodal 1876               seven1m/open-bibles rus-synodal.zefania.xml
  fr  Ostervald                  seven1m/open-bibles fra-ostervald.osis.xml
  ja  口語訳(1955)               seven1m/open-bibles jpn-kougo.osis.xml
  vi  1934(Cadman)               seven1m/open-bibles vie-cadman.osis.xml
  sw  Neno                       wldeh/bible-api  swh-onen (절 단위 JSON)

검증: 같은 절에서 다른 언어 대비 35% 미만으로 짧으면 '잘림'으로 보고 누락(→영어 폴백).
미수록(영어 폴백): fa, ur, my, ms — 신뢰할 공개 단일파일 출처 확보 후 추가 예정.

사용: python3 scripts/build-verses-ext.py  → VERSES_EXT TS 블록을 표준출력으로.
네트워크가 GitHub raw 로 열려 있어야 한다(원본 파일은 로컬에 받아두고 경로만 바꿔도 됨).
"""
import json, re, sys, urllib.request

REFS = ["GEN 1:31","ISA 1:18","ISA 59:2","MRK 1:15","JHN 1:12","JHN 3:16","JHN 5:24",
 "JHN 10:10","JHN 14:6","ROM 3:23","ROM 5:8","ROM 6:23","ROM 10:9","ROM 10:13",
 "REV 3:20","2CO 5:17","1PE 3:18","2PE 3:18"]
# (osisBook, usfxBook, zefBnumber, tbIdx0, chap, verse)
META = {
 "GEN 1:31":("Gen","GEN",1,0,1,31),"ISA 1:18":("Isa","ISA",23,22,1,18),"ISA 59:2":("Isa","ISA",23,22,59,2),
 "MRK 1:15":("Mark","MRK",41,40,1,15),"JHN 1:12":("John","JHN",43,42,1,12),"JHN 3:16":("John","JHN",43,42,3,16),
 "JHN 5:24":("John","JHN",43,42,5,24),"JHN 10:10":("John","JHN",43,42,10,10),"JHN 14:6":("John","JHN",43,42,14,6),
 "ROM 3:23":("Rom","ROM",45,44,3,23),"ROM 5:8":("Rom","ROM",45,44,5,8),"ROM 6:23":("Rom","ROM",45,44,6,23),
 "ROM 10:9":("Rom","ROM",45,44,10,9),"ROM 10:13":("Rom","ROM",45,44,10,13),"REV 3:20":("Rev","REV",66,65,3,20),
 "2CO 5:17":("2Cor","2CO",47,46,5,17),"1PE 3:18":("1Pet","1PE",60,59,3,18),"2PE 3:18":("2Pet","2PE",61,60,3,18),
}
RAW = "https://raw.githubusercontent.com"
FILES = {
 "ar": f"{RAW}/thiagobodruk/bible/master/json/ar_svd.json",
 "hi": f"{RAW}/godlytalias/Bible-Database/master/Hindi/bible.json",
 "bn": f"{RAW}/godlytalias/Bible-Database/master/Bengali/bible.json",
 "id": f"{RAW}/godlytalias/Bible-Database/master/Indonesian/bible.json",
 "es": f"{RAW}/seven1m/open-bibles/master/spa-rv1909.usfx.xml",
 "pt": f"{RAW}/seven1m/open-bibles/master/por-almeida.usfx.xml",
 "zh": f"{RAW}/seven1m/open-bibles/master/chi-cuv.usfx.xml",
 "ru": f"{RAW}/seven1m/open-bibles/master/rus-synodal.zefania.xml",
 "fr": f"{RAW}/seven1m/open-bibles/master/fra-ostervald.osis.xml",
 "ja": f"{RAW}/seven1m/open-bibles/master/jpn-kougo.osis.xml",
 "vi": f"{RAW}/seven1m/open-bibles/master/vie-cadman.osis.xml",
}
SW_BOOK = {"Gen":"mwanzo","Isa":"isaya","Mark":"marko","John":"yohana","Rom":"warumi",
           "Rev":"ufunuo","2Cor":"2wakorintho","1Pet":"1petro","2Pet":"2petro"}
LANGS = ["ar","es","pt","ru","vi","zh","hi","bn","id","fr","ja","sw"]

def fetch(url):
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read().decode("utf-8")

PUNCT_AFTER = re.compile(r"\s+([,.;:!?»…、。])")
PUNCT_BEFORE = re.compile(r"([«¿¡(])\s+")
def ws(s):
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    s = PUNCT_AFTER.sub(r"\1", s)
    s = PUNCT_BEFORE.sub(r"\1", s)
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

def tb(text):
    b = json.loads(text.lstrip("﻿"))
    return lambda m: ws(b[m[3]]["chapters"][m[4]-1][m[5]-1])
def gt(text):
    b = json.loads(text.lstrip("﻿"))["Book"]
    return lambda m: ws(b[m[3]]["Chapter"][m[4]-1]["Verse"][m[5]-1]["Verse"])

def build():
    getter = {}
    getter["ar"] = tb(fetch(FILES["ar"]))
    for l in ("hi","bn","id"): getter[l] = gt(fetch(FILES[l]))
    for l in ("es","pt","zh"): getter[l] = usfx(fetch(FILES[l]))
    getter["ru"] = zefania(fetch(FILES["ru"]))
    for l in ("fr","ja","vi"): getter[l] = osis(fetch(FILES[l]))
    def sw_get(m):
        u = f"{RAW}/wldeh/bible-api/main/bibles/swh-onen/books/{SW_BOOK[m[0]]}/chapters/{m[4]}/verses/{m[5]}.json"
        return ws(json.loads(fetch(u))["text"])
    getter["sw"] = sw_get

    out = {}
    for key in REFS:
        m = META[key]; out[key] = {}
        for l in LANGS:
            t = getter[l](m)
            if l in ("zh","ja"): t = re.sub(r"\s+", "", t)
            out[key][l] = t
    # 잘림 방어
    for key in REFS:
        lens = {l: len(out[key][l]) for l in out[key]}
        mx = max(lens.values())
        for l in list(out[key]):
            if l not in ("zh","ja") and mx > 40 and lens[l] < 0.35*mx:
                print(f"  drop(trunc) {key}/{l}", file=sys.stderr)
                del out[key][l]
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
