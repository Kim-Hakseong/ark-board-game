import { useMemo } from "react";
import { AnimatedDice } from "../../components/AnimatedDice";
import { TvCanvas } from "../../components/TvCanvas";
import { getAnimal } from "../../data/animals";
import { CELLS, type CellKind } from "../../data/cells";
import type { GameState, Player } from "../../logic/types";

interface BoardProps {
  state: GameState;
}

// ────────────────────────────────────────────────────────────
// 트랙 좌표 — 5행 × 6열 S자(boustrophedon).
// 셀 30이 우하단에 오도록 좌표 잡고, 방주는 그 바로 오른쪽/아래에 배치.
// ────────────────────────────────────────────────────────────
const COLS = 6;
const ROWS = 5;
const X0 = 200;
const X1 = 1080; // 셀 영역 우측 한계 (오른쪽은 방주 + 우측 패널)
const Y0 = 180;
const Y1 = 880;

function colX(c: number): number {
  return X0 + (X1 - X0) * (c / (COLS - 1));
}
function rowY(r: number): number {
  return Y0 + (Y1 - Y0) * (r / (ROWS - 1));
}

interface Point {
  x: number;
  y: number;
}

function stepPos(step: number): Point {
  const idx = step - 1;
  const row = Math.floor(idx / COLS);
  let col = idx % COLS;
  if (row % 2 === 1) col = COLS - 1 - col;
  // 살짝 유기적 흔들림
  const jx = Math.sin(step * 1.7) * 14;
  const jy = Math.cos(step * 2.3) * 12;
  return { x: colX(col) + jx, y: rowY(row) + jy };
}

const START_PT: Point = { x: 110, y: 540 };
const ARK_DOOR: Point = { x: 1280, y: 880 }; // 방주 문 (셀 30 우하단 옆)

function smoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    const n = points[i + 1];
    const mx = (p.x + n.x) / 2;
    const my = (p.y + n.y) / 2;
    d += ` Q ${p.x} ${p.y} ${mx} ${my}`;
  }
  const last = points[points.length - 1];
  d += ` T ${last.x} ${last.y}`;
  return d;
}

const KIND_CLASS: Record<CellKind, string> = {
  WORD: "t-word",
  SHARE: "t-share",
  MISSION: "t-mission",
  EVENT: "t-event",
};
const KIND_GLYPH: Record<CellKind, string> = {
  WORD: "📖",
  SHARE: "💬",
  MISSION: "⭐",
  EVENT: "⚡",
};

// ────────────────────────────────────────────────────────────
export function Board({ state }: BoardProps) {
  const currentPlayer = state.players[state.currentTurnIdx] ?? null;

  const trackPoints = useMemo(() => {
    const pts: Point[] = [];
    for (let s = 1; s <= 30; s++) pts.push(stepPos(s));
    return pts;
  }, []);

  const trackD = useMemo(
    () => smoothPath([START_PT, ...trackPoints, ARK_DOOR]),
    [trackPoints],
  );

  return (
    <TvCanvas>
      {/* 비 페이즈 D-카운터 상단 배너 (옵션) */}
      {state.countdown.active && (
        <div
          className="absolute top-5 left-1/2 -translate-x-1/2 z-40 px-9 py-3 rounded-full"
          style={{
            background: "rgba(74,59,42,.85)",
            color: "#fff",
            border: "4px solid var(--ark-gold)",
            fontFamily: "var(--font-display)",
            fontSize: 30,
            boxShadow: "var(--sh-deep)",
          }}
        >
          🌧 문이 닫히기까지 D-{state.countdown.daysLeft}
        </div>
      )}

      <div className="board-root paper-noise" style={rootStyle}>
        <Scape />

        {/* 좌측 트랙 영역 */}
        <div style={playAreaStyle}>
          {/* 사행 경로 (페일 옐로우 + 점선 안내) */}
          <svg
            viewBox="0 0 1480 1080"
            style={{ position: "absolute", inset: 0, width: 1480, height: 1080, zIndex: 3 }}
          >
            <path
              d={trackD}
              fill="none"
              stroke="#C8A86E"
              strokeWidth={46}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.55}
            />
            <path
              d={trackD}
              fill="none"
              stroke="#E9D3A6"
              strokeWidth={30}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2 40"
              opacity={0.8}
            />
          </svg>

          {/* START + 노아 */}
          <div className="start-sign" style={{ position: "absolute", left: 24, top: 470, zIndex: 6, textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 30,
                color: "#fff",
                background: "linear-gradient(180deg,#9c6a35,#7a4f24)",
                padding: "10px 22px",
                borderRadius: 14,
                border: "5px solid #5e3a1b",
                boxShadow: "var(--sh-pop)",
                transform: "rotate(-4deg)",
                display: "inline-block",
              }}
            >
              START
            </div>
            <div
              style={{
                fontSize: 76,
                marginTop: 6,
                filter: "drop-shadow(0 6px 5px rgba(74,59,42,.35))",
                animation: "bob 3s ease-in-out infinite",
              }}
            >
              🧔🏻
            </div>
          </div>

          {/* 방주 일러스트 (셀 30 근처 우하단) */}
          <Ark state={state} />

          {/* 칸 렌더 */}
          {CELLS.map((cell) => {
            const p = stepPos(cell.index);
            const tilt = ((cell.index * 37) % 13) - 6;
            return (
              <div
                key={cell.index}
                className={`cell ${KIND_CLASS[cell.kind]}`}
                style={{
                  position: "absolute",
                  left: p.x,
                  top: p.y,
                  width: 96,
                  height: 96,
                  marginLeft: -48,
                  marginTop: -48,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  border: "6px solid var(--edge)",
                  background:
                    "radial-gradient(circle at 38% 30%, rgba(255,255,255,.65), rgba(255,255,255,0) 55%), var(--fill)",
                  boxShadow: "var(--sh-token)",
                  transform: `rotate(${tilt}deg)`,
                  zIndex: 4,
                  ...(getCellVars(cell.kind) as React.CSSProperties),
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: -16,
                    left: -14,
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "var(--paper)",
                    border: "3px solid var(--edge)",
                    color: "var(--deep)",
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 3px 0 rgba(74,59,42,.18)",
                  }}
                >
                  {cell.index}
                </span>
                <span
                  style={{
                    fontSize: 40,
                    lineHeight: 1,
                    filter: "drop-shadow(0 1px 0 rgba(0,0,0,.12))",
                  }}
                >
                  {KIND_GLYPH[cell.kind]}
                </span>
              </div>
            );
          })}

          {/* 동물 말 */}
          {state.players
            .filter((p) => !p.arrived && p.position >= 1 && p.position <= 30)
            .map((p) => {
              const pos = stepPos(p.position);
              const isCurrent = p.id === currentPlayer?.id;
              return <Piece key={p.id} player={p} x={pos.x} y={pos.y} current={isCurrent} />;
            })}

          {/* 종류 범례 */}
          <div className="legend" style={legendStyle}>
            <LegendItem fill="var(--word)" edge="var(--word-edge)" glyph="📖" label="말씀" />
            <LegendItem fill="var(--share)" edge="var(--share-edge)" glyph="💬" label="나눔" />
            <LegendItem fill="var(--mission)" edge="var(--mission-edge)" glyph="⭐" label="미션" />
            <LegendItem fill="var(--event)" edge="var(--event-edge)" glyph="⚡" label="이벤트" />
          </div>
        </div>

        {/* 우측 점수판 */}
        <StatusPanel state={state} current={currentPlayer} />
      </div>
    </TvCanvas>
  );
}

const rootStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
};
const playAreaStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: 1480,
  height: 1080,
};
const legendStyle: React.CSSProperties = {
  position: "absolute",
  left: 40,
  bottom: 28,
  zIndex: 6,
  display: "flex",
  gap: 14,
  background: "rgba(255,251,243,.86)",
  border: "4px solid #fff",
  borderRadius: 20,
  padding: "12px 18px",
  boxShadow: "var(--sh-soft)",
  backdropFilter: "blur(2px)",
};

function getCellVars(kind: CellKind): Record<string, string> {
  return {
    "--fill": `var(--${kind.toLowerCase()})`,
    "--edge": `var(--${kind.toLowerCase()}-edge)`,
    "--deep": `var(--${kind.toLowerCase()}-deep)`,
  };
}

function LegendItem({ fill, edge, glyph, label }: { fill: string; edge: string; glyph: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
        fontFamily: "var(--font-display)",
        fontSize: 22,
        color: "var(--ink)",
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontSize: 18,
          border: `4px solid ${edge}`,
          background: fill,
        }}
      >
        {glyph}
      </span>
      {label}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
function Piece({ player, x, y, current }: { player: Player; x: number; y: number; current: boolean }) {
  const animal = getAnimal(player.animalId);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 110,
        height: 130,
        marginLeft: -55,
        marginTop: -126,
        zIndex: 7,
        transformOrigin: "bottom center",
        animation: "bob 2.6s var(--ease-pop) infinite",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 70,
          height: 22,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(74,59,42,.34), rgba(74,59,42,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 90,
          height: 100,
          borderRadius: "46px 46px 22px 22px",
          background: "linear-gradient(180deg, var(--paper), #f4e9d6)",
          border: current ? "5px solid var(--ark-gold)" : "5px solid #fff",
          boxShadow: current
            ? "0 0 0 6px rgba(232,163,61,.35), var(--sh-pop)"
            : "var(--sh-pop)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span style={{ fontSize: 52, lineHeight: 1, transform: "translateY(-2px)" }}>
          {animal?.emoji ?? "❓"}
        </span>
      </div>
      {current && (
        <div
          style={{
            position: "absolute",
            top: -34,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--font-display)",
            fontSize: 18,
            color: "#fff",
            whiteSpace: "nowrap",
            background: "var(--ark-gold)",
            padding: "4px 12px",
            borderRadius: 12,
            border: "3px solid #fff",
            boxShadow: "var(--sh-soft)",
          }}
        >
          지금 차례!
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
function Ark({ state }: { state: GameState }) {
  const arrived = state.players.filter((p) => p.arrived).slice(0, 6);
  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        bottom: 80,
        width: 460,
        height: 380,
        zIndex: 5,
        filter: "drop-shadow(0 18px 22px rgba(74,59,42,.3))",
      }}
    >
      <svg viewBox="0 0 540 420" width="460" height="380" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hullg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D9A86A" />
            <stop offset="1" stopColor="#B07C3E" />
          </linearGradient>
        </defs>
        <ellipse cx="270" cy="250" rx="280" ry="150" fill="#FFE9A8" opacity="0.5" />
        <path
          d="M40 250 Q 270 360 500 250 L470 330 Q 270 410 70 330 Z"
          fill="url(#hullg)"
          stroke="#8A5A2E"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <g stroke="#9C6B3E" strokeWidth="5" opacity="0.7">
          <path d="M70 300 Q 270 372 470 300" fill="none" />
          <path d="M60 278 Q 270 350 480 278" fill="none" />
        </g>
        <rect
          x="120"
          y="120"
          width="300"
          height="140"
          rx="20"
          fill="#E7C68C"
          stroke="#8A5A2E"
          strokeWidth="8"
        />
        <g stroke="#B8915A" strokeWidth="4" opacity="0.8">
          <line x1="130" y1="160" x2="410" y2="160" />
          <line x1="130" y1="200" x2="410" y2="200" />
        </g>
        <path
          d="M104 124 L270 56 L436 124 Z"
          fill="#C8763E"
          stroke="#8A5A2E"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <circle cx="270" cy="92" r="12" fill="#FFE07A" stroke="#8A5A2E" strokeWidth="5" />
        <path
          d="M232 260 V190 a38 38 0 0 1 76 0 V260 Z"
          fill="#FFF6D8"
          stroke="#8A5A2E"
          strokeWidth="7"
        />
        <path d="M270 260 V190" stroke="#C9A227" strokeWidth="4" />
        <line x1="270" y1="56" x2="270" y2="20" stroke="#8A5A2E" strokeWidth="5" />
        <path d="M270 24 L320 34 L270 46 Z" fill="#E8A33D" />
      </svg>
      {/* 도착한 동물들을 갑판 위에 빼꼼 */}
      {arrived.map((p, i) => {
        const a = getAnimal(p.animalId);
        const positions = [
          { left: 150, top: 84 },
          { left: 210, top: 76 },
          { left: 270, top: 80 },
          { left: 330, top: 76 },
          { left: 100, top: 92 },
          { left: 380, top: 92 },
        ];
        const pos = positions[i] ?? positions[0];
        return (
          <div
            key={p.id}
            title={`${p.name} (${p.arrivalRank}등)`}
            style={{
              position: "absolute",
              left: pos.left,
              top: pos.top,
              fontSize: 38,
              filter: "drop-shadow(0 4px 4px rgba(74,59,42,.35))",
              zIndex: 7,
            }}
          >
            {a?.emoji}
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
function Scape() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#BFE3F2" />
            <stop offset=".55" stopColor="#E8F4F0" />
            <stop offset="1" stopColor="#F8CFAE" />
          </linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#DDEBC8" />
            <stop offset=".4" stopColor="#F0E2C2" />
            <stop offset=".7" stopColor="#F5D9A8" />
            <stop offset="1" stopColor="#F8CFAE" />
          </linearGradient>
          <radialGradient id="sun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFF6D8" />
            <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#sky)" />
        <circle cx="240" cy="170" r="220" fill="url(#sun)" />
        <circle cx="240" cy="170" r="78" fill="#FFE07A" />
        <g stroke="#FFE07A" strokeWidth="14" strokeLinecap="round" opacity=".7">
          <line x1="240" y1="40" x2="240" y2="-10" />
          <line x1="120" y1="90" x2="86" y2="56" />
          <line x1="360" y1="90" x2="394" y2="56" />
          <line x1="70" y1="200" x2="22" y2="200" />
        </g>
        <g fill="#FFFFFF" opacity=".92">
          <g>
            <ellipse cx="720" cy="150" rx="120" ry="48" />
            <ellipse cx="800" cy="130" rx="80" ry="46" />
            <ellipse cx="650" cy="160" rx="70" ry="40" />
          </g>
          <g opacity=".8">
            <ellipse cx="1180" cy="120" rx="110" ry="44" />
            <ellipse cx="1250" cy="138" rx="70" ry="38" />
          </g>
          <g opacity=".7">
            <ellipse cx="430" cy="250" rx="86" ry="34" />
            <ellipse cx="490" cy="240" rx="56" ry="30" />
          </g>
        </g>
        <path
          d="M0 560 Q 300 470 620 540 T 1240 520 T 1920 560 V1080 H0 Z"
          fill="#C6DDA8"
        />
        <path
          d="M0 660 Q 480 580 980 650 T 1920 660 V1080 H0 Z"
          fill="url(#ground)"
        />
        <path
          d="M0 820 Q 360 760 760 820 T 1920 840 V1080 H0 Z"
          fill="#CFE3AE"
          opacity=".85"
        />
        <g>
          <g transform="translate(120 760)">
            <rect x="-12" y="0" width="24" height="60" rx="8" fill="#9C6B3E" />
            <circle cx="0" cy="-18" r="56" fill="#8FBF6B" />
            <circle cx="-34" cy="6" r="38" fill="#9FCB78" />
            <circle cx="34" cy="4" r="40" fill="#7FB05E" />
          </g>
          <g transform="translate(560 700) scale(.8)">
            <rect x="-12" y="0" width="24" height="60" rx="8" fill="#9C6B3E" />
            <circle cx="0" cy="-18" r="56" fill="#7FB05E" />
            <circle cx="-32" cy="8" r="36" fill="#8FBF6B" />
          </g>
        </g>
      </svg>
      {state_rain_overlay()}
    </div>
  );
}

function state_rain_overlay() {
  // 빗방울/비 효과는 상태에 따라 토글되어야 하지만 Scape는 state를 못 받음.
  // 일단 자리만 비워둠. 실제 비 페이즈 시각화는 RainOverlay 컴포넌트로 처리.
  return null;
}

// ────────────────────────────────────────────────────────────
// 우측 점수판
// ────────────────────────────────────────────────────────────
function StatusPanel({
  state,
  current,
}: {
  state: GameState;
  current: Player | null;
}) {
  const animal = current ? getAnimal(current.animalId) : null;
  return (
    <aside
      className="status-panel paper-noise"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 440,
        height: 1080,
        padding: "30px 28px 26px",
        background:
          "repeating-linear-gradient(0deg, rgba(120,82,40,.06) 0 22px, rgba(120,82,40,.11) 22px 24px), linear-gradient(180deg, #8a5a2e, #774a24)",
        borderLeft: "8px solid #5e3a1b",
        boxShadow: "-18px 0 40px rgba(74,59,42,.28)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        zIndex: 6,
      }}
    >
      {/* 로고 + 방코드 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <svg width="50" height="50" viewBox="0 0 56 56">
          <path
            d="M6 30 Q28 44 50 30 L46 40 Q28 50 10 40 Z"
            fill="#E7C68C"
            stroke="#5e3a1b"
            strokeWidth="3"
          />
          <path d="M14 16 L42 16 L28 6 Z" fill="#C8763E" stroke="#5e3a1b" strokeWidth="3" />
          <rect x="14" y="16" width="28" height="14" fill="#E7C68C" stroke="#5e3a1b" strokeWidth="3" />
        </svg>
        <div style={{ fontFamily: "var(--font-display)", lineHeight: 1.12, minWidth: 0 }}>
          <b style={{ display: "block", fontSize: 22, color: "#fff", textShadow: "0 2px 0 rgba(0,0,0,.25)", whiteSpace: "nowrap" }}>
            방주로 가는 길
          </b>
          <span style={{ fontSize: 15, color: "#ffe9c4" }}>Road to the Ark</span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            background: "var(--paper)",
            border: "4px solid var(--ark-gold)",
            borderRadius: 16,
            padding: "5px 12px",
            textAlign: "center",
            boxShadow: "var(--sh-soft)",
          }}
        >
          <small style={{ display: "block", fontSize: 13, color: "var(--ink-soft)" }}>방 코드</small>
          <b style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: 3, color: "var(--ink)" }}>
            {state.roomCode}
          </b>
        </div>
      </div>

      {/* 비 페이즈 / D-카운터 (countdown 활성 시만) */}
      {state.countdown.active && (
        <PanelCard style={{ background: "linear-gradient(180deg,#e6eef6,#d3e0ee)", textAlign: "center", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {[14, 34, 58, 78, 90].map((leftPct, i) => (
              <i
                key={i}
                style={{
                  position: "absolute",
                  top: -10,
                  left: `${leftPct}%`,
                  width: 6,
                  height: 14,
                  borderRadius: "60%",
                  background: "#9fb6d1",
                  opacity: 0.6,
                  animation: `fall 1.6s linear infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#4f6680" }}>
            ☂︎ 비가 시작됐어요 · 방주까지
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 64, lineHeight: 0.9, color: "var(--rain)" }}>
            D-{state.countdown.daysLeft}
            <span style={{ fontSize: 22, color: "#6b819c" }}> 일</span>
          </div>
        </PanelCard>
      )}

      {/* 현재 차례 */}
      {current && (
        <PanelCard style={{ background: "linear-gradient(180deg,#fff5e2,#ffe9c4)", display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              fontSize: 64,
              filter: "drop-shadow(0 4px 3px rgba(74,59,42,.3))",
              animation: "bob 2.4s ease-in-out infinite",
            }}
          >
            {animal?.emoji}
          </div>
          <div>
            <b
              style={{
                display: "block",
                fontFamily: "var(--font-display)",
                fontSize: 30,
                color: "var(--ark-deep)",
              }}
            >
              {current.name}의 차례
            </b>
            <span style={{ fontSize: 18, color: "var(--ink-soft)" }}>
              {current.arrived ? "초청해주세요!" : "주사위를 굴려보세요!"}
            </span>
          </div>
        </PanelCard>
      )}

      {/* 주사위 */}
      <PanelCard style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink-soft)" }}>
          🎲 주사위
        </div>
        <AnimatedDice
          value={state.lastDiceRoll}
          trigger={state.lastDiceRoll == null ? null : `${state.seq}-${state.lastDiceRoll}`}
          size="lg"
          durationMs={1500}
        />
        {state.lastDiceRoll != null && (
          <div style={{ fontFamily: "var(--font-display)", fontSize: 44, color: "var(--ark-deep)" }}>
            {state.lastDiceRoll}
          </div>
        )}
      </PanelCard>

      {/* 친구들 현황 */}
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#fff", textShadow: "0 2px 0 rgba(0,0,0,.2)", margin: "2px 0 -4px 4px" }}>
        친구들 현황
      </div>
      <PanelCard style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, overflowY: "auto" }}>
        {state.players.length === 0 && (
          <div style={{ fontFamily: "var(--font-body)", color: "var(--ink-soft)", textAlign: "center" }}>
            (입장한 친구가 없어요)
          </div>
        )}
        {state.players.map((p, i) => {
          const a = getAnimal(p.animalId);
          const pct = p.arrived ? 100 : Math.round((p.position / 30) * 100);
          const isCurrent = i === state.currentTurnIdx;
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  flex: "none",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 26,
                  background: "var(--paper)",
                  border: isCurrent ? "4px solid var(--ark-gold)" : "4px solid #fff",
                  boxShadow: "var(--sh-soft)",
                }}
              >
                {a?.emoji ?? "❓"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  color: "var(--ink)",
                  width: 56,
                  flex: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 16,
                  borderRadius: 12,
                  background: "#efe3cf",
                  border: "2px solid #fff",
                  overflow: "hidden",
                  boxShadow: "inset 0 2px 4px rgba(74,59,42,.18)",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 10,
                    background: p.arrived
                      ? "var(--ark-gold)"
                      : "linear-gradient(90deg,var(--grace),var(--ark-gold))",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  color: "#fff",
                  width: 60,
                  flex: "none",
                  textAlign: "right",
                }}
              >
                {p.arrived ? `🛟 ${p.arrivalRank}등` : `${p.position}/30`}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 14,
                  color: "var(--ink)",
                  background: "var(--grace)",
                  borderRadius: 12,
                  padding: "2px 8px",
                  flex: "none",
                  whiteSpace: "nowrap",
                }}
                title="토큰"
              >
                🪙 {p.tokens}
              </div>
            </div>
          );
        })}
      </PanelCard>
    </aside>
  );
}

function PanelCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--paper)",
        borderRadius: "var(--r-card)",
        border: "5px solid #fff",
        boxShadow: "var(--sh-deep)",
        padding: "16px 18px",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
