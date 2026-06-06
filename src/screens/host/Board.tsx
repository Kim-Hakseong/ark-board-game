import { AnimatedDice } from "../../components/AnimatedDice";
import { CELLS, type Cell, type CellKind } from "../../data/cells";
import { getAnimal } from "../../data/animals";
import type { GameState, Player } from "../../logic/types";

interface BoardProps {
  state: GameState;
}

// S자 사행 — 5행 × 6열 (PRD Design.md §5)
const ROWS = 5;
const COLS = 6;

function cellIndexAt(row: number, col: number): number {
  const start = row * COLS + 1;
  return row % 2 === 0 ? start + col : start + (COLS - 1 - col);
}

const KIND_STYLE: Record<CellKind, { bg: string; edge: string; icon: string; label: string }> = {
  WORD: { bg: "var(--word)", edge: "var(--word-edge)", icon: "📖", label: "말씀" },
  SHARE: { bg: "var(--share)", edge: "var(--share-edge)", icon: "💬", label: "나눔" },
  MISSION: { bg: "var(--mission)", edge: "var(--mission-edge)", icon: "⭐", label: "미션" },
  EVENT: { bg: "var(--event)", edge: "var(--event-edge)", icon: "⚡", label: "이벤트" },
};

// 셀별 결정적 틸트(인덱스 기반) — 통통 튀는 손그림 보드 느낌
function tiltFor(index: number): number {
  const seeds = [-3, 2, -2, 3, -1, 2, -3, 1, 3, -2];
  return seeds[index % seeds.length];
}

export function Board({ state }: BoardProps) {
  const currentPlayer = state.players[state.currentTurnIdx] ?? null;

  return (
    <div className="min-h-screen w-screen relative overflow-hidden">
      <ScenicBackground />

      {state.countdown.active && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-8 py-3 rounded-full bg-ink/85 text-cream font-display text-2xl border-4 border-ark-gold shadow-2xl">
          🌧 문이 닫히기까지 D-{state.countdown.daysLeft}
        </div>
      )}

      {state.phase === "rain" && <RainOverlay />}

      <div className="relative z-10 grid grid-cols-[1fr_24rem] h-screen gap-5 p-6">
        <BoardTrack state={state} />
        <StatusPanel state={state} current={currentPlayer} />
      </div>

      <SharedStyles />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 배경 풍경
// ─────────────────────────────────────────────────────────────
function ScenicBackground() {
  return (
    <div className="absolute inset-0 -z-0">
      {/* 하늘 → 들판 → 황무지 → 방주 언덕 4구역 그라데이션 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #BDE0F3 0%, #DCE9D6 35%, #F5E5BB 65%, #F4CFA0 100%)",
        }}
      />
      {/* 해 */}
      <div className="absolute top-10 right-32 text-7xl drop-shadow-lg select-none">☀️</div>
      {/* 구름 */}
      <div className="absolute top-6 left-32 text-6xl select-none opacity-90">☁️</div>
      <div className="absolute top-24 left-1/2 text-5xl select-none opacity-80">☁️</div>
      <div className="absolute top-16 left-2/3 text-4xl select-none opacity-70">☁️</div>
      {/* 새 */}
      <div className="absolute top-32 left-1/3 text-2xl select-none animate-[birdFloat_6s_ease-in-out_infinite]">🕊️</div>
      <div className="absolute top-40 right-1/3 text-2xl select-none animate-[birdFloat_8s_ease-in-out_infinite_reverse]">🐦</div>
      {/* 산/언덕 SVG */}
      <svg
        className="absolute bottom-0 left-0 right-0 h-2/5 w-full"
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
      >
        <path d="M 0 30 Q 18 10 32 16 T 60 12 T 100 14 L 100 30 Z" fill="#A8D08D" opacity="0.55" />
        <path d="M 0 30 Q 25 18 50 22 T 100 22 L 100 30 Z" fill="#86B36F" opacity="0.7" />
      </svg>
      {/* 나무들 흩어놓기 */}
      <div className="absolute bottom-32 left-12 text-6xl select-none">🌳</div>
      <div className="absolute bottom-24 left-40 text-5xl select-none">🌲</div>
      <div className="absolute bottom-40 right-1/4 text-5xl select-none">🌳</div>
      <div className="absolute bottom-12 left-1/2 text-4xl select-none">🌿</div>
      <div className="absolute bottom-20 right-1/2 text-3xl select-none">🌾</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 보드 트랙 (30칸 + 방주)
// ─────────────────────────────────────────────────────────────
function BoardTrack({ state }: { state: GameState }) {
  const currentTurnPos = state.players[state.currentTurnIdx]?.position ?? -1;
  return (
    <div className="relative rounded-[2.5rem] p-8 overflow-hidden bg-white/30 backdrop-blur-sm border-4 border-white/50 shadow-2xl">
      <div className="grid h-full gap-5" style={{ gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
        {Array.from({ length: ROWS }, (_, row) => (
          <div
            key={row}
            className="grid gap-5"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {Array.from({ length: COLS }, (_, col) => {
              const index = cellIndexAt(row, col);
              const cell = CELLS.find((c) => c.index === index);
              if (!cell) return null;
              const playersHere = state.players.filter((p) => p.position === index);
              const isCurrentCell = currentTurnPos === index;
              return (
                <BoardCell
                  key={index}
                  cell={cell}
                  players={playersHere}
                  highlight={isCurrentCell}
                />
              );
            })}
          </div>
        ))}
      </div>
      <ArkCorner state={state} />
    </div>
  );
}

function BoardCell({
  cell,
  players,
  highlight,
}: {
  cell: Cell;
  players: Player[];
  highlight: boolean;
}) {
  const style = KIND_STYLE[cell.kind];
  const tilt = tiltFor(cell.index);
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* 그림자 (입체감) */}
      <div
        className="absolute inset-0 rounded-[1.75rem] translate-y-1.5"
        style={{ backgroundColor: style.edge, opacity: 0.35 }}
      />
      {/* 본체 */}
      <div
        className={[
          "relative w-full h-full rounded-[1.75rem] border-4 flex flex-col items-center justify-center p-2 gap-1",
          highlight ? "animate-[cellPulse_1.2s_ease-in-out_infinite]" : "",
        ].join(" ")}
        style={{
          backgroundColor: style.bg,
          borderColor: style.edge,
        }}
      >
        <div className="text-3xl">{style.icon}</div>
        <div
          className="font-display text-3xl leading-none"
          style={{ color: style.edge }}
        >
          {cell.index}
        </div>
        <div
          className="text-[10px] uppercase tracking-wider font-display"
          style={{ color: style.edge, opacity: 0.85 }}
        >
          {style.label}
        </div>
      </div>
      {players.length > 0 && (
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-1 z-20"
          style={{ transform: `translate(-50%, 0) rotate(${-tilt}deg)` }}
        >
          {players.map((p) => (
            <PlayerPiece key={p.id} player={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerPiece({ player }: { player: Player }) {
  const animal = getAnimal(player.animalId);
  return (
    <div className="flex flex-col items-center animate-[pieceIdle_2.4s_ease-in-out_infinite]">
      <div
        title={`${player.name} (${player.position}칸, 토큰 ${player.tokens})`}
        className="w-14 h-14 rounded-full bg-white shadow-[0_6px_0_rgba(0,0,0,0.18)] flex items-center justify-center text-3xl border-[3px] border-ark-gold"
      >
        {animal?.emoji ?? "❓"}
      </div>
      <div className="-mt-1 w-8 h-1.5 rounded-full bg-black/15 blur-[1px]" />
    </div>
  );
}

function ArkCorner({ state }: { state: GameState }) {
  const arrived = state.players.filter((p) => p.arrived);
  return (
    <div className="absolute -right-2 -bottom-2 w-52 flex flex-col items-center">
      {/* 광 */}
      <div
        className="absolute inset-x-0 top-2 h-32 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,163,61,0.5) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      <div className="relative text-8xl drop-shadow-2xl animate-[arkBob_3s_ease-in-out_infinite]">
        🚢
      </div>
      <div className="relative font-display text-2xl text-ark-gold drop-shadow mt-1">
        방주
      </div>
      {arrived.length > 0 && (
        <div className="relative flex gap-1 mt-2 flex-wrap justify-center">
          {arrived.map((p) => {
            const a = getAnimal(p.animalId);
            return (
              <div
                key={p.id}
                title={`${p.name} (${p.arrivalRank}등)`}
                className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-xl border-2 border-ark-gold"
              >
                {a?.emoji}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 우측 현황 패널 (육각 인벤토리 칩)
// ─────────────────────────────────────────────────────────────
function StatusPanel({
  state,
  current,
}: {
  state: GameState;
  current: Player | null;
}) {
  const animal = current ? getAnimal(current.animalId) : null;
  return (
    <aside className="relative rounded-[2.5rem] p-5 flex flex-col gap-4 shadow-2xl border-4 border-white/60 bg-white/60 backdrop-blur-md overflow-hidden">
      <div className="text-center">
        <div className="font-display text-3xl text-ark-gold drop-shadow">
          🌈 방주로 가는 길
        </div>
        <div className="text-xs opacity-60 mt-1">
          방 코드 · <span className="font-display text-ark-gold">{state.roomCode}</span>
        </div>
      </div>

      {/* 현재 턴 카드 */}
      {current && (
        <div
          className={[
            "relative rounded-3xl p-5 text-center border-4 transition shadow-lg",
            current.arrived ? "border-grace bg-grace/15" : "border-ark-gold bg-ark-gold/15",
          ].join(" ")}
        >
          <div className="absolute top-2 right-3 text-xs font-display opacity-60">
            현재 턴
          </div>
          <div className="text-7xl animate-[pieceIdle_2s_ease-in-out_infinite] drop-shadow-lg">
            {animal?.emoji}
          </div>
          <div className="font-display text-2xl mt-2">{current.name}</div>
          <div className="text-sm opacity-70 mt-1">
            {current.arrived ? "초청해주세요!" : "주사위를 굴려보세요!"}
          </div>
        </div>
      )}

      {/* 주사위 */}
      <div className="relative bg-white/80 rounded-3xl p-4 flex flex-col items-center gap-2 border-2 border-ink/10 shadow-inner">
        <div className="text-xs opacity-60 font-display">🎲 주사위</div>
        <AnimatedDice
          value={state.lastDiceRoll}
          trigger={state.lastDiceRoll == null ? null : `${state.seq}-${state.lastDiceRoll}`}
          size="lg"
          durationMs={700}
        />
        {state.lastDiceRoll != null && (
          <div className="font-display text-5xl text-ark-gold drop-shadow">
            {state.lastDiceRoll}
          </div>
        )}
      </div>

      {/* 플레이어 인벤토리 — 육각 칩 */}
      <div className="flex-1 overflow-y-auto -mx-1 px-1">
        <div className="text-xs opacity-60 font-display mb-2">📜 현황</div>
        <ul className="flex flex-col gap-2">
          {state.players.map((p, i) => {
            const a = getAnimal(p.animalId);
            const isCurrent = i === state.currentTurnIdx;
            return (
              <li key={p.id}>
                <PlayerInventoryRow
                  emoji={a?.emoji ?? "❓"}
                  name={p.name}
                  position={p.position}
                  arrived={p.arrived}
                  arrivalRank={p.arrivalRank}
                  tokens={p.tokens}
                  isCurrent={isCurrent}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

function PlayerInventoryRow({
  emoji,
  name,
  position,
  arrived,
  arrivalRank,
  tokens,
  isCurrent,
}: {
  emoji: string;
  name: string;
  position: number;
  arrived: boolean;
  arrivalRank: number | null;
  tokens: number;
  isCurrent: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-2xl px-2 py-2 border-2 transition",
        isCurrent
          ? "border-ark-gold bg-ark-gold/20 shadow-lg"
          : "border-transparent bg-white/60",
      ].join(" ")}
    >
      <HexBadge>{emoji}</HexBadge>
      <div className="flex-1 min-w-0">
        <div className="font-display text-base truncate">{name}</div>
        <div className="text-xs opacity-60">
          {arrived ? `🚢 ${arrivalRank}등 도착` : `${position}칸`}
        </div>
      </div>
      <HexChip label={`${tokens}`} icon="🪙" />
    </div>
  );
}

function HexBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-12 h-12 flex items-center justify-center text-2xl shadow"
      style={{
        clipPath:
          "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
        backgroundColor: "var(--ark-gold)",
      }}
    >
      <div
        className="w-[88%] h-[88%] flex items-center justify-center bg-white"
        style={{
          clipPath:
            "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function HexChip({ label, icon }: { label: string; icon: string }) {
  return (
    <div
      className="px-3 h-9 flex items-center gap-1 font-display"
      style={{
        clipPath:
          "polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)",
        backgroundColor: "var(--grace)",
        color: "white",
      }}
    >
      <span className="text-base">{icon}</span>
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

function RainOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0 bg-rain/20 mix-blend-multiply" />
      <div className="absolute inset-0 rain-lines" />
      <style>{`
        .rain-lines {
          background: repeating-linear-gradient(
            105deg,
            transparent 0,
            transparent 8px,
            rgba(255,255,255,0.3) 8px,
            rgba(255,255,255,0.3) 9px
          );
          animation: rainShift 1.4s linear infinite;
        }
        @keyframes rainShift {
          from { background-position: 0 0; }
          to { background-position: -40px 60px; }
        }
      `}</style>
    </div>
  );
}

function SharedStyles() {
  return (
    <style>{`
      @keyframes pieceIdle {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      @keyframes cellPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(232,163,61,0.0); }
        50% { transform: scale(1.06); box-shadow: 0 0 0 8px rgba(232,163,61,0.35); }
      }
      @keyframes arkBob {
        0%, 100% { transform: translateY(0) rotate(-2deg); }
        50% { transform: translateY(-6px) rotate(2deg); }
      }
      @keyframes birdFloat {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(20px, -8px); }
      }
    `}</style>
  );
}
