import { getAnimal } from "../../data/animals";
import { FINAL_MESSAGE } from "../../data/cells";
import { computeResults } from "../../logic/results";
import type { GameState } from "../../logic/types";

interface ResultsProps {
  state: GameState;
}

// 파스텔 무지개 (Design.md §3)
const RAINBOW = ["#F8B6B6", "#F8D49B", "#F4E89A", "#B7E0AA", "#A8CFEA", "#C5B2E0"];

export function Results({ state }: ResultsProps) {
  const entries = computeResults(state);

  return (
    <main className="min-h-screen w-screen relative overflow-hidden bg-gradient-to-b from-[#D7E4F2] to-[#FDF6EC]">
      <Rainbow />
      <Confetti />

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 grid grid-cols-[1fr_30rem] gap-8 p-12 items-center">
          <Deck entries={entries} />
          <div className="flex flex-col gap-3 overflow-y-auto pr-2">
            <h1 className="font-display text-5xl text-ark-gold drop-shadow">결과</h1>
            {entries.map((e, i) => (
              <RankCard key={e.playerId} entry={e} highlight={i < 3} />
            ))}
          </div>
        </div>

        <footer className="bg-ink/80 backdrop-blur text-cream p-8 text-center font-display text-2xl leading-relaxed shadow-2xl">
          {FINAL_MESSAGE}
        </footer>
      </div>
    </main>
  );
}

function Rainbow() {
  // 6색 아치
  const cx = 50;
  const cy = 100;
  return (
    <svg
      className="absolute inset-x-0 top-0 w-full h-[55%] pointer-events-none opacity-90"
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
    >
      {RAINBOW.map((color, i) => {
        const r = 70 - i * 4;
        return (
          <path
            key={i}
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            stroke={color}
            strokeWidth={4}
            fill="none"
          />
        );
      })}
    </svg>
  );
}

function Confetti() {
  // CSS-only confetti — 절제된 1회성 (Design.md §5)
  const pieces = Array.from({ length: 30 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => (
        <span
          key={i}
          className="absolute w-2 h-3 rounded-sm"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `-5%`,
            background: i % 2 ? "var(--ark-gold)" : "var(--bg-cream)",
            animation: `confettiFall ${2 + (i % 5) * 0.4}s ease-out forwards`,
            animationDelay: `${(i % 10) * 0.05}s`,
            transform: `rotate(${i * 23}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function Deck({ entries }: { entries: ReturnType<typeof computeResults> }) {
  const arrived = entries.filter((e) => e.arrived);
  const notArrived = entries.filter((e) => !e.arrived);
  return (
    <div className="relative h-full flex flex-col items-center justify-end">
      <div className="text-9xl mb-2 drop-shadow-lg">⛵</div>
      <div className="text-xl font-display opacity-70 mb-6">방주 갑판</div>

      {arrived.length > 0 && (
        <div className="flex gap-3 flex-wrap justify-center mb-4">
          {arrived.map((e) => {
            const a = getAnimal(e.animalId);
            return (
              <div
                key={e.playerId}
                className="flex flex-col items-center bg-white/80 rounded-2xl px-4 py-3 shadow"
              >
                <div className="text-5xl">{a?.emoji}</div>
                <div className="font-display text-sm mt-1">{e.name}</div>
                <div className="text-xs opacity-60">{e.arrivalRank}등 도착</div>
              </div>
            );
          })}
        </div>
      )}

      {notArrived.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center opacity-70">
          {notArrived.map((e) => {
            const a = getAnimal(e.animalId);
            return (
              <div
                key={e.playerId}
                className="flex flex-col items-center bg-white/40 rounded-xl px-3 py-2"
              >
                <div className="text-3xl">{a?.emoji}</div>
                <div className="text-xs font-display">{e.name}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RankCard({
  entry,
  highlight,
}: {
  entry: ReturnType<typeof computeResults>[number];
  highlight: boolean;
}) {
  const animal = getAnimal(entry.animalId);
  const medal = ["🥇", "🥈", "🥉"][entry.finalRank - 1] ?? "";
  return (
    <div
      className={[
        "flex items-center gap-4 rounded-2xl p-4 border-2 shadow-md transition",
        highlight ? "bg-white border-ark-gold" : "bg-white/80 border-ink/10",
      ].join(" ")}
    >
      <div className="font-display text-3xl w-12 text-center">
        {medal || entry.finalRank}
      </div>
      <div className="text-4xl">{animal?.emoji}</div>
      <div className="flex-1">
        <div className="font-display text-xl">{entry.name}</div>
        <div className="text-sm opacity-70">
          {entry.arrived ? `${entry.arrivalRank}등 도착` : `${entry.position}칸`}
          {" · "}
          <span title="도착 보너스 + 토큰">
            도착 +{entry.arrivalBonus} / 토큰 {entry.tokensExcludingBonus}
          </span>
        </div>
      </div>
      <div className="font-display text-3xl text-ark-gold">{entry.total}</div>
    </div>
  );
}

// 컨트롤러용 내 결과 카드 (작은 화면)
export function MyResultCard({
  state,
  myPlayerId,
}: {
  state: GameState;
  myPlayerId: string;
}) {
  const entries = computeResults(state);
  const mine = entries.find((e) => e.playerId === myPlayerId);
  if (!mine) return null;
  const animal = getAnimal(mine.animalId);
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-3">
      <div className="font-display text-2xl">🌈 결과</div>
      <div className="text-5xl">{animal?.emoji}</div>
      <div className="font-display text-xl">{mine.name}</div>
      <div className="font-display text-5xl text-ark-gold">{mine.total}점</div>
      <div className="text-sm opacity-70">
        도착 +{mine.arrivalBonus} / 토큰 {mine.tokensExcludingBonus} · 최종 {mine.finalRank}등
      </div>
      <div className="text-xs opacity-60 mt-2 text-center leading-relaxed">
        {FINAL_MESSAGE}
      </div>
    </div>
  );
}

