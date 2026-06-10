"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * 도구별 도표 일러스트 (정교·우아 버전).
 * schema.sql 의 sketch_key 에 맞춰 그림을 그린다.
 *  - 사영리:   circle · two-circles · cross · throne
 *  - 다리예화: two-sides · gap · bridge · cross-over
 *  - 세개의원: circle · circle-broken · circle-gospel · arrows
 * 그라데이션 + 은은한 빛(글로우) + 선이 그려지는 연출.
 * 기본 상태는 '보임'이라 동작 줄이기 설정에서도 그림은 유지된다.
 */

// 선이 그려지는 효과 (요소에 pathLength={1} 함께 부여)
const draw = (delay = 0, dur = 1): CSSProperties => ({
  strokeDasharray: 1,
  strokeDashoffset: 0,
  animation: `sk-draw ${dur}s cubic-bezier(0.45,0,0.2,1) ${delay}s both`,
});
// 부드럽게 떠오르며 등장 (요소 자기 중심 기준)
const pop = (delay = 0): CSSProperties => ({
  opacity: 1,
  transformBox: "fill-box",
  transformOrigin: "center",
  animation: `sk-pop 0.7s cubic-bezier(0.2,0.7,0.2,1) ${delay}s both`,
});
const glow = (dur = 3.6): CSSProperties => ({
  animation: `sk-glow ${dur}s ease-in-out infinite`,
});

function Defs() {
  return (
    <defs>
      <linearGradient id="g-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F9E29B" />
        <stop offset="1" stopColor="#D29220" />
      </linearGradient>
      <linearGradient id="g-green" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9BDCB4" />
        <stop offset="1" stopColor="#3A8056" />
      </linearGradient>
      <linearGradient id="g-crimson" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#EC6B53" />
        <stop offset="1" stopColor="#9C2516" />
      </linearGradient>
      <linearGradient id="g-parch" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FCFAF3" />
        <stop offset="1" stopColor="#CBC1AC" />
      </linearGradient>
      <linearGradient id="g-violet" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#C5B8E6" />
        <stop offset="1" stopColor="#7D6CB0" />
      </linearGradient>
      <linearGradient id="g-cliff" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3B3358" />
        <stop offset="1" stopColor="#1A1629" />
      </linearGradient>
      <linearGradient id="g-chasm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0E0B17" stopOpacity="0.1" />
        <stop offset="1" stopColor="#000000" stopOpacity="0.85" />
      </linearGradient>
      <radialGradient id="halo-gold" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#E3B23C" stopOpacity="0.55" />
        <stop offset="1" stopColor="#E3B23C" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="halo-green" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#5AA476" stopOpacity="0.5" />
        <stop offset="1" stopColor="#5AA476" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="halo-crimson" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#C9402F" stopOpacity="0.4" />
        <stop offset="1" stopColor="#C9402F" stopOpacity="0" />
      </radialGradient>
      <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "relative", margin: "0 auto 24px", width: "100%", maxWidth: 280 }}>
      <svg
        viewBox="0 0 260 160"
        style={{ height: "auto", width: "100%", overflow: "visible" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Defs />
        {children}
      </svg>
    </div>
  );
}

// 우아한 사람 실루엣 (머리 + 망토형 몸)
function Person({
  x,
  feet,
  fill = "url(#g-parch)",
  delay = 0.55,
  style,
}: {
  x: number;
  feet: number;
  fill?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  return (
    <g style={style ?? pop(delay)}>
      <ellipse cx={x} cy={feet + 2} rx={13} ry={3.5} fill="#000" opacity={0.2} />
      <path
        d={`M${x - 11} ${feet} C ${x - 12} ${feet - 27} ${x + 12} ${feet - 27} ${x + 11} ${feet} Z`}
        fill={fill}
      />
      <circle cx={x} cy={feet - 33} r={8} fill={fill} />
    </g>
  );
}

// 빛나는 십자가 (둥근 막대 + 글로우)
function Cross({
  cx,
  cy,
  s = 1,
  fill = "url(#g-gold)",
  delay = 0.3,
}: {
  cx: number;
  cy: number;
  s?: number;
  fill?: string;
  delay?: number;
}) {
  const w = 6 * s;
  return (
    <g filter="url(#soft)" style={pop(delay)}>
      <rect x={cx - w / 2} y={cy - 30 * s} width={w} height={62 * s} rx={w / 2} fill={fill} />
      <rect x={cx - 19 * s} y={cy - 11 * s} width={38 * s} height={w} rx={w / 2} fill={fill} />
    </g>
  );
}

// 좌/우 땅(절벽) — 박스가 아닌 둥근 지면. 가운데는 깊은 골.
function Cliffs({ leftTop, rightTop }: { leftTop: number; rightTop: number }) {
  const deeper = Math.max(leftTop, rightTop) + 40;
  return (
    <>
      {/* 깊은 골 (가운데 어둠) */}
      <path
        d={`M84 ${leftTop + 4} Q130 ${deeper} 176 ${rightTop + 4} L176 160 L84 160 Z`}
        fill="url(#g-chasm)"
        style={pop(0.05)}
      />
      {/* 좌 땅 (사람 편) */}
      <path
        d={`M0 ${leftTop + 16} Q22 ${leftTop} 58 ${leftTop} Q86 ${leftTop} 92 ${leftTop + 12} L92 160 L0 160 Z`}
        fill="url(#g-cliff)"
      />
      <path
        d={`M0 ${leftTop + 16} Q22 ${leftTop} 58 ${leftTop} Q86 ${leftTop} 92 ${leftTop + 12}`}
        stroke="url(#g-parch)"
        strokeWidth={2.5}
        fill="none"
        opacity={0.5}
        pathLength={1}
        style={draw(0.15)}
      />
      {/* 우 땅 (하나님 편, 살짝 높게) */}
      <path
        d={`M168 ${rightTop + 12} Q174 ${rightTop} 204 ${rightTop} Q240 ${rightTop} 260 ${rightTop + 16} L260 160 L168 160 Z`}
        fill="url(#g-cliff)"
      />
      <path
        d={`M168 ${rightTop + 12} Q174 ${rightTop} 204 ${rightTop} Q240 ${rightTop} 260 ${rightTop + 16}`}
        stroke="url(#g-gold)"
        strokeWidth={2.5}
        fill="none"
        opacity={0.6}
        pathLength={1}
        style={draw(0.3)}
      />
    </>
  );
}

function Halo({ cx, cy, r, id = "halo-gold", style }: { cx: number; cy: number; r: number; id?: string; style?: CSSProperties }) {
  return <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} style={style ?? glow()} />;
}

export default function Sketch({ k }: { k: string | null }) {
  if (!k) return null;

  switch (k) {
    // ── 온전한 원: 하나님의 사랑/디자인 ──
    case "circle":
      return (
        <Frame>
          <Halo cx={130} cy={76} r={62} />
          <circle cx={130} cy={76} r={46} stroke="url(#g-gold)" strokeWidth={5} filter="url(#soft)" pathLength={1} style={draw(0.15, 1.2)} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
            const rad = (a * Math.PI) / 180;
            return (
              <circle
                key={a}
                cx={130 + 60 * Math.cos(rad)}
                cy={76 + 60 * Math.sin(rad)}
                r={2.6}
                fill="#F9E29B"
                style={{ ...pop(0.9 + i * 0.06), animation: `sk-twinkle ${2.4 + (i % 3) * 0.5}s ease-in-out ${i * 0.2}s infinite` }}
              />
            );
          })}
          <path d="M130 92 C118 80 116 66 126 64 c5 -1 4 6 4 6 c0 0 -1 -7 4 -6 c10 2 8 16 -4 28 Z" fill="url(#g-crimson)" filter="url(#soft)" style={pop(0.7)} />
        </Frame>
      );

    // ── 두 원이 갈라짐: 죄로 인한 단절 ──
    case "two-circles":
      return (
        <Frame>
          <Halo cx={74} cy={80} r={40} id="halo-gold" style={{ ...glow(), opacity: 0.5 }} />
          <Halo cx={186} cy={80} r={42} id="halo-gold" />
          <circle cx={74} cy={80} r={34} stroke="url(#g-parch)" strokeWidth={5} pathLength={1} style={draw(0.1)} />
          <circle cx={186} cy={80} r={34} stroke="url(#g-gold)" strokeWidth={5} filter="url(#soft)" pathLength={1} style={draw(0.3)} />
          <Person x={74} feet={92} delay={0.6} />
          <Cross cx={186} cy={80} s={0.62} delay={0.7} />
          <path d="M120 52 L132 72 L118 84 L134 108" stroke="url(#g-crimson)" strokeWidth={5} filter="url(#soft)" pathLength={1} style={draw(0.9, 0.7)} />
        </Frame>
      );

    // ── 십자가 ──
    case "cross":
      return (
        <Frame>
          <Halo cx={130} cy={78} r={66} />
          {[ -1, 1 ].map((d) => (
            <line key={d} x1={130} y1={78} x2={130 + d * 70} y2={78 - 40} stroke="#F9E29B" strokeWidth={2} opacity={0.25} style={{ ...pop(1), animation: "sk-twinkle 3s ease-in-out infinite" }} />
          ))}
          <Cross cx={130} cy={80} s={1.35} delay={0.2} />
        </Frame>
      );

    // ── 마음의 보좌에 그리스도: 영접 ──
    case "throne":
      return (
        <Frame>
          <Halo cx={130} cy={74} r={58} id="halo-crimson" />
          <path
            d="M130 126 C64 86 74 36 108 36 c12 0 18 9 22 17 c4 -8 10 -17 22 -17 c34 0 44 50 -22 90 Z"
            fill="url(#g-crimson)"
            fillOpacity={0.18}
            stroke="url(#g-crimson)"
            strokeWidth={5}
            filter="url(#soft)"
            pathLength={1}
            style={draw(0.1, 1.3)}
          />
          <Cross cx={130} cy={72} s={0.8} delay={0.95} />
        </Frame>
      );

    // ── 두 편: 사람과 하나님 ──
    case "two-sides":
      return (
        <Frame>
          <Cliffs leftTop={108} rightTop={94} />
          <Person x={46} feet={108} delay={0.6} />
          <Halo cx={212} cy={70} r={34} />
          <Cross cx={212} cy={70} s={0.64} delay={0.7} />
        </Frame>
      );

    // ── 죄가 만든 깊은 간격 ──
    case "gap":
      return (
        <Frame>
          <Cliffs leftTop={108} rightTop={94} />
          <Halo cx={130} cy={140} r={42} id="halo-crimson" style={glow(2.8)} />
          <Person x={46} feet={108} delay={0.6} />
          <Cross cx={212} cy={70} s={0.64} delay={0.7} />
          <path d="M122 110 L132 128 L118 140 L130 160" stroke="url(#g-crimson)" strokeWidth={5} filter="url(#soft)" pathLength={1} style={draw(0.7, 0.8)} />
        </Frame>
      );

    // ── 십자가라는 다리 ──
    case "bridge":
      return (
        <Frame>
          <Cliffs leftTop={104} rightTop={104} />
          {/* 다리 그림자 */}
          <path d="M82 100 Q130 76 178 100" stroke="#000" strokeOpacity={0.28} strokeWidth={13} fill="none" style={pop(0.4)} />
          {/* 십자가 가로보 = 다리 (아치) */}
          <path d="M82 96 Q130 72 178 96" stroke="url(#g-gold)" strokeWidth={9} fill="none" filter="url(#soft)" pathLength={1} style={draw(0.5, 0.95)} />
          {/* 세로기둥 */}
          <rect x={126} y={52} width={8} height={50} rx={4} fill="url(#g-gold)" filter="url(#soft)" style={pop(1.15)} />
          {[104, 130, 156].map((x, i) => (
            <circle key={x} cx={x} cy={i === 1 ? 77 : 82} r={2.4} fill="#FCF3CF" style={{ animation: `sk-twinkle ${2.6 + i * 0.4}s ease-in-out ${1.3 + i * 0.2}s infinite` }} />
          ))}
        </Frame>
      );

    // ── 믿음으로 건너감 ──
    case "cross-over":
      return (
        <Frame>
          <Cliffs leftTop={104} rightTop={104} />
          <path d="M82 96 Q130 72 178 96" stroke="url(#g-gold)" strokeWidth={9} fill="none" filter="url(#soft)" pathLength={1} style={draw(0.3, 0.85)} />
          <rect x={126} y={52} width={8} height={50} rx={4} fill="url(#g-gold)" filter="url(#soft)" style={pop(0.95)} />
          <Halo cx={214} cy={80} r={32} id="halo-green" />
          {/* 빛(생명)을 향해 다리를 건너는 사람 */}
          <g style={{ animation: "sk-cross 3.6s cubic-bezier(0.4,0,0.4,1) 1s infinite" }}>
            <Person x={130} feet={84} fill="url(#g-green)" style={{ opacity: 1 }} />
          </g>
        </Frame>
      );

    // ── 깨어진 원 ──
    case "circle-broken":
      return (
        <Frame>
          <g transform="translate(7 -5) rotate(7 130 78)">
            <path d="M130 32 A46 46 0 0 1 130 124" stroke="#938CA8" strokeWidth={5} pathLength={1} style={draw(0.1)} />
          </g>
          <g transform="translate(-8 6) rotate(-9 130 78)">
            <path d="M130 32 A46 46 0 0 0 130 124" stroke="#7A7392" strokeWidth={5} pathLength={1} style={draw(0.35)} />
          </g>
          <path d="M133 24 L118 60 L142 80 L124 132" stroke="url(#g-crimson)" strokeWidth={5} filter="url(#soft)" pathLength={1} style={draw(0.7, 0.9)} />
        </Frame>
      );

    // ── 복음으로 회복되는 원 ──
    case "circle-gospel":
      return (
        <Frame>
          <Halo cx={130} cy={78} r={62} id="halo-green" />
          <circle cx={130} cy={78} r={46} stroke="url(#g-green)" strokeWidth={5} filter="url(#soft)" pathLength={1} style={draw(0.15, 1.3)} />
          {[30, 90, 150, 210, 270, 330].map((a, i) => {
            const rad = (a * Math.PI) / 180;
            return (
              <line key={a} x1={130 + 50 * Math.cos(rad)} y1={78 + 50 * Math.sin(rad)} x2={130 + 60 * Math.cos(rad)} y2={78 + 60 * Math.sin(rad)} stroke="#9BDCB4" strokeWidth={2.4} style={{ ...pop(1 + i * 0.08), animation: `sk-twinkle ${2.6 + (i % 2) * 0.6}s ease-in-out ${i * 0.15}s infinite` }} />
            );
          })}
          <Cross cx={130} cy={78} s={0.78} delay={1} />
        </Frame>
      );

    // ── 돌이킴(회개)과 믿음 ──
    case "arrows":
      return (
        <Frame>
          <Halo cx={158} cy={80} r={34} id="halo-green" />
          <circle cx={158} cy={80} r={28} stroke="url(#g-green)" strokeWidth={5} filter="url(#soft)" pathLength={1} style={draw(0.7)} />
          <Cross cx={158} cy={80} s={0.5} delay={1.1} />
          <path d="M104 122 C56 104 56 50 102 34" stroke="url(#g-violet)" strokeWidth={6} fill="none" filter="url(#soft)" pathLength={1} style={draw(0.1, 1)} />
          <path d="M102 34 L86 34 M102 34 L100 50" stroke="url(#g-violet)" strokeWidth={6} pathLength={1} style={draw(1.05, 0.35)} />
        </Frame>
      );

    default:
      return (
        <Frame>
          <Halo cx={130} cy={78} r={60} />
          <circle cx={130} cy={78} r={46} stroke="url(#g-gold)" strokeWidth={5} filter="url(#soft)" pathLength={1} style={draw(0.15, 1.2)} />
        </Frame>
      );
  }
}
