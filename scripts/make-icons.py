#!/usr/bin/env python3
"""DABAR 앱 아이콘 생성기 — 보라색 배경 + 금색 펼친 성경(말씀) + 워드마크."""
from PIL import Image, ImageDraw, ImageFont

PURPLE_TL = (83, 74, 183)    # #534ab7
PURPLE_BR = (43, 21, 80)     # #2b1550 (theme.primary 보다 약간 어둡게)
GOLD      = (201, 168, 76)   # #c9a84c
GOLD_LT   = (240, 226, 176)  # 페이지 밝은 금색
GOLD_DK   = (160, 130, 55)   # 페이지 두께/테두리
INK       = (59, 31, 107)    # 페이지 위 글줄(보라)

LATIN = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
HANGUL = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(size):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            # 좌상 -> 우하 대각 그라데이션
            t = (x + y) / (2 * size)
            px[x, y] = lerp(PURPLE_TL, PURPLE_BR, t)
    return img


def poly(d, pts, S, **kw):
    d.polygon([(x * S, y * S) for x, y in pts], **kw)


def draw_icon(size):
    img = gradient(size)
    d = ImageDraw.Draw(img)
    S = size

    # ── 펼친 성경 ──────────────────────────────
    # 페이지 두께(아래 그림자처럼)
    poly(d, [(0.205, 0.355), (0.5, 0.415), (0.5, 0.55), (0.205, 0.49)], S, fill=GOLD_DK)
    poly(d, [(0.795, 0.355), (0.5, 0.415), (0.5, 0.55), (0.795, 0.49)], S, fill=GOLD_DK)
    # 왼쪽 페이지
    poly(d, [(0.20, 0.34), (0.5, 0.40), (0.5, 0.535), (0.20, 0.475)], S,
         fill=GOLD_LT, outline=GOLD, width=max(2, size // 170))
    # 오른쪽 페이지
    poly(d, [(0.80, 0.34), (0.5, 0.40), (0.5, 0.535), (0.80, 0.475)], S,
         fill=GOLD_LT, outline=GOLD, width=max(2, size // 170))
    # 가운데 책등
    d.line([(0.5 * S, 0.40 * S), (0.5 * S, 0.535 * S)], fill=GOLD_DK, width=max(2, size // 150))

    # 페이지 위 글줄(왼/오 각 3줄)
    lw = max(1, size // 256)
    for i, dy in enumerate((0.0, 0.028, 0.056)):
        # 왼쪽
        d.line([(0.255 * S, (0.385 + dy) * S), (0.455 * S, (0.408 + dy) * S)], fill=INK, width=lw)
        # 오른쪽
        d.line([(0.545 * S, (0.408 + dy) * S), (0.745 * S, (0.385 + dy) * S)], fill=INK, width=lw)

    # ── 워드마크 DABAR ─────────────────────────
    f_latin = ImageFont.truetype(LATIN, int(size * 0.135))
    text = "DABAR"
    # 자간 넓히기: 글자별로 그려서 간격 추가
    spacing = int(size * 0.018)
    widths = [d.textlength(c, font=f_latin) for c in text]
    total = sum(widths) + spacing * (len(text) - 1)
    x = (S - total) / 2
    y = 0.62 * S
    for c, w in zip(text, widths):
        d.text((x, y), c, font=f_latin, fill=GOLD)
        x += w + spacing

    # ── 부제 다바르 ────────────────────────────
    f_kr = ImageFont.truetype(HANGUL, int(size * 0.072))
    sub = "다바르"
    sw = d.textlength(sub, font=f_kr)
    d.text(((S - sw) / 2, 0.80 * S), sub, font=f_kr, fill=GOLD_LT)

    return img


if __name__ == "__main__":
    import sys
    for sz in (512, 192):
        out = f"/tmp/icon-{sz}.png"
        draw_icon(sz).save(out)
        print("saved", out)
    # 미리보기용 큰 이미지
    draw_icon(512).save("/tmp/icon-preview.png")
