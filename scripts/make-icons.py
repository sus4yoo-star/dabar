#!/usr/bin/env python3
"""DABAR 앱 아이콘 생성기.

디자인: 보라색 그라데이션 배경 + 금색 펼친 성경(말씀) + 위쪽 금색 십자가(반짝임).
글자는 넣지 않는다. iOS/안드로이드가 설치 시 모서리를 둥글게 처리하므로
아이콘은 모서리까지 꽉 찬(full-bleed) 정사각형으로 만든다.
"""
from PIL import Image, ImageDraw

PURPLE_TL = (104, 82, 180)   # 좌상 (밝은 보라)
PURPLE_BR = (52, 26, 98)     # 우하 (짙은 보라)
PAGE_FILL = (60, 33, 110)    # 책 안쪽(배경보다 약간 진한 보라)
GOLD      = (208, 176, 92)   # 금색 본선
GOLD_DK   = (168, 134, 60)   # 금색 그림자
GOLD_LT   = (236, 214, 150)  # 금색 하이라이트


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(size):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            px[x, y] = lerp(PURPLE_TL, PURPLE_BR, (x + y) / (2 * size))
    return img


def P(pts, S):
    return [(x * S, y * S) for x, y in pts]


def draw_icon(size, ss=4):
    """ss 배 크게 그린 뒤 축소해서 가장자리를 매끈하게(안티앨리어싱)."""
    S = size * ss
    img = gradient(S)
    d = ImageDraw.Draw(img)

    stroke = max(2, int(S * 0.016))
    line_w = max(1, int(S * 0.011))

    # ── 십자가(반짝임) — 책 위 중앙 ──────────────────
    cx, cy = 0.5 * S, 0.285 * S
    tip, inn = 0.072 * S, 0.018 * S
    star = [
        (cx, cy - tip), (cx + inn, cy - inn), (cx + tip, cy), (cx + inn, cy + inn),
        (cx, cy + tip), (cx - inn, cy + inn), (cx - tip, cy), (cx - inn, cy - inn),
    ]
    d.polygon(star, fill=GOLD)
    d.ellipse([cx - inn * 0.7, cy - inn * 0.7, cx + inn * 0.7, cy + inn * 0.7], fill=GOLD_LT)

    # ── 펼친 성경 ────────────────────────────────────
    # 좌/우 페이지: 바깥쪽 위가 높고 가운데(책등)가 살짝 내려온 펼친 책 모양
    left = [(0.18, 0.50), (0.50, 0.55), (0.50, 0.775), (0.18, 0.70)]
    right = [(0.82, 0.50), (0.50, 0.55), (0.50, 0.775), (0.82, 0.70)]
    # 페이지 두께(아래쪽 금색 띠)
    d.polygon(P([(0.18, 0.70), (0.50, 0.775), (0.50, 0.80), (0.18, 0.725)], S), fill=GOLD_DK)
    d.polygon(P([(0.82, 0.70), (0.50, 0.775), (0.50, 0.80), (0.82, 0.725)], S), fill=GOLD_DK)
    # 페이지 면
    d.polygon(P(left, S), fill=PAGE_FILL, outline=GOLD, width=stroke)
    d.polygon(P(right, S), fill=PAGE_FILL, outline=GOLD, width=stroke)
    # 책등
    d.line(P([(0.50, 0.55), (0.50, 0.775)], S), fill=GOLD, width=stroke)

    # 페이지 위 글줄 (좌/우 각 4줄) — 위쪽 모서리 기울기와 평행, 안쪽이 더 낮게
    for i in range(4):
        dy = 0.038 * i
        d.line(P([(0.245, 0.575 + dy), (0.455, 0.610 + dy)], S), fill=GOLD, width=line_w)
        d.line(P([(0.545, 0.610 + dy), (0.755, 0.575 + dy)], S), fill=GOLD, width=line_w)

    return img.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    for sz in (512, 192):
        out = f"/tmp/icon-{sz}.png"
        draw_icon(sz).save(out)
        print("saved", out)
