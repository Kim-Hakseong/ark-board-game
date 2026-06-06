import { AnimatedDice } from "../../components/AnimatedDice";
import { CELLS, type Cell, type CellKind } from "../../data/cells";
import { getAnimal } from "../../data/animals";
import type { GameState, Player } from "../../logic/types";

interface BoardProps {
  state: GameState;
}

// S자 사행 — 5행 × 6열 (PRD Design.md §5)
// Row 0: 1→6,  Row 1: 12→7(역),  Row 2: 13→18,  Row 3: 24→19(역),  Row 4: 25→30
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

export function Board({ state }: BoardProps) {
  const currentPlayer = state.players[state.currentTurnIdx] ?? null;

  return (
    <div className="min-h-screen w-screen relative overflow-hidden bg-cream">
      {state.countdown.active && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 px-8 py-3 mt-3 rounded-2xl bg-ink/80 text-cream font-display text-2xl border-2 border-ark-gold shadow-2xl">
          🌧 문이 닫히기까지 D-{state.countdown.daysLeft}
        </div>
      )}

      {state.phase === "rain" && <RainOverlay />}

      <div className="grid grid-cols-[1fr_22rem] h-screen gap-4 p-6">
        <BoardTrack state={state} />
        <StatusPanel state={state} current={currentPlayer} />
      </div>
    </div>
  );
}

function BoardTrack({ state }: { state: GameState }) {
  // 풍경 그라데이션 4구역 (Design.md §3)
  const bgStyle = {
    background:
      "linear-gradient(120deg, var(--field) 0%, var(--bone) 35%, var(--sand) 65%, var(--peach) 100%)",
  };
  return (
    <div
      className="relative rounded-3xl p-6 shadow-inner overflow-hidden"
      style={bgStyle}
    >
      <div className="grid h-full" style={{ gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
        {Array.from({ length: ROWS }, (_, row) => (
          <div
            key={row}
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {Array.from({ length: COLS }, (_, col) => {
              const index = cellIndexAt(row, col);
              const cell = CELLS.find((c) => c.index === index);
              if (!cell) return null;
              const playersHere = state.players.filter((p) => p.position === index);
              return <CellCard key={index} cell={cell} players={playersHere} />;
            })}
          </div>
        ))}
      </div>
      <ArkCorner state={state} />
    </div>
  );
}

function CellCard({ cell, players }: { cell: Cell; players: Player[] }) {
  const style = KIND_STYLE[cell.kind];
  return (
    <div
      className="relative rounded-2xl border-2 p-3 flex flex-col justify-between shadow"
      style={{ backgroundColor: style.bg, borderColor: style.edge }}
    >
      <div className="flex items-center justify-between">
        <div className="font-display text-2xl">{cell.index}</div>
        <div className="text-2xl">{style.icon}</div>
      </div>
      <div className="text-[10px] uppercase tracking-wider opacity-70 font-display">
        {style.label}
      </div>
      {players.length > 0 && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center gap-1 flex-wrap">
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
    <div
      title={`${player.name} (${player.position}칸, 토큰 ${player.tokens})`}
      className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl border-2 border-ink/10"
    >
      {animal?.emoji ?? "❓"}
    </div>
  );
}

function ArkCorner({ state }: { state: GameState }) {
  const arrived = state.players.filter((p) => p.arrived);
  return (
    <div className="absolute right-6 bottom-6 w-40 flex flex-col items-center">
      <div
        className="text-6xl"
        style={{
          filter: "drop-shadow(0 0 20px rgba(232,163,61,0.6))",
        }}
      >
        🛟
      </div>
      <div className="font-display text-xl text-ark-gold mt-1">방주</div>
      <div className="flex gap-1 mt-2 flex-wrap justify-center">
        {arrived.map((p) => {
          const a = getAnimal(p.animalId);
          return (
            <div
              key={p.id}
              title={`${p.name} (${p.arrivalRank}등)`}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-xl"
            >
              {a?.emoji}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusPanel({
  state,
  current,
}: {
  state: GameState;
  current: Player | null;
}) {
  const animal = current ? getAnimal(current.animalId) : null;
  return (
    <aside className="bg-white/70 rounded-3xl p-5 flex flex-col gap-4 shadow-inner">
      <div className="text-center">
        <div className="font-display text-2xl text-ark-gold">방주로 가는 길</div>
        <div className="text-sm opacity-60">방 코드 · {state.roomCode}</div>
      </div>

      {current && (
        <div
          className={[
            "rounded-2xl p-4 text-center transition",
            current.arrived ? "bg-grace/30" : "bg-ark-gold/20",
          ].join(" ")}
          style={{
            boxShadow: current.arrived
              ? "0 0 0 2px var(--grace) inset"
              : "0 0 0 2px var(--ark-gold) inset",
          }}
        >
          <div className="text-5xl">{animal?.emoji}</div>
          <div className="font-display text-2xl mt-1">{current.name}</div>
          <div className="text-sm opacity-70 mt-1">
            {current.arrived ? "초청해주세요!" : "폰을 흔들어 주세요!"}
          </div>
        </div>
      )}

      <div className="bg-cream rounded-2xl p-4 flex flex-col items-center gap-2">
        <div className="text-xs opacity-60 font-display">주사위</div>
        <AnimatedDice
          value={state.lastDiceRoll}
          trigger={state.lastDiceRoll == null ? null : `${state.seq}-${state.lastDiceRoll}`}
          size="lg"
          durationMs={700}
        />
        {state.lastDiceRoll != null && (
          <div className="font-display text-4xl text-ark-gold">{state.lastDiceRoll}</div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="text-xs opacity-60 font-display mb-2">현황</div>
        <ul className="flex flex-col gap-1">
          {state.players.map((p, i) => {
            const a = getAnimal(p.animalId);
            const isCurrent = i === state.currentTurnIdx;
            return (
              <li
                key={p.id}
                className={[
                  "flex items-center gap-2 rounded-xl px-2 py-1",
                  isCurrent ? "bg-ark-gold/15 font-bold" : "",
                ].join(" ")}
              >
                <span className="text-xl">{a?.emoji}</span>
                <span className="flex-1 font-display text-sm truncate">{p.name}</span>
                <span className="text-xs opacity-70">
                  {p.arrived ? `🛟 ${p.arrivalRank}등` : `${p.position}칸`}
                </span>
                <span className="text-xs bg-grace/30 rounded-full px-2">
                  🪙 {p.tokens}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

function RainOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0 bg-rain/15 mix-blend-multiply" />
      <div className="absolute inset-0 rain-lines" />
      <style>{`
        .rain-lines {
          background: repeating-linear-gradient(
            105deg,
            transparent 0,
            transparent 8px,
            rgba(255,255,255,0.25) 8px,
            rgba(255,255,255,0.25) 9px
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
